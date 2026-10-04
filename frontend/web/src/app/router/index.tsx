import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router';
import { useAuth } from '@/app/providers/AuthProvider';
import { PublicLayout } from '@/app/layouts/PublicLayout';
import { AuthLayout } from '@/app/layouts/AuthLayout';
import { AppShell } from '@/app/layouts/AppShell';

// Import Feature Pages
import { WelcomePage } from '@/pages/WelcomePage';
import { LoginPage } from '@/features/auth/pages/LoginPage';
import { SignUpPage } from '@/features/auth/pages/SignUpPage';
import { ForgotPasswordPage } from '@/features/auth/pages/ForgotPasswordPage';
import { DashboardPage } from '@/features/onboarding/pages/DashboardPage';
import { ProfilePage } from '@/features/auth/pages/ProfilePage';
import { RequestRolePage } from '@/features/onboarding/pages/RequestRolePage';
import { NotificationsPage } from '@/features/onboarding/pages/NotificationsPage';
import { OutpassPage } from '@/features/outpass/pages/OutpassPage';
import { ComplaintsPage } from '@/features/complaints/pages/ComplaintsPage';
import { AttendancePage } from '@/features/attendance/pages/AttendancePage';
import { FeesPage } from '@/features/fees/pages/FeesPage';
import { SosPage } from '@/features/sos/pages/SosPage';
import { WardenDashboardPage } from '@/features/warden/pages/WardenDashboardPage';
import { AdminDashboardPage } from '@/features/admin/pages/AdminDashboardPage';
import { BlockedPage } from '@/pages/BlockedPage';
import { Skeleton } from '@/components/ui/Skeleton';
import { GraduationCap } from 'lucide-react';

/**
 * Route guard restricting public pages (Login/SignUp) when user is already authenticated.
 */
export const RequirePublicOnly: React.FC = () => {
  const { accountStatus, isLoadingSession } = useAuth();

  if (isLoadingSession) {
    return <SplashLoadingScreen />;
  }

  if (accountStatus === 'frozen') {
    return <Navigate to="/blocked" replace />;
  }

  if (accountStatus !== 'not_logged_in') {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

/**
 * Route guard requiring authenticated user. Checks for frozen status.
 */
export const RequireAuth: React.FC<{ allowedStatuses?: string[] }> = ({ allowedStatuses }) => {
  const { accountStatus, isLoadingSession } = useAuth();

  if (isLoadingSession) {
    return <SplashLoadingScreen />;
  }

  if (accountStatus === 'not_logged_in') {
    return <Navigate to="/login" replace />;
  }

  if (accountStatus === 'frozen') {
    return <Navigate to="/blocked" replace />;
  }

  if (allowedStatuses && !allowedStatuses.includes(accountStatus)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export const SplashLoadingScreen: React.FC = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-background space-y-4">
    <div className="flex items-center gap-2 font-bold text-2xl text-primary animate-pulse">
      <GraduationCap className="h-10 w-10" />
      <span>Campus CMS</span>
    </div>
    <p className="text-xs text-muted-foreground font-medium">Restoring campus session...</p>
    <div className="w-48">
      <Skeleton className="h-1.5 w-full" />
    </div>
  </div>
);

export const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<WelcomePage />} />
        </Route>

        {/* Public Only Auth Routes */}
        <Route element={<RequirePublicOnly />}>
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<SignUpPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          </Route>
        </Route>

        {/* Frozen Account Blocked Screen */}
        <Route path="/blocked" element={<BlockedPage />} />

        {/* Common Authenticated Routes (Registered, Pending, Active, Rejected) */}
        <Route element={<RequireAuth />}>
          <Route element={<AppShell />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/outpass" element={<OutpassPage />} />
            <Route path="/complaints" element={<ComplaintsPage />} />
            <Route path="/attendance" element={<AttendancePage />} />
            <Route path="/fees" element={<FeesPage />} />
            <Route path="/sos" element={<SosPage />} />
            <Route path="/warden" element={<WardenDashboardPage />} />
            <Route path="/admin" element={<AdminDashboardPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/request-role" element={<RequestRolePage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
          </Route>
        </Route>

        {/* Fallback Redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};
