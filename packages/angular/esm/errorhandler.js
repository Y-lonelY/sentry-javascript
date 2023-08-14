import { __assign, __decorate } from "tslib";
import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import * as Sentry from '@sentry/browser';
import { runOutsideAngular } from './zone';
/**
 * Implementation of Angular's ErrorHandler provider that can be used as a drop-in replacement for the stock one.
 */
var SentryErrorHandler = /** @class */ (function () {
    function SentryErrorHandler(options) {
        this._options = __assign({ logErrors: true }, options);
    }
    /**
     * Method called for every value captured through the ErrorHandler
     */
    SentryErrorHandler.prototype.handleError = function (error) {
        var extractedError = this._extractError(error) || 'Handled unknown error';
        // Capture handled exception and send it to Sentry.
        var eventId = runOutsideAngular(function () { return Sentry.captureException(extractedError); });
        // When in development mode, log the error to console for immediate feedback.
        if (this._options.logErrors) {
            // eslint-disable-next-line no-console
            console.error(extractedError);
        }
        // Optionally show user dialog to provide details on what happened.
        if (this._options.showDialog) {
            Sentry.showReportDialog(__assign(__assign({}, this._options.dialogOptions), { eventId: eventId }));
        }
    };
    /**
     * Used to pull a desired value that will be used to capture an event out of the raw value captured by ErrorHandler.
     */
    SentryErrorHandler.prototype._extractError = function (error) {
        // Allow custom overrides of extracting function
        if (this._options.extractor) {
            var defaultExtractor = this._defaultExtractor.bind(this);
            return this._options.extractor(error, defaultExtractor);
        }
        return this._defaultExtractor(error);
    };
    /**
     * Default implementation of error extraction that handles default error wrapping, HTTP responses, ErrorEvent and few other known cases.
     */
    SentryErrorHandler.prototype._defaultExtractor = function (errorCandidate) {
        var error = errorCandidate;
        // Try to unwrap zone.js error.
        // https://github.com/angular/angular/blob/master/packages/core/src/util/errors.ts
        if (error && error.ngOriginalError) {
            error = error.ngOriginalError;
        }
        // We can handle messages and Error objects directly.
        if (typeof error === 'string' || error instanceof Error) {
            return error;
        }
        // If it's http module error, extract as much information from it as we can.
        if (error instanceof HttpErrorResponse) {
            // The `error` property of http exception can be either an `Error` object, which we can use directly...
            if (error.error instanceof Error) {
                return error.error;
            }
            // ... or an`ErrorEvent`, which can provide us with the message but no stack...
            if (error.error instanceof ErrorEvent && error.error.message) {
                return error.error.message;
            }
            // ...or the request body itself, which we can use as a message instead.
            if (typeof error.error === 'string') {
                return "Server returned code " + error.status + " with body \"" + error.error + "\"";
            }
            // If we don't have any detailed information, fallback to the request message itself.
            return error.message;
        }
        // Nothing was extracted, fallback to default error message.
        return null;
    };
    SentryErrorHandler = __decorate([
        Injectable({ providedIn: 'root' })
    ], SentryErrorHandler);
    return SentryErrorHandler;
}());
/**
 * Factory function that creates an instance of a preconfigured ErrorHandler provider.
 */
function createErrorHandler(config) {
    return new SentryErrorHandler(config);
}
export { createErrorHandler, SentryErrorHandler };
//# sourceMappingURL=errorhandler.js.map