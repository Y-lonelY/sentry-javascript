import { getCurrentHub } from '@sentry/node';
import { fill } from '@sentry/utils';
/** Google Cloud Platform service requests tracking for RESTful APIs */
export class GoogleCloudHttp {
    constructor(options = {}) {
        /**
         * @inheritDoc
         */
        this.name = GoogleCloudHttp.id;
        this._optional = options.optional || false;
    }
    /**
     * @inheritDoc
     */
    setupOnce() {
        try {
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const commonModule = require('@google-cloud/common');
            fill(commonModule.Service.prototype, 'request', wrapRequestFunction);
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
GoogleCloudHttp.id = 'GoogleCloudHttp';
/** Returns a wrapped function that makes a request with tracing enabled */
function wrapRequestFunction(orig) {
    return function (reqOpts, callback) {
        let transaction;
        let span;
        const scope = getCurrentHub().getScope();
        if (scope) {
            transaction = scope.getTransaction();
        }
        if (transaction) {
            const httpMethod = reqOpts.method || 'GET';
            span = transaction.startChild({
                description: `${httpMethod} ${reqOpts.uri}`,
                op: `gcloud.http.${identifyService(this.apiEndpoint)}`,
            });
        }
        orig.call(this, reqOpts, (...args) => {
            if (span) {
                span.finish();
            }
            callback(...args);
        });
    };
}
/** Identifies service by its base url */
function identifyService(apiEndpoint) {
    const match = apiEndpoint.match(/^https:\/\/(\w+)\.googleapis.com$/);
    return match ? match[1] : apiEndpoint.replace(/^(http|https)?:\/\//, '');
}
//# sourceMappingURL=google-cloud-http.js.map