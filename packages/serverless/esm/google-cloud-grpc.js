import { getCurrentHub } from '@sentry/node';
import { fill } from '@sentry/utils';
/** Google Cloud Platform service requests tracking for GRPC APIs */
export class GoogleCloudGrpc {
    constructor(options = {}) {
        /**
         * @inheritDoc
         */
        this.name = GoogleCloudGrpc.id;
        this._optional = options.optional || false;
    }
    /**
     * @inheritDoc
     */
    setupOnce() {
        try {
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const gaxModule = require('google-gax');
            fill(gaxModule.GrpcClient.prototype, // eslint-disable-line @typescript-eslint/no-unsafe-member-access
            'createStub', wrapCreateStub);
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
GoogleCloudGrpc.id = 'GoogleCloudGrpc';
/** Returns a wrapped function that returns a stub with tracing enabled */
function wrapCreateStub(origCreate) {
    return async function (...args) {
        var _a;
        const servicePath = (_a = args[1]) === null || _a === void 0 ? void 0 : _a.servicePath;
        if (servicePath == null || servicePath == undefined) {
            return origCreate.apply(this, args);
        }
        const serviceIdentifier = identifyService(servicePath);
        const stub = await origCreate.apply(this, args);
        for (const methodName of Object.keys(Object.getPrototypeOf(stub))) {
            fillGrpcFunction(stub, serviceIdentifier, methodName);
        }
        return stub;
    };
}
/** Patches the function in grpc stub to enable tracing */
function fillGrpcFunction(stub, serviceIdentifier, methodName) {
    const funcObj = stub[methodName];
    if (typeof funcObj !== 'function') {
        return;
    }
    const callType = !funcObj.requestStream && !funcObj.responseStream
        ? 'unary call'
        : funcObj.requestStream && !funcObj.responseStream
            ? 'client stream'
            : !funcObj.requestStream && funcObj.responseStream
                ? 'server stream'
                : 'bidi stream';
    if (callType != 'unary call') {
        return;
    }
    fill(stub, methodName, (orig) => (...args) => {
        var _a;
        const ret = orig.apply(stub, args);
        if (typeof ((_a = ret) === null || _a === void 0 ? void 0 : _a.on) !== 'function') {
            return ret;
        }
        let transaction;
        let span;
        const scope = getCurrentHub().getScope();
        if (scope) {
            transaction = scope.getTransaction();
        }
        if (transaction) {
            span = transaction.startChild({
                description: `${callType} ${methodName}`,
                op: `gcloud.grpc.${serviceIdentifier}`,
            });
        }
        ret.on('status', () => {
            if (span) {
                span.finish();
            }
        });
        return ret;
    });
}
/** Identifies service by its address */
function identifyService(servicePath) {
    const match = servicePath.match(/^(\w+)\.googleapis.com$/);
    return match ? match[1] : servicePath;
}
//# sourceMappingURL=google-cloud-grpc.js.map