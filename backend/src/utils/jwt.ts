import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export interface TokenPayload {
  sub: string;
  userCode?: string;
  roles?: string[];
  type: 'access' | 'refresh';
}

/**
 * Signs an access token (expires in 15 minutes)
 */
export const signAccessToken = (payload: Omit<TokenPayload, 'type'>): string => {
  return jwt.sign(
    { ...payload, type: 'access' },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN as any }
  );
};

/**
 * Signs a refresh token (expires in 7 days)
 */
export const signRefreshToken = (payload: Omit<TokenPayload, 'type'>): string => {
  return jwt.sign(
    { ...payload, type: 'refresh' },
    env.JWT_REFRESH_SECRET,
    { expiresIn: env.REFRESH_TOKEN_EXPIRES_IN as any }
  );
};

/**
 * Verifies a JWT token and returns payload if valid
 */
export const verifyToken = (token: string): TokenPayload | null => {
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as TokenPayload;
    return decoded;
  } catch (error) {
    try {
      const decoded = jwt.verify(token, env.JWT_REFRESH_SECRET) as TokenPayload;
      return decoded;
    } catch {
      return null;
    }
  }
};
