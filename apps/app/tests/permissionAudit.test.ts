import { SCREEN_PERMISSIONS } from '@campus/config';
import { useProtectedRoute } from '../src/providers/AuthProvider';
import { useAuthStore } from '../src/store/authStore';
import { renderHook } from '@testing-library/react-native';

const mockReplace = jest.fn();
let mockSegments: string[] = [];

jest.mock('expo-router', () => ({
  useRouter: () => ({
    replace: mockReplace,
  }),
  useSegments: () => mockSegments,
}));

describe('Permission & Status Route Guard Audit (Item 9)', () => {
  beforeEach(() => {
    mockReplace.mockClear();
    mockSegments = [];
    useAuthStore.setState({
      isAuthenticated: true,
      accountStatus: 'active',
      isRestoringSession: false,
    });
  });

  it('verifies every screen in SCREEN_PERMISSIONS has a required permission entry', () => {
    const screens = Object.keys(SCREEN_PERMISSIONS);
    expect(screens.length).toBeGreaterThan(0);
    for (const [screen, perm] of Object.entries(SCREEN_PERMISSIONS)) {
      expect(perm).toBeDefined();
      expect(typeof perm).toBe('string');
      expect(perm.length).toBeGreaterThan(0);
    }
  });

  it('restricts pending_approval users to onboarding / status screen when navigating to dashboard', () => {
    mockSegments = ['(dashboard)'];
    useAuthStore.setState({ isAuthenticated: true, accountStatus: 'pending_approval' });

    renderHook(() => useProtectedRoute());

    expect(mockReplace).toHaveBeenCalledWith('/(onboarding)/onboarding');
  });

  it('restricts rejected users to onboarding / status screen when navigating to dashboard', () => {
    mockSegments = ['(dashboard)'];
    useAuthStore.setState({ isAuthenticated: true, accountStatus: 'rejected' });

    renderHook(() => useProtectedRoute());

    expect(mockReplace).toHaveBeenCalledWith('/(onboarding)/onboarding');
  });

  it('restricts frozen users to blocked screen only when navigating to dashboard', () => {
    mockSegments = ['(dashboard)'];
    useAuthStore.setState({ isAuthenticated: true, accountStatus: 'frozen' });

    renderHook(() => useProtectedRoute());

    expect(mockReplace).toHaveBeenCalledWith('/(blocked)/frozen');
  });
});
