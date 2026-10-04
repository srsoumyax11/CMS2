import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router';
import { useAuth } from '@/app/providers/AuthProvider';
import { useToast } from '@/components/ui/Toast';
import { FormField } from '@/components/ui/FormField';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { OtpInput } from '@/components/ui/OtpInput';
import { signUpSchema, SignUpFormData } from '../schema';
import { authApi } from '../api';
import { AppError } from '@/lib/apiClient';
import { APP_CONSTANTS } from '@/config/constants';
import { Mail, Lock, User as UserIcon } from 'lucide-react';

export const SignUpPage: React.FC = () => {
  const { login } = useAuth();
  const { showError, showSuccess } = useToast();
  const navigate = useNavigate();

  const [step, setStep] = useState<'form' | 'otp'>('form');
  const [registeredEmail, setRegisteredEmail] = useState<string>('');
  const [otpCode, setOtpCode] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Resend cooldown timer state
  const [cooldown, setCooldown] = useState<number>(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
  });

  const onSignUpSubmit = async (data: SignUpFormData) => {
    if (isSubmitting) return; // Block double submit
    setIsSubmitting(true);

    try {
      const res = await authApi.register(data.fullName, data.email, data.password);
      setRegisteredEmail(data.email);
      setStep('otp');
      setCooldown(res.resendCooldownSec || APP_CONSTANTS.OTP_RESEND_COOLDOWN_SEC);
      showSuccess(`Verification code sent to ${data.email}`);
    } catch (err) {
      if (err instanceof AppError) {
        if (err.status === 409 || err.message.toLowerCase().includes('already registered')) {
          showError('An account with this email address already exists. Please log in instead.');
        } else if (err.status === 429 && err.retryAfter) {
          showError(`Too many sign-up attempts. Please wait ${err.retryAfter} seconds.`);
        } else {
          showError(err.message, err.requestId ? `Request ID: ${err.requestId}` : undefined);
        }
      } else {
        showError('Registration failed. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const onOtpVerify = async () => {
    if (otpCode.length !== APP_CONSTANTS.OTP_LENGTH || isSubmitting) return;
    setIsSubmitting(true);

    try {
      const res = await authApi.verifyOtp(registeredEmail, otpCode);

      if (res.accessToken && res.user) {
        login(res.accessToken, res.user);
        showSuccess('Account verified and logged in successfully!');
        navigate('/dashboard');
      } else {
        showSuccess('Email verified! Please log in.');
        navigate('/login');
      }
    } catch (err) {
      if (err instanceof AppError) {
        showError(err.message, err.requestId ? `Request ID: ${err.requestId}` : undefined);
      } else {
        showError('Invalid OTP verification code.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendOtp = async () => {
    if (cooldown > 0 || isSubmitting) return;
    setIsSubmitting(true);

    try {
      const res = await authApi.resendOtp(registeredEmail);
      setCooldown(res.resendCooldownSec || APP_CONSTANTS.OTP_RESEND_COOLDOWN_SEC);
      showSuccess('A fresh verification code has been sent to your email.');
    } catch (err) {
      if (err instanceof AppError) {
        if (err.status === 429 && err.retryAfter) {
          setCooldown(err.retryAfter);
          showError(`Rate limit exceeded. Please wait ${err.retryAfter} seconds before requesting another code.`);
        } else {
          showError(err.message);
        }
      } else {
        showError('Failed to resend code.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (step === 'otp') {
    return (
      <div className="space-y-6">
        <div className="text-center space-y-1">
          <h2 className="text-xl font-bold">Verify Email Address</h2>
          <p className="text-xs text-muted-foreground">
            Enter the 6-digit verification code sent to <span className="font-semibold text-foreground">{registeredEmail}</span>
          </p>
        </div>

        <div className="space-y-4 py-2">
          <OtpInput value={otpCode} onChange={setOtpCode} disabled={isSubmitting} />

          <Button
            type="button"
            variant="primary"
            className="w-full"
            isLoading={isSubmitting}
            disabled={otpCode.length !== APP_CONSTANTS.OTP_LENGTH}
            onClick={onOtpVerify}
          >
            Verify & Complete Sign Up
          </Button>

          <div className="text-center">
            {cooldown > 0 ? (
              <p className="text-xs text-muted-foreground">
                Resend code in <span className="font-semibold text-foreground">{cooldown}s</span>
              </p>
            ) : (
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={isSubmitting}
                className="text-xs text-primary font-semibold hover:underline"
              >
                Resend Verification Code
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1 text-center">
        <h2 className="text-xl font-bold">Create Campus Account</h2>
        <p className="text-xs text-muted-foreground">Sign up to access campus services and applications</p>
      </div>

      <form onSubmit={handleSubmit(onSignUpSubmit)} className="space-y-4">
        <FormField label="Full Name" error={errors.fullName?.message} required>
          <div className="relative">
            <UserIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input type="text" placeholder="John Doe" className="pl-9" {...register('fullName')} />
          </div>
        </FormField>

        <FormField label="Email Address" error={errors.email?.message} required>
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input type="email" placeholder="student@campus.edu" className="pl-9" {...register('email')} />
          </div>
        </FormField>

        <FormField label="Password" error={errors.password?.message} required>
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input type="password" placeholder="At least 8 characters" className="pl-9" {...register('password')} />
          </div>
        </FormField>

        <FormField label="Confirm Password" error={errors.confirmPassword?.message} required>
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input type="password" placeholder="Re-enter password" className="pl-9" {...register('confirmPassword')} />
          </div>
        </FormField>

        <Button type="submit" variant="primary" className="w-full" isLoading={isSubmitting}>
          Create Account
        </Button>
      </form>

      <div className="text-center text-xs text-muted-foreground">
        Already have an account?{' '}
        <Link to="/login" className="text-primary font-semibold hover:underline">
          Log In
        </Link>
      </div>
    </div>
  );
};
