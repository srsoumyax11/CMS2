const SENSITIVE_NORMALIZED_KEYS = new Set([
  'accesstoken',
  'refreshtoken',
  'idtoken',
  'backupcode',
  'newpassword',
  'oldpassword',
  'otpcode',
  'cookie',
  'setcookie',
  'authorization',
  'password',
  'otp',
  'token',
  'secret',
  'marks',
  'health',
  'anonymous',
  'pin',
  'cvv',
  'code',
  'passcode',
  'authcode',
]);

const JWT_REGEX = /^eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/;

function redactUrlQueryParams(urlStr: string): string {
  try {
    const url = new URL(urlStr);
    let modified = false;
    for (const param of Array.from(url.searchParams.keys())) {
      const normalized = param.toLowerCase().replace(/[_|-]/g, '');
      if (SENSITIVE_NORMALIZED_KEYS.has(normalized) || normalized.includes('token') || normalized.includes('secret')) {
        url.searchParams.set(param, '[REDACTED_PARAM]');
        modified = true;
      }
    }
    return modified ? url.toString() : urlStr;
  } catch {
    // If not a valid URL, perform regex replacement on token-like query params
    return urlStr.replace(/([?&](?:token|access_token|refresh_token|code|secret|otp|password)=)[^&]+/gi, '$1[REDACTED_PARAM]');
  }
}

export function redactSensitiveData(obj: unknown, seen = new WeakSet<object>()): unknown {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj === 'string') {
    const trimmed = obj.trim();
    if (JWT_REGEX.test(trimmed)) {
      return '[REDACTED_JWT]';
    }
    if (trimmed.includes('?') && (trimmed.includes('http://') || trimmed.includes('https://') || trimmed.includes('token=') || trimmed.includes('code='))) {
      return redactUrlQueryParams(trimmed);
    }
    return obj;
  }

  if (typeof obj !== 'object') {
    return obj;
  }

  if (seen.has(obj as object)) {
    return '[CIRCULAR_REF]';
  }
  seen.add(obj as object);

  if (Array.isArray(obj)) {
    return obj.map((item) => redactSensitiveData(item, seen));
  }

  const redacted: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
    const normalizedKey = key.toLowerCase().replace(/[_|-]/g, '');
    if (SENSITIVE_NORMALIZED_KEYS.has(normalizedKey)) {
      redacted[key] = '[REDACTED]';
    } else {
      redacted[key] = redactSensitiveData(value, seen);
    }
  }
  return redacted;
}
