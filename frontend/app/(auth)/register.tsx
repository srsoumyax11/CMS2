import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
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

export default function RegisterScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [fullName, setFullName] = useState('');
  const [phoneOrEmail, setPhoneOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [timer, setTimer] = useState(60);
  const [errorMsg, setErrorMsg] = useState('');

  const bg = isDark ? Tokens.colors.bgDark : Tokens.colors.bgLight;
  const surface = isDark ? Tokens.colors.surfaceDark : Tokens.colors.surfaceLight;
  const border = isDark ? Tokens.colors.borderDark : Tokens.colors.borderLight;
  const textPrimary = isDark ? Tokens.colors.textLight : Tokens.colors.textDark;

  useEffect(() => {
    let interval: any;
    if (step === 2 && timer > 0) {
      interval = setInterval(() => setTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  const handleNextStep1 = () => {
    setErrorMsg('');
    if (!fullName.trim() || fullName.length < 3) {
      setErrorMsg('Please enter your full name (minimum 3 characters)');
      return;
    }
    if (!phoneOrEmail.trim()) {
      setErrorMsg('Please enter your mobile phone number or email');
      return;
    }
    if (!password || password.length < 8) {
      setErrorMsg('Password must be at least 8 characters with numbers & symbols');
      return;
    }
    setStep(2);
    setTimer(60);
  };

  const handleVerifyOtp = () => {
    setErrorMsg('');
    if (otpCode.length < 6) {
      setErrorMsg('Please enter the complete 6-digit OTP code');
      return;
    }
    setStep(3);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: bg }]}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={[styles.card, { backgroundColor: surface, borderColor: border }]}>
          {/* Stepper Indicator */}
          <View style={styles.stepperContainer}>
            <View style={[styles.stepDot, step >= 1 && { backgroundColor: Tokens.colors.primary }]}>
              <Text style={styles.stepDotText}>1</Text>
            </View>
            <View style={[styles.stepLine, step >= 2 && { backgroundColor: Tokens.colors.primary }]} />
            <View style={[styles.stepDot, step >= 2 && { backgroundColor: Tokens.colors.primary }]}>
              <Text style={styles.stepDotText}>2</Text>
            </View>
            <View style={[styles.stepLine, step >= 3 && { backgroundColor: Tokens.colors.primary }]} />
            <View style={[styles.stepDot, step >= 3 && { backgroundColor: Tokens.colors.primary }]}>
              <Text style={styles.stepDotText}>3</Text>
            </View>
          </View>

          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: textPrimary }]}>
              {step === 1 && 'Create Account'}
              {step === 2 && 'Verify Mobile OTP'}
              {step === 3 && 'Account Registered!'}
            </Text>
            <Text style={styles.subtitle}>
              {step === 1 && 'Step 1: Enter your personal contact details'}
              {step === 2 && `Step 2: Enter 6-digit OTP sent to ${phoneOrEmail}`}
              {step === 3 && 'Step 3: Account created. Apply for your operational role.'}
            </Text>
          </View>

          {errorMsg ? (
            <View style={[styles.errorBanner, { backgroundColor: '#FEE2E2', borderColor: Tokens.colors.accentRed }]}>
              <Ionicons name="alert-circle" size={18} color={Tokens.colors.accentRed} />
              <Text style={styles.errorText}>{errorMsg}</Text>
            </View>
          ) : null}

          {/* Step 1 Form */}
          {step === 1 && (
            <>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Full Name</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: bg, borderColor: border, color: textPrimary }]}
                  placeholder="e.g. Soham Banerjee"
                  placeholderTextColor="#94A3B8"
                  value={fullName}
                  onChangeText={setFullName}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Mobile Phone / Email</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: bg, borderColor: border, color: textPrimary }]}
                  placeholder="e.g. +91 9876543210"
                  placeholderTextColor="#94A3B8"
                  value={phoneOrEmail}
                  onChangeText={setPhoneOrEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Create Password</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: bg, borderColor: border, color: textPrimary }]}
                  placeholder="At least 8 characters"
                  placeholderTextColor="#94A3B8"
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                />
              </View>

              <TouchableOpacity
                style={[styles.submitBtn, { backgroundColor: Tokens.colors.primary }]}
                onPress={handleNextStep1}
              >
                <Text style={styles.submitBtnText}>Continue to OTP Verification</Text>
                <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
              </TouchableOpacity>
            </>
          )}

          {/* Step 2 Form */}
          {step === 2 && (
            <>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>6-Digit OTP Code</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: bg, borderColor: border, color: textPrimary, fontSize: 20, textAlign: 'center', letterSpacing: 8 }]}
                  placeholder="123456"
                  placeholderTextColor="#94A3B8"
                  keyboardType="number-pad"
                  maxLength={6}
                  value={otpCode}
                  onChangeText={setOtpCode}
                />
              </View>

              <View style={styles.timerRow}>
                <Text style={styles.timerText}>
                  {timer > 0 ? `Resend OTP in ${timer}s` : 'Didn\'t receive code?'}
                </Text>
                {timer === 0 && (
                  <TouchableOpacity onPress={() => setTimer(60)}>
                    <Text style={[styles.resendBtn, { color: Tokens.colors.primary }]}>Resend OTP Now</Text>
                  </TouchableOpacity>
                )}
              </View>

              <TouchableOpacity
                style={[styles.submitBtn, { backgroundColor: Tokens.colors.secondary }]}
                onPress={handleVerifyOtp}
              >
                <Text style={styles.submitBtnText}>Verify Code & Complete Signup</Text>
                <Ionicons name="checkmark-circle" size={18} color="#FFFFFF" />
              </TouchableOpacity>
            </>
          )}

          {/* Step 3 Success */}
          {step === 3 && (
            <View style={{ alignItems: 'center', paddingVertical: Tokens.spacing.md }}>
              <Ionicons name="ribbon" size={56} color={Tokens.colors.secondary} />
              <Text style={[styles.title, { color: textPrimary, marginTop: Tokens.spacing.sm }]}>Status: Registered</Text>
              <Text style={[styles.subtitle, { marginBottom: Tokens.spacing.lg }]}>
                Your account is active as a basic registered user. To access Student, Faculty, Warden, or Parent portals, submit a role application.
              </Text>

              <TouchableOpacity
                style={[styles.submitBtn, { backgroundColor: Tokens.colors.primary, width: '100%' }]}
                onPress={() => router.replace('/(auth)/role-selection' as any)}
              >
                <Text style={styles.submitBtnText}>Apply for Role (Student / Faculty / Warden)</Text>
                <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          )}

          <TouchableOpacity onPress={() => router.push('/(auth)/login' as any)} style={styles.loginLink}>
            <Text style={styles.loginLinkText}>Already have an account? <Text style={{ color: Tokens.colors.primary, fontWeight: '700' }}>Sign In</Text></Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', padding: Tokens.spacing.md },
  card: { width: '100%', maxWidth: 440, borderRadius: Tokens.radii.lg, padding: Tokens.spacing.lg, borderWidth: Tokens.borderWidths.flat },
  stepperContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: Tokens.spacing.lg },
  stepDot: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#CBD5E1', alignItems: 'center', justifyContent: 'center' },
  stepDotText: { color: '#FFFFFF', fontWeight: '900', fontSize: 12 },
  stepLine: { width: 40, height: 4, backgroundColor: '#CBD5E1', marginHorizontal: 4 },
  header: { alignItems: 'center', marginBottom: Tokens.spacing.md },
  title: { fontSize: 20, fontWeight: '900', marginBottom: 4 },
  subtitle: { fontSize: 12, color: Tokens.colors.textMuted, textAlign: 'center' },
  errorBanner: { flexDirection: 'row', alignItems: 'center', gap: Tokens.spacing.xs, padding: Tokens.spacing.sm, borderRadius: Tokens.radii.sm, borderWidth: Tokens.borderWidths.thin, marginBottom: Tokens.spacing.md },
  errorText: { fontSize: 12, color: Tokens.colors.accentRed, fontWeight: '700', flex: 1 },
  inputGroup: { marginBottom: Tokens.spacing.md },
  label: { fontSize: 12, fontWeight: '700', color: Tokens.colors.textMuted, marginBottom: 6 },
  input: { paddingHorizontal: Tokens.spacing.md, paddingVertical: Tokens.spacing.sm, borderRadius: Tokens.radii.sm, borderWidth: Tokens.borderWidths.flat, fontSize: 14 },
  timerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Tokens.spacing.md },
  timerText: { fontSize: 12, color: Tokens.colors.textMuted },
  resendBtn: { fontSize: 12, fontWeight: '700' },
  submitBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: Tokens.spacing.md, borderRadius: Tokens.radii.sm, gap: Tokens.spacing.sm, marginTop: Tokens.spacing.xs },
  submitBtnText: { color: '#FFFFFF', fontWeight: '900', fontSize: 14 },
  loginLink: { marginTop: Tokens.spacing.lg, alignItems: 'center' },
  loginLinkText: { fontSize: 12, color: Tokens.colors.textMuted },
});
