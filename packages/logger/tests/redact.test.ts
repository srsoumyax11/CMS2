import { describe, it, expect } from 'vitest';
import { redactSensitiveData } from '../src/redact';

describe('redactSensitiveData', () => {
  it('redacts all sensitive normalized keys (exact matching, ignoring case, underscores, dashes)', () => {
    const sensitivePayload = {
      accesstoken: 'secret_acc_123',
      access_token: 'secret_acc_456',
      refreshToken: 'secret_ref_789',
      idToken: 'secret_id_101',
      backupCode: 'backup_999',
      newPassword: 'my_new_password',
      oldPassword: 'my_old_password',
      otpCode: '123456',
      cookie: 'session_cookie=abc',
      setCookie: 'set_cookie=def',
      authorization: 'Bearer secret_token',
      password: 'super_secret_password',
      otp: '654321',
      token: 'jwt_token_sample',
      secret: 'api_secret_key',
      marks: 98,
      health: 'medical_condition_data',
      anonymous: 'anonymous_submission_text',
      pin: '1234',
      cvv: '999',
    };

    const redacted = redactSensitiveData(sensitivePayload) as Record<string, unknown>;

    for (const key of Object.keys(sensitivePayload)) {
      expect(redacted[key]).toBe('[REDACTED]');
    }
  });

  it('does NOT redact harmless keys containing substrings like bookmarks', () => {
    const harmlessPayload = {
      bookmarks: ['book1', 'book2'],
      healthCheckUrl: 'https://api.campus.edu/health',
      tokenCount: 42,
    };

    const redacted = redactSensitiveData(harmlessPayload) as Record<string, unknown>;

    expect(redacted.bookmarks).toEqual(['book1', 'book2']);
    expect(redacted.healthCheckUrl).toBe('https://api.campus.edu/health');
    expect(redacted.tokenCount).toBe(42);
  });

  it('masks JWT looking strings inside values', () => {
    const jwt = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
    const payload = { payload: jwt };

    const redacted = redactSensitiveData(payload) as Record<string, unknown>;
    expect(redacted.payload).toBe('[REDACTED_JWT]');
  });

  it('strips sensitive query parameters from URLs', () => {
    const url = 'https://api.campus.edu/callback?token=secret123&code=xyz789&user=john';
    const redacted = redactSensitiveData(url) as string;

    expect(redacted).toContain('token=%5BREDACTED_PARAM%5D');
    expect(redacted).toContain('code=%5BREDACTED_PARAM%5D');
    expect(redacted).toContain('user=john');
  });

  it('handles circular references safely without throwing', () => {
    const circularObj: Record<string, unknown> = { name: 'Test' };
    circularObj.self = circularObj;

    const redacted = redactSensitiveData(circularObj) as Record<string, unknown>;
    expect(redacted.name).toBe('Test');
    expect(redacted.self).toBe('[CIRCULAR_REF]');
  });
});
