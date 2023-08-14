import { Integration } from '@sentry/types';
/** AWS service requests tracking */
export declare class AWSServices implements Integration {
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
//# sourceMappingURL=awsservices.d.ts.map