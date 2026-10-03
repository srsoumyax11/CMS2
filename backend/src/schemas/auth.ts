import { z } from 'zod';

export const loginSchema = z.object({
  identifier: z.string().min(1, 'Email or phone number is required'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  deviceInfo: z.object({
    deviceName: z.string().optional(),
    deviceFingerprint: z.string().optional(),
    ipAddress: z.string().optional(),
  }).optional(),
});

export const registerSchema = z.object({
  email: z.string().email('Invalid email address format'),
  phone: z.string().regex(/^\+?[1-9]\d{7,14}$/, 'Invalid phone number format'),
  fullName: z.string().min(2, 'Full name must be at least 2 characters long'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
});

export const otpSendSchema = z.object({
  identifier: z.string().min(1, 'Email or phone is required'),
  purpose: z.enum(['registration', 'login', 'password_reset', '2fa', 'contact_change']),
});

export const otpVerifySchema = z.object({
  identifier: z.string().min(1, 'Email or phone is required'),
  code: z.string().length(6, 'OTP code must be exactly 6 digits'),
  purpose: z.enum(['registration', 'login', 'password_reset', '2fa', 'contact_change']),
});

export const passwordResetSchema = z.object({
  resetToken: z.string().min(1, 'Reset token is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters long'),
});
