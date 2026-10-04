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

describe('Deep Link Security Route Guard (Item 12 & Gap 4)', () => {
  beforeEach(() => {
    mockReplace.mockClear();
    mockSegments = [];
    useAuthStore.setState({
      isAuthenticated: false,
      accountStatus: null,
      permissions: [],
      isRestoringSession: false,
    });
  });

  it('intercepts unauthenticated deep link to campus://dashboard/outpass and redirects to login', () => {
    mockSegments = ['(dashboard)', 'outpass'];
    renderHook(() => useProtectedRoute());

    expect(mockReplace).toHaveBeenCalledWith('/(auth)/login');
  });

  it('intercepts deep link to permission-denied route (userGovernance) for active user without required permission and redirects to unauthorized', () => {
    useAuthStore.setState({
      isAuthenticated: true,
      accountStatus: 'active',
      permissions: ['student.basic'], // lacks 'admin.users.manage' required by userGovernance
    });

    mockSegments = ['(dashboard)', 'userGovernance'];
    renderHook(() => useProtectedRoute());

    expect(mockReplace).toHaveBeenCalledWith('/(blocked)/unauthorized');
  });
});
