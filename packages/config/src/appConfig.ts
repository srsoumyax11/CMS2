declare const process: { env: Record<string, string | undefined> };

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

export const appConfig: AppConfig = {
  apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:3000/api/v1',
  environment: (process.env.EXPO_PUBLIC_ENV as AppConfig['environment']) || 'development',
  minAppVersion: '1.0.0',
  supportedLanguages: ['en', 'hi', 'or'],
  uploadLimits: {
    maxSizeBytes: 10 * 1024 * 1024, // 10MB
    allowedMimeTypes: [
      'image/jpeg',
      'image/png',
      'image/webp',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ],
  },
  pollingIntervals: {
    driverTelemetryMs: 5000,
    activeSosMs: 3000,
    noticeFeedMs: 30000,
    outpassStatusMs: 15000,
  },
  featureFlags: {
    anonymousReportEnabled: false, // Hidden behind feature flag until backend anonymous endpoint is ready
    webSocketEnabled: false,
    offlineSyncEnabled: true,
    biometricAuthEnabled: false,
  },
};
