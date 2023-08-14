import * as Sentry from '@sentry/node';
import { GoogleCloudGrpc } from '../google-cloud-grpc';
import { GoogleCloudHttp } from '../google-cloud-http';
import { serverlessEventProcessor } from '../utils';
export * from './http';
export * from './events';
export * from './cloud_events';
export const defaultIntegrations = [
    ...Sentry.defaultIntegrations,
    new GoogleCloudHttp({ optional: true }),
    new GoogleCloudGrpc({ optional: true }),
];
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
        integrations: ['GCPFunction'],
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
//# sourceMappingURL=index.js.map