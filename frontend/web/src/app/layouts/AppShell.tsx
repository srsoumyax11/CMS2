import React, { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router';
import { useAuth } from '@/app/providers/AuthProvider';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/Button';
import { MockBanner } from '@/components/ui/MockBanner';
import {
  GraduationCap,
  LayoutDashboard,
  User,
  Bell,
  LogOut,
  Menu,
  X,
  FileCheck,
  Wrench,
  BookOpen,
  CreditCard,
  ShieldAlert,
  Building2,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';

export const AppShell: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Outpass', path: '/outpass', icon: FileCheck },
    { label: 'Complaints', path: '/complaints', icon: Wrench },
    { label: 'Attendance', path: '/attendance', icon: BookOpen },
    { label: 'Fees & Invoices', path: '/fees', icon: CreditCard },
    { label: 'Emergency SOS', path: '/sos', icon: ShieldAlert },
    { label: 'Warden Portal', path: '/warden', icon: Building2 },
    { label: 'Admin Portal', path: '/admin', icon: ShieldCheck },
    { label: 'Request Role', path: '/request-role', icon: UserCheck },
    { label: 'Notifications', path: '/notifications', icon: Bell },
    { label: 'Profile', path: '/profile', icon: User },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <MockBanner />
      {/* Top Header Navigation */}
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-md hover:bg-accent text-muted-foreground"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <Link to="/dashboard" className="flex items-center gap-2 font-bold text-lg text-primary">
              <GraduationCap className="h-6 w-6" />
              <span className="hidden sm:inline">Campus CMS</span>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            {user?.status && <StatusBadge status={user.status} />}
            <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{user?.fullName || user?.email}</span>
            </div>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-1.5 text-muted-foreground hover:text-destructive">
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Log Out</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto flex-1 flex flex-col md:flex-row">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex w-64 flex-col border-r p-4 space-y-1 shrink-0 bg-card/30">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                  }`
                }
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </aside>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b bg-card p-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                    }`
                  }
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
