import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Button, Input, Card } from '@campus/ui';
import { colors, spacing, typography } from '@campus/design-tokens';
import { en } from '@campus/i18n';
import { z } from 'zod';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ApiClient, AppError } from '@campus/api-client';

const registerSchema = z.object({
  identity: z.string().min(3, 'Identity must be at least 3 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type RegisterFormData = z.infer<typeof registerSchema>;

interface RegisterScreenProps {
  apiClient: ApiClient;
  onRegistered: (identity: string) => void;
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
  const [registeredIdentity, setRegisteredIdentity] = useState('');
  const [cooldown, setCooldown] = useState(0);
  const [retryAfterError, setRetryAfterError] = useState<string | null>(null);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { identity: '', password: '' },
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
    setRetryAfterError(null);
    try {
      const idempotencyKey = apiClient.generateIdempotencyKey();
      const res = await apiClient.post(
        '/auth/otp/send',
        z.object({ otpId: z.string().optional(), cooldownSeconds: z.number().optional() }),
        { phoneOrEmail: data.identity },
        { idempotencyKey }
      );
      setOtpId(res.otpId || 'otp-demo-123');
      setRegisteredIdentity(data.identity);
      setCooldown(res.cooldownSeconds || 60);
      setStep('otp');
    } catch (err: unknown) {
      if (err instanceof AppError) {
        if (err.status === 429 && err.retryAfter) {
          setRetryAfterError(
            i18nDict.auth.tooManyRequests.replace('{{seconds}}', String(err.retryAfter))
          );
        } else {
          setGeneralError(err.message + (err.requestId ? ` (Req ID: ${err.requestId})` : ''));
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
      await apiClient.post(
        '/auth/otp/verify',
        z.object({ verified: z.boolean().optional() }),
        { otpId, code: otpCode }
      );
      onRegistered(registeredIdentity);
    } catch (err: unknown) {
      if (err instanceof AppError) {
        setGeneralError(err.message + (err.requestId ? ` (Req ID: ${err.requestId})` : ''));
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
        { phoneOrEmail: registeredIdentity }
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
    <View style={styles.container}>
      <Card style={styles.card}>
        <Text style={styles.title}>{i18nDict.common.register}</Text>

        {retryAfterError && (
          <Text style={styles.warningText} testID="retry-after-error">
            {retryAfterError}
          </Text>
        )}
        {generalError && (
          <Text style={styles.errorText} testID="general-error">
            {generalError}
          </Text>
        )}

        {step === 'register' ? (
          <View>
            <Controller
              control={control}
              name="identity"
              render={({ field: { onChange, value } }) => (
                <Input
                  label={i18nDict.auth.enterPhone}
                  value={value}
                  onChangeText={onChange}
                  error={errors.identity?.message}
                  testID="input-identity"
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
            <Button
              label={i18nDict.common.register}
              onPress={handleSubmit(onRegisterSubmit)}
              isLoading={isLoading}
              disabled={isLoading}
            />
          </View>
        ) : (
          <View>
            <Input
              label={i18nDict.auth.enterOtp}
              value={otpCode}
              onChangeText={setOtpCode}
              keyboardType="number-pad"
              testID="input-otp"
            />
            <Button
              label={i18nDict.auth.verify}
              onPress={handleVerifyOtp}
              isLoading={isLoading}
              disabled={isLoading || otpCode.length < 4}
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
            />
          </View>
        )}
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.md, justifyContent: 'center' },
  card: { padding: spacing.lg },
  title: {
    fontSize: typography.fontSize.xl,
    fontWeight: 'bold',
    color: colors.gray[900],
    marginBottom: spacing.md,
  },
  errorText: { color: colors.danger.main, marginVertical: spacing.xs },
  warningText: { color: colors.gray[800], marginVertical: spacing.xs, fontWeight: 'bold' },
});
