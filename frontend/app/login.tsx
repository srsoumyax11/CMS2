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
  const surface = isDark ? Tokens.colors.surfaceDark : Tokens.colors.canvas;
  const stageBg = isDark ? Tokens.colors.surfaceSoftDark : Tokens.colors.softCloud;
  const border = isDark ? Tokens.colors.borderDark : Tokens.colors.hairline;
  const textPrimary = isDark ? Tokens.colors.textLight : Tokens.colors.ink;

  const handleLogin = () => {
    router.replace('/' as any);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: bg }]}
    >
      <View style={[styles.card, { backgroundColor: surface, borderColor: border }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={16} color={textPrimary} />
          <Text style={[styles.backBtnText, { color: textPrimary }]}>BACK TO PORTAL</Text>
        </TouchableOpacity>

        <View style={styles.header}>
          <View style={styles.iconBox}>
            <Ionicons name="lock-closed" size={20} color={Tokens.colors.canvas} />
          </View>
          <Text style={[styles.title, { color: textPrimary }]}>SIGN IN TO CAMPUS7</Text>
          <Text style={styles.subtitle}>
            UNIFIED ACADEMIC & HOSTEL GOVERNANCE ENGINE
          </Text>
        </View>

        {/* Tab Switcher Pill Bar */}
        <View style={[styles.tabBar, { backgroundColor: stageBg }]}>
          <TouchableOpacity
            style={[styles.tab, loginMethod === 'IDENTITY' && styles.tabActive]}
            onPress={() => setLoginMethod('IDENTITY')}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.tabText,
                { color: loginMethod === 'IDENTITY' ? Tokens.colors.canvas : Tokens.colors.mute },
              ]}
            >
              ROLL / EMPLOYEE CODE
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
                { color: loginMethod === 'PHONE' ? Tokens.colors.canvas : Tokens.colors.mute },
              ]}
            >
              PHONE OTP
            </Text>
          </TouchableOpacity>
        </View>

        {/* Form Inputs */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            {loginMethod === 'IDENTITY' ? 'ROLL NO / EMPLOYEE CODE' : 'PHONE NUMBER (+91)'}
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: stageBg,
                borderColor: border,
                color: textPrimary,
              },
            ]}
            placeholder={loginMethod === 'IDENTITY' ? 'e.g. 2026-CS-004' : '9876543210'}
            placeholderTextColor={Tokens.colors.mute}
            value={identifier}
            onChangeText={setIdentifier}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            {loginMethod === 'IDENTITY' ? 'ACCOUNT PASSWORD' : '6-DIGIT OTP CODE'}
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: stageBg,
                borderColor: border,
                color: textPrimary,
              },
            ]}
            placeholder={loginMethod === 'IDENTITY' ? '••••••••' : '123456'}
            placeholderTextColor={Tokens.colors.mute}
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
          <Text style={styles.submitBtnText}>AUTHENTICATE & SIGN IN</Text>
          <Ionicons name="arrow-forward" size={16} color={Tokens.colors.canvas} />
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
    maxWidth: 440,
    borderRadius: Tokens.radii.none, // Flat 0px per design.md
    padding: Tokens.spacing.lg,
    borderWidth: Tokens.borderWidths.thin,
    borderColor: Tokens.colors.hairline,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Tokens.spacing.xs,
    marginBottom: Tokens.spacing.md,
  },
  backBtnText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  header: {
    alignItems: 'center',
    marginBottom: Tokens.spacing.lg,
  },
  iconBox: {
    width: 44,
    height: 44,
    backgroundColor: Tokens.colors.ink,
    borderRadius: Tokens.radii.none, // Sharp 0px box
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Tokens.spacing.sm,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 0,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 11,
    fontWeight: '600',
    color: Tokens.colors.mute,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  tabBar: {
    flexDirection: 'row',
    borderRadius: Tokens.radii.pill, // 30px pill container
    padding: 3,
    marginBottom: Tokens.spacing.md,
  },
  tab: {
    flex: 1,
    paddingVertical: Tokens.spacing.sm,
    alignItems: 'center',
    borderRadius: Tokens.radii.pill,
  },
  tabActive: {
    backgroundColor: Tokens.colors.ink,
  },
  tabText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  inputGroup: {
    marginBottom: Tokens.spacing.md,
  },
  label: {
    fontSize: 11,
    fontWeight: '800',
    color: Tokens.colors.mute,
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  input: {
    height: 44,
    paddingHorizontal: Tokens.spacing.md,
    borderRadius: Tokens.radii.md, // 24px input search pill shape per design.md
    borderWidth: Tokens.borderWidths.thin,
    fontSize: 14,
    fontWeight: '500',
  },
  submitBtn: {
    backgroundColor: Tokens.colors.ink,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: Tokens.radii.pill, // 30px pill radius per design.md
    gap: Tokens.spacing.sm,
    marginTop: Tokens.spacing.sm,
  },
  submitBtnText: {
    color: Tokens.colors.canvas,
    fontWeight: '900',
    fontSize: 13,
    letterSpacing: 0.5,
  },
});

