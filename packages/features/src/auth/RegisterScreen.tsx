import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Button, Input, Card } from '@campus/ui';
import { colors, spacing, typography } from '@campus/design-tokens';
import { en } from '@campus/i18n';
import { z } from 'zod';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ApiClient, AppError } from '@campus/api-client';

const registerSchema = z
  .object({
    fullName: z.string().min(2, 'Full name required'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(6, 'Confirm password must be at least 6 characters'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

interface RegisterScreenProps {
  apiClient: ApiClient;
  onRegistered: (session: { email: string; token?: string }) => void;
  i18nDict?: typeof en;
}

export const RegisterScreen: React.FC<RegisterScreenProps> = ({
  apiClient,
  onRegistered,
  i18nDict = en,
}) => {
  const [step, setStep] = useState<'register' | 'otp'>('register');
  const [otpCode, setOtpCode] = useState('');
  const [otpId, setOtpId] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [cooldown, setCooldown] = useState(0);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { fullName: '', email: '', password: '', confirmPassword: '' },
  });

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (cooldown > 0) {
      timer = setInterval(() => setCooldown((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  const onRegisterSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    setGeneralError(null);
    try {
      const idempotencyKey = apiClient.generateIdempotencyKey();
      const res = await apiClient.post(
        '/auth/otp/send',
        z.object({ otpId: z.string().optional(), cooldownSeconds: z.number().optional() }),
        { phoneOrEmail: data.email, fullName: data.fullName, password: data.password },
        { idempotencyKey }
      );
      setOtpId(res.otpId || 'otp-demo-123');
      setUserEmail(data.email);
      setCooldown(res.cooldownSeconds || 60);
      setStep('otp');
    } catch (err: unknown) {
      if (err instanceof AppError) {
        if (err.status === 409 || err.message.toLowerCase().includes('already registered')) {
          setGeneralError('email already registered');
        } else {
          setGeneralError(err.message);
        }
      } else {
        setGeneralError(i18nDict.common.error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otpCode || otpCode.length < 4) return;
    setIsLoading(true);
    setGeneralError(null);
    try {
      const res = await apiClient.post(
        '/auth/otp/verify',
        z.object({ verified: z.boolean().optional(), accessToken: z.string().optional() }),
        { otpId, code: otpCode }
      );

      // Auto login if session returned
      onRegistered({ email: userEmail, token: res.accessToken });
    } catch (err: unknown) {
      if (err instanceof AppError) {
        setGeneralError('Invalid OTP code. Please check your inbox.');
      } else {
        setGeneralError(i18nDict.common.error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (cooldown > 0) return;
    setIsLoading(true);
    setGeneralError(null);
    try {
      const res = await apiClient.post(
        '/auth/otp/send',
        z.object({ otpId: z.string().optional(), cooldownSeconds: z.number().optional() }),
        { phoneOrEmail: userEmail }
      );
      setCooldown(res.cooldownSeconds || 60);
    } catch (err: unknown) {
      if (err instanceof AppError) {
        setGeneralError(err.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Card style={styles.card}>
        <Text style={styles.title}>{i18nDict.common.register}</Text>

        {generalError && (
          <Text style={styles.errorText} testID="general-error">
            {generalError}
          </Text>
        )}

        {step === 'register' ? (
          <View>
            <Controller
              control={control}
              name="fullName"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Full Name"
                  value={value}
                  onChangeText={onChange}
                  error={errors.fullName?.message}
                  testID="input-fullname"
                />
              )}
            />
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Email Address"
                  value={value}
                  onChangeText={onChange}
                  keyboardType="email-address"
                  error={errors.email?.message}
                  testID="input-email"
                />
              )}
            />
            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Password"
                  secureTextEntry
                  value={value}
                  onChangeText={onChange}
                  error={errors.password?.message}
                  testID="input-password"
                />
              )}
            />
            <Controller
              control={control}
              name="confirmPassword"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Confirm Password"
                  secureTextEntry
                  value={value}
                  onChangeText={onChange}
                  error={errors.confirmPassword?.message}
                  testID="input-confirmpassword"
                />
              )}
            />
            <Button
              label={i18nDict.common.register}
              onPress={handleSubmit(onRegisterSubmit)}
              isLoading={isLoading}
              disabled={isLoading}
              testID="btn-submit-register"
            />
          </View>
        ) : (
          <View>
            <Text style={styles.subText}>Enter 6-digit OTP sent to {userEmail}</Text>
            <Input
              label={i18nDict.auth.enterOtp}
              value={otpCode}
              onChangeText={setOtpCode}
              keyboardType="number-pad"
              maxLength={6}
              testID="input-otp"
            />
            <Button
              label={i18nDict.auth.verify}
              onPress={handleVerifyOtp}
              isLoading={isLoading}
              disabled={isLoading || otpCode.length < 4}
              testID="btn-verify-otp"
            />
            <Button
              label={
                cooldown > 0
                  ? `${i18nDict.auth.resendOtp} (${cooldown}s)`
                  : i18nDict.auth.resendOtp
              }
              onPress={handleResendOtp}
              variant="secondary"
              disabled={cooldown > 0 || isLoading}
              testID="btn-resend-otp"
            />
          </View>
        )}
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.gray[50] },
  content: { padding: spacing.md, justifyContent: 'center' },
  card: { padding: spacing.lg },
  title: {
    fontSize: typography.fontSize.xl,
    fontWeight: 'bold',
    color: colors.gray[900],
    marginBottom: spacing.md,
  },
  subText: { fontSize: typography.fontSize.xs, color: colors.gray[600], marginBottom: spacing.sm },
  errorText: { color: colors.danger.main, marginVertical: spacing.xs, fontWeight: 'bold' },
});
