import React from 'react';
import { useAuth } from '@/app/providers/AuthProvider';
import { hasPermission } from '@/config/permissions';

interface PermissionGateProps {
  permission?: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const PermissionGate: React.FC<PermissionGateProps> = ({
  permission,
  children,
  fallback = null,
}) => {
  const { user } = useAuth();

  if (!permission) return <>{children}</>;
  if (!user?.roles || user.roles.length === 0) return <>{fallback}</>;

  const allowed = hasPermission(user.roles, permission);
  if (!allowed) return <>{fallback}</>;

  return <>{children}</>;
};
