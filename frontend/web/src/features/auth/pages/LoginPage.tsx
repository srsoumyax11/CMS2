import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router';
import { useAuth } from '@/app/providers/AuthProvider';
import { useToast } from '@/components/ui/Toast';
import { FormField } from '@/components/ui/FormField';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { loginSchema, LoginFormData, twoFactorSchema, TwoFactorFormData } from '../schema';
import { authApi } from '../api';
import { AppError } from '@/lib/apiClient';
import { ShieldCheck, Lock, Mail } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const { showError, showSuccess } = useToast();
  const navigate = useNavigate();

  const [requires2fa, setRequires2fa] = useState<boolean>(false);
  const [ticket2fa, setTicket2fa] = useState<string>('');
  const [isBackupCode, setIsBackupCode] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const {
    register: registerLogin,
    handleSubmit: handleSubmitLogin,
    formState: { errors: loginErrors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const {
    register: register2fa,
    handleSubmit: handleSubmit2fa,
    formState: { errors: errors2fa },
  } = useForm<TwoFactorFormData>({
    resolver: zodResolver(twoFactorSchema),
    defaultValues: { isBackupCode: false },
  });

  const onLoginSubmit = async (data: LoginFormData) => {
    if (isSubmitting) return; // Block double submit
    setIsSubmitting(true);

    try {
      const res = await authApi.login(data.emailOrId, data.password);

      if (res.requires2fa && res.ticket2fa) {
        setRequires2fa(true);
        setTicket2fa(res.ticket2fa);
        showSuccess('Credentials verified. Please enter 2FA code.');
        return;
      }

      if (res.accessToken && res.user) {
        login(res.accessToken, res.user);
        showSuccess('Logged in successfully!');
        navigate('/dashboard');
      }
    } catch (err) {
      if (err instanceof AppError) {
        showError(err.message, err.requestId ? `Request ID: ${err.requestId}` : undefined);
      } else {
        showError('Invalid login credentials.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const on2faSubmit = async (data: TwoFactorFormData) => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const res = await authApi.verify2fa(ticket2fa, data.code, isBackupCode);

      if (res.accessToken && res.user) {
        login(res.accessToken, res.user);
        showSuccess('2FA verification successful!');
        navigate('/dashboard');
      }
    } catch (err) {
      if (err instanceof AppError) {
        showError(err.message, err.requestId ? `Request ID: ${err.requestId}` : undefined);
      } else {
        showError('Invalid 2FA code. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (requires2fa) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col items-center text-center space-y-1">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary mb-2">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-bold">Two-Factor Authentication</h2>
          <p className="text-xs text-muted-foreground">
            {isBackupCode
              ? 'Enter one of your 8-digit emergency backup codes'
              : 'Enter the 6-digit verification code from your authenticator app'}
          </p>
        </div>

        <form onSubmit={handleSubmit2fa(on2faSubmit)} className="space-y-4">
          <FormField
            label={isBackupCode ? 'Backup Code' : '2FA Verification Code'}
            error={errors2fa.code?.message}
            required
          >
            <Input
              type="text"
              placeholder={isBackupCode ? 'e.g. 1234-5678' : '000000'}
              maxLength={isBackupCode ? 12 : 6}
              {...register2fa('code')}
            />
          </FormField>

          <Button type="submit" variant="primary" className="w-full" isLoading={isSubmitting}>
            Verify & Log In
          </Button>
        </form>

        <div className="text-center pt-2">
          <button
            type="button"
            onClick={() => setIsBackupCode(!isBackupCode)}
            className="text-xs text-primary hover:underline font-medium"
          >
            {isBackupCode ? 'Use Authenticator Code instead' : 'Use a Backup Code instead'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1 text-center">
        <h2 className="text-xl font-bold">Log In to Your Account</h2>
        <p className="text-xs text-muted-foreground">Enter your campus credentials to continue</p>
      </div>

      <form onSubmit={handleSubmitLogin(onLoginSubmit)} className="space-y-4">
        <FormField label="Email Address or ID" error={loginErrors.emailOrId?.message} required>
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="user@campus.edu or Roll No"
              className="pl-9"
              {...registerLogin('emailOrId')}
            />
          </div>
        </FormField>

        <FormField label="Password" error={loginErrors.password?.message} required>
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              type="password"
              placeholder="••••••••"
              className="pl-9"
              {...registerLogin('password')}
            />
          </div>
        </FormField>

        <div className="flex items-center justify-between text-xs">
          <Link to="/forgot-password" className="text-primary hover:underline font-medium">
            Forgot password?
          </Link>
        </div>

        <Button type="submit" variant="primary" className="w-full" isLoading={isSubmitting}>
          Log In
        </Button>
      </form>

      <div className="text-center text-xs text-muted-foreground">
        Don&apos;t have an account?{' '}
        <Link to="/register" className="text-primary font-semibold hover:underline">
          Sign Up
        </Link>
      </div>
    </div>
  );
};
