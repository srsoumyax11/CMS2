import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
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

  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'ACADEMICS' | 'HOSTEL'>('OVERVIEW');

  const bg = isDark ? Tokens.colors.bgDark : Tokens.colors.bgLight;
  const surface = isDark ? Tokens.colors.surfaceDark : Tokens.colors.surfaceLight;
  const stageBg = isDark ? Tokens.colors.surfaceSoftDark : Tokens.colors.softCloud;
  const border = isDark ? Tokens.colors.borderDark : Tokens.colors.hairline;
  const textPrimary = isDark ? Tokens.colors.textLight : Tokens.colors.textDark;

  return (
    <ScrollView style={[styles.container, { backgroundColor: bg }]} contentContainerStyle={styles.content}>
      {/* 🧭 1. Editorial Header Navigation */}
      <View style={[styles.navbar, { backgroundColor: surface, borderColor: border }]}>
        <View style={styles.navBrand}>
          <View style={styles.brandBadge}>
            <Text style={styles.brandBadgeText}>C7</Text>
          </View>
          <Text style={[styles.brandTitle, { color: textPrimary }]}>CAMPUS7 PLATFORM</Text>
        </View>

        <View style={styles.navActions}>
          <TouchableOpacity
            style={styles.pillButtonPrimary}
            onPress={() => router.push('/login' as any)}
            activeOpacity={0.8}
          >
            <Text style={styles.pillButtonPrimaryText}>SIGN IN TO PORTAL</Text>
            <Ionicons name="arrow-forward" size={14} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* ⚡ 2. Editorial Campaign Hero Section */}
      <View style={[styles.heroCard, { backgroundColor: stageBg, borderColor: border }]}>
        <View style={styles.editorialHeaderBox}>
          <Text style={styles.campaignBadge}>OFFICIAL INSTITUTION SYSTEM 2026</Text>
          <Text style={[styles.displayHeadline, { color: textPrimary }]}>
            CAMPUS GOVERNANCE. REIMAGINED.
          </Text>
          <Text style={styles.heroSubText}>
            Unified high-performance engine powering real-time academic scheduling, anti-proxy 15s rotating QR attendance, digital outpass approvals, and instant 2D emergency SOS dispatch across Web, iOS, and Android.
          </Text>
        </View>

        <View style={styles.heroBtnRow}>
          <TouchableOpacity
            style={styles.heroPrimaryPill}
            onPress={() => router.push('/login' as any)}
            activeOpacity={0.8}
          >
            <Text style={styles.heroPrimaryPillText}>ENTER PORTAL DASHBOARD</Text>
            <Ionicons name="log-in-outline" size={18} color="#FFFFFF" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.heroSecondaryPill, { backgroundColor: surface, borderColor: border }]}
            onPress={() => setActiveTab('HOSTEL')}
            activeOpacity={0.8}
          >
            <Text style={[styles.heroSecondaryPillText, { color: textPrimary }]}>EXPLORE HOSTEL & SAFETY</Text>
          </TouchableOpacity>
        </View>

        {/* Studio Product/Feature Stage Row */}
        <View style={styles.featureStageGrid}>
          <View style={[styles.stageTile, { backgroundColor: surface }]}>
            <Ionicons name="qr-code" size={32} color={Tokens.colors.ink} />
            <Text style={[styles.stageTitle, { color: textPrimary }]}>15S ROTATING QR</Text>
            <Text style={styles.stageSub}>Anti-proxy live attendance scanner</Text>
          </View>

          <View style={[styles.stageTile, { backgroundColor: surface }]}>
            <Ionicons name="shield-checkmark" size={32} color={Tokens.colors.secondary} />
            <Text style={[styles.stageTitle, { color: textPrimary }]}>2D SOS CONTROL</Text>
            <Text style={styles.stageSub}>Instant Warden & Security dispatch</Text>
          </View>

          <View style={[styles.stageTile, { backgroundColor: surface }]}>
            <Ionicons name="card" size={32} color={Tokens.colors.accentOrange} />
            <Text style={[styles.stageTitle, { color: textPrimary }]}>DIGITAL PASS</Text>
            <Text style={styles.stageSub}>Parent OTP verified outpass passes</Text>
          </View>
        </View>
      </View>

      {/* 📊 3. Live Statistics Banner */}
      <View style={[styles.statsBar, { backgroundColor: Tokens.colors.ink }]}>
        <View style={styles.statItem}>
          <Text style={styles.statVal}>12,500+</Text>
          <Text style={styles.statLabel}>ENROLLED STUDENTS</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statVal}>99.4%</Text>
          <Text style={styles.statLabel}>OUTPASS VERIFICATION</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statVal}>&lt; 30s</Text>
          <Text style={styles.statLabel}>EMERGENCY SOS RESPONSE</Text>
        </View>
      </View>

      {/* 🛠️ 4. Multi-Persona Capability Cards */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: textPrimary }]}>PERSONA WORKSPACES</Text>
        <Text style={styles.sectionSub}>Designed for speed, clarity, and mechanical restraint</Text>
      </View>

      <View style={styles.gridContainer}>
        {[
          {
            role: 'STUDENTS',
            icon: 'school-outline',
            color: Tokens.colors.ink,
            desc: 'Timetables, QR attendance scanning, outpass passes, digital ID card, and instant fee payments.',
          },
          {
            role: 'FACULTY',
            icon: 'briefcase-outline',
            color: Tokens.colors.secondary,
            desc: 'Anti-proxy rotating QR attendance launcher, course assignments, rubric grading, dispute resolution.',
          },
          {
            role: 'WARDENS',
            icon: 'business-outline',
            color: Tokens.colors.accentOrange,
            desc: 'Outpass approvals, emergency SOS control room, hostel room bed allocator, night roll call.',
          },
          {
            role: 'PARENTS',
            icon: 'people-outline',
            color: Tokens.colors.accentPurple,
            desc: 'Multi-child switcher, SMS OTP outpass consents, fee invoices, direct safety alert telemetry.',
          },
        ].map((item, idx) => (
          <View key={idx} style={[styles.personaCard, { backgroundColor: stageBg, borderColor: border }]}>
            <View style={[styles.personaIconBox, { backgroundColor: item.color }]}>
              <Ionicons name={item.icon as any} size={22} color="#FFFFFF" />
            </View>
            <Text style={[styles.personaTitle, { color: textPrimary }]}>{item.role}</Text>
            <Text style={styles.personaDesc}>{item.desc}</Text>
          </View>
        ))}
      </View>

      {/* 🚀 5. Bottom Call-To-Action Pill Footer */}
      <View style={[styles.footerCard, { backgroundColor: surface, borderColor: border }]}>
        <Text style={[styles.footerHeadline, { color: textPrimary }]}>READY TO START?</Text>
        <Text style={styles.footerSubText}>Log in with your institutional credentials or pre-verified user code.</Text>

        <TouchableOpacity
          style={styles.pillButtonPrimaryLarge}
          onPress={() => router.push('/login' as any)}
          activeOpacity={0.8}
        >
          <Text style={styles.pillButtonPrimaryTextLarge}>ACCESS CAMPUS7 PORTAL</Text>
          <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: Tokens.spacing.md, paddingBottom: Tokens.spacing.xxl },

  // Navbar
  navbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Tokens.spacing.md,
    paddingVertical: Tokens.spacing.sm,
    borderWidth: Tokens.borderWidths.thin,
    borderRadius: Tokens.radii.none,
    marginBottom: Tokens.spacing.md,
  },
  navBrand: { flexDirection: 'row', alignItems: 'center', gap: Tokens.spacing.xs },
  brandBadge: {
    width: 30,
    height: 30,
    backgroundColor: Tokens.colors.ink,
    borderRadius: Tokens.radii.none,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandBadgeText: { color: '#FFFFFF', fontWeight: '900', fontSize: 13 },
  brandTitle: { fontSize: 15, fontWeight: '900', letterSpacing: 0.5 },
  navActions: { flexDirection: 'row', alignItems: 'center' },
  pillButtonPrimary: {
    backgroundColor: Tokens.colors.ink,
    paddingHorizontal: Tokens.spacing.md,
    paddingVertical: Tokens.spacing.sm,
    borderRadius: Tokens.radii.pill,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pillButtonPrimaryText: { color: '#FFFFFF', fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },

  // Campaign Hero
  heroCard: {
    padding: Tokens.spacing.lg,
    borderWidth: Tokens.borderWidths.thin,
    borderRadius: Tokens.radii.none,
    marginBottom: Tokens.spacing.section,
  },
  editorialHeaderBox: { marginBottom: Tokens.spacing.md },
  campaignBadge: { fontSize: 11, fontWeight: '800', color: Tokens.colors.mute, letterSpacing: 1, marginBottom: Tokens.spacing.xs },
  displayHeadline: { fontSize: 32, fontWeight: '900', lineHeight: 38, letterSpacing: -0.5, marginBottom: Tokens.spacing.sm },
  heroSubText: { fontSize: 14, color: Tokens.colors.mute, lineHeight: 22 },
  heroBtnRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Tokens.spacing.sm, marginVertical: Tokens.spacing.md },
  heroPrimaryPill: {
    backgroundColor: Tokens.colors.ink,
    paddingHorizontal: Tokens.spacing.lg,
    paddingVertical: Tokens.spacing.md,
    borderRadius: Tokens.radii.pill,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  heroPrimaryPillText: { color: '#FFFFFF', fontSize: 12, fontWeight: '800', letterSpacing: 0.5 },
  heroSecondaryPill: {
    paddingHorizontal: Tokens.spacing.lg,
    paddingVertical: Tokens.spacing.md,
    borderRadius: Tokens.radii.pill,
    borderWidth: Tokens.borderWidths.thin,
  },
  heroSecondaryPillText: { fontSize: 12, fontWeight: '800', letterSpacing: 0.5 },

  // Feature Stage
  featureStageGrid: { flexDirection: 'row', gap: Tokens.spacing.sm, marginTop: Tokens.spacing.md },
  stageTile: {
    flex: 1,
    padding: Tokens.spacing.md,
    borderRadius: Tokens.radii.none,
    borderWidth: Tokens.borderWidths.thin,
    borderColor: Tokens.colors.hairline,
  },
  stageTitle: { fontSize: 12, fontWeight: '900', marginTop: Tokens.spacing.xs, letterSpacing: 0.5 },
  stageSub: { fontSize: 10, color: Tokens.colors.mute, marginTop: 2 },

  // Stats Bar
  statsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: Tokens.spacing.md,
    paddingHorizontal: Tokens.spacing.sm,
    marginBottom: Tokens.spacing.section,
  },
  statItem: { alignItems: 'center' },
  statVal: { color: '#FFFFFF', fontSize: 20, fontWeight: '900' },
  statLabel: { color: '#9E9EA0', fontSize: 9, fontWeight: '800', letterSpacing: 0.5, marginTop: 2 },
  statDivider: { width: 1, height: '60%', backgroundColor: '#333336' },

  // Personas Grid
  sectionHeader: { marginBottom: Tokens.spacing.md },
  sectionTitle: { fontSize: 20, fontWeight: '900', letterSpacing: -0.5 },
  sectionSub: { fontSize: 12, color: Tokens.colors.mute, marginTop: 2 },
  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: Tokens.spacing.md, marginBottom: Tokens.spacing.section },
  personaCard: {
    width: '48%',
    padding: Tokens.spacing.md,
    borderWidth: Tokens.borderWidths.thin,
    borderRadius: Tokens.radii.none,
  },
  personaIconBox: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center', marginBottom: Tokens.spacing.xs },
  personaTitle: { fontSize: 14, fontWeight: '900', letterSpacing: 0.5 },
  personaDesc: { fontSize: 11, color: Tokens.colors.mute, marginTop: Tokens.spacing.xs, lineHeight: 16 },

  // Footer
  footerCard: {
    padding: Tokens.spacing.lg,
    borderWidth: Tokens.borderWidths.thin,
    borderRadius: Tokens.radii.none,
    alignItems: 'center',
  },
  footerHeadline: { fontSize: 24, fontWeight: '900', letterSpacing: -0.5 },
  footerSubText: { fontSize: 12, color: Tokens.colors.mute, marginTop: 4, textAlign: 'center' },
  pillButtonPrimaryLarge: {
    backgroundColor: Tokens.colors.ink,
    paddingHorizontal: Tokens.spacing.xl,
    paddingVertical: Tokens.spacing.md,
    borderRadius: Tokens.radii.pill,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: Tokens.spacing.md,
  },
  pillButtonPrimaryTextLarge: { color: '#FFFFFF', fontSize: 13, fontWeight: '900', letterSpacing: 0.5 },
});
