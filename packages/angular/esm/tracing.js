import { __assign, __decorate } from "tslib";
import { Directive, Injectable, Input, NgModule } from '@angular/core';
import { NavigationEnd, NavigationStart } from '@angular/router';
import { getCurrentHub } from '@sentry/browser';
import { getGlobalObject, logger, stripUrlQueryAndFragment, timestampWithMs } from '@sentry/utils';
import { Subscription } from 'rxjs';
import { filter, tap } from 'rxjs/operators';
import { ANGULAR_INIT_OP, ANGULAR_OP, ANGULAR_ROUTING_OP } from './constants';
import { runOutsideAngular } from './zone';
var instrumentationInitialized;
var stashedStartTransaction;
var stashedStartTransactionOnLocationChange;
var global = getGlobalObject();
/**
 * Creates routing instrumentation for Angular Router.
 */
export function routingInstrumentation(customStartTransaction, startTransactionOnPageLoad, startTransactionOnLocationChange) {
    if (startTransactionOnPageLoad === void 0) { startTransactionOnPageLoad = true; }
    if (startTransactionOnLocationChange === void 0) { startTransactionOnLocationChange = true; }
    instrumentationInitialized = true;
    stashedStartTransaction = customStartTransaction;
    stashedStartTransactionOnLocationChange = startTransactionOnLocationChange;
    if (startTransactionOnPageLoad) {
        customStartTransaction({
            name: global.location.pathname,
            op: 'pageload',
        });
    }
}
export var instrumentAngularRouting = routingInstrumentation;
/**
 * Grabs active transaction off scope
 */
export function getActiveTransaction() {
    var currentHub = getCurrentHub();
    if (currentHub) {
        var scope = currentHub.getScope();
        if (scope) {
            return scope.getTransaction();
        }
    }
    return undefined;
}
/**
 * Angular's Service responsible for hooking into Angular Router and tracking current navigation process.
 * Creates a new transaction for every route change and measures a duration of routing process.
 */
var TraceService = /** @class */ (function () {
    function TraceService(_router) {
        var _this = this;
        this._router = _router;
        this.navStart$ = this._router.events.pipe(filter(function (event) { return event instanceof NavigationStart; }), tap(function (event) {
            if (!instrumentationInitialized) {
                logger.error('Angular integration has tracing enabled, but Tracing integration is not configured');
                return;
            }
            var navigationEvent = event;
            var strippedUrl = stripUrlQueryAndFragment(navigationEvent.url);
            var activeTransaction = getActiveTransaction();
            if (!activeTransaction && stashedStartTransactionOnLocationChange) {
                activeTransaction = stashedStartTransaction({
                    name: strippedUrl,
                    op: 'navigation',
                });
            }
            if (activeTransaction) {
                if (_this._routingSpan) {
                    _this._routingSpan.finish();
                }
                _this._routingSpan = activeTransaction.startChild({
                    description: "" + navigationEvent.url,
                    op: ANGULAR_ROUTING_OP,
                    tags: __assign({ 'routing.instrumentation': '@sentry/angular', url: strippedUrl }, (navigationEvent.navigationTrigger && {
                        navigationTrigger: navigationEvent.navigationTrigger,
                    })),
                });
            }
        }));
        this.navEnd$ = this._router.events.pipe(filter(function (event) { return event instanceof NavigationEnd; }), tap(function () {
            if (_this._routingSpan) {
                runOutsideAngular(function () {
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    _this._routingSpan.finish();
                });
                _this._routingSpan = null;
            }
        }));
        this._routingSpan = null;
        this._subscription = new Subscription();
        this._subscription.add(this.navStart$.subscribe());
        this._subscription.add(this.navEnd$.subscribe());
    }
    /**
     * This is used to prevent memory leaks when the root view is created and destroyed multiple times,
     * since `subscribe` callbacks capture `this` and prevent many resources from being GC'd.
     */
    TraceService.prototype.ngOnDestroy = function () {
        this._subscription.unsubscribe();
    };
    TraceService = __decorate([
        Injectable({ providedIn: 'root' })
    ], TraceService);
    return TraceService;
}());
export { TraceService };
var UNKNOWN_COMPONENT = 'unknown';
/**
 * A directive that can be used to capture initialization lifecycle of the whole component.
 */
var TraceDirective = /** @class */ (function () {
    function TraceDirective() {
        this.componentName = UNKNOWN_COMPONENT;
    }
    /**
     * Implementation of OnInit lifecycle method
     * @inheritdoc
     */
    TraceDirective.prototype.ngOnInit = function () {
        var activeTransaction = getActiveTransaction();
        if (activeTransaction) {
            this._tracingSpan = activeTransaction.startChild({
                description: "<" + this.componentName + ">",
                op: ANGULAR_INIT_OP,
            });
        }
    };
    /**
     * Implementation of AfterViewInit lifecycle method
     * @inheritdoc
     */
    TraceDirective.prototype.ngAfterViewInit = function () {
        if (this._tracingSpan) {
            this._tracingSpan.finish();
        }
    };
    __decorate([
        Input('trace')
    ], TraceDirective.prototype, "componentName", void 0);
    TraceDirective = __decorate([
        Directive({ selector: '[trace]' })
    ], TraceDirective);
    return TraceDirective;
}());
export { TraceDirective };
/**
 * A module serves as a single compilation unit for the `TraceDirective` and can be re-used by any other module.
 */
var TraceModule = /** @class */ (function () {
    function TraceModule() {
    }
    TraceModule = __decorate([
        NgModule({
            declarations: [TraceDirective],
            exports: [TraceDirective],
        })
    ], TraceModule);
    return TraceModule;
}());
export { TraceModule };
/**
 * Decorator function that can be used to capture initialization lifecycle of the whole component.
 */
export function TraceClassDecorator() {
    var tracingSpan;
    /* eslint-disable @typescript-eslint/no-unsafe-member-access */
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    return function (target) {
        var originalOnInit = target.prototype.ngOnInit;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        target.prototype.ngOnInit = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            var activeTransaction = getActiveTransaction();
            if (activeTransaction) {
                tracingSpan = activeTransaction.startChild({
                    description: "<" + target.name + ">",
                    op: ANGULAR_INIT_OP,
                });
            }
            if (originalOnInit) {
                return originalOnInit.apply(this, args);
            }
        };
        var originalAfterViewInit = target.prototype.ngAfterViewInit;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        target.prototype.ngAfterViewInit = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            if (tracingSpan) {
                tracingSpan.finish();
            }
            if (originalAfterViewInit) {
                return originalAfterViewInit.apply(this, args);
            }
        };
    };
    /* eslint-enable @typescript-eslint/no-unsafe-member-access */
}
/**
 * Decorator function that can be used to capture a single lifecycle methods of the component.
 */
export function TraceMethodDecorator() {
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type, @typescript-eslint/ban-types
    return function (target, propertyKey, descriptor) {
        var originalMethod = descriptor.value;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        descriptor.value = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            var now = timestampWithMs();
            var activeTransaction = getActiveTransaction();
            if (activeTransaction) {
                activeTransaction.startChild({
                    description: "<" + target.constructor.name + ">",
                    endTimestamp: now,
                    op: ANGULAR_OP + "." + String(propertyKey),
                    startTimestamp: now,
                });
            }
            if (originalMethod) {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                return originalMethod.apply(this, args);
            }
        };
        return descriptor;
    };
}
//# sourceMappingURL=tracing.js.map