import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';
import { Tokens } from '../src/theme/tokens';

export default function LoginScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [loginMethod, setLoginMethod] = useState<'IDENTITY' | 'PHONE'>('IDENTITY');
  const [identifier, setIdentifier] = useState('');
  const [passwordOrOtp, setPasswordOrOtp] = useState('');

  const bg = isDark ? Tokens.colors.bgDark : Tokens.colors.bgLight;
  const surface = isDark ? Tokens.colors.surfaceDark : Tokens.colors.surfaceLight;
  const border = isDark ? Tokens.colors.borderDark : Tokens.colors.borderLight;
  const textPrimary = isDark ? Tokens.colors.textLight : Tokens.colors.textDark;

  const handleLogin = () => {
    router.replace('/' as any);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: bg }]}
    >
      <View style={[styles.card, { backgroundColor: surface, borderColor: border }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={18} color={textPrimary} />
          <Text style={[styles.backBtnText, { color: textPrimary }]}>Back to Landing Page</Text>
        </TouchableOpacity>

        <View style={styles.header}>
          <View style={[styles.iconCircle, { backgroundColor: Tokens.colors.primary }]}>
            <Ionicons name="lock-closed" size={24} color="#FFFFFF" />
          </View>
          <Text style={[styles.title, { color: textPrimary }]}>Sign in to Campus7</Text>
          <Text style={styles.subtitle}>
            Unified Academic & Hostel Governance Engine
          </Text>
        </View>

        {/* Tab Switcher */}
        <View style={[styles.tabBar, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }]}>
          <TouchableOpacity
            style={[styles.tab, loginMethod === 'IDENTITY' && { backgroundColor: Tokens.colors.primary }]}
            onPress={() => setLoginMethod('IDENTITY')}
          >
            <Text
              style={[
                styles.tabText,
                { color: loginMethod === 'IDENTITY' ? '#FFFFFF' : Tokens.colors.textMuted },
              ]}
            >
              Roll / Employee Code
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, loginMethod === 'PHONE' && { backgroundColor: Tokens.colors.primary }]}
            onPress={() => setLoginMethod('PHONE')}
          >
            <Text
              style={[
                styles.tabText,
                { color: loginMethod === 'PHONE' ? '#FFFFFF' : Tokens.colors.textMuted },
              ]}
            >
              Phone OTP
            </Text>
          </TouchableOpacity>
        </View>

        {/* Form Inputs */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            {loginMethod === 'IDENTITY' ? 'Roll No / Employee Code' : 'Phone Number (+91)'}
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: isDark ? Tokens.colors.bgDark : Tokens.colors.bgLight,
                borderColor: border,
                color: textPrimary,
              },
            ]}
            placeholder={loginMethod === 'IDENTITY' ? 'e.g. 2026-CS-004' : '9876543210'}
            placeholderTextColor="#94A3B8"
            value={identifier}
            onChangeText={setIdentifier}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            {loginMethod === 'IDENTITY' ? 'Account Password' : '6-Digit OTP Code'}
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: isDark ? Tokens.colors.bgDark : Tokens.colors.bgLight,
                borderColor: border,
                color: textPrimary,
              },
            ]}
            placeholder={loginMethod === 'IDENTITY' ? '••••••••' : '123456'}
            placeholderTextColor="#94A3B8"
            secureTextEntry={loginMethod === 'IDENTITY'}
            value={passwordOrOtp}
            onChangeText={setPasswordOrOtp}
          />
        </View>

        <TouchableOpacity
          style={[styles.submitBtn, { backgroundColor: Tokens.colors.primary }]}
          onPress={handleLogin}
          activeOpacity={0.8}
        >
          <Text style={styles.submitBtnText}>Authenticate & Sign In</Text>
          <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Tokens.spacing.md,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    borderRadius: Tokens.radii.lg,
    padding: Tokens.spacing.lg,
    borderWidth: Tokens.borderWidths.flat,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Tokens.spacing.xs,
    marginBottom: Tokens.spacing.md,
  },
  backBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  header: {
    alignItems: 'center',
    marginBottom: Tokens.spacing.lg,
  },
  iconCircle: {
    width: 50,
    height: 50,
    borderRadius: Tokens.radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Tokens.spacing.sm,
  },
  title: {
    fontSize: 20,
    fontWeight: '900',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: Tokens.colors.textMuted,
    textAlign: 'center',
  },
  tabBar: {
    flexDirection: 'row',
    borderRadius: Tokens.radii.sm,
    padding: Tokens.spacing.xs,
    marginBottom: Tokens.spacing.md,
  },
  tab: {
    flex: 1,
    paddingVertical: Tokens.spacing.sm,
    alignItems: 'center',
    borderRadius: Tokens.radii.sm,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '700',
  },
  inputGroup: {
    marginBottom: Tokens.spacing.md,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: Tokens.colors.textMuted,
    marginBottom: 6,
  },
  input: {
    paddingHorizontal: Tokens.spacing.md,
    paddingVertical: Tokens.spacing.sm,
    borderRadius: Tokens.radii.sm,
    borderWidth: Tokens.borderWidths.flat,
    fontSize: 14,
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Tokens.spacing.md,
    borderRadius: Tokens.radii.sm,
    gap: Tokens.spacing.sm,
    marginTop: Tokens.spacing.sm,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 14,
  },
});
