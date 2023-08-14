import * as Sentry from '@sentry/node';
import { Integration } from '@sentry/types';
import { Handler } from 'aws-lambda';
export * from '@sentry/node';
export declare type AsyncHandler<T extends Handler> = (event: Parameters<T>[0], context: Parameters<T>[1]) => Promise<NonNullable<Parameters<Parameters<T>[2]>[1]>>;
export interface WrapperOptions {
    flushTimeout: number;
    rethrowAfterCapture: boolean;
    callbackWaitsForEmptyEventLoop: boolean;
    captureTimeoutWarning: boolean;
    timeoutWarningLimit: number;
    /**
     * Capture all errors when `Promise.allSettled` is returned by the handler
     * The {@link wrapHandler} will not fail the lambda even if there are errors
     * @default false
     */
    captureAllSettledReasons: boolean;
}
export declare const defaultIntegrations: Integration[];
/**
 * @see {@link Sentry.init}
 */
export declare function init(options?: Sentry.NodeOptions): void;
/** */
export declare function tryPatchHandler(taskRoot: string, handlerPath: string): void;
/**
 * Wraps a lambda handler adding it error capture and tracing capabilities.
 *
 * @param handler Handler
 * @param options Options
 * @returns Handler
 */
export declare function wrapHandler<TEvent, TResult>(handler: Handler<TEvent, TResult>, wrapOptions?: Partial<WrapperOptions>): Handler<TEvent, TResult | undefined>;
//# sourceMappingURL=awslambda.d.ts.map