import { MobileSecureTokenStore, createPlatformTokenStore } from '../src/tokenStore/secureTokenStore';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const mockStorage = new Map<string, string>();

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(async (key: string) => mockStorage.get(key) || null),
  setItemAsync: jest.fn(async (key: string, value: string) => {
    mockStorage.set(key, value);
  }),
  deleteItemAsync: jest.fn(async (key: string) => {
    mockStorage.delete(key);
  }),
}));

describe('MobileSecureTokenStore with Real expo-secure-store Mock', () => {
  let store: MobileSecureTokenStore;

  beforeEach(() => {
    mockStorage.clear();
    jest.clearAllMocks();
    store = new MobileSecureTokenStore();
  });

  it('stores and retrieves access token using SecureStore', async () => {
    await store.setAccessToken('sec_access_123');
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith('campus_access_token', 'sec_access_123');

    const token = await store.getAccessToken();
    expect(SecureStore.getItemAsync).toHaveBeenCalledWith('campus_access_token');
    expect(token).toBe('sec_access_123');
  });

  it('stores and retrieves refresh token using SecureStore', async () => {
    await store.setRefreshToken('sec_refresh_456');
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith('campus_refresh_token', 'sec_refresh_456');

    const token = await store.getRefreshToken();
    expect(SecureStore.getItemAsync).toHaveBeenCalledWith('campus_refresh_token');
    expect(token).toBe('sec_refresh_456');
  });

  it('clears access and refresh tokens from SecureStore', async () => {
    await store.setAccessToken('access_to_clear');
    await store.setRefreshToken('refresh_to_clear');

    await store.clearTokens();

    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('campus_access_token');
    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('campus_refresh_token');
    expect(await store.getAccessToken()).toBeNull();
    expect(await store.getRefreshToken()).toBeNull();
  });

  it('createPlatformTokenStore returns MobileSecureTokenStore on mobile and InMemoryTokenStore on web', () => {
    Platform.OS = 'ios';
    const mobileStore = createPlatformTokenStore();
    expect(mobileStore).toBeInstanceOf(MobileSecureTokenStore);

    Platform.OS = 'web';
    const webStore = createPlatformTokenStore();
    expect(webStore).not.toBeInstanceOf(MobileSecureTokenStore);
  });
});
