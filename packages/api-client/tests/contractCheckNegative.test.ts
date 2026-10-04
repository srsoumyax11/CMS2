import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { ApiResponseSchema } from '../src/schemas';

describe('Contract Check Negative Test (Schema Drift Detection)', () => {
  it('should detect breaking schema drift when a required field is altered or missing', () => {
    // 1. Expected Auth Token response schema require accessToken (string)
    const StrictAuthTokenSchema = z.object({
      accessToken: z.string(),
      refreshToken: z.string().optional(),
    });

    const WrappedSchema = ApiResponseSchema(StrictAuthTokenSchema);

    // 2. Mismatched payload missing required accessToken string (drifted backend response)
    const MismatchedPayload = {
      success: true,
      message: 'OK',
      data: {
        accessToken: 12345, // Number instead of string -> schema drift!
      },
      requestId: 'test-req',
      timestamp: new Date().toISOString(),
    };

    const result = WrappedSchema.safeParse(MismatchedPayload);

    // Assert that contract check fails on schema drift
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.path).toContain('accessToken');
    }
  });
});
