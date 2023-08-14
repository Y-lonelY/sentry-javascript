import { Integration } from '@sentry/types';
/** Google Cloud Platform service requests tracking for RESTful APIs */
export declare class GoogleCloudHttp implements Integration {
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
//# sourceMappingURL=google-cloud-http.d.ts.map