/* eslint-disable @typescript-eslint/no-explicit-any */
import { captureException } from '@sentry/browser';
/**
 * Creates routing instrumentation for Vue Router v2
 *
 * @param router The Vue Router instance that is used
 */
export function vueRouterInstrumentation(router) {
    return function (startTransaction, startTransactionOnPageLoad, startTransactionOnLocationChange) {
        if (startTransactionOnPageLoad === void 0) { startTransactionOnPageLoad = true; }
        if (startTransactionOnLocationChange === void 0) { startTransactionOnLocationChange = true; }
        router.onError(function (error) { return captureException(error); });
        router.beforeEach(function (to, from, next) {
            // According to docs we could use `from === VueRouter.START_LOCATION` but I couldnt get it working for Vue 2
            // https://router.vuejs.org/api/#router-start-location
            // https://next.router.vuejs.org/api/#start-location
            // Vue2 - null
            // Vue3 - undefined
            var isPageLoadNavigation = from.name == null && from.matched.length === 0;
            var tags = {
                'routing.instrumentation': 'vue-router',
            };
            var data = {
                params: to.params,
                query: to.query,
            };
            if (startTransactionOnPageLoad && isPageLoadNavigation) {
                startTransaction({
                    name: to.name || to.path,
                    op: 'pageload',
                    tags: tags,
                    data: data,
                });
            }
            if (startTransactionOnLocationChange && !isPageLoadNavigation) {
                startTransaction({
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                    name: to.name || (to.matched[0] && to.matched[0].path) || to.path,
                    op: 'navigation',
                    tags: tags,
                    data: data,
                });
            }
            next();
        });
    };
}
//# sourceMappingURL=router.js.map