/* eslint-disable max-lines */
import * as Sentry from '@sentry/node';
import { captureException, captureMessage, flush, getCurrentHub, startTransaction, withScope, } from '@sentry/node';
import { extractTraceparentData } from '@sentry/tracing';
import { isString, logger } from '@sentry/utils';
import { existsSync } from 'fs';
import { hostname } from 'os';
import { basename, resolve } from 'path';
import { performance } from 'perf_hooks';
import { types } from 'util';
import { AWSServices } from './awsservices';
import { serverlessEventProcessor } from './utils';
export * from '@sentry/node';
const { isPromise } = types;
export const defaultIntegrations = [...Sentry.defaultIntegrations, new AWSServices({ optional: true })];
/**
 * @see {@link Sentry.init}
 */
export function init(options = {}) {
    if (options.defaultIntegrations === undefined) {
        options.defaultIntegrations = defaultIntegrations;
    }
    options._metadata = options._metadata || {};
    options._metadata.sdk = {
        name: 'sentry.javascript.serverless',
        integrations: ['AWSLambda'],
        packages: [
            {
                name: 'npm:@sentry/serverless',
                version: Sentry.SDK_VERSION,
            },
        ],
        version: Sentry.SDK_VERSION,
    };
    Sentry.init(options);
    Sentry.addGlobalEventProcessor(serverlessEventProcessor);
}
/** */
function tryRequire(taskRoot, subdir, mod) {
    const lambdaStylePath = resolve(taskRoot, subdir, mod);
    if (existsSync(lambdaStylePath) || existsSync(`${lambdaStylePath}.js`)) {
        // Lambda-style path
        return require(lambdaStylePath);
    }
    // Node-style path
    return require(require.resolve(mod, { paths: [taskRoot, subdir] }));
}
/** */
function isPromiseAllSettledResult(result) {
    return result.every(v => Object.prototype.hasOwnProperty.call(v, 'status') &&
        (Object.prototype.hasOwnProperty.call(v, 'value') || Object.prototype.hasOwnProperty.call(v, 'reason')));
}
/** */
function getRejectedReasons(results) {
    return results.reduce((rejected, result) => {
        if (result.status === 'rejected' && result.reason)
            rejected.push(result.reason);
        return rejected;
    }, []);
}
/** */
export function tryPatchHandler(taskRoot, handlerPath) {
    const handlerDesc = basename(handlerPath);
    const match = handlerDesc.match(/^([^.]*)\.(.*)$/);
    if (!match) {
        logger.error(`Bad handler ${handlerDesc}`);
        return;
    }
    const [, handlerMod, handlerName] = match;
    let obj;
    try {
        const handlerDir = handlerPath.substring(0, handlerPath.indexOf(handlerDesc));
        obj = tryRequire(taskRoot, handlerDir, handlerMod);
    }
    catch (e) {
        logger.error(`Cannot require ${handlerPath} in ${taskRoot}`, e);
        return;
    }
    let mod;
    let functionName;
    handlerName.split('.').forEach(name => {
        mod = obj;
        obj = obj && obj[name];
        functionName = name;
    });
    if (!obj) {
        logger.error(`${handlerPath} is undefined or not exported`);
        return;
    }
    if (typeof obj !== 'function') {
        logger.error(`${handlerPath} is not a function`);
        return;
    }
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    mod[functionName] = wrapHandler(obj);
}
/**
 * Tries to invoke context.getRemainingTimeInMillis if not available returns 0
 * Some environments use AWS lambda but don't support this function
 * @param context
 */
function tryGetRemainingTimeInMillis(context) {
    return typeof context.getRemainingTimeInMillis === 'function' ? context.getRemainingTimeInMillis() : 0;
}
/**
 * Adds additional information from the environment and AWS Context to the Sentry Scope.
 *
 * @param scope Scope that should be enhanced
 * @param context AWS Lambda context that will be used to extract some part of the data
 * @param startTime performance.now() when wrapHandler was invoked
 */
