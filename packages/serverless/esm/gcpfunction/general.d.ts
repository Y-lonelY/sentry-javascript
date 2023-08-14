import { Scope } from '@sentry/node';
import { Request, Response } from 'express';
export interface HttpFunction {
    (req: Request, res: Response): any;
}
export interface EventFunction {
    (data: Record<string, any>, context: Context): any;
}
export interface EventFunctionWithCallback {
    (data: Record<string, any>, context: Context, callback: Function): any;
}
export interface CloudEventFunction {
    (cloudevent: CloudEventsContext): any;
}
export interface CloudEventFunctionWithCallback {
    (cloudevent: CloudEventsContext, callback: Function): any;
}
export interface CloudFunctionsContext {
    eventId?: string;
    timestamp?: string;
    eventType?: string;
    resource?: string;
}
export interface CloudEventsContext {
    [key: string]: any;
    type?: string;
    specversion?: string;
    source?: string;
    id?: string;
    time?: string;
    schemaurl?: string;
    contenttype?: string;
}
export declare type Context = CloudFunctionsContext | CloudEventsContext;
export interface WrapperOptions {
    flushTimeout: number;
}
/**
 * Enhances the scope with additional event information.
 *
 * @param scope scope
 * @param context event context
 */
export declare function configureScopeWithContext(scope: Scope, context: Context): void;
export { Request, Response };
//# sourceMappingURL=general.d.ts.map