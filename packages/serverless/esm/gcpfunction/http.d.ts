import { Handlers } from '@sentry/node';
import { HttpFunction, WrapperOptions } from './general';
declare type ParseRequestOptions = Handlers.ParseRequestOptions;
export interface HttpFunctionWrapperOptions extends WrapperOptions {
    parseRequestOptions: ParseRequestOptions;
}
/**
 * Wraps an HTTP function handler adding it error capture and tracing capabilities.
 *
 * @param fn HTTP Handler
 * @param options Options
 * @returns HTTP handler
 */
export declare function wrapHttpFunction(fn: HttpFunction, wrapOptions?: Partial<HttpFunctionWrapperOptions>): HttpFunction;
export {};
//# sourceMappingURL=http.d.ts.map