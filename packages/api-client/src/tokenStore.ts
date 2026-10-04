export interface TokenStore {
  getAccessToken(): Promise<string | null>;
  setAccessToken(token: string | null): Promise<void>;
  getRefreshToken(): Promise<string | null>;
  setRefreshToken(token: string | null): Promise<void>;
  clearTokens(): Promise<void>;
}

export class InMemoryTokenStore implements TokenStore {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  async getAccessToken(): Promise<string | null> {
    return this.accessToken;
  }

  async setAccessToken(token: string | null): Promise<void> {
    this.accessToken = token;
  }

  async getRefreshToken(): Promise<string | null> {
    return this.refreshToken;
  }

  async setRefreshToken(token: string | null): Promise<void> {
    this.refreshToken = token;
  }

  async clearTokens(): Promise<void> {
    this.accessToken = null;
    this.refreshToken = null;
  }
}