function enhanceScopeWithEnvironmentData(scope, context, startTime) {
    scope.setTransactionName(context.functionName);
    scope.setTag('server_name', process.env._AWS_XRAY_DAEMON_ADDRESS || process.env.SENTRY_NAME || hostname());
    scope.setTag('url', `awslambda:///${context.functionName}`);
    scope.setContext('runtime', {
        name: 'node',
        version: global.process.version,
    });
    scope.setContext('aws.lambda', {
        aws_request_id: context.awsRequestId,
        function_name: context.functionName,
        function_version: context.functionVersion,
        invoked_function_arn: context.invokedFunctionArn,
        execution_duration_in_millis: performance.now() - startTime,
        remaining_time_in_millis: tryGetRemainingTimeInMillis(context),
        'sys.argv': process.argv,
    });
    scope.setContext('aws.cloudwatch.logs', {
        log_group: context.logGroupName,
        log_stream: context.logStreamName,
        url: `https://console.aws.amazon.com/cloudwatch/home?region=${process.env.AWS_REGION}#logsV2:log-groups/log-group/${encodeURIComponent(context.logGroupName)}/log-events/${encodeURIComponent(context.logStreamName)}?filterPattern="${context.awsRequestId}"`,
    });
}
/**
 * Wraps a lambda handler adding it error capture and tracing capabilities.
 *
 * @param handler Handler
 * @param options Options
 * @returns Handler
 */
export function wrapHandler(handler, wrapOptions = {}) {
    const START_TIME = performance.now();
    const options = {
        flushTimeout: 2000,
        rethrowAfterCapture: true,
        callbackWaitsForEmptyEventLoop: false,
        captureTimeoutWarning: true,
        timeoutWarningLimit: 500,
        captureAllSettledReasons: false,
        ...wrapOptions,
    };
    let timeoutWarningTimer;
    // AWSLambda is like Express. It makes a distinction about handlers based on it's last argument
    // async (event) => async handler
    // async (event, context) => async handler
    // (event, context, callback) => sync handler
    // Nevertheless whatever option is chosen by user, we convert it to async handler.
    const asyncHandler = handler.length > 2
        ? (event, context) => new Promise((resolve, reject) => {
            const rv = handler(event, context, (error, result) => {
                if (error === null || error === undefined) {
                    resolve(result); // eslint-disable-line @typescript-eslint/no-non-null-assertion
                }
                else {
                    reject(error);
                }
            });
            // This should never happen, but still can if someone writes a handler as
            // `async (event, context, callback) => {}`
            if (isPromise(rv)) {
                void rv.then(resolve, reject);
            }
        })
        : handler;
    return async (event, context) => {
        context.callbackWaitsForEmptyEventLoop = options.callbackWaitsForEmptyEventLoop;
        // In seconds. You cannot go any more granular than this in AWS Lambda.
        const configuredTimeout = Math.ceil(tryGetRemainingTimeInMillis(context) / 1000);
        const configuredTimeoutMinutes = Math.floor(configuredTimeout / 60);
        const configuredTimeoutSeconds = configuredTimeout % 60;
        const humanReadableTimeout = configuredTimeoutMinutes > 0
            ? `${configuredTimeoutMinutes}m${configuredTimeoutSeconds}s`
            : `${configuredTimeoutSeconds}s`;
        // When `callbackWaitsForEmptyEventLoop` is set to false, which it should when using `captureTimeoutWarning`,
        // we don't have a guarantee that this message will be delivered. Because of that, we don't flush it.
        if (options.captureTimeoutWarning) {
            const timeoutWarningDelay = tryGetRemainingTimeInMillis(context) - options.timeoutWarningLimit;
            timeoutWarningTimer = setTimeout(() => {
                withScope(scope => {
                    scope.setTag('timeout', humanReadableTimeout);
                    captureMessage(`Possible function timeout: ${context.functionName}`, 'warning');
                });
            }, timeoutWarningDelay);
        }
        // Applying `sentry-trace` to context
        let traceparentData;
        const eventWithHeaders = event;
        if (eventWithHeaders.headers && isString(eventWithHeaders.headers['sentry-trace'])) {
            traceparentData = extractTraceparentData(eventWithHeaders.headers['sentry-trace']);
        }
        const transaction = startTransaction({
            name: context.functionName,
            op: 'awslambda.handler',
            ...traceparentData,
        });
        const hub = getCurrentHub();
        const scope = hub.pushScope();
        let rv;
        try {
            enhanceScopeWithEnvironmentData(scope, context, START_TIME);
            // We put the transaction on the scope so users can attach children to it
            scope.setSpan(transaction);
            rv = await asyncHandler(event, context);
            // We manage lambdas that use Promise.allSettled by capturing the errors of failed promises
            if (options.captureAllSettledReasons && Array.isArray(rv) && isPromiseAllSettledResult(rv)) {
                const reasons = getRejectedReasons(rv);
                reasons.forEach(exception => {
                    captureException(exception);
                });
            }
        }
        catch (e) {
            captureException(e);
            if (options.rethrowAfterCapture) {
                throw e;
            }
        }
        finally {
            clearTimeout(timeoutWarningTimer);
            transaction.finish();
            hub.popScope();
            await flush(options.flushTimeout);
        }
        return rv;
    };
}
//# sourceMappingURL=awslambda.js.map