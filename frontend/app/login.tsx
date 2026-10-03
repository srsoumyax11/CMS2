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
  const surface = isDark ? Tokens.colors.surfaceDark : Tokens.colors.surface;
  const border = isDark ? Tokens.colors.borderDark : Tokens.colors.border;
  const textPrimary = isDark ? Tokens.colors.textLight : Tokens.colors.textPrimary;
  const textSecondary = isDark ? Tokens.colors.textMuted : Tokens.colors.textSecondary;

  const handleLogin = () => {
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
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: bg }]}
    >
      <View style={[styles.card, { backgroundColor: surface, borderColor: border }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={16} color={textPrimary} />
          <Text style={[styles.backBtnText, { color: textPrimary }]}>Back to Portal</Text>
        </TouchableOpacity>

        <View style={styles.header}>
          <View style={styles.iconBox}>
            <Ionicons name="lock-closed" size={20} color="#FFFFFF" />
          </View>
          <Text style={[styles.title, { color: textPrimary }]}>Sign in to Campus7</Text>
          <Text style={[styles.subtitle, { color: textSecondary }]}>
            Unified Academic & Hostel Governance Engine
          </Text>
        </View>

        {/* Tab Switcher */}
        <View style={[styles.tabBar, { backgroundColor: Tokens.colors.surfaceSoftLight }]}>
          <TouchableOpacity
            style={[styles.tab, loginMethod === 'IDENTITY' && styles.tabActive]}
            onPress={() => setLoginMethod('IDENTITY')}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.tabText,
                { color: loginMethod === 'IDENTITY' ? '#FFFFFF' : textSecondary },
              ]}
            >
              Roll / Employee Code
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, loginMethod === 'PHONE' && styles.tabActive]}
            onPress={() => setLoginMethod('PHONE')}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.tabText,
                { color: loginMethod === 'PHONE' ? '#FFFFFF' : textSecondary },
              ]}
            >
              Phone OTP
            </Text>
          </TouchableOpacity>
        </View>

        {/* Form Inputs */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: textSecondary }]}>
            {loginMethod === 'IDENTITY' ? 'Roll No / Employee Code' : 'Phone Number (+91)'}
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: surface,
                borderColor: border,
                color: textPrimary,
              },
            ]}
            placeholder={loginMethod === 'IDENTITY' ? 'e.g. 2026-CS-004' : '9876543210'}
            placeholderTextColor={Tokens.colors.neutral}
            value={identifier}
            onChangeText={setIdentifier}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: textSecondary }]}>
            {loginMethod === 'IDENTITY' ? 'Account Password' : '6-Digit OTP Code'}
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: surface,
                borderColor: border,
                color: textPrimary,
              },
            ]}
            placeholder={loginMethod === 'IDENTITY' ? '••••••••' : '123456'}
            placeholderTextColor={Tokens.colors.neutral}
            secureTextEntry={loginMethod === 'IDENTITY'}
            value={passwordOrOtp}
            onChangeText={setPasswordOrOtp}
          />
        </View>

        <TouchableOpacity
          style={styles.submitBtn}
          onPress={handleLogin}
          activeOpacity={0.8}
        >
          <Text style={styles.submitBtnText}>Authenticate & Sign In</Text>
          <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
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
    borderRadius: Tokens.radii.xl, // 12px card radius per Genesis
    padding: Tokens.spacing.lg,
    borderWidth: Tokens.borderWidths.thin,
    borderColor: Tokens.colors.border,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Tokens.spacing.xs,
    marginBottom: Tokens.spacing.md,
  },
  backBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  header: {
    alignItems: 'center',
    marginBottom: Tokens.spacing.lg,
  },
  iconBox: {
    width: 44,
    height: 44,
    backgroundColor: Tokens.colors.primary, // Indigo #6366F1
    borderRadius: Tokens.radii.md, // 6px icon box radius
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Tokens.spacing.sm,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.01,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    textAlign: 'center',
  },
  tabBar: {
    flexDirection: 'row',
    borderRadius: Tokens.radii.md, // 6px container radius
    padding: 3,
    marginBottom: Tokens.spacing.md,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: Tokens.radii.md,
  },
  tabActive: {
    backgroundColor: Tokens.colors.primary, // Indigo active tab
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
  },
  inputGroup: {
    marginBottom: Tokens.spacing.md,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  input: {
    height: 40,
    paddingHorizontal: Tokens.spacing.md,
    borderRadius: Tokens.radii.md, // 6px input radius per Genesis
    borderWidth: Tokens.borderWidths.thin,
    fontSize: 14,
  },
  submitBtn: {
    backgroundColor: Tokens.colors.primary, // Indigo Primary CTA button
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 42,
    borderRadius: Tokens.radii.md, // 6px button radius per Genesis
    gap: Tokens.spacing.xs,
    marginTop: Tokens.spacing.xs,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
});
