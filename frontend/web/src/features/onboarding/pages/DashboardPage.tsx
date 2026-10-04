import React from 'react';
import { Link } from 'react-router';
import { useAuth } from '@/app/providers/AuthProvider';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/Button';
import {
  User,
  FileCheck,
  Bell,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();

  const isRoleAssigned = user?.roles && user.roles.length > 0;
  const isPending = user?.roleRequestStatus === 'PENDING';

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="border rounded-2xl p-6 sm:p-8 bg-gradient-to-br from-primary/10 via-background to-card border-primary/20 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary mb-1">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Campus Operating System</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground">
              Welcome back, {user?.fullName || user?.email || 'User'}!
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Account status:{' '}
              <span className="font-semibold text-foreground capitalize">{user?.status?.replace(/_/g, ' ')}</span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            {user?.status && <StatusBadge status={user.status} />}
          </div>
        </div>
      </div>

      {/* Grid Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Role Application Status */}
        <div className="border rounded-xl p-6 bg-card space-y-3 shadow-sm flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <FileCheck className="h-5 w-5" />
              </div>
              {user?.roleRequestStatus && <StatusBadge status={user.roleRequestStatus} />}
            </div>
            <h3 className="font-bold text-base text-foreground">Role Request Status</h3>
            <p className="text-xs text-muted-foreground">
              {isRoleAssigned
                ? `Active Role: ${user.activeRole || user.roles.join(', ')}`
                : isPending
                ? 'Your role application is currently under warden review.'
                : 'Select your campus role to unlock outpass and attendance modules.'}
            </p>
          </div>

          <div className="pt-4">
            <Link to="/request-role">
              <Button variant="outline" size="sm" className="w-full gap-1.5 text-xs">
                <span>{isRoleAssigned ? 'View Role Applications' : 'Request Campus Role'}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Profile Completion Card */}
        <div className="border rounded-xl p-6 bg-card space-y-3 shadow-sm flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600">
                <User className="h-5 w-5" />
              </div>
              <span className="text-xs font-bold text-emerald-600">80% Complete</span>
            </div>
            <h3 className="font-bold text-base text-foreground">Profile Information</h3>
            <p className="text-xs text-muted-foreground">
              Email verified. Ensure your phone number and security preferences are updated.
            </p>
          </div>

          <div className="pt-4">
            <Link to="/profile">
              <Button variant="outline" size="sm" className="w-full gap-1.5 text-xs">
                <span>Manage Profile</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Notifications & System Alerts */}
        <div className="border rounded-xl p-6 bg-card space-y-3 shadow-sm flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600">
                <Bell className="h-5 w-5" />
              </div>
            </div>
            <h3 className="font-bold text-base text-foreground">Notifications & Alerts</h3>
            <p className="text-xs text-muted-foreground">
              Check latest campus notifications and system alerts.
            </p>
          </div>

          <div className="pt-4">
            <Link to="/notifications">
              <Button variant="outline" size="sm" className="w-full gap-1.5 text-xs">
                <span>View Inbox</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
