import { Integration } from '@sentry/types';
import { GatsbyOptions } from './types';
declare type UserFnIntegrations = (integrations: Integration[]) => Integration[];
export declare type UserIntegrations = Integration[] | UserFnIntegrations;
/**
 * Returns the integrations to add to the SDK.
 * If tracing is enabled, `BrowserTracing` is always present.
 *
 * @param options The options users have defined.
 */
export declare function getIntegrationsFromOptions(options: GatsbyOptions): UserIntegrations;
export {};
//# sourceMappingURL=integrations.d.ts.map