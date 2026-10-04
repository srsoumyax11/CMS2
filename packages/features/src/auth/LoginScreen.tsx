import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Button, Input, Card } from '@campus/ui';
import { colors, spacing, typography } from '@campus/design-tokens';
import { en } from '@campus/i18n';
import { z } from 'zod';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ApiClient, AppError, AuthTokenDataSchema, AuthTokenData } from '@campus/api-client';

const loginSchema = z.object({
  identity: z.string().min(1, 'Identity is required'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

interface LoginScreenProps {
  apiClient: ApiClient;
  onLoginSuccess: (tokenData: AuthTokenData) => void;
  i18nDict?: typeof en;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  apiClient,
  onLoginSuccess,
  i18nDict = en,
}) => {
  const [step, setStep] = useState<'credentials' | '2fa' | 'backup'>('credentials');
  const [otpCode, setOtpCode] = useState('');
  const [backupCode, setBackupCode] = useState('');
  const [tempToken, setTempToken] = useState('');
  const [securityNotice, setSecurityNotice] = useState<string | null>(null);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { identity: '', password: '' },
  });

  const onCredentialsSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setGeneralError(null);
    setSecurityNotice(null);
    try {
      const idempotencyKey = apiClient.generateIdempotencyKey();
      const res = await apiClient.post(
        '/auth/login',
        z.object({
          accessToken: z.string().optional(),
          refreshToken: z.string().optional(),
          requires2FA: z.boolean().optional(),
          tempToken: z.string().optional(),
          notice: z.string().optional(),
        }),
        { identity: data.identity, password: data.password },
        { idempotencyKey }
      );

      if (res.notice) {
        setSecurityNotice(res.notice);
      }

      if (res.requires2FA && res.tempToken) {
        setTempToken(res.tempToken);
        setStep('2fa');
      } else if (res.accessToken) {
        onLoginSuccess(res as AuthTokenData);
      }
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

  const handleVerify2FA = async () => {
    if (!otpCode) return;
    setIsLoading(true);
    setGeneralError(null);
    try {
      const res = await apiClient.post('/auth/2fa/verify', AuthTokenDataSchema, {
        tempToken,
        otp: otpCode,
      });
      onLoginSuccess(res);
    } catch (err: unknown) {
      if (err instanceof AppError) {
        setGeneralError(err.message);
      } else {
        setGeneralError(i18nDict.common.error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyBackupCode = async () => {
    if (!backupCode) return;
    setIsLoading(true);
    setGeneralError(null);
    try {
      const res = await apiClient.post('/auth/backup-code/verify', AuthTokenDataSchema, {
        tempToken,
        code: backupCode,
      });
      onLoginSuccess(res);
    } catch (err: unknown) {
      if (err instanceof AppError) {
        setGeneralError(err.message);
      } else {
        setGeneralError(i18nDict.common.error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Text style={styles.title}>{i18nDict.common.login}</Text>

        {securityNotice && (
          <Text style={styles.noticeText} testID="security-notice">
            {securityNotice}
          </Text>
        )}
        {generalError && (
          <Text style={styles.errorText} testID="login-error">
            {generalError}
          </Text>
        )}

        {step === 'credentials' && (
          <View>
            <Controller
              control={control}
              name="identity"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="User Code / Email / Phone"
                  value={value}
                  onChangeText={onChange}
                  error={errors.identity?.message}
                  testID="input-login-identity"
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
                  testID="input-login-password"
                />
              )}
            />
            <Button
              label={i18nDict.common.login}
              onPress={handleSubmit(onCredentialsSubmit)}
              isLoading={isLoading}
              disabled={isLoading}
              testID="btn-login-submit"
            />
          </View>
        )}

        {step === '2fa' && (
          <View>
            <Input
              label={i18nDict.auth.enterOtp}
              value={otpCode}
              onChangeText={setOtpCode}
              keyboardType="number-pad"
              testID="input-2fa-otp"
            />
            <Button
              label={i18nDict.auth.verify}
              onPress={handleVerify2FA}
              isLoading={isLoading}
              disabled={isLoading || !otpCode}
              testID="btn-verify-2fa"
            />
            <Button
              label={i18nDict.auth.useBackupCode}
              onPress={() => setStep('backup')}
              variant="secondary"
              testID="btn-switch-backup"
            />
          </View>
        )}

        {step === 'backup' && (
          <View>
            <Input
              label={i18nDict.auth.enterBackupCode}
              value={backupCode}
              onChangeText={setBackupCode}
              testID="input-backup-code"
            />
            <Button
              label={i18nDict.auth.verify}
              onPress={handleVerifyBackupCode}
              isLoading={isLoading}
              disabled={isLoading || !backupCode}
              testID="btn-verify-backup"
            />
            <Button
              label={i18nDict.common.cancel}
              onPress={() => setStep('2fa')}
              variant="secondary"
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
  noticeText: { color: colors.warning.main, marginVertical: spacing.xs, fontWeight: 'bold' },
});
