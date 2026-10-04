import React from 'react';
import { useAuth } from '@/app/providers/AuthProvider';
import { Button } from '@/components/ui/Button';
import { ShieldAlert, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router';

export const BlockedPage: React.FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-muted/20">
      <div className="w-full max-w-md text-center p-8 border rounded-xl bg-card shadow-sm space-y-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 text-destructive mx-auto">
          <ShieldAlert className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-bold text-foreground">Account Frozen / Blocked</h2>
        <p className="text-sm text-muted-foreground">
          Your account has been temporarily restricted by administration. Please contact your campus warden or IT admin for assistance.
        </p>
        <Button variant="outline" onClick={handleLogout} className="gap-2">
          <LogOut className="h-4 w-4" />
          <span>Log Out</span>
        </Button>
      </div>
    </div>
  );
};
