import { EventProcessor, Hub, Integration } from '@sentry/types';
/**
 * Process WASM stack traces to support server-side symbolication.
 *
 * This also hooks the WebAssembly loading browser API so that module
 * registraitons are intercepted.
 */
export declare class Wasm implements Integration {
    /**
     * @inheritDoc
     */
    static id: string;
    /**
     * @inheritDoc
     */
    name: string;
    /**
     * @inheritDoc
     */
    setupOnce(addGlobalEventProcessor: (callback: EventProcessor) => void, _getCurrentHub: () => Hub): void;
}
//# sourceMappingURL=index.d.ts.map