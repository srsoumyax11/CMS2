import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/app/providers/AuthProvider';
import { useToast } from '@/components/ui/Toast';
import { FormField } from '@/components/ui/FormField';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { changePasswordSchema, ChangePasswordFormData } from '../schema';
import { authApi, DeviceSession } from '../api';
import { Laptop, LogOut, KeyRound, Smartphone } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user, logout } = useAuth();
  const { showSuccess, showError } = useToast();

  const [devices, setDevices] = useState<DeviceSession[]>([]);
  const [isChangingPassword, setIsChangingPassword] = useState<boolean>(false);
  const [showLogoutAllConfirm, setShowLogoutAllConfirm] = useState<boolean>(false);
  const [isLoggingOutAll, setIsLoggingOutAll] = useState<boolean>(false);

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    reset: resetPasswordForm,
    formState: { errors: passwordErrors },
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
  });

  useEffect(() => {
    let ignore = false;
    authApi.getDevices().then((data) => {
      if (!ignore) {
        setDevices(data);
      }
    }).catch(() => {
      if (!ignore) {
        setDevices([
          {
            id: 'dev_current',
            deviceName: 'Web Browser (Current Session)',
            browser: 'Chrome / Edge',
            ipAddress: '127.0.0.1',
            lastActive: 'Active Now',
            isCurrent: true,
          },
        ]);
      }
    });
    return () => {
      ignore = true;
    };
  }, []);

  const onChangePasswordSubmit = async (data: ChangePasswordFormData) => {
    if (isChangingPassword) return;
    setIsChangingPassword(true);

    try {
      await authApi.changePassword(data.currentPassword, data.newPassword);
      showSuccess('Password updated successfully!');
      resetPasswordForm();
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to change password.');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleRevokeDevice = async (deviceId: string) => {
    try {
      await authApi.revokeDevice(deviceId);
      showSuccess('Device session revoked.');
      setDevices((prev) => prev.filter((d) => d.id !== deviceId));
    } catch {
      showError('Failed to revoke device session.');
    }
  };

  const handleLogoutAll = async () => {
    setIsLoggingOutAll(true);
    try {
      await authApi.logoutAllDevices();
      showSuccess('Logged out from all devices.');
      await logout();
    } catch {
      showError('Failed to log out all devices.');
    } finally {
      setIsLoggingOutAll(false);
      setShowLogoutAllConfirm(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-foreground">My Account & Profile</h1>
        <p className="text-sm text-muted-foreground">Manage profile info, password, and active sessions</p>
      </div>

      {/* Account Info Card */}
      <div className="border rounded-xl p-6 bg-card space-y-4 shadow-sm">
        <div className="flex items-center justify-between pb-4 border-b">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-lg">
              {user?.fullName?.charAt(0) || user?.email?.charAt(0) || 'U'}
            </div>
            <div>
              <h3 className="font-semibold text-base text-foreground">{user?.fullName || 'User'}</h3>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
          </div>
          {user?.status && <StatusBadge status={user.status} />}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-xs text-muted-foreground block">User ID</span>
            <span className="font-mono text-xs">{user?.id}</span>
          </div>
          <div>
            <span className="text-xs text-muted-foreground block">Assigned Roles</span>
            <span className="font-semibold">{user?.roles?.join(', ') || 'No Role Assigned'}</span>
          </div>
        </div>
      </div>

      {/* Change Password Form */}
      <div className="border rounded-xl p-6 bg-card space-y-4 shadow-sm">
        <div className="flex items-center gap-2 text-base font-bold text-foreground">
          <KeyRound className="h-5 w-5 text-primary" />
          <span>Change Password</span>
        </div>

        <form onSubmit={handleSubmitPassword(onChangePasswordSubmit)} className="space-y-4 max-w-md">
          <FormField label="Current Password" error={passwordErrors.currentPassword?.message} required>
            <Input type="password" placeholder="••••••••" {...registerPassword('currentPassword')} />
          </FormField>

          <FormField label="New Password" error={passwordErrors.newPassword?.message} required>
            <Input type="password" placeholder="At least 8 characters" {...registerPassword('newPassword')} />
          </FormField>

          <FormField label="Confirm New Password" error={passwordErrors.confirmNewPassword?.message} required>
            <Input type="password" placeholder="Re-enter new password" {...registerPassword('confirmNewPassword')} />
          </FormField>

          <Button type="submit" variant="primary" isLoading={isChangingPassword}>
            Update Password
          </Button>
        </form>
      </div>

      {/* Devices / Active Sessions */}
      <div className="border rounded-xl p-6 bg-card space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-base font-bold text-foreground">
            <Laptop className="h-5 w-5 text-primary" />
            <span>Active Sessions & Devices</span>
          </div>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setShowLogoutAllConfirm(true)}
            className="gap-1.5"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Log Out All Devices</span>
          </Button>
        </div>

        <div className="divide-y divide-border">
          {devices.map((device) => (
            <div key={device.id} className="py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-muted text-muted-foreground">
                  <Smartphone className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-foreground">{device.deviceName}</span>
                    {device.isCurrent && (
                      <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold">
                        Current Device
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {device.browser} • IP: {device.ipAddress} • {device.lastActive}
                  </p>
                </div>
              </div>
              {!device.isCurrent && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRevokeDevice(device.id)}
                  className="text-xs text-destructive hover:bg-destructive/10"
                >
                  Revoke
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Confirm Logout All Modal */}
      <ConfirmDialog
        isOpen={showLogoutAllConfirm}
        title="Log Out All Devices?"
        description="This will invalidate all active sessions across all browser tabs and mobile devices. You will be logged out immediately."
        confirmLabel="Log Out Everywhere"
        variant="destructive"
        isLoading={isLoggingOutAll}
        onConfirm={handleLogoutAll}
        onClose={() => setShowLogoutAllConfirm(false)}
      />
    </div>
  );
};
