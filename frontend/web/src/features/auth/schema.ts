import { z } from 'zod';
import { APP_CONSTANTS } from '@/config/constants';

export const loginSchema = z.object({
  emailOrId: z.string().min(1, 'Email address or User ID is required'),
  password: z.string().min(APP_CONSTANTS.PASSWORD_MIN_LENGTH, `Password must be at least ${APP_CONSTANTS.PASSWORD_MIN_LENGTH} characters`),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const twoFactorSchema = z.object({
  code: z.string().min(6, 'Verification code must be 6 characters'),
  isBackupCode: z.boolean(),
});

export type TwoFactorFormData = z.infer<typeof twoFactorSchema>;

export const signUpSchema = z
  .object({
    fullName: z.string().min(2, 'Full name is required'),
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(APP_CONSTANTS.PASSWORD_MIN_LENGTH, `Password must be at least ${APP_CONSTANTS.PASSWORD_MIN_LENGTH} characters`),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type SignUpFormData = z.infer<typeof signUpSchema>;

export const otpSchema = z.object({
  code: z.string().length(APP_CONSTANTS.OTP_LENGTH, `OTP must be exactly ${APP_CONSTANTS.OTP_LENGTH} digits`),
});

export type OtpFormData = z.infer<typeof otpSchema>;

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(APP_CONSTANTS.PASSWORD_MIN_LENGTH, `Password must be at least ${APP_CONSTANTS.PASSWORD_MIN_LENGTH} characters`),
    confirmNewPassword: z.string().min(1, 'Please confirm your new password'),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: 'New passwords do not match',
    path: ['confirmNewPassword'],
  });

export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;
