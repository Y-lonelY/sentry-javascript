import * as api from '@opentelemetry/api';
import type { Hub, RunWithAsyncContextOptions } from '@sentry/core';
import { setAsyncContextStrategy } from '@sentry/core';

import { getHubFromContext } from './utils/contextData';

/**
 * Sets the async context strategy to use follow the OTEL context under the hood.
 * We handle forking a hub inside of our custom OTEL Context Manager (./otelContextManager.ts)
 */
export function setOpenTelemetryContextAsyncContextStrategy(): void {
  function getCurrentHub(): Hub | undefined {
    const ctx = api.context.active();

    // Returning undefined means the global hub will be used
    // Need to cast from @sentry/type's `Hub` to @sentry/core's `Hub`
    return getHubFromContext(ctx) as Hub | undefined;
  }

  /* This is more or less a NOOP - we rely on the OTEL context manager for this */
  function runWithAsyncContext<T>(callback: () => T, options: RunWithAsyncContextOptions): T {
    const existingHub = getCurrentHub();

    if (existingHub && options?.reuseExisting) {
      // We're already in an async context, so we don't need to create a new one
      // just call the callback with the current hub
      return callback();
    }

    const ctx = api.context.active();

    // We depend on the otelContextManager to handle the context/hub
    return api.context.with(ctx, () => {
      return callback();
    });
  }

  setAsyncContextStrategy({ getCurrentHub, runWithAsyncContext });
}
