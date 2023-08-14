import { hostname } from 'os';
/**
 * Enhances the scope with additional event information.
 *
 * @param scope scope
 * @param context event context
 */
export function configureScopeWithContext(scope, context) {
    scope.setContext('runtime', {
        name: 'node',
        version: global.process.version,
    });
    scope.setTag('server_name', process.env.SENTRY_NAME || hostname());
    scope.setContext('gcp.function.context', { ...context });
}
//# sourceMappingURL=general.js.map