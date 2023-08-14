import { __assign } from "tslib";
import { init as reactInit, SDK_VERSION } from '@sentry/react';
import { getIntegrationsFromOptions } from './utils/integrations';
/**
 * Inits the Sentry Gatsby SDK.
 */
export function init(options) {
    options._metadata = options._metadata || {};
    options._metadata.sdk = options._metadata.sdk || {
        name: 'sentry.javascript.gatsby',
        packages: [
            {
                name: 'npm:@sentry/gatsby',
                version: SDK_VERSION,
            },
        ],
        version: SDK_VERSION,
    };
    var integrations = getIntegrationsFromOptions(options);
    reactInit(__assign(__assign({}, options), { integrations: integrations }));
}
//# sourceMappingURL=sdk.js.map