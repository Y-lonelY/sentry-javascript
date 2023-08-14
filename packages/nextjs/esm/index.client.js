import { __assign, __read, __spread } from "tslib";
import { configureScope, init as reactInit, Integrations as BrowserIntegrations } from '@sentry/react';
import { BrowserTracing, defaultRequestInstrumentationOptions } from '@sentry/tracing';
import { nextRouterInstrumentation } from './performance/client';
import { buildMetadata } from './utils/metadata';
import { addIntegration } from './utils/userIntegrations';
export * from '@sentry/react';
export { nextRouterInstrumentation } from './performance/client';
export var Integrations = __assign(__assign({}, BrowserIntegrations), { BrowserTracing: BrowserTracing });
/** Inits the Sentry NextJS SDK on the browser with the React SDK. */
export function init(options) {
    buildMetadata(options, ['nextjs', 'react']);
    options.environment = options.environment || process.env.NODE_ENV;
    // Only add BrowserTracing if a tracesSampleRate or tracesSampler is set
    var integrations = options.tracesSampleRate === undefined && options.tracesSampler === undefined
        ? options.integrations
        : createClientIntegrations(options.integrations);
    reactInit(__assign(__assign({}, options), { integrations: integrations }));
    configureScope(function (scope) {
        scope.setTag('runtime', 'browser');
        scope.addEventProcessor(function (event) { return (event.type === 'transaction' && event.transaction === '/404' ? null : event); });
    });
}
var defaultBrowserTracingIntegration = new BrowserTracing({
    tracingOrigins: __spread(defaultRequestInstrumentationOptions.tracingOrigins, [/^(api\/)/]),
    routingInstrumentation: nextRouterInstrumentation,
});
function createClientIntegrations(integrations) {
    if (integrations) {
        return addIntegration(defaultBrowserTracingIntegration, integrations, {
            BrowserTracing: { keyPath: 'options.routingInstrumentation', value: nextRouterInstrumentation },
        });
    }
    else {
        return [defaultBrowserTracingIntegration];
    }
}
//# sourceMappingURL=index.client.js.map