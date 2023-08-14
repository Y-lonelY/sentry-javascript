import { getCurrentHub } from '@sentry/node';
import { fill } from '@sentry/utils';
/** AWS service requests tracking */
export class AWSServices {
    constructor(options = {}) {
        /**
         * @inheritDoc
         */
        this.name = AWSServices.id;
        this._optional = options.optional || false;
    }
    /**
     * @inheritDoc
     */
    setupOnce() {
        try {
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const awsModule = require('aws-sdk/global');
            fill(awsModule.Service.prototype, 'makeRequest', wrapMakeRequest);
        }
        catch (e) {
            if (!this._optional) {
                throw e;
            }
        }
    }
}
/**
 * @inheritDoc
 */
AWSServices.id = 'AWSServices';
/** */
function wrapMakeRequest(orig) {
    return function (operation, params, callback) {
        let transaction;
        let span;
        const scope = getCurrentHub().getScope();
        if (scope) {
            transaction = scope.getTransaction();
        }
        const req = orig.call(this, operation, params);
        req.on('afterBuild', () => {
            if (transaction) {
                span = transaction.startChild({
                    description: describe(this, operation, params),
                    op: 'aws.request',
                });
            }
        });
        req.on('complete', () => {
            if (span) {
                span.finish();
            }
        });
        if (callback) {
            req.send(callback);
        }
        return req;
    };
}
/** Describes an operation on generic AWS service */
function describe(service, operation, params) {
    let ret = `aws.${service.serviceIdentifier}.${operation}`;
    if (params === undefined) {
        return ret;
    }
    switch (service.serviceIdentifier) {
        case 's3':
            ret += describeS3Operation(operation, params);
            break;
        case 'lambda':
            ret += describeLambdaOperation(operation, params);
            break;
    }
    return ret;
}
/** Describes an operation on AWS Lambda service */
function describeLambdaOperation(_operation, params) {
    let ret = '';
    if ('FunctionName' in params) {
        ret += ` ${params.FunctionName}`;
    }
    return ret;
}
/** Describes an operation on AWS S3 service */
function describeS3Operation(_operation, params) {
    let ret = '';
    if ('Bucket' in params) {
        ret += ` ${params.Bucket}`;
    }
    return ret;
}
//# sourceMappingURL=awsservices.js.map