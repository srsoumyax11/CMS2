import React from 'react';
import { Link, Outlet } from 'react-router';
import { Button } from '@/components/ui/Button';
import { MockBanner } from '@/components/ui/MockBanner';
import { GraduationCap } from 'lucide-react';

export const PublicLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <MockBanner />
      {/* Navigation Header */}
      <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2 font-bold text-lg text-primary">
            <GraduationCap className="h-6 w-6" />
            <span>Campus CMS</span>
          </Link>

          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost" size="sm">
                Log In
              </Button>
            </Link>
            <Link to="/register">
              <Button variant="primary" size="sm">
                Sign Up
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Body */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t py-6 bg-muted/30">
        <div className="container mx-auto px-4 text-center text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} Campus Management System. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};
