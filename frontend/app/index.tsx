import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Pressable,
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

  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'PROGRAMS' | 'HOSTEL'>('OVERVIEW');

  // Colors based on current theme
  const bg = isDark ? Tokens.colors.bgDark : Tokens.colors.bgLight;
  const surface = isDark ? Tokens.colors.surfaceDark : Tokens.colors.surfaceLight;
  const border = isDark ? Tokens.colors.borderDark : Tokens.colors.borderLight;
  const textPrimary = isDark ? Tokens.colors.textLight : Tokens.colors.textDark;

  return (
    <ScrollView style={[styles.container, { backgroundColor: bg }]} contentContainerStyle={styles.content}>
      {/* 🧭 1. Flat Navbar */}
      <View style={[styles.navbar, { backgroundColor: surface, borderColor: border }]}>
        <View style={styles.navBrand}>
          <View style={styles.brandIconBox}>
            <Ionicons name="school" size={20} color="#FFFFFF" />
          </View>
          <Text style={[styles.brandTitle, { color: textPrimary }]}>Campus7</Text>
        </View>

        <View style={styles.navActions}>
          <TouchableOpacity
            style={[styles.navBtn, { backgroundColor: Tokens.colors.primary }]}
            onPress={() => router.push('/login' as any)}
            activeOpacity={0.8}
          >
            <Text style={styles.navBtnText}>Portal Login</Text>
            <Ionicons name="arrow-forward" size={14} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* ⚡ 2. Hero Section */}
      <View style={[styles.heroCard, { backgroundColor: surface, borderColor: border }]}>
        <View style={styles.heroBadgeBox}>
          <Text style={styles.heroBadgeText}>NEXT-GEN CAMPUS ENGINE 2026</Text>
        </View>

        <Text style={[styles.heroHeadline, { color: textPrimary }]}>
          Unified College & Hostel Governance Platform
        </Text>

        <Text style={styles.heroSubtitle}>
          Real-time academic schedules, digital outpass workflows, 1-minute QR attendance verification, and automated emergency SOS dispatch across Web, iOS, and Android.
        </Text>

        <View style={styles.heroBtnRow}>
          <TouchableOpacity
            style={[styles.btnPrimary, { backgroundColor: Tokens.colors.primary }]}
            onPress={() => router.push('/login' as any)}
            activeOpacity={0.8}
          >
            <Text style={styles.btnPrimaryText}>Sign In to Dashboard</Text>
            <Ionicons name="log-in-outline" size={18} color="#FFFFFF" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.btnSecondary, { borderColor: Tokens.colors.primary }]}
            onPress={() => setActiveTab('HOSTEL')}
            activeOpacity={0.8}
          >
            <Text style={[styles.btnSecondaryText, { color: Tokens.colors.primary }]}>Explore Hostel & SOS</Text>
          </TouchableOpacity>
        </View>

        {/* CSS 2D Geometric Visual Element (Flat Design representation of Campus) */}
        <View style={styles.geometricCampusBox}>
          <View style={[styles.geoBlock, { backgroundColor: Tokens.colors.primary }]}>
            <Ionicons name="business" size={28} color="#FFFFFF" />
            <Text style={styles.geoLabel}>Academic Block</Text>
          </View>
          <View style={[styles.geoBlock, { backgroundColor: Tokens.colors.secondary }]}>
            <Ionicons name="home" size={28} color="#FFFFFF" />
            <Text style={styles.geoLabel}>Hostel Towers</Text>
          </View>
          <View style={[styles.geoBlock, { backgroundColor: Tokens.colors.accentRed }]}>
            <Ionicons name="shield-checkmark" size={28} color="#FFFFFF" />
            <Text style={styles.geoLabel}>SOS Control Room</Text>
          </View>
        </View>
      </View>

      {/* ⭐ 3. Features Section (3 Flat Cards with SVG Icons) */}
      <Text style={[styles.sectionHeading, { color: textPrimary }]}>Core Campus Modules</Text>

      <View style={styles.featureGrid}>
        {/* Feature 1 */}
        <View style={[styles.featureCard, { backgroundColor: surface, borderColor: Tokens.colors.primary }]}>
          <View style={[styles.iconBox, { backgroundColor: Tokens.colors.primary }]}>
            <Ionicons name="book" size={24} color="#FFFFFF" />
          </View>
          <Text style={[styles.featureTitle, { color: textPrimary }]}>Academics & Timetables</Text>
          <Text style={styles.featureDesc}>
            Live class schedules, automated clash checks, 1-minute QR attendance verification, and instant mark sheets.
          </Text>
        </View>

        {/* Feature 2 */}
        <View style={[styles.featureCard, { backgroundColor: surface, borderColor: Tokens.colors.secondary }]}>
          <View style={[styles.iconBox, { backgroundColor: Tokens.colors.secondary }]}>
            <Ionicons name="document-text" size={24} color="#FFFFFF" />
          </View>
          <Text style={[styles.featureTitle, { color: textPrimary }]}>Digital Outpass Governance</Text>
          <Text style={styles.featureDesc}>
            Paperless weekend pass requests, automatic parent approval alerts, and gate scanner verification.
          </Text>
        </View>

        {/* Feature 3 */}
        <View style={[styles.featureCard, { backgroundColor: surface, borderColor: Tokens.colors.accentRed }]}>
          <View style={[styles.iconBox, { backgroundColor: Tokens.colors.accentRed }]}>
            <Ionicons name="warning" size={24} color="#FFFFFF" />
          </View>
          <Text style={[styles.featureTitle, { color: textPrimary }]}>Emergency SOS & Safety</Text>
          <Text style={styles.featureDesc}>
            One-tap emergency trigger with automated 2-minute escalation chain to Warden, Security, Nurse, and Ambulance.
          </Text>
        </View>
      </View>

      {/* 💬 4. Testimonials (3 Cards) */}
      <Text style={[styles.sectionHeading, { color: textPrimary }]}>Campus Feedback & Reviews</Text>

      <View style={styles.testimonialGrid}>
        <View style={[styles.testimonialCard, { backgroundColor: surface, borderColor: border }]}>
          <View style={styles.avatarHeader}>
            <View style={[styles.avatarCircle, { backgroundColor: Tokens.colors.primary }]}>
              <Text style={styles.avatarInitial}>RV</Text>
            </View>
            <View>
              <Text style={[styles.authorName, { color: textPrimary }]}>Rahul Verma</Text>
              <Text style={styles.authorRole}>B.Tech Computer Science (Student)</Text>
            </View>
          </View>
          <Text style={styles.quoteText}>
            "Weekend outpass approvals take 2 minutes now without paper forms or office queues. Everything is verified instantly on my phone."
          </Text>
        </View>

        <View style={[styles.testimonialCard, { backgroundColor: surface, borderColor: border }]}>
          <View style={styles.avatarHeader}>
            <View style={[styles.avatarCircle, { backgroundColor: Tokens.colors.secondary }]}>
              <Text style={styles.avatarInitial}>SS</Text>
            </View>
            <View>
              <Text style={[styles.authorName, { color: textPrimary }]}>Dr. Suresh Sharma</Text>
              <Text style={styles.authorRole}>HOD Computer Engineering (Faculty)</Text>
            </View>
          </View>
          <Text style={styles.quoteText}>
            "Taking roll call with 1-minute dynamic session codes eliminated proxy attendance completely. Attendance disputes dropped to zero."
          </Text>
        </View>

        <View style={[styles.testimonialCard, { backgroundColor: surface, borderColor: border }]}>
          <View style={styles.avatarHeader}>
            <View style={[styles.avatarCircle, { backgroundColor: Tokens.colors.accentPurple }]}>
              <Text style={styles.avatarInitial}>KV</Text>
            </View>
            <View>
              <Text style={[styles.authorName, { color: textPrimary }]}>Kavita Verma</Text>
              <Text style={styles.authorRole}>Parent Guardian</Text>
            </View>
          </View>
          <Text style={styles.quoteText}>
            "The direct fee invoice breakdown and instant SMS/outpass approval notifications give complete peace of mind."
          </Text>
        </View>
      </View>

      {/* 🏷️ 5. Pricing / Academic Program Tiers (3 Tiers, highlighted middle) */}
      <Text style={[styles.sectionHeading, { color: textPrimary }]}>Academic Programs & Enrolment Tiers</Text>

      <View style={styles.pricingGrid}>
        {/* Tier 1 */}
        <View style={[styles.pricingCard, { backgroundColor: surface, borderColor: border }]}>
          <Text style={styles.tierName}>UNDERGRADUATE</Text>
          <Text style={[styles.tierPrice, { color: textPrimary }]}>B.Tech / B.Sc</Text>
          <Text style={styles.tierDetail}>4-Year Full-Time Engineering & Applied Sciences</Text>

          <View style={styles.bulletList}>
            <Text style={styles.bulletItem}>✓ Complete LMS & Course Material</Text>
            <Text style={styles.bulletItem}>✓ Hostel Bed & Digital Outpass</Text>
            <Text style={styles.bulletItem}>✓ Standard Medical & Emergency SOS</Text>
          </View>

          <TouchableOpacity
            style={[styles.tierBtn, { backgroundColor: Tokens.colors.primary }]}
            onPress={() => router.push('/login' as any)}
          >
            <Text style={styles.tierBtnText}>Apply for Admission</Text>
          </TouchableOpacity>
        </View>

        {/* Tier 2 (Highlighted Middle Tier) */}
        <View
          style={[
            styles.pricingCard,
            styles.pricingCardFeatured,
            { backgroundColor: surface, borderColor: Tokens.colors.accentOrange },
          ]}
        >
          <View style={[styles.featuredTag, { backgroundColor: Tokens.colors.accentOrange }]}>
            <Text style={styles.featuredTagText}>MOST POPULAR</Text>
          </View>
          <Text style={styles.tierName}>POSTGRADUATE</Text>
          <Text style={[styles.tierPrice, { color: textPrimary }]}>M.Tech / MBA</Text>
          <Text style={styles.tierDetail}>2-Year Advanced Specialization & Executive Training</Text>

          <View style={styles.bulletList}>
            <Text style={styles.bulletItem}>✓ Advanced Research Labs Access</Text>
            <Text style={styles.bulletItem}>✓ Single Occupancy Hostel Suite</Text>
            <Text style={styles.bulletItem}>✓ Priority Placement Drive Portal</Text>
            <Text style={styles.bulletItem}>✓ Faculty Mentoring & Grants</Text>
          </View>

          <TouchableOpacity
            style={[styles.tierBtn, { backgroundColor: Tokens.colors.accentOrange }]}
            onPress={() => router.push('/login' as any)}
          >
            <Text style={styles.tierBtnText}>Apply for Masters</Text>
          </TouchableOpacity>
        </View>

        {/* Tier 3 */}
        <View style={[styles.pricingCard, { backgroundColor: surface, borderColor: border }]}>
          <Text style={styles.tierName}>DOCTORAL</Text>
          <Text style={[styles.tierPrice, { color: textPrimary }]}>Ph.D. Fellowship</Text>
          <Text style={styles.tierDetail}>Full-Time Doctoral Research & Industry Sponsorship</Text>

          <View style={styles.bulletList}>
            <Text style={styles.bulletItem}>✓ Monthly Stipend & Research Grant</Text>
            <Text style={styles.bulletItem}>✓ Dedicated Scholar Quarter</Text>
            <Text style={styles.bulletItem}>✓ International Conference Funding</Text>
          </View>

          <TouchableOpacity
            style={[styles.tierBtn, { backgroundColor: Tokens.colors.secondary }]}
            onPress={() => router.push('/login' as any)}
          >
            <Text style={styles.tierBtnText}>Submit Research Proposal</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 🚀 6. Final Call to Action */}
      <View style={[styles.ctaBanner, { backgroundColor: Tokens.colors.primary }]}>
        <Text style={styles.ctaBannerTitle}>Ready to Experience Campus7?</Text>
        <Text style={styles.ctaBannerSub}>
          Access Student, Faculty, Warden, Parent, and Admin portals in one unified platform.
        </Text>
        <TouchableOpacity
          style={styles.ctaBannerBtn}
          onPress={() => router.push('/login' as any)}
          activeOpacity={0.8}
        >
          <Text style={styles.ctaBannerBtnText}>Get Started Now</Text>
          <Ionicons name="arrow-forward" size={16} color={Tokens.colors.primary} />
        </TouchableOpacity>
      </View>

      {/* 🌐 7. Full Flat Footer */}
      <View style={[styles.footer, { backgroundColor: surface, borderColor: border }]}>
        <View style={styles.footerBrandRow}>
          <Ionicons name="school" size={24} color={Tokens.colors.primary} />
          <Text style={[styles.footerBrandTitle, { color: textPrimary }]}>Campus7 College Governance</Text>
        </View>

        <Text style={styles.footerSub}>
          Unified Academic, Hostel, and Student Welfare Engine — Built with Bun, ElysiaJS, Supabase, and React Native Expo.
        </Text>

        <View style={styles.footerLinksRow}>
          <Text style={styles.footerLink}>Privacy Policy</Text>
          <Text style={styles.footerLink}>Terms of Service</Text>
          <Text style={styles.footerLink}>Help Desk</Text>
          <Text style={styles.footerLink}>API Documentation</Text>
        </View>

        <View style={styles.socialRow}>
          <Ionicons name="logo-github" size={20} color={Tokens.colors.textMuted} />
          <Ionicons name="logo-twitter" size={20} color={Tokens.colors.textMuted} />
          <Ionicons name="logo-linkedin" size={20} color={Tokens.colors.textMuted} />
        </View>

        <Text style={styles.copyrightText}>
          Copyright © 2026 Campus7 Platform. All rights reserved.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: Tokens.spacing.md,
    paddingBottom: Tokens.spacing.xxl,
  },

  // Navbar
  navbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Tokens.spacing.md,
    borderRadius: Tokens.radii.md,
    borderWidth: Tokens.borderWidths.flat,
    marginBottom: Tokens.spacing.lg,
  },
  navBrand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Tokens.spacing.sm,
  },
  brandIconBox: {
    width: 32,
    height: 32,
    borderRadius: Tokens.radii.sm,
    backgroundColor: Tokens.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandTitle: {
    fontSize: 18,
    fontWeight: '900',
  },
  navActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  navBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Tokens.spacing.md,
    paddingVertical: Tokens.spacing.sm,
    borderRadius: Tokens.radii.sm,
    gap: Tokens.spacing.xs,
  },
  navBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
  },

  // Hero Section
  heroCard: {
    padding: Tokens.spacing.lg,
    borderRadius: Tokens.radii.lg,
    borderWidth: Tokens.borderWidths.flat,
    marginBottom: Tokens.spacing.xl,
  },
  heroBadgeBox: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(37, 99, 235, 0.1)',
    paddingHorizontal: Tokens.spacing.sm,
    paddingVertical: 4,
    borderRadius: Tokens.radii.sm,
    borderWidth: Tokens.borderWidths.thin,
    borderColor: Tokens.colors.primary,
    marginBottom: Tokens.spacing.sm,
  },
  heroBadgeText: {
    color: Tokens.colors.primary,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },
  heroHeadline: {
    fontSize: 26,
    fontWeight: '900',
    lineHeight: 32,
    marginBottom: Tokens.spacing.sm,
  },
  heroSubtitle: {
    fontSize: 13,
    color: Tokens.colors.textMuted,
    lineHeight: 18,
    marginBottom: Tokens.spacing.lg,
  },
  heroBtnRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Tokens.spacing.sm,
    marginBottom: Tokens.spacing.lg,
  },
  btnPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Tokens.spacing.md,
    paddingVertical: Tokens.spacing.md,
    borderRadius: Tokens.radii.sm,
    gap: Tokens.spacing.sm,
  },
  btnPrimaryText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },
  btnSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Tokens.spacing.md,
    paddingVertical: Tokens.spacing.md,
    borderRadius: Tokens.radii.sm,
    borderWidth: Tokens.borderWidths.flat,
    backgroundColor: 'transparent',
  },
  btnSecondaryText: {
    fontWeight: '800',
    fontSize: 14,
  },

  // 2D Geometric Visual Campus Box
  geometricCampusBox: {
    flexDirection: 'row',
    gap: Tokens.spacing.sm,
    marginTop: Tokens.spacing.sm,
  },
  geoBlock: {
    flex: 1,
    padding: Tokens.spacing.md,
    borderRadius: Tokens.radii.sm,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Tokens.spacing.xs,
  },
  geoLabel: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    textAlign: 'center',
  },

  // Section Headings
  sectionHeading: {
    fontSize: 20,
    fontWeight: '900',
    marginBottom: Tokens.spacing.md,
    marginTop: Tokens.spacing.sm,
  },

  // Features Grid
  featureGrid: {
    gap: Tokens.spacing.md,
    marginBottom: Tokens.spacing.xl,
  },
  featureCard: {
    padding: Tokens.spacing.md,
    borderRadius: Tokens.radii.md,
    borderWidth: Tokens.borderWidths.flat,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: Tokens.radii.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Tokens.spacing.sm,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 4,
  },
  featureDesc: {
    fontSize: 12,
    color: Tokens.colors.textMuted,
    lineHeight: 16,
  },

  // Testimonials
  testimonialGrid: {
    gap: Tokens.spacing.md,
    marginBottom: Tokens.spacing.xl,
  },
  testimonialCard: {
    padding: Tokens.spacing.md,
    borderRadius: Tokens.radii.md,
    borderWidth: Tokens.borderWidths.flat,
  },
  avatarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Tokens.spacing.sm,
    marginBottom: Tokens.spacing.sm,
  },
  avatarCircle: {
    width: 36,
    height: 36,
    borderRadius: Tokens.radii.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
  },
  authorName: {
    fontSize: 14,
    fontWeight: '800',
  },
  authorRole: {
    fontSize: 11,
    color: Tokens.colors.textMuted,
  },
  quoteText: {
    fontSize: 12,
    color: Tokens.colors.textMuted,
    fontStyle: 'italic',
    lineHeight: 16,
  },

  // Pricing / Programs
  pricingGrid: {
    gap: Tokens.spacing.md,
    marginBottom: Tokens.spacing.xl,
  },
  pricingCard: {
    padding: Tokens.spacing.md,
    borderRadius: Tokens.radii.md,
    borderWidth: Tokens.borderWidths.flat,
  },
  pricingCardFeatured: {
    borderWidth: Tokens.borderWidths.thick,
    position: 'relative',
  },
  featuredTag: {
    position: 'absolute',
    top: -12,
    right: 16,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Tokens.radii.sm,
  },
  featuredTagText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
  },
  tierName: {
    fontSize: 11,
    fontWeight: '900',
    color: Tokens.colors.textMuted,
    letterSpacing: 1,
    marginBottom: 4,
  },
  tierPrice: {
    fontSize: 20,
    fontWeight: '900',
    marginBottom: 4,
  },
  tierDetail: {
    fontSize: 11,
    color: Tokens.colors.textMuted,
    marginBottom: Tokens.spacing.md,
  },
  bulletList: {
    gap: 6,
    marginBottom: Tokens.spacing.md,
  },
  bulletItem: {
    fontSize: 12,
    color: Tokens.colors.textMuted,
    fontWeight: '600',
  },
  tierBtn: {
    paddingVertical: Tokens.spacing.sm,
    borderRadius: Tokens.radii.sm,
    alignItems: 'center',
  },
  tierBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
  },

  // CTA Banner
  ctaBanner: {
    padding: Tokens.spacing.lg,
    borderRadius: Tokens.radii.lg,
    alignItems: 'center',
    marginBottom: Tokens.spacing.xl,
  },
  ctaBannerTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 4,
  },
  ctaBannerSub: {
    color: '#E0E7FF',
    fontSize: 12,
    textAlign: 'center',
    marginBottom: Tokens.spacing.md,
  },
  ctaBannerBtn: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Tokens.spacing.md,
    paddingVertical: Tokens.spacing.sm,
    borderRadius: Tokens.radii.sm,
    gap: Tokens.spacing.xs,
  },
  ctaBannerBtnText: {
    color: Tokens.colors.primary,
    fontWeight: '900',
    fontSize: 13,
  },

  // Footer
  footer: {
    padding: Tokens.spacing.md,
    borderRadius: Tokens.radii.md,
    borderWidth: Tokens.borderWidths.flat,
  },
  footerBrandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Tokens.spacing.xs,
    marginBottom: 6,
  },
  footerBrandTitle: {
    fontSize: 16,
    fontWeight: '900',
  },
  footerSub: {
    fontSize: 11,
    color: Tokens.colors.textMuted,
    marginBottom: Tokens.spacing.md,
    lineHeight: 15,
  },
  footerLinksRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Tokens.spacing.md,
    marginBottom: Tokens.spacing.md,
  },
  footerLink: {
    fontSize: 12,
    color: Tokens.colors.primary,
    fontWeight: '700',
  },
  socialRow: {
    flexDirection: 'row',
    gap: Tokens.spacing.md,
    marginBottom: Tokens.spacing.md,
  },
  copyrightText: {
    fontSize: 10,
    color: Tokens.colors.textMuted,
  },
});
