import * as Tracing from '@sentry/tracing';
/**
 * Returns the integrations to add to the SDK.
 * If tracing is enabled, `BrowserTracing` is always present.
 *
 * @param options The options users have defined.
 */
export function getIntegrationsFromOptions(options) {
    var isTracingEnabled = Tracing.hasTracingEnabled(options);
    if (options.integrations === undefined) {
        return getIntegrationsFromArray([], isTracingEnabled);
    }
    else if (Array.isArray(options.integrations)) {
        return getIntegrationsFromArray(options.integrations, isTracingEnabled);
    }
    else {
        return getIntegrationsFromFunction(options.integrations, isTracingEnabled);
    }
}
/**
 * Returns the integrations to add to the SDK, from the given integrations array.
 *
 * @param userIntegrations Array of user's integrations.
 * @param isTracingEnabled Whether the user has enabled tracing.
 */
function getIntegrationsFromArray(userIntegrations, isTracingEnabled) {
    if (isTracingEnabled &&
        !userIntegrations.some(function (integration) { return integration.name === Tracing.Integrations.BrowserTracing.name; })) {
        userIntegrations.push(new Tracing.Integrations.BrowserTracing());
    }
    return userIntegrations;
}
/**
 * Returns the integrations to add to the SDK, from the given function.
 *
 * @param userIntegrations Function returning the user's integrations.
 * @param isTracingEnabled Whether the user has enabled tracing.
 */
function getIntegrationsFromFunction(userIntegrations, isTracingEnabled) {
    var wrapper = function (defaultIntegrations) {
        return getIntegrationsFromArray(userIntegrations(defaultIntegrations), isTracingEnabled);
    };
    return wrapper;
}
//# sourceMappingURL=integrations.js.map