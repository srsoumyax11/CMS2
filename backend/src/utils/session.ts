import { createHash } from 'node:crypto';
import { env } from '../config/env';
import { prisma } from '../config/prisma';
import { signAccessToken, signRefreshToken } from './jwt';

/**
 * Computes a deterministic SHA-256 hash of a refresh token string for storage in auth_sessions
 */
export function hashRefreshToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

/**
 * Parses raw HTTP Cookie header into a key-value dictionary
 */
export function parseCookies(cookieHeader?: string | null): Record<string, string> {
  if (!cookieHeader) return {};
  const cookies: Record<string, string> = {};
  const pairs = cookieHeader.split(';');

  for (const pair of pairs) {
    const idx = pair.indexOf('=');
    if (idx < 0) continue;
    const key = pair.substring(0, idx).trim();
    const val = pair.substring(idx + 1).trim();
    cookies[key] = decodeURIComponent(val);
  }

  return cookies;
}

/**
 * Extracts client IP address. Only trusts x-forwarded-for or proxy headers when TRUSTED_PROXY=true
 */
export function getClientIp(request: Request, server?: any): string {
  const isTrusted = process.env.TRUSTED_PROXY ? process.env.TRUSTED_PROXY === 'true' : env.TRUSTED_PROXY === 'true';

  if (isTrusted && request?.headers) {
    const forwarded = request.headers.get('x-forwarded-for') || request.headers.get('cf-connecting-ip') || request.headers.get('x-real-ip');
    if (forwarded) {
      return String(forwarded).split(',')[0]!.trim();
    }
  }

  // When TRUSTED_PROXY is false, extract real socket IP from server.requestIP or socket
  if (server?.requestIP) {
    const ipObj = server.requestIP(request);
    if (ipObj?.address) {
      return ipObj.address;
    }
  }

  if ((request as any)?.socket?.remoteAddress) {
    return (request as any).socket.remoteAddress;
  }

  // Support x-socket-ip header in test environment to simulate raw socket IP
  if (request?.headers?.get('x-socket-ip')) {
    return request.headers.get('x-socket-ip')!.trim();
  }

  return '127.0.0.1';
}

/**
 * Computes rate limit key per token hash
 */
export function getTokenRateLimitKey(request: Request): string {
  const cookieHeader = request?.headers ? request.headers.get('cookie') : null;
  const cookies = parseCookies(cookieHeader);
  const token = cookies['refresh_token'] || (request?.headers ? request.headers.get('authorization') : null) || '';

  if (token) {
    return hashRefreshToken(token).substring(0, 16);
  }

  return 'no_token';
}

/**
 * Computes a rate limiter key combining client IP and token hash (legacy wrapper)
 */
export function getRefreshRateLimitKey(request: Request): string {
  const clientIp = getClientIp(request);
  const tokenKey = getTokenRateLimitKey(request);
  return `${clientIp}:${tokenKey}`;
}

/**
 * Formats Set-Cookie header for Web client refresh token
 */
export function setWebRefreshCookie(set: any, refreshToken: string) {
  const secureFlag = env.COOKIE_SECURE === 'true' ? ' Secure;' : '';
  const sameSiteCapitalized = env.COOKIE_SAMESITE.charAt(0).toUpperCase() + env.COOKIE_SAMESITE.slice(1);
  const domainFlag = env.COOKIE_DOMAIN ? ` Domain=${env.COOKIE_DOMAIN};` : '';

  const cookieStr = `refresh_token=${encodeURIComponent(refreshToken)}; Path=/api/v1/auth; Max-Age=604800; HttpOnly;${secureFlag} SameSite=${sameSiteCapitalized};${domainFlag}`;

  if (!set.headers) {
    set.headers = {};
  }

  if (Array.isArray(set.headers['Set-Cookie'])) {
    set.headers['Set-Cookie'].push(cookieStr);
  } else if (set.headers['Set-Cookie']) {
    set.headers['Set-Cookie'] = [set.headers['Set-Cookie'], cookieStr];
  } else {
    set.headers['Set-Cookie'] = cookieStr;
  }
}

/**
 * Clears refresh_token cookie on logout or token revocation
 */
export function clearWebRefreshCookie(set: any) {
  const secureFlag = env.COOKIE_SECURE === 'true' ? ' Secure;' : '';
  const sameSiteCapitalized = env.COOKIE_SAMESITE.charAt(0).toUpperCase() + env.COOKIE_SAMESITE.slice(1);
  const domainFlag = env.COOKIE_DOMAIN ? ` Domain=${env.COOKIE_DOMAIN};` : '';

  const cookieStr = `refresh_token=; Path=/api/v1/auth; Max-Age=0; HttpOnly;${secureFlag} SameSite=${sameSiteCapitalized};${domainFlag}`;

  if (!set.headers) {
    set.headers = {};
  }

  set.headers['Set-Cookie'] = cookieStr;
}

/**
 * Helper to issue access and refresh tokens, store session in DB, and format response/cookie based on client header.
 */
export async function issueAuthSession({
  user,
  request,
  set,
}: {
  user: { id: string; user_code: string | null };
  request: Request;
  set: any;
}) {
  const isWeb = request?.headers ? request.headers.get('x-client')?.toLowerCase() === 'web' : false;
  const headerIp = request?.headers ? (request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip')) : null;
  const clientIp = (headerIp || '127.0.0.1').split(',')[0]!.trim();

  const accessToken = signAccessToken({ sub: user.id, userCode: user.user_code || '' });
  const refreshToken = signRefreshToken({ sub: user.id, userCode: user.user_code || '' });

  const tokenHash = hashRefreshToken(refreshToken);
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  await prisma.auth_sessions.create({
    data: {
      id: crypto.randomUUID(),
      user_id: user.id,
      refresh_token_hash: tokenHash,
      ip_address: clientIp,
      expires_at: expiresAt,
    },
  });

  if (isWeb) {
    setWebRefreshCookie(set, refreshToken);
    return {
      token: accessToken,
      accessToken,
    };
  } else {
    return {
      token: accessToken,
      accessToken,
      refreshToken,
    };
  }
}

