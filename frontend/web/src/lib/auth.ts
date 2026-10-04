/**
 * In-memory access token storage.
 * Access tokens live strictly in memory and are never persisted to localStorage or sessionStorage.
 */
let memoryAccessToken: string | null = null;

export const authStore = {
  getToken: (): string | null => memoryAccessToken,
  setToken: (token: string | null): void => {
    memoryAccessToken = token;
  },
  clearToken: (): void => {
    memoryAccessToken = null;
  },
};
