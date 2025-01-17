export { Breadcrumb, Request, SdkInfo, Event, EventStatus, Exception, Response, SeverityLevel, StackFrame, Stacktrace, Thread, User, } from '@sentry/types';
export { BrowserClient, BrowserOptions, defaultIntegrations, forceLoad, lastEventId, onLoad, showReportDialog, flush, close, wrap, ReportDialogOptions, addGlobalEventProcessor, addBreadcrumb, captureException, captureEvent, captureMessage, configureScope, getHubFromCarrier, getCurrentHub, Hub, Scope, setContext, setExtra, setExtras, setTag, setTags, setUser, startTransaction, Transports, withScope, SDK_NAME, SDK_VERSION, } from '@sentry/browser';
export { init } from './sdk';
export { vueRouterInstrumentation } from './router';
export { attachErrorHandler } from './errorhandler';
export { createTracingMixins } from './tracing';
declare const INTEGRATIONS: {
    GlobalHandlers: typeof import("@sentry/browser/dist/integrations").GlobalHandlers;
    TryCatch: typeof import("@sentry/browser/dist/integrations").TryCatch;
    Breadcrumbs: typeof import("@sentry/browser/dist/integrations").Breadcrumbs;
    LinkedErrors: typeof import("@sentry/browser/dist/integrations").LinkedErrors;
    UserAgent: typeof import("@sentry/browser/dist/integrations").UserAgent;
    Dedupe: typeof import("@sentry/browser/dist/integrations").Dedupe;
    FunctionToString: typeof import("@sentry/core/dist/integrations").FunctionToString;
    InboundFilters: typeof import("@sentry/core/dist/integrations").InboundFilters;
};
export { INTEGRATIONS as Integrations };
//# sourceMappingURL=index.bundle.d.ts.map