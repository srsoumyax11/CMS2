import { renderHook } from '@testing-library/react-native';
import { useProtectedRoute } from '../src/providers/AuthProvider';
import { useAuthStore } from '../src/store/authStore';

const mockReplace = jest.fn();
let mockSegments: string[] = [];

jest.mock('expo-router', () => ({
  useRouter: () => ({
    replace: mockReplace,
  }),
  useSegments: () => mockSegments,
}));

describe('useProtectedRoute (Real Guard Code)', () => {
  beforeEach(() => {
    mockReplace.mockClear();
    mockSegments = [];
    useAuthStore.setState({
      isAuthenticated: false,
      accountStatus: null,
      isRestoringSession: false,
    });
  });

  it('redirects unauthenticated user from (dashboard) to (auth)/login', () => {
    mockSegments = ['(dashboard)'];
    useAuthStore.setState({ isAuthenticated: false, accountStatus: null });

    renderHook(() => useProtectedRoute());

    expect(mockReplace).toHaveBeenCalledWith('/(auth)/login');
  });

  it('does not redirect unauthenticated user if already in (auth) group', () => {
    mockSegments = ['(auth)'];
    useAuthStore.setState({ isAuthenticated: false, accountStatus: null });

    renderHook(() => useProtectedRoute());

    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('redirects registered user to onboarding', () => {
    mockSegments = ['(dashboard)'];
    useAuthStore.setState({ isAuthenticated: true, accountStatus: 'registered' });

    renderHook(() => useProtectedRoute());

    expect(mockReplace).toHaveBeenCalledWith('/(onboarding)/onboarding');
  });

  it('redirects active user to dashboard when in auth group', () => {
    mockSegments = ['(auth)'];
    useAuthStore.setState({ isAuthenticated: true, accountStatus: 'active' });

    renderHook(() => useProtectedRoute());

    expect(mockReplace).toHaveBeenCalledWith('/(dashboard)');
  });

  it('redirects frozen user to blocked screen and ONLY blocked screen when in dashboard', () => {
    mockSegments = ['(dashboard)'];
    useAuthStore.setState({ isAuthenticated: true, accountStatus: 'frozen' });

    renderHook(() => useProtectedRoute());

    expect(mockReplace).toHaveBeenCalledWith('/(blocked)/frozen');
  });

  it('allows frozen user to stay on blocked screen without further redirect', () => {
    mockSegments = ['(blocked)'];
    useAuthStore.setState({ isAuthenticated: true, accountStatus: 'frozen' });

    renderHook(() => useProtectedRoute());

    expect(mockReplace).not.toHaveBeenCalled();
  });
});
