export interface AppConfig {
    apiBaseUrl: string;
    environment: 'development' | 'staging' | 'production';
    minAppVersion: string;
    supportedLanguages: Array<'en' | 'hi' | 'or'>;
    uploadLimits: {
        maxSizeBytes: number;
        allowedMimeTypes: string[];
    };
    pollingIntervals: {
        driverTelemetryMs: number;
        activeSosMs: number;
        noticeFeedMs: number;
        outpassStatusMs: number;
    };
    featureFlags: {
        anonymousReportEnabled: boolean;
        webSocketEnabled: boolean;
        offlineSyncEnabled: boolean;
        biometricAuthEnabled: boolean;
    };
}
export declare const appConfig: AppConfig;
//# sourceMappingURL=appConfig.d.ts.map