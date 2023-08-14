import { Integration } from '@sentry/types';
/** Google Cloud Platform service requests tracking for GRPC APIs */
export declare class GoogleCloudGrpc implements Integration {
    /**
     * @inheritDoc
     */
    static id: string;
    /**
     * @inheritDoc
     */
    name: string;
    private readonly _optional;
    constructor(options?: {
        optional?: boolean;
    });
    /**
     * @inheritDoc
     */
    setupOnce(): void;
}
//# sourceMappingURL=google-cloud-grpc.d.ts.map