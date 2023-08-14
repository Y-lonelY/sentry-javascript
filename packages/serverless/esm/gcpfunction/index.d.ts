import * as Sentry from '@sentry/node';
import { Integration } from '@sentry/types';
export * from './http';
export * from './events';
export * from './cloud_events';
export declare const defaultIntegrations: Integration[];
/**
 * @see {@link Sentry.init}
 */
export declare function init(options?: Sentry.NodeOptions): void;
//# sourceMappingURL=index.d.ts.map