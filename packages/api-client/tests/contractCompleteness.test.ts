import { describe, it, expect } from 'vitest';
import { ENDPOINT_SCHEMA_MAP } from '../scripts/contract-check';

// List of all active app endpoints expected to be used by api-client
const REQUIRED_APP_ENDPOINTS = [
  '/api/v1/auth/login',
  '/api/v1/auth/2fa/verify',
  '/api/v1/auth/otp/send',
  '/api/v1/auth/otp/verify',
  '/api/v1/auth/logout',
  '/api/v1/auth/token/refresh',
  '/api/v1/me/permissions',
  '/api/v1/me/roles',
];

describe('Contract Check Completeness', () => {
  it('every active app endpoint used in api-client must have a contract check entry', () => {
    for (const endpoint of REQUIRED_APP_ENDPOINTS) {
      const entry = ENDPOINT_SCHEMA_MAP[endpoint];
      expect(entry, `Missing contract check entry for endpoint "${endpoint}"`).toBeDefined();
      expect(entry.schema, `Missing Zod schema for endpoint "${endpoint}"`).toBeDefined();
    }
  });
});
