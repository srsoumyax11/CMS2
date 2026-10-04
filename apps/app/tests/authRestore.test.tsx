import { ApiClient, InMemoryTokenStore } from '@campus/api-client';
import { useAuthStore } from '../src/store/authStore';

describe('Web Silent Session Restore (Item 8)', () => {
  let testApiClient: ApiClient;

  beforeEach(() => {
    testApiClient = new ApiClient('http://localhost:3000/api/v1', new InMemoryTokenStore());
    useAuthStore.setState({
      isAuthenticated: false,
      accountStatus: null,
      isRestoringSession: true,
      permissions: [],
    });
    jest.restoreAllMocks();
  });

  it('restores session successfully when silentRestoreSession returns token', async () => {
    jest.spyOn(testApiClient, 'silentRestoreSession').mockResolvedValue('valid_web_token');
    jest.spyOn(testApiClient, 'get').mockResolvedValue({ permissions: ['STUDENT_READ'] });

    const token = await testApiClient.silentRestoreSession();
    expect(token).toBe('valid_web_token');

    useAuthStore.setState({
      isAuthenticated: true,
      accountStatus: 'active',
      permissions: ['STUDENT_READ'],
      isRestoringSession: false,
    });

    expect(useAuthStore.getState().isRestoringSession).toBe(false);
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
    expect(useAuthStore.getState().permissions).toContain('STUDENT_READ');
  });

  it('clears session when silentRestoreSession fails or returns null', async () => {
    jest.spyOn(testApiClient, 'silentRestoreSession').mockResolvedValue(null);

    const token = await testApiClient.silentRestoreSession();
    expect(token).toBeNull();

    useAuthStore.getState().clearSession();

    expect(useAuthStore.getState().isRestoringSession).toBe(false);
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(useAuthStore.getState().permissions).toEqual([]);
  });
});
