import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'cms2_production_secret_key_change_me_2026';
const ACCESS_TOKEN_EXPIRATION = '15m';
const REFRESH_TOKEN_EXPIRATION = '7d';

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
    JWT_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRATION }
  );
};

/**
 * Signs a refresh token (expires in 7 days)
 */
export const signRefreshToken = (payload: Omit<TokenPayload, 'type'>): string => {
  return jwt.sign(
    { ...payload, type: 'refresh' },
    JWT_SECRET,
    { expiresIn: REFRESH_TOKEN_EXPIRATION }
  );
};

/**
 * Verifies a JWT token and returns payload if valid
 */
export const verifyToken = (token: string): TokenPayload | null => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
    return decoded;
  } catch (error) {
    return null;
  }
};
