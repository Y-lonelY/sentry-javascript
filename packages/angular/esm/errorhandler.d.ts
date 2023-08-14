import { ErrorHandler as AngularErrorHandler } from '@angular/core';
import * as Sentry from '@sentry/browser';
/**
 * Options used to configure the behavior of the Angular ErrorHandler.
 */
export interface ErrorHandlerOptions {
    logErrors?: boolean;
    showDialog?: boolean;
    dialogOptions?: Sentry.ReportDialogOptions;
    /**
     * Custom implementation of error extraction from the raw value captured by the Angular.
     * @param error Value captured by Angular's ErrorHandler provider
     * @param defaultExtractor Default implementation that can be used as the fallback in case of custom implementation
     */
    extractor?(error: unknown, defaultExtractor: (error: unknown) => unknown): unknown;
}
/**
 * Implementation of Angular's ErrorHandler provider that can be used as a drop-in replacement for the stock one.
 */
declare class SentryErrorHandler implements AngularErrorHandler {
    protected readonly _options: ErrorHandlerOptions;
    constructor(options?: ErrorHandlerOptions);
    /**
     * Method called for every value captured through the ErrorHandler
     */
    handleError(error: unknown): void;
    /**
     * Used to pull a desired value that will be used to capture an event out of the raw value captured by ErrorHandler.
     */
    protected _extractError(error: unknown): unknown;
    /**
     * Default implementation of error extraction that handles default error wrapping, HTTP responses, ErrorEvent and few other known cases.
     */
    protected _defaultExtractor(errorCandidate: unknown): unknown;
}
/**
 * Factory function that creates an instance of a preconfigured ErrorHandler provider.
 */
declare function createErrorHandler(config?: ErrorHandlerOptions): SentryErrorHandler;
export { createErrorHandler, SentryErrorHandler };
//# sourceMappingURL=errorhandler.d.ts.map