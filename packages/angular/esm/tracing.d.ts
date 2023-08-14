import { AfterViewInit, OnDestroy, OnInit } from '@angular/core';
import { Event, Router } from '@angular/router';
import { Transaction, TransactionContext } from '@sentry/types';
import { Observable } from 'rxjs';
/**
 * Creates routing instrumentation for Angular Router.
 */
export declare function routingInstrumentation(customStartTransaction: (context: TransactionContext) => Transaction | undefined, startTransactionOnPageLoad?: boolean, startTransactionOnLocationChange?: boolean): void;
export declare const instrumentAngularRouting: typeof routingInstrumentation;
/**
 * Grabs active transaction off scope
 */
export declare function getActiveTransaction(): Transaction | undefined;
/**
 * Angular's Service responsible for hooking into Angular Router and tracking current navigation process.
 * Creates a new transaction for every route change and measures a duration of routing process.
 */
export declare class TraceService implements OnDestroy {
    private readonly _router;
    navStart$: Observable<Event>;
    navEnd$: Observable<Event>;
    private _routingSpan;
    private _subscription;
    constructor(_router: Router);
    /**
     * This is used to prevent memory leaks when the root view is created and destroyed multiple times,
     * since `subscribe` callbacks capture `this` and prevent many resources from being GC'd.
     */
    ngOnDestroy(): void;
}
/**
 * A directive that can be used to capture initialization lifecycle of the whole component.
 */
export declare class TraceDirective implements OnInit, AfterViewInit {
    componentName: string;
    private _tracingSpan?;
    /**
     * Implementation of OnInit lifecycle method
     * @inheritdoc
     */
    ngOnInit(): void;
    /**
     * Implementation of AfterViewInit lifecycle method
     * @inheritdoc
     */
    ngAfterViewInit(): void;
}
/**
 * A module serves as a single compilation unit for the `TraceDirective` and can be re-used by any other module.
 */
export declare class TraceModule {
}
/**
 * Decorator function that can be used to capture initialization lifecycle of the whole component.
 */
export declare function TraceClassDecorator(): ClassDecorator;
/**
 * Decorator function that can be used to capture a single lifecycle methods of the component.
 */
export declare function TraceMethodDecorator(): MethodDecorator;
//# sourceMappingURL=tracing.d.ts.map