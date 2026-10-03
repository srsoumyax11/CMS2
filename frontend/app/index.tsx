import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';
import { Tokens } from '../src/theme/tokens';

export default function CollegeLandingScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const bg = isDark ? Tokens.colors.bgDark : Tokens.colors.bgLight;
  const surface = isDark ? Tokens.colors.surfaceDark : Tokens.colors.surface;
  const border = isDark ? Tokens.colors.borderDark : Tokens.colors.border;
  const textPrimary = isDark ? Tokens.colors.textLight : Tokens.colors.textPrimary;
  const textSecondary = isDark ? Tokens.colors.textMuted : Tokens.colors.textSecondary;

  return (
    <ScrollView style={[styles.container, { backgroundColor: bg }]} contentContainerStyle={styles.content}>
      {/* 🧭 1. Genesis Header Navigation */}
      <View style={[styles.navbar, { backgroundColor: surface, borderColor: border }]}>
        <View style={styles.navBrand}>
          <View style={styles.brandBadge}>
            <Text style={styles.brandBadgeText}>C7</Text>
          </View>
          <Text style={[styles.brandTitle, { color: textPrimary }]}>Campus7 Platform</Text>
        </View>

        <View style={styles.navActions}>
          <TouchableOpacity
            style={styles.buttonPrimary}
            onPress={() => router.push('/login' as any)}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonPrimaryText}>Sign in to Portal</Text>
            <Ionicons name="arrow-forward" size={14} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* ⚡ 2. Hero Section Card */}
      <View style={[styles.heroCard, { backgroundColor: surface, borderColor: border }]}>
        <View style={styles.editorialHeaderBox}>
          <View style={styles.tagBadge}>
            <Text style={styles.tagBadgeText}>GENESIS PLATFORM 2026</Text>
          </View>
          <Text style={[styles.displayHeadline, { color: textPrimary }]}>
            Campus Governance. Reimagined.
          </Text>
          <Text style={[styles.heroSubText, { color: textSecondary }]}>
            Unified high-performance engine powering real-time academic scheduling, anti-proxy 15s rotating QR attendance, digital outpass approvals, and instant 2D emergency SOS dispatch across Web, iOS, and Android.
          </Text>
        </View>

        <View style={styles.heroBtnRow}>
          <TouchableOpacity
            style={styles.heroPrimaryButton}
            onPress={() => router.push('/login' as any)}
            activeOpacity={0.8}
          >
            <Text style={styles.heroPrimaryButtonText}>Enter Portal Dashboard</Text>
            <Ionicons name="log-in-outline" size={16} color="#FFFFFF" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.heroSecondaryButton, { backgroundColor: Tokens.colors.surfaceSoftLight, borderColor: border }]}
            onPress={() => router.push('/(student)/hostel' as any)}
            activeOpacity={0.8}
          >
            <Text style={[styles.heroSecondaryButtonText, { color: textPrimary }]}>Explore Hostel & Safety</Text>
          </TouchableOpacity>
        </View>

        {/* Feature Cards Grid */}
        <View style={styles.featureStageGrid}>
          <View style={[styles.stageCard, { backgroundColor: Tokens.colors.surfaceSoftLight, borderColor: border }]}>
            <Ionicons name="qr-code" size={28} color={Tokens.colors.primary} />
            <Text style={[styles.stageTitle, { color: textPrimary }]}>15s Rotating QR</Text>
            <Text style={[styles.stageSub, { color: textSecondary }]}>Anti-proxy live attendance scanner</Text>
          </View>

          <View style={[styles.stageCard, { backgroundColor: Tokens.colors.surfaceSoftLight, borderColor: border }]}>
            <Ionicons name="shield-checkmark" size={28} color={Tokens.colors.success} />
            <Text style={[styles.stageTitle, { color: textPrimary }]}>2D SOS Control</Text>
            <Text style={[styles.stageSub, { color: textSecondary }]}>Instant Warden & Security dispatch</Text>
          </View>

          <View style={[styles.stageCard, { backgroundColor: Tokens.colors.surfaceSoftLight, borderColor: border }]}>
            <Ionicons name="card" size={28} color={Tokens.colors.warning} />
            <Text style={[styles.stageTitle, { color: textPrimary }]}>Digital Outpass</Text>
            <Text style={[styles.stageSub, { color: textSecondary }]}>Parent OTP verified outpass passes</Text>
          </View>
        </View>
      </View>

      {/* 📊 3. Live Statistics Panel */}
      <View style={[styles.statsPanel, { backgroundColor: surface, borderColor: border }]}>
        <View style={styles.statItem}>
          <Text style={[styles.statVal, { color: Tokens.colors.primary }]}>12,500+</Text>
          <Text style={[styles.statLabel, { color: textSecondary }]}>ENROLLED STUDENTS</Text>
        </View>
        <View style={[styles.statDivider, { backgroundColor: border }]} />
        <View style={styles.statItem}>
          <Text style={[styles.statVal, { color: Tokens.colors.primary }]}>99.4%</Text>
          <Text style={[styles.statLabel, { color: textSecondary }]}>OUTPASS VERIFICATION</Text>
        </View>
        <View style={[styles.statDivider, { backgroundColor: border }]} />
        <View style={styles.statItem}>
          <Text style={[styles.statVal, { color: Tokens.colors.primary }]}>&lt; 30s</Text>
          <Text style={[styles.statLabel, { color: textSecondary }]}>EMERGENCY SOS RESPONSE</Text>
        </View>
      </View>

      {/* 🛠️ 4. Multi-Persona Capability Cards Grid */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: textPrimary }]}>Persona Workspaces</Text>
        <Text style={[styles.sectionSub, { color: textSecondary }]}>Designed for speed, clarity, and mechanical restraint</Text>
      </View>

      <View style={styles.gridContainer}>
        {[
          {
            role: 'Students',
            icon: 'school-outline',
            color: Tokens.colors.primary,
            desc: 'Timetables, QR attendance scanning, outpass passes, digital ID card, and instant fee payments.',
          },
          {
            role: 'Faculty',
            icon: 'briefcase-outline',
            color: Tokens.colors.success,
            desc: 'Anti-proxy rotating QR attendance launcher, course assignments, rubric grading, dispute resolution.',
          },
          {
            role: 'Wardens',
            icon: 'business-outline',
            color: Tokens.colors.warning,
            desc: 'Outpass approvals, emergency SOS control room, hostel room bed allocator, night roll call.',
          },
          {
            role: 'Parents',
            icon: 'people-outline',
            color: Tokens.colors.accentPurple,
            desc: 'Multi-child switcher, SMS OTP outpass consents, fee invoices, direct safety alert telemetry.',
          },
        ].map((item, idx) => (
          <View key={idx} style={[styles.personaCard, { backgroundColor: surface, borderColor: border }]}>
            <View style={[styles.personaIconBox, { backgroundColor: Tokens.colors.surfaceSoftLight }]}>
              <Ionicons name={item.icon as any} size={22} color={item.color} />
            </View>
            <Text style={[styles.personaTitle, { color: textPrimary }]}>{item.role}</Text>
            <Text style={[styles.personaDesc, { color: textSecondary }]}>{item.desc}</Text>
          </View>
        ))}
      </View>

      {/* 🚀 5. Bottom Call-To-Action Card Footer */}
      <View style={[styles.footerCard, { backgroundColor: surface, borderColor: border }]}>
        <Text style={[styles.footerHeadline, { color: textPrimary }]}>Ready to get started?</Text>
        <Text style={[styles.footerSubText, { color: textSecondary }]}>Log in with your institutional credentials or pre-verified user code.</Text>

        <TouchableOpacity
          style={styles.heroPrimaryButtonLarge}
          onPress={() => router.push('/login' as any)}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonPrimaryTextLarge}>Access Campus7 Portal</Text>
          <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: Tokens.spacing.md, paddingBottom: Tokens.spacing.xl },

  // Navbar
  navbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Tokens.spacing.md,
    paddingVertical: Tokens.spacing.xs,
    borderWidth: Tokens.borderWidths.thin,
    borderRadius: Tokens.radii.xl, // 12px card radius
    marginBottom: Tokens.spacing.md,
  },
  navBrand: { flexDirection: 'row', alignItems: 'center', gap: Tokens.spacing.xs },
  brandBadge: {
    width: 28,
    height: 28,
    backgroundColor: Tokens.colors.primary, // Indigo #6366F1
    borderRadius: Tokens.radii.md, // 6px radius
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandBadgeText: { color: '#FFFFFF', fontWeight: '700', fontSize: 13 },
  brandTitle: { fontSize: 15, fontWeight: '700', letterSpacing: -0.02 },
  navActions: { flexDirection: 'row', alignItems: 'center' },
  buttonPrimary: {
    backgroundColor: Tokens.colors.primary,
    paddingHorizontal: Tokens.spacing.md,
    paddingVertical: 8,
    borderRadius: Tokens.radii.md, // 6px button radius
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  buttonPrimaryText: { color: '#FFFFFF', fontSize: 13, fontWeight: '600' },

  // Hero Card
  heroCard: {
    padding: Tokens.spacing.lg,
    borderWidth: Tokens.borderWidths.thin,
    borderRadius: Tokens.radii.xl, // 12px card radius
    marginBottom: Tokens.spacing.lg,
  },
  editorialHeaderBox: { marginBottom: Tokens.spacing.md },
  tagBadge: {
    backgroundColor: Tokens.colors.surfaceSoftLight,
    paddingHorizontal: Tokens.spacing.xs,
    paddingVertical: 4,
    borderRadius: Tokens.radii.xs, // 4px tag radius
    alignSelf: 'flex-start',
    marginBottom: Tokens.spacing.xs,
  },
  tagBadgeText: { fontSize: 11, fontWeight: '600', color: Tokens.colors.primary, letterSpacing: 0.5 },
  displayHeadline: { fontSize: 32, fontWeight: '700', lineHeight: 38, letterSpacing: -0.02, marginBottom: Tokens.spacing.xs },
  heroSubText: { fontSize: 15, lineHeight: 22 },
  heroBtnRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Tokens.spacing.xs, marginVertical: Tokens.spacing.md },
  heroPrimaryButton: {
    backgroundColor: Tokens.colors.primary,
    paddingHorizontal: Tokens.spacing.lg,
    paddingVertical: Tokens.spacing.sm,
    borderRadius: Tokens.radii.md, // 6px button radius
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  heroPrimaryButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
  heroSecondaryButton: {
    paddingHorizontal: Tokens.spacing.lg,
    paddingVertical: Tokens.spacing.sm,
    borderRadius: Tokens.radii.md, // 6px button radius
    borderWidth: Tokens.borderWidths.thin,
  },
  heroSecondaryButtonText: { fontSize: 14, fontWeight: '600' },

  // Feature Cards Stage
  featureStageGrid: { flexDirection: 'row', gap: Tokens.spacing.xs, marginTop: Tokens.spacing.sm },
  stageCard: {
    flex: 1,
    padding: Tokens.spacing.sm,
    borderRadius: Tokens.radii.lg, // 8px card radius
    borderWidth: Tokens.borderWidths.thin,
  },
  stageTitle: { fontSize: 13, fontWeight: '600', marginTop: Tokens.spacing.xs },
  stageSub: { fontSize: 12, marginTop: 2, lineHeight: 16 },

  // Stats Panel
  statsPanel: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: Tokens.spacing.md,
    paddingHorizontal: Tokens.spacing.sm,
    borderWidth: Tokens.borderWidths.thin,
    borderRadius: Tokens.radii.xl, // 12px card radius
    marginBottom: Tokens.spacing.lg,
  },
  statItem: { alignItems: 'center' },
  statVal: { fontSize: 22, fontWeight: '700' },
  statLabel: { fontSize: 10, fontWeight: '600', letterSpacing: 0.5, marginTop: 2 },
  statDivider: { width: 1, height: '60%' },

  // Personas Grid
  sectionHeader: { marginBottom: Tokens.spacing.sm },
  sectionTitle: { fontSize: 24, fontWeight: '700', letterSpacing: -0.01 },
  sectionSub: { fontSize: 14, marginTop: 2 },
  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: Tokens.spacing.md, marginBottom: Tokens.spacing.lg },
  personaCard: {
    width: '48%',
    padding: Tokens.spacing.md,
    borderWidth: Tokens.borderWidths.thin,
    borderRadius: Tokens.radii.xl, // 12px card radius per Genesis
  },
  personaIconBox: { width: 36, height: 36, borderRadius: Tokens.radii.md, alignItems: 'center', justifyContent: 'center', marginBottom: Tokens.spacing.xs },
  personaTitle: { fontSize: 15, fontWeight: '600' },
  personaDesc: { fontSize: 13, marginTop: Tokens.spacing.xs, lineHeight: 18 },

  // Footer Card
  footerCard: {
    padding: Tokens.spacing.lg,
    borderWidth: Tokens.borderWidths.thin,
    borderRadius: Tokens.radii.xl, // 12px card radius
    alignItems: 'center',
  },
  footerHeadline: { fontSize: 24, fontWeight: '700', letterSpacing: -0.01 },
  footerSubText: { fontSize: 14, marginTop: 4, textAlign: 'center' },
  heroPrimaryButtonLarge: {
    backgroundColor: Tokens.colors.primary,
    paddingHorizontal: Tokens.spacing.lg,
    paddingVertical: Tokens.spacing.sm,
    borderRadius: Tokens.radii.md, // 6px button radius
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: Tokens.spacing.md,
  },
  buttonPrimaryTextLarge: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
});
