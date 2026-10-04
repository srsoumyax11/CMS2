import { Platform } from 'react-native';
import { InMemoryTokenStore, TokenStore } from '@campus/api-client';
import * as SecureStore from 'expo-secure-store';

export class MobileSecureTokenStore implements TokenStore {
  private accessTokenKey = 'campus_access_token';
  private refreshTokenKey = 'campus_refresh_token';

  async getAccessToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(this.accessTokenKey);
    } catch {
      return null;
    }
  }

  async setAccessToken(token: string): Promise<void> {
    await SecureStore.setItemAsync(this.accessTokenKey, token);
  }

  async getRefreshToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(this.refreshTokenKey);
    } catch {
      return null;
    }
  }

  async setRefreshToken(token: string): Promise<void> {
    await SecureStore.setItemAsync(this.refreshTokenKey, token);
  }

  async clearTokens(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(this.accessTokenKey);
      await SecureStore.deleteItemAsync(this.refreshTokenKey);
    } catch {
      // Ignore errors on clear
    }
  }
}

export function createPlatformTokenStore(): TokenStore {
  if (Platform.OS === 'web') {
    return new InMemoryTokenStore();
  }
  return new MobileSecureTokenStore();
}
