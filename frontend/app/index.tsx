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

  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'PROGRAMS' | 'GOVERNANCE' | 'NOTICES'>('OVERVIEW');

  const bg = isDark ? Tokens.colors.bgDark : Tokens.colors.bgLight;
  const surface = isDark ? Tokens.colors.surfaceDark : Tokens.colors.surface;
  const border = isDark ? Tokens.colors.borderDark : Tokens.colors.border;
  const textPrimary = isDark ? Tokens.colors.textLight : Tokens.colors.textPrimary;
  const textSecondary = isDark ? Tokens.colors.textMuted : Tokens.colors.textSecondary;

  return (
    <ScrollView style={[styles.container, { backgroundColor: bg }]} contentContainerStyle={styles.content}>
      {/* 🏛️ 1. Institutional Announcement Ribbon */}
      <View style={[styles.topRibbon, { backgroundColor: Tokens.colors.primary }]}>
        <View style={styles.ribbonLeft}>
          <Ionicons name="ribbon-outline" size={14} color="#FFFFFF" />
          <Text style={styles.ribbonText}>NAAC GRADE A++ ACCREDITED · NIRF ALL INDIA RANK #7</Text>
        </View>
        <View style={styles.ribbonRight}>
          <Text style={styles.ribbonLink}>24/7 HELPLINE: +91 1800-419-7700</Text>
        </View>
      </View>

      {/* 🧭 2. Header & Main Navigation Bar */}
      <View style={[styles.navbar, { backgroundColor: surface, borderColor: border }]}>
        <View style={styles.navBrand}>
          <View style={styles.brandEmblem}>
            <Text style={styles.brandEmblemText}>C7</Text>
          </View>
          <View>
            <Text style={[styles.brandTitle, { color: textPrimary }]}>CAMPUS7 UNIVERSITY</Text>
            <Text style={[styles.brandSubtitle, { color: textSecondary }]}>Autonomous Institute of Higher Education</Text>
          </View>
        </View>

        <View style={styles.navActions}>
          <TouchableOpacity
            style={styles.buttonSecondaryNav}
            onPress={() => setActiveTab('PROGRAMS')}
            activeOpacity={0.8}
          >
            <Text style={[styles.buttonSecondaryNavText, { color: textPrimary }]}>Academics</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.buttonPrimaryNav}
            onPress={() => router.push('/login' as any)}
            activeOpacity={0.8}
          >
            <Ionicons name="log-in-outline" size={14} color="#FFFFFF" />
            <Text style={styles.buttonPrimaryNavText}>Sign In to Portal</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ⚡ 3. Institutional Hero Banner */}
      <View style={[styles.heroCard, { backgroundColor: surface, borderColor: border }]}>
        <View style={styles.heroHeaderBox}>
          <View style={styles.tagBadge}>
            <Ionicons name="sparkles-outline" size={12} color={Tokens.colors.primary} />
            <Text style={styles.tagBadgeText}>OFFICIAL ACADEMIC & GOVERNANCE ECOSYSTEM</Text>
          </View>
          <Text style={[styles.displayHeadline, { color: textPrimary }]}>
            Pioneering Excellence in Higher Education & Smart Campus Technology.
          </Text>
          <Text style={[styles.heroSubText, { color: textSecondary }]}>
            Campus7 is an integrated, next-generation digital university portal unifying 12,500+ students, 450+ distinguished faculty, warden hostel administration, and parents on a single real-time platform.
          </Text>
        </View>

        <View style={styles.heroBtnRow}>
          <TouchableOpacity
            style={styles.heroPrimaryButton}
            onPress={() => router.push('/login' as any)}
            activeOpacity={0.8}
          >
            <Text style={styles.heroPrimaryButtonText}>Access Portal Dashboard</Text>
            <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.heroSecondaryButton, { backgroundColor: Tokens.colors.surfaceSoftLight, borderColor: border }]}
            onPress={() => router.push('/(student)/campus' as any)}
            activeOpacity={0.8}
          >
            <Ionicons name="compass-outline" size={16} color={textPrimary} />
            <Text style={[styles.heroSecondaryButtonText, { color: textPrimary }]}>Explore Campus Life</Text>
          </TouchableOpacity>
        </View>

        {/* Feature Highlights Banner */}
        <View style={styles.highlightGrid}>
          <View style={[styles.highlightCard, { backgroundColor: Tokens.colors.surfaceSoftLight, borderColor: border }]}>
            <View style={[styles.iconBox, { backgroundColor: Tokens.colors.primary }]}>
              <Ionicons name="qr-code" size={20} color="#FFFFFF" />
            </View>
            <Text style={[styles.highlightTitle, { color: textPrimary }]}>15s Rotating QR</Text>
            <Text style={[styles.highlightSub, { color: textSecondary }]}>Cryptographically signed anti-proxy attendance scanning</Text>
          </View>

          <View style={[styles.highlightCard, { backgroundColor: Tokens.colors.surfaceSoftLight, borderColor: border }]}>
            <View style={[styles.iconBox, { backgroundColor: Tokens.colors.error }]}>
              <Ionicons name="shield-checkmark" size={20} color="#FFFFFF" />
            </View>
            <Text style={[styles.highlightTitle, { color: textPrimary }]}>2D Emergency SOS</Text>
            <Text style={[styles.highlightSub, { color: textSecondary }]}>Instant 1-tap dispatch to Warden & Campus Control Room</Text>
          </View>

          <View style={[styles.highlightCard, { backgroundColor: Tokens.colors.surfaceSoftLight, borderColor: border }]}>
            <View style={[styles.iconBox, { backgroundColor: Tokens.colors.warning }]}>
              <Ionicons name="card" size={20} color="#FFFFFF" />
            </View>
            <Text style={[styles.highlightTitle, { color: textPrimary }]}>Digital Gate Outpass</Text>
            <Text style={[styles.highlightSub, { color: textSecondary }]}>Parent SMS OTP-verified gate pass & entry logs</Text>
          </View>
        </View>
      </View>

      {/* 📊 4. Trust Metrics & Key Statistics */}
      <View style={[styles.statsPanel, { backgroundColor: surface, borderColor: border }]}>
        <View style={styles.statItem}>
          <Text style={[styles.statVal, { color: Tokens.colors.primary }]}>12,500+</Text>
          <Text style={[styles.statLabel, { color: textSecondary }]}>ENROLLED STUDENTS</Text>
        </View>
        <View style={[styles.statDivider, { backgroundColor: border }]} />
        <View style={styles.statItem}>
          <Text style={[styles.statVal, { color: Tokens.colors.success }]}>99.4%</Text>
          <Text style={[styles.statLabel, { color: textSecondary }]}>ATTENDANCE PRECISION</Text>
        </View>
        <View style={[styles.statDivider, { backgroundColor: border }]} />
        <View style={styles.statItem}>
          <Text style={[styles.statVal, { color: Tokens.colors.primary }]}>450+</Text>
          <Text style={[styles.statLabel, { color: textSecondary }]}>DOCTORAL FACULTY</Text>
        </View>
        <View style={[styles.statDivider, { backgroundColor: border }]} />
        <View style={styles.statItem}>
          <Text style={[styles.statVal, { color: Tokens.colors.error }]}>&lt; 30s</Text>
          <Text style={[styles.statLabel, { color: textSecondary }]}>SOS RESPONSE TIME</Text>
        </View>
      </View>

      {/* 🎓 5. Academic Schools & Disciplines */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: textPrimary }]}>Schools & Academic Faculties</Text>
        <Text style={[styles.sectionSub, { color: textSecondary }]}>Offering industry-aligned undergraduate, postgraduate, and research programs</Text>
      </View>

      <View style={styles.gridContainer}>
        {[
          {
            title: 'School of Computer Science & AI',
            desc: 'B.Tech CS, Data Science, AI/ML, Cyber Security, and Cloud Architecture.',
            icon: 'hardware-chip-outline',
            badge: 'NAAC A++ Ranked',
          },
          {
            title: 'School of Engineering & Robotics',
            desc: 'Robotics, Electronics, Autonomous Systems, and Electrical Engineering.',
            icon: 'construct-outline',
            badge: 'Industry Partnered',
          },
          {
            title: 'School of Business & Analytics',
            desc: 'MBA, Financial Analytics, Supply Chain, and Technology Management.',
            icon: 'trending-up-outline',
            badge: '100% Placement Record',
          },
          {
            title: 'School of Humanities & Law',
            desc: 'Digital Governance, Cyber Law, Applied Psychology, and Ethics.',
            icon: 'library-outline',
            badge: 'Research Excellence',
          },
        ].map((item, idx) => (
          <View key={idx} style={[styles.schoolCard, { backgroundColor: surface, borderColor: border }]}>
            <View style={styles.cardHeaderRow}>
              <View style={[styles.schoolIconBox, { backgroundColor: Tokens.colors.surfaceSoftLight }]}>
                <Ionicons name={item.icon as any} size={22} color={Tokens.colors.primary} />
              </View>
              <View style={styles.miniBadge}>
                <Text style={styles.miniBadgeText}>{item.badge}</Text>
              </View>
            </View>
            <Text style={[styles.schoolTitle, { color: textPrimary }]}>{item.title}</Text>
            <Text style={[styles.schoolDesc, { color: textSecondary }]}>{item.desc}</Text>
          </View>
        ))}
      </View>

      {/* 👥 6. Role-Based Governance Portals */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: textPrimary }]}>Unified Persona Workspaces</Text>
        <Text style={[styles.sectionSub, { color: textSecondary }]}>Tailored, high-speed dashboards for every stakeholder in the campus ecosystem</Text>
      </View>

      <View style={styles.gridContainer}>
        {[
          {
            role: 'Students Workspace',
            icon: 'school-outline',
            desc: 'View real-time timetables, scan rotating attendance QR codes, apply for outpasses, and access library e-books.',
            btn: 'Student Sign In',
          },
          {
            role: 'Faculty Portal',
            icon: 'briefcase-outline',
            desc: 'Launch cryptographically verified 15s attendance sessions, publish assignments, grade rubrics, and track mentees.',
            btn: 'Faculty Sign In',
          },
          {
            role: 'Warden Control Room',
            icon: 'business-outline',
            desc: 'Approve digital outpasses, monitor live 2D SOS safety alerts, allocate hostel beds, and conduct night roll calls.',
            btn: 'Warden Sign In',
          },
          {
            role: 'Parent Portal',
            icon: 'people-outline',
            desc: 'Approve outpass gate requests via SMS OTP, pay semester fee invoices, and monitor child attendance telemetry.',
            btn: 'Parent Sign In',
          },
        ].map((item, idx) => (
          <View key={idx} style={[styles.personaCard, { backgroundColor: surface, borderColor: border }]}>
            <View style={[styles.personaIconBox, { backgroundColor: Tokens.colors.surfaceSoftLight }]}>
              <Ionicons name={item.icon as any} size={22} color={Tokens.colors.primary} />
            </View>
            <Text style={[styles.personaTitle, { color: textPrimary }]}>{item.role}</Text>
            <Text style={[styles.personaDesc, { color: textSecondary }]}>{item.desc}</Text>

            <TouchableOpacity
              style={styles.personaBtn}
              onPress={() => router.push('/login' as any)}
              activeOpacity={0.8}
            >
              <Text style={styles.personaBtnText}>{item.btn}</Text>
              <Ionicons name="chevron-forward" size={14} color={Tokens.colors.primary} />
            </TouchableOpacity>
          </View>
        ))}
      </View>

      {/* 📢 7. Live Notice & Announcement Feed */}
      <View style={[styles.noticeSection, { backgroundColor: surface, borderColor: border }]}>
        <View style={styles.noticeHeader}>
          <View style={styles.noticeHeaderLeft}>
            <Ionicons name="megaphone-outline" size={20} color={Tokens.colors.primary} />
            <Text style={[styles.noticeTitle, { color: textPrimary }]}>Official Campus Bulletins & Announcements</Text>
          </View>
          <Text style={styles.noticeSub}>Updated in real-time</Text>
        </View>

        <View style={styles.noticeList}>
          {[
            {
              date: '03 OCT 2026',
              tag: 'EXAMINATIONS',
              title: 'Fall 2026 Mid-Semester Examination Schedule & Seating Allotments Released.',
            },
            {
              date: '01 OCT 2026',
              tag: 'RESEARCH',
              title: 'Call for Proposals: Annual International AI & Robotics Innovation Summit.',
            },
            {
              date: '28 SEP 2026',
              tag: 'HOSTEL & SAFETY',
              title: 'Mandatory Night Roll-Call & Emergency SOS Drill Conducted for Resident Hostels.',
            },
          ].map((notice, idx) => (
            <View key={idx} style={[styles.noticeItem, idx < 2 && { borderBottomWidth: Tokens.borderWidths.thin, borderBottomColor: border }]}>
              <View style={styles.noticeBadgeRow}>
                <Text style={styles.noticeDate}>{notice.date}</Text>
                <View style={styles.tagChip}>
                  <Text style={styles.tagChipText}>{notice.tag}</Text>
                </View>
              </View>
              <Text style={[styles.noticeText, { color: textPrimary }]}>{notice.title}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* 🚀 8. Institutional Call to Action Banner */}
      <View style={[styles.ctaBanner, { backgroundColor: Tokens.colors.primary }]}>
        <Text style={styles.ctaTitle}>Ready to Access Campus7 Institutional Services?</Text>
        <Text style={styles.ctaSub}>Log in using your official institutional roll number, employee code, or phone OTP.</Text>

        <TouchableOpacity
          style={styles.ctaButton}
          onPress={() => router.push('/login' as any)}
          activeOpacity={0.8}
        >
          <Text style={styles.ctaButtonText}>Sign In to University Portal</Text>
          <Ionicons name="arrow-forward" size={16} color={Tokens.colors.primary} />
        </TouchableOpacity>
      </View>

      {/* 🏛️ 9. Footer & Institutional Compliance */}
      <View style={[styles.footer, { backgroundColor: surface, borderColor: border }]}>
        <View style={styles.footerColGrid}>
          <View style={styles.footerCol}>
            <Text style={[styles.footerColTitle, { color: textPrimary }]}>CAMPUS7 UNIVERSITY</Text>
            <Text style={[styles.footerText, { color: textSecondary }]}>
              Autonomous Institution accredited with Grade A++ by NAAC. Approved by AICTE & UGC, New Delhi.
            </Text>
          </View>

          <View style={styles.footerCol}>
            <Text style={[styles.footerColTitle, { color: textPrimary }]}>QUICK LINKS</Text>
            <Text style={[styles.footerLink, { color: textSecondary }]}>Academic Calendar</Text>
            <Text style={[styles.footerLink, { color: textSecondary }]}>Research & Publications</Text>
            <Text style={[styles.footerLink, { color: textSecondary }]}>Hostel & Outpass Rules</Text>
            <Text style={[styles.footerLink, { color: textSecondary }]}>Parent Consent Guidelines</Text>
          </View>

          <View style={styles.footerCol}>
            <Text style={[styles.footerColTitle, { color: textPrimary }]}>EMERGENCY HELPLINES</Text>
            <Text style={[styles.footerLink, { color: Tokens.colors.error }]}>24x7 Security Control: +91 1800-419-7701</Text>
            <Text style={[styles.footerLink, { color: textSecondary }]}>Campus Medical Center: +91 1800-419-7702</Text>
            <Text style={[styles.footerLink, { color: textSecondary }]}>Anti-Ragging Squad: +91 1800-180-5522</Text>
          </View>
        </View>

        <View style={[styles.footerDivider, { backgroundColor: border }]} />

        <View style={styles.footerBottomRow}>
          <Text style={[styles.copyrightText, { color: textSecondary }]}>
            © 2026 Campus7 Platform. All Rights Reserved. ISO 27001 Certified Digital Governance Engine.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: Tokens.spacing.md, paddingBottom: Tokens.spacing.xl },

  // Top Ribbon
  topRibbon: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Tokens.spacing.md,
    paddingVertical: 6,
    borderRadius: Tokens.radii.xs, // 4px radius
    marginBottom: Tokens.spacing.xs,
  },
  ribbonLeft: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  ribbonText: { color: '#FFFFFF', fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
  ribbonRight: {},
  ribbonLink: { color: '#FFFFFF', fontSize: 11, fontWeight: '700' },

  // Navbar
  navbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Tokens.spacing.md,
    paddingVertical: Tokens.spacing.xs,
    borderWidth: Tokens.borderWidths.thin,
    borderRadius: Tokens.radii.xl, // 12px card radius per Genesis
    marginBottom: Tokens.spacing.md,
  },
  navBrand: { flexDirection: 'row', alignItems: 'center', gap: Tokens.spacing.xs },
  brandEmblem: {
    width: 32,
    height: 32,
    backgroundColor: Tokens.colors.primary, // Indigo #6366F1
    borderRadius: Tokens.radii.md, // 6px radius
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandEmblemText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },
  brandTitle: { fontSize: 15, fontWeight: '700', letterSpacing: -0.02 },
  brandSubtitle: { fontSize: 11, fontWeight: '400' },
  navActions: { flexDirection: 'row', alignItems: 'center', gap: Tokens.spacing.xs },
  buttonSecondaryNav: {
    paddingHorizontal: Tokens.spacing.sm,
    paddingVertical: 8,
  },
  buttonSecondaryNavText: { fontSize: 13, fontWeight: '600' },
  buttonPrimaryNav: {
    backgroundColor: Tokens.colors.primary,
    paddingHorizontal: Tokens.spacing.md,
    paddingVertical: 8,
    borderRadius: Tokens.radii.md, // 6px radius
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  buttonPrimaryNavText: { color: '#FFFFFF', fontSize: 13, fontWeight: '600' },

  // Hero Card
  heroCard: {
    padding: Tokens.spacing.lg,
    borderWidth: Tokens.borderWidths.thin,
    borderRadius: Tokens.radii.xl, // 12px card radius
    marginBottom: Tokens.spacing.lg,
  },
  heroHeaderBox: { marginBottom: Tokens.spacing.md },
  tagBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Tokens.spacing.lg,
    paddingVertical: Tokens.spacing.sm,
    borderRadius: Tokens.radii.md, // 6px button radius
    borderWidth: Tokens.borderWidths.thin,
  },
  heroSecondaryButtonText: { fontSize: 14, fontWeight: '600' },

  // Highlights Grid
  highlightGrid: { flexDirection: 'row', gap: Tokens.spacing.xs, marginTop: Tokens.spacing.sm },
  highlightCard: {
    flex: 1,
    padding: Tokens.spacing.sm,
    borderRadius: Tokens.radii.lg, // 8px card radius
    borderWidth: Tokens.borderWidths.thin,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: Tokens.radii.md, // 6px radius
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Tokens.spacing.xs,
  },
  highlightTitle: { fontSize: 13, fontWeight: '600' },
  highlightSub: { fontSize: 12, marginTop: 2, lineHeight: 16 },

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

  // Schools Grid
  sectionHeader: { marginBottom: Tokens.spacing.sm },
  sectionTitle: { fontSize: 22, fontWeight: '700', letterSpacing: -0.01 },
  sectionSub: { fontSize: 14, marginTop: 2 },
  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: Tokens.spacing.md, marginBottom: Tokens.spacing.lg },
  schoolCard: {
    width: '48%',
    padding: Tokens.spacing.md,
    borderWidth: Tokens.borderWidths.thin,
    borderRadius: Tokens.radii.xl, // 12px card radius
  },
  cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Tokens.spacing.xs },
  schoolIconBox: {
    width: 36,
    height: 36,
    borderRadius: Tokens.radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniBadge: {
    backgroundColor: Tokens.colors.surfaceSoftLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Tokens.radii.xs, // 4px radius
  },
  miniBadgeText: { fontSize: 10, fontWeight: '600', color: Tokens.colors.primary },
  schoolTitle: { fontSize: 15, fontWeight: '600', marginTop: Tokens.spacing.xs },
  schoolDesc: { fontSize: 13, marginTop: 4, lineHeight: 18 },

  // Persona Cards
  personaCard: {
    width: '48%',
    padding: Tokens.spacing.md,
    borderWidth: Tokens.borderWidths.thin,
    borderRadius: Tokens.radii.xl, // 12px card radius
    justifyContent: 'space-between',
  },
  personaIconBox: { width: 36, height: 36, borderRadius: Tokens.radii.md, alignItems: 'center', justifyContent: 'center', marginBottom: Tokens.spacing.xs },
  personaTitle: { fontSize: 15, fontWeight: '600' },
  personaDesc: { fontSize: 13, marginTop: Tokens.spacing.xs, lineHeight: 18, marginBottom: Tokens.spacing.sm },
  personaBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  personaBtnText: { color: Tokens.colors.primary, fontSize: 13, fontWeight: '600' },

  // Notice Section
  noticeSection: {
    padding: Tokens.spacing.md,
    borderWidth: Tokens.borderWidths.thin,
    borderRadius: Tokens.radii.xl, // 12px card radius
    marginBottom: Tokens.spacing.lg,
  },
  noticeHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Tokens.spacing.md },
  noticeHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: Tokens.spacing.xs },
  noticeTitle: { fontSize: 16, fontWeight: '700' },
  noticeSub: { fontSize: 12, color: Tokens.colors.textMuted },
  noticeList: {},
  noticeItem: { paddingVertical: Tokens.spacing.xs },
  noticeBadgeRow: { flexDirection: 'row', alignItems: 'center', gap: Tokens.spacing.xs, marginBottom: 4 },
  noticeDate: { fontSize: 11, fontWeight: '600', color: Tokens.colors.textMuted },
  tagChip: {
    backgroundColor: Tokens.colors.surfaceSoftLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Tokens.radii.xs,
  },
  tagChipText: { fontSize: 9, fontWeight: '700', color: Tokens.colors.primary },
  noticeText: { fontSize: 14, fontWeight: '500', lineHeight: 20 },

  // CTA Banner
  ctaBanner: {
    padding: Tokens.spacing.lg,
    borderRadius: Tokens.radii.xl, // 12px card radius
    alignItems: 'center',
    marginBottom: Tokens.spacing.lg,
  },
  ctaTitle: { color: '#FFFFFF', fontSize: 22, fontWeight: '700', textAlign: 'center', marginBottom: 4 },
  ctaSub: { color: 'rgba(255,255,255,0.85)', fontSize: 13, textAlign: 'center', marginBottom: Tokens.spacing.md },
  ctaButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: Tokens.spacing.lg,
    paddingVertical: Tokens.spacing.sm,
    borderRadius: Tokens.radii.md, // 6px button radius
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ctaButtonText: { color: Tokens.colors.primary, fontSize: 14, fontWeight: '700' },

  // Footer
  footer: {
    padding: Tokens.spacing.lg,
    borderWidth: Tokens.borderWidths.thin,
    borderRadius: Tokens.radii.xl, // 12px card radius
  },
  footerColGrid: { flexDirection: 'row', gap: Tokens.spacing.lg, marginBottom: Tokens.spacing.md },
  footerCol: { flex: 1 },
  footerColTitle: { fontSize: 13, fontWeight: '700', marginBottom: Tokens.spacing.xs },
  footerText: { fontSize: 12, lineHeight: 18 },
  footerLink: { fontSize: 12, marginBottom: 6 },
  footerDivider: { height: 1, marginVertical: Tokens.spacing.sm },
  footerBottomRow: { alignItems: 'center' },
  copyrightText: { fontSize: 11, textAlign: 'center' },
});
