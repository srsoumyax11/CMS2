import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';
import { Tokens } from '../../src/theme/tokens';

export default function AuthLoginScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [loginMethod, setLoginMethod] = useState<'IDENTITY' | 'PHONE'>('IDENTITY');
  const [identifier, setIdentifier] = useState('');
  const [passwordOrOtp, setPasswordOrOtp] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Forgot password modal
  const [forgotModalVisible, setForgotModalVisible] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotStep, setForgotStep] = useState<'EMAIL' | 'OTP' | 'SUCCESS'>('EMAIL');

  const bg = isDark ? Tokens.colors.bgDark : Tokens.colors.bgLight;
  const surface = isDark ? Tokens.colors.surfaceDark : Tokens.colors.surfaceLight;
  const border = isDark ? Tokens.colors.borderDark : Tokens.colors.borderLight;
  const textPrimary = isDark ? Tokens.colors.textLight : Tokens.colors.textDark;

  const handleLogin = () => {
    setErrorMsg('');
    if (!identifier.trim()) {
      setErrorMsg(loginMethod === 'IDENTITY' ? 'Please enter your Roll No or Email' : 'Please enter your 10-digit phone number');
      return;
    }
    if (!passwordOrOtp.trim()) {
      setErrorMsg(loginMethod === 'IDENTITY' ? 'Please enter your password' : 'Please enter the 6-digit OTP');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      // Success redirection to persona dashboard
      const code = identifier.trim().toUpperCase();
      if (code.startsWith('FAC') || code.startsWith('PROF')) {
        router.replace('/(faculty)' as any);
      } else if (code.startsWith('WARDEN') || code.startsWith('HOSTEL')) {
        router.replace('/(warden)' as any);
      } else if (code.startsWith('PARENT') || code.startsWith('PAR')) {
        router.replace('/(parent)' as any);
      } else if (code.startsWith('ADMIN') || code.startsWith('SYS')) {
        router.replace('/(admin)/users' as any);
      } else {
        router.replace('/(student)' as any);
      }
    }, 600);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: bg }]}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={[styles.card, { backgroundColor: surface, borderColor: border }]}>
          {/* Header */}
          <View style={styles.header}>
            <View style={[styles.iconCircle, { backgroundColor: Tokens.colors.primary }]}>
              <Ionicons name="shield-checkmark" size={28} color="#FFFFFF" />
            </View>
            <Text style={[styles.title, { color: textPrimary }]}>Campus7 Sign In</Text>
            <Text style={styles.subtitle}>Unified Academic & Hostel Governance Engine</Text>
          </View>

          {/* Error Banner */}
          {errorMsg ? (
            <View style={[styles.errorBanner, { backgroundColor: '#FEE2E2', borderColor: Tokens.colors.accentRed }]}>
              <Ionicons name="alert-circle" size={18} color={Tokens.colors.accentRed} />
              <Text style={styles.errorText}>{errorMsg}</Text>
            </View>
          ) : null}

          {/* Login Method Tabs */}
          <View style={[styles.tabBar, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }]}>
            <TouchableOpacity
              style={[styles.tab, loginMethod === 'IDENTITY' && { backgroundColor: Tokens.colors.primary }]}
              onPress={() => { setLoginMethod('IDENTITY'); setErrorMsg(''); }}
            >
              <Text style={[styles.tabText, { color: loginMethod === 'IDENTITY' ? '#FFFFFF' : Tokens.colors.textMuted }]}>
                User Code / Email
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tab, loginMethod === 'PHONE' && { backgroundColor: Tokens.colors.primary }]}
              onPress={() => { setLoginMethod('PHONE'); setErrorMsg(''); }}
            >
              <Text style={[styles.tabText, { color: loginMethod === 'PHONE' ? '#FFFFFF' : Tokens.colors.textMuted }]}>
                Phone OTP
              </Text>
            </TouchableOpacity>
          </View>

          {/* Identifier Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              {loginMethod === 'IDENTITY' ? 'Roll No / Employee Code / Email' : 'Mobile Number (+91)'}
            </Text>
            <View style={[styles.inputWrapper, { backgroundColor: bg, borderColor: border }]}>
              <Ionicons name={loginMethod === 'IDENTITY' ? 'person-outline' : 'call-outline'} size={18} color={Tokens.colors.textMuted} />
              <TextInput
                style={[styles.input, { color: textPrimary }]}
                placeholder={loginMethod === 'IDENTITY' ? 'e.g. 2026-CS-004' : '9876543210'}
                placeholderTextColor="#94A3B8"
                value={identifier}
                onChangeText={setIdentifier}
                autoCapitalize="none"
              />
            </View>
          </View>

          {/* Password / OTP Input */}
          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>
                {loginMethod === 'IDENTITY' ? 'Account Password' : '6-Digit OTP Code'}
              </Text>
              {loginMethod === 'IDENTITY' && (
                <TouchableOpacity onPress={() => setForgotModalVisible(true)}>
                  <Text style={[styles.forgotText, { color: Tokens.colors.primary }]}>Forgot Password?</Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={[styles.inputWrapper, { backgroundColor: bg, borderColor: border }]}>
              <Ionicons name={loginMethod === 'IDENTITY' ? 'key-outline' : 'chatbox-ellipses-outline'} size={18} color={Tokens.colors.textMuted} />
              <TextInput
                style={[styles.input, { color: textPrimary }]}
                placeholder={loginMethod === 'IDENTITY' ? '••••••••' : '123456'}
                placeholderTextColor="#94A3B8"
                secureTextEntry={loginMethod === 'IDENTITY' && !showPassword}
                value={passwordOrOtp}
                onChangeText={setPasswordOrOtp}
                keyboardType={loginMethod === 'PHONE' ? 'number-pad' : 'default'}
              />
              {loginMethod === 'IDENTITY' && (
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={18} color={Tokens.colors.textMuted} />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Submit Action Button */}
          <TouchableOpacity
            style={[styles.submitBtn, { backgroundColor: Tokens.colors.primary }]}
            onPress={handleLogin}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            <Text style={styles.submitBtnText}>{isLoading ? 'Authenticating...' : 'Authenticate & Sign In'}</Text>
            <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
          </TouchableOpacity>

          {/* Quick Registration & Role Application Navigation Links */}
          <View style={styles.linkContainer}>
            <TouchableOpacity onPress={() => router.push('/(auth)/register' as any)} style={styles.linkBtn}>
              <Text style={styles.linkText}>New user? <Text style={{ color: Tokens.colors.primary, fontWeight: '700' }}>Self Signup</Text></Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.push('/(auth)/role-selection' as any)} style={styles.linkBtn}>
              <Text style={styles.linkText}>Check <Text style={{ color: Tokens.colors.secondary, fontWeight: '700' }}>Role Request Status</Text></Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.push('/(auth)/parent-link' as any)} style={styles.linkBtn}>
              <Text style={styles.linkText}>Parent? <Text style={{ color: Tokens.colors.accentOrange, fontWeight: '700' }}>Link Student</Text></Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Forgot Password Modal */}
      <Modal visible={forgotModalVisible} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: surface, borderColor: border }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: textPrimary }]}>Reset Password</Text>
              <TouchableOpacity onPress={() => { setForgotModalVisible(false); setForgotStep('EMAIL'); }}>
                <Ionicons name="close-circle" size={22} color={Tokens.colors.textMuted} />
              </TouchableOpacity>
            </View>

            {forgotStep === 'EMAIL' && (
              <>
                <Text style={styles.modalSub}>Enter your registered email address or user code to receive a reset code.</Text>
                <TextInput
                  style={[styles.modalInput, { backgroundColor: bg, borderColor: border, color: textPrimary }]}
                  placeholder="name@example.com"
                  placeholderTextColor="#94A3B8"
                  value={forgotEmail}
                  onChangeText={setForgotEmail}
                />
                <TouchableOpacity
                  style={[styles.submitBtn, { backgroundColor: Tokens.colors.primary, marginTop: Tokens.spacing.md }]}
                  onPress={() => setForgotStep('OTP')}
                >
                  <Text style={styles.submitBtnText}>Send Reset Code</Text>
                </TouchableOpacity>
              </>
            )}

            {forgotStep === 'OTP' && (
              <>
                <Text style={styles.modalSub}>Enter the 6-digit code sent to {forgotEmail || 'your email'}.</Text>
                <TextInput
                  style={[styles.modalInput, { backgroundColor: bg, borderColor: border, color: textPrimary }]}
                  placeholder="Enter 6-digit OTP"
                  placeholderTextColor="#94A3B8"
                  keyboardType="number-pad"
                />
                <TouchableOpacity
                  style={[styles.submitBtn, { backgroundColor: Tokens.colors.secondary, marginTop: Tokens.spacing.md }]}
                  onPress={() => setForgotStep('SUCCESS')}
                >
                  <Text style={styles.submitBtnText}>Verify & Set New Password</Text>
                </TouchableOpacity>
              </>
            )}

            {forgotStep === 'SUCCESS' && (
              <View style={{ alignItems: 'center', paddingVertical: Tokens.spacing.md }}>
                <Ionicons name="checkmark-circle" size={48} color={Tokens.colors.secondary} />
                <Text style={[styles.modalTitle, { color: textPrimary, marginTop: Tokens.spacing.sm }]}>Password Reset Complete</Text>
                <Text style={styles.modalSub}>You can now sign in with your new password.</Text>
                <TouchableOpacity
                  style={[styles.submitBtn, { backgroundColor: Tokens.colors.primary, width: '100%', marginTop: Tokens.spacing.md }]}
                  onPress={() => { setForgotModalVisible(false); setForgotStep('EMAIL'); }}
                >
                  <Text style={styles.submitBtnText}>Back to Sign In</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Tokens.spacing.md,
  },
  card: {
    width: '100%',
    maxWidth: 440,
    borderRadius: Tokens.radii.lg,
    padding: Tokens.spacing.lg,
    borderWidth: Tokens.borderWidths.flat,
  },
  header: { alignItems: 'center', marginBottom: Tokens.spacing.lg },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: Tokens.radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Tokens.spacing.sm,
  },
  title: { fontSize: 22, fontWeight: '900', marginBottom: 4 },
  subtitle: { fontSize: 12, color: Tokens.colors.textMuted, textAlign: 'center' },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Tokens.spacing.xs,
    padding: Tokens.spacing.sm,
    borderRadius: Tokens.radii.sm,
    borderWidth: Tokens.borderWidths.thin,
    marginBottom: Tokens.spacing.md,
  },
  errorText: { fontSize: 12, color: Tokens.colors.accentRed, fontWeight: '700', flex: 1 },
  tabBar: {
    flexDirection: 'row',
    borderRadius: Tokens.radii.sm,
    padding: Tokens.spacing.xs,
    marginBottom: Tokens.spacing.md,
  },
  tab: { flex: 1, paddingVertical: Tokens.spacing.sm, alignItems: 'center', borderRadius: Tokens.radii.sm },
  tabText: { fontSize: 12, fontWeight: '700' },
  inputGroup: { marginBottom: Tokens.spacing.md },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  label: { fontSize: 12, fontWeight: '700', color: Tokens.colors.textMuted },
  forgotText: { fontSize: 11, fontWeight: '700' },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Tokens.spacing.md,
    borderRadius: Tokens.radii.sm,
    borderWidth: Tokens.borderWidths.flat,
    gap: Tokens.spacing.sm,
  },
  input: { flex: 1, paddingVertical: Tokens.spacing.sm, fontSize: 14 },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Tokens.spacing.md,
    borderRadius: Tokens.radii.sm,
    gap: Tokens.spacing.sm,
    marginTop: Tokens.spacing.sm,
  },
  submitBtnText: { color: '#FFFFFF', fontWeight: '900', fontSize: 14 },
  linkContainer: { marginTop: Tokens.spacing.lg, gap: Tokens.spacing.xs, alignItems: 'center' },
  linkBtn: { paddingVertical: Tokens.spacing.xs },
  linkText: { fontSize: 12, color: Tokens.colors.textMuted },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Tokens.spacing.md,
  },
  modalCard: {
    width: '100%',
    maxWidth: 400,
    borderRadius: Tokens.radii.lg,
    padding: Tokens.spacing.lg,
    borderWidth: Tokens.borderWidths.flat,
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Tokens.spacing.sm },
  modalTitle: { fontSize: 18, fontWeight: '900' },
  modalSub: { fontSize: 12, color: Tokens.colors.textMuted, marginBottom: Tokens.spacing.md },
  modalInput: {
    paddingHorizontal: Tokens.spacing.md,
    paddingVertical: Tokens.spacing.sm,
    borderRadius: Tokens.radii.sm,
    borderWidth: Tokens.borderWidths.flat,
    fontSize: 14,
  },
});
