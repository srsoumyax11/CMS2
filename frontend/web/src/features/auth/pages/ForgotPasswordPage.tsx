import React, { useState } from 'react';
import { Link } from 'react-router';
import { useToast } from '@/components/ui/Toast';
import { FormField } from '@/components/ui/FormField';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Mail, ArrowLeft } from 'lucide-react';
import { apiClient } from '@/lib/apiClient';

export const ForgotPasswordPage: React.FC = () => {
  const { showSuccess, showError } = useToast();
  const [email, setEmail] = useState<string>('');
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || isLoading) return;
    setIsLoading(true);

    try {
      await apiClient('/api/v1/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      }).catch(() => null);

      setIsSubmitted(true);
      showSuccess('Password reset link sent if account exists.');
    } catch {
      showError('Failed to send reset link.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="space-y-4 text-center">
        <h2 className="text-xl font-bold">Check Your Email</h2>
        <p className="text-xs text-muted-foreground">
          If an account is associated with <span className="font-semibold text-foreground">{email}</span>, password reset instructions have been sent.
        </p>
        <Link to="/login">
          <Button variant="outline" className="w-full mt-4 gap-2">
            <ArrowLeft className="h-4 w-4" />
            <span>Return to Log In</span>
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1 text-center">
        <h2 className="text-xl font-bold">Reset Password</h2>
        <p className="text-xs text-muted-foreground">Enter your registered email address to receive reset instructions</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label="Email Address" required>
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              type="email"
              placeholder="user@campus.edu"
              className="pl-9"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        </FormField>

        <Button type="submit" variant="primary" className="w-full" isLoading={isLoading}>
          Send Reset Instructions
        </Button>
      </form>

      <div className="text-center">
        <Link to="/login" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Log In</span>
        </Link>
      </div>
    </div>
  );
};
