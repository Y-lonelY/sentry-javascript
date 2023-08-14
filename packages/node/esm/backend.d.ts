import { BaseBackend } from '@sentry/core';
import { Event, EventHint, SeverityLevel, Transport } from '@sentry/types';
import { NodeOptions } from './types';
/**
 * The Sentry Node SDK Backend.
 * @hidden
 */
export declare class NodeBackend extends BaseBackend<NodeOptions> {
    /**
     * @inheritDoc
     */
    eventFromException(exception: any, hint?: EventHint): PromiseLike<Event>;
    /**
     * @inheritDoc
     */
    eventFromMessage(message: string, level?: SeverityLevel, hint?: EventHint): PromiseLike<Event>;
    /**
     * @inheritDoc
     */
    protected _setupTransport(): Transport;
}
//# sourceMappingURL=backend.d.ts.map