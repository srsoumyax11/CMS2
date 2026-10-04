import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  ImageBackground,
  TouchableOpacity,
  useWindowDimensions,
  ViewStyle,
} from 'react-native';
import { Button, Card } from '@campus/ui';
import { colors, spacing, typography, radius } from '@campus/design-tokens';

export interface WelcomeScreenProps {
  onNavigateLogin?: () => void;
  onNavigateSignUp?: () => void;
  onNavigateCMS?: () => void;
  onNavigateDashboard?: () => void;
}

const features = [
  {
    title: 'Smart Room Assignments',
    description: 'Automated allocation workflows considering student preferences, capacity, and hostel blocks.',
    icon: '🏢',
    bgColor: colors.primary[50],
    iconColor: colors.primary[600],
  },
  {
    title: 'Student Onboarding',
    description: 'Seamless digital check-ins, document verification, and profile management for new residents.',
    icon: '📝',
    bgColor: '#eef2ff',
    iconColor: '#4f46e5',
  },
  {
    title: 'Digital Outpass System',
    description: 'Instant leave applications with automated warden approvals and parental notifications.',
    icon: '🎫',
    bgColor: '#fef2f2',
    iconColor: colors.danger?.main || '#ef4444',
  },
  {
    title: 'Administration & Billing',
    description: 'Centralized dashboard for hostel administration, fee tracking, and maintenance requests.',
    icon: '💼',
    bgColor: '#f0fdf4',
    iconColor: colors.success?.dark || '#15803d',
  },
];

const galleryImages = [
  {
    url: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&q=80&w=800',
    title: 'Modern Student Accommodations',
  },
  {
    url: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=800',
    title: 'Collaborative Study Lounges',
  },
  {
    url: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=80&w=800',
    title: 'Campus Architecture',
  },
  {
    url: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&q=80&w=800',
    title: 'Integrated IT Services',
  },
];

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  onNavigateLogin = () => {},
  onNavigateSignUp = () => {},
  onNavigateCMS,
  onNavigateDashboard,
}) => {
  const { width } = useWindowDimensions();

  const handlePrimary = onNavigateDashboard || onNavigateCMS || (() => {});

  // Breakpoints
  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1024;
  const isDesktop = width >= 1024;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Hero Section */}
      <ImageBackground
        source={{ uri: 'https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?auto=format&fit=crop&q=80&w=1920' }}
        style={[styles.heroBackground, { minHeight: isMobile ? 480 : 600 }]}
        imageStyle={{ borderRadius: 0 }}
      >
        <View style={styles.heroOverlay}>
          {/* Top Navbar */}
          <View style={[styles.navbar, { paddingHorizontal: isMobile ? spacing.sm : spacing.xl } as ViewStyle]}>
            <View style={styles.navBrand}>
              <Text style={styles.navLogoIcon}>⚡</Text>
              <Text style={styles.navBrandText}>Apex Management</Text>
            </View>
            <View style={styles.navLinks}>
              <TouchableOpacity style={styles.navContactBtn}>
                <Text style={styles.navContactText}>Support</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Hero Content */}
          <View style={styles.heroContent}>
            <View style={styles.liveBadge}>
              <View style={styles.liveDot} />
              <Text style={styles.liveBadgeText}>Hostel OS v1.0 is Live</Text>
            </View>

            <Text style={[styles.heroTitle, { fontSize: isMobile ? 32 : 48 }]}>
              Intelligent Hostel Administration
            </Text>
            <Text style={[styles.heroSubtitle, { fontSize: isMobile ? 14 : 18 }]}>
              The all-in-one platform engineered to streamline student onboarding, automate room assignments, and simplify campus residency management.
            </Text>

            {/* Action Buttons */}
            <View style={[styles.buttonGroup, { flexDirection: isMobile ? 'column' : 'row' } as ViewStyle]}>
              <View style={{ flex: isMobile ? 0 : 1 }}>
                <Button
                  label="Enter Dashboard ➔"
                  onPress={handlePrimary}
                  testID="btn-welcome-dash"
                />
              </View>
              <View style={{ flex: isMobile ? 0 : 1 }}>
                <Button
                  label="Log In"
                  variant="secondary"
                  onPress={onNavigateLogin}
                  testID="btn-welcome-login"
                />
              </View>
              <View style={{ flex: isMobile ? 0 : 1 }}>
                <Button
                  label="Create Account"
                  variant="secondary"
                  onPress={onNavigateSignUp}
                  testID="btn-welcome-signup"
                />
              </View>
            </View>
          </View>
        </View>
      </ImageBackground>

      {/* About Section */}
      <View style={[styles.sectionWhite, { paddingHorizontal: isMobile ? spacing.lg : spacing['2xl'] } as ViewStyle]}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Elevating Campus Residency</Text>
          <Text style={styles.sectionSubtitle}>
            Designed from the ground up for modern educational institutions, delivering real-time oversight and administrative efficiency.
          </Text>
        </View>

        <View style={[styles.aboutLayout, { flexDirection: isDesktop ? 'row' : 'column' } as ViewStyle]}>
          <View style={[styles.aboutList, { flex: 1 }]}>
            <View style={styles.aboutItem}>
              <View style={[styles.aboutIconBox, { backgroundColor: colors.primary[50] }]}>
                <Text style={styles.aboutIconText}>🗄️</Text>
              </View>
              <View style={styles.aboutTextContent}>
                <Text style={styles.aboutItemTitle}>Centralized Database</Text>
                <Text style={styles.aboutItemDesc}>Maintain secure, structured records of all resident students and staff.</Text>
              </View>
            </View>

            <View style={styles.aboutItem}>
              <View style={[styles.aboutIconBox, { backgroundColor: '#f0fdf4' }]}>
                <Text style={styles.aboutIconText}>🔐</Text>
              </View>
              <View style={styles.aboutTextContent}>
                <Text style={styles.aboutItemTitle}>Role-Based Access</Text>
                <Text style={styles.aboutItemDesc}>Distinct portals for students, wardens, and administrators.</Text>
              </View>
            </View>
          </View>

          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=1000' }}
            style={{ ...styles.aboutImage, height: isDesktop ? 300 : 220 }}
            resizeMode="cover"
          />
        </View>
      </View>

      {/* Core Services Section */}
      <View style={[styles.sectionGray, { paddingHorizontal: isMobile ? spacing.lg : spacing['2xl'] } as ViewStyle]}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Core Modules</Text>
          <Text style={styles.sectionSubtitle}>
            A complete suite of tools integrated perfectly with your existing university infrastructure.
          </Text>
        </View>

        <View style={[styles.servicesGrid, { flexDirection: isMobile ? 'column' : 'row' } as ViewStyle]}>
          {features.map((item, index) => (
            <Card
              key={index}
              style={{
                ...styles.serviceCard,
                width: (isMobile ? '100%' : isTablet ? '48%' : '23%') as any,
              }}
            >
              <View style={[styles.serviceIconBadge, { backgroundColor: item.bgColor }]}>
                <Text style={styles.serviceIcon}>{item.icon}</Text>
              </View>
              <Text style={styles.serviceTitle}>{item.title}</Text>
              <Text style={styles.serviceDesc}>{item.description}</Text>
            </Card>
          ))}
        </View>
      </View>

      {/* Gallery Section */}
      <View style={[styles.sectionWhite, { paddingHorizontal: isMobile ? spacing.lg : spacing['2xl'] } as ViewStyle]}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Facility Highlights</Text>
        </View>

        <View style={[styles.galleryGrid, { flexDirection: isMobile ? 'column' : 'row' } as ViewStyle]}>
          {galleryImages.map((img, index) => (
            <View
              key={index}
              style={{
                ...styles.galleryCard,
                width: (isMobile ? '100%' : isTablet ? '48%' : '23%') as any,
              }}
            >
              <Image source={{ uri: img.url }} style={styles.galleryImage} resizeMode="cover" />
              <View style={styles.galleryCaptionOverlay}>
                <Text style={styles.galleryCaptionText}>{img.title}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Footer */}
      <View style={[styles.footer, { paddingHorizontal: isMobile ? spacing.lg : spacing['2xl'] } as ViewStyle]}>
        <View style={styles.footerBrandRow}>
          <Text style={styles.footerLogoIcon}>⚡</Text>
          <Text style={styles.footerBrandText}>Apex</Text>
        </View>

        <Text style={styles.footerDesc}>
          Enterprise-grade hostel management and campus residency solutions.
        </Text>

        <View style={styles.footerDivider} />

        <View style={[styles.footerBottomRow, { flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between' } as ViewStyle]}>
          <Text style={styles.footerCopyright}>
            © {new Date().getFullYear()} Apex Systems. All rights reserved.
          </Text>
          <Text style={styles.footerLinks}>Privacy Policy • Terms of Service</Text>
        </View>
      </View>
    </ScrollView>
  );
};

export default WelcomeScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.gray[50] },
  contentContainer: { flexGrow: 1 },

  // Hero Section
  heroBackground: { width: '100%' },
  heroOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingVertical: spacing.lg,
  },
  navbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.15)',
  },
  navBrand: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  navLogoIcon: { fontSize: 24 },
  navBrandText: { fontSize: typography.fontSize.lg, fontWeight: 'bold', color: '#ffffff' },
  navLinks: { flexDirection: 'row', alignItems: 'center' },
  navContactBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
  },
  navContactText: { color: '#ffffff', fontSize: typography.fontSize.xs, fontWeight: 'bold' },

  heroContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginTop: spacing.xl,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(30, 58, 138, 0.6)',
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: 'rgba(96, 165, 250, 0.4)',
    marginBottom: spacing.lg,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.success?.main || '#22c55e',
    marginRight: spacing.xs,
  },
  liveBadgeText: { color: '#dbeafe', fontSize: typography.fontSize.xs, fontWeight: 'bold' },
  heroTitle: {
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  heroSubtitle: {
    color: colors.gray[300],
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 24,
    maxWidth: 600,
  },
  buttonGroup: { width: '100%', maxWidth: 650, gap: spacing.md },

  // Section Styles
  sectionWhite: { backgroundColor: '#ffffff', paddingVertical: spacing['2xl'] },
  sectionGray: { backgroundColor: colors.gray[50], paddingVertical: spacing['2xl'] },
  sectionHeader: { alignItems: 'center', marginBottom: spacing.xl },
  sectionTitle: { fontSize: typography.fontSize['2xl'], fontWeight: 'bold', color: colors.gray[900], textAlign: 'center' },
  sectionSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.gray[600],
    textAlign: 'center',
    marginTop: spacing.sm,
    maxWidth: 650,
    lineHeight: 22,
  },

  // About Section
  aboutLayout: { gap: spacing['2xl'] },
  aboutList: { gap: spacing.xl, justifyContent: 'center' },
  aboutItem: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  aboutIconBox: {
    width: 52,
    height: 52,
    borderRadius: radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  aboutIconText: { fontSize: 24 },
  aboutTextContent: { flex: 1 },
  aboutItemTitle: { fontSize: typography.fontSize.base, fontWeight: 'bold', color: colors.gray[900] },
  aboutItemDesc: { fontSize: typography.fontSize.sm, color: colors.gray[600], marginTop: 4, lineHeight: 20 },
  aboutImage: { width: '100%', borderRadius: radius.xl },

  // Services Section
  servicesGrid: { flexWrap: 'wrap', gap: spacing.md, justifyContent: 'space-between' },
  serviceCard: { padding: spacing.xl, gap: spacing.sm, borderRadius: radius.lg },
  serviceIconBadge: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  serviceIcon: { fontSize: 24 },
  serviceTitle: { fontSize: typography.fontSize.lg, fontWeight: 'bold', color: colors.gray[900] },
  serviceDesc: { fontSize: typography.fontSize.sm, color: colors.gray[600], lineHeight: 20 },

  // Gallery Section
  galleryGrid: { flexWrap: 'wrap', gap: spacing.md, justifyContent: 'space-between' },
  galleryCard: {
    position: 'relative',
    height: 220,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  galleryImage: { width: '100%', height: '100%' },
  galleryCaptionOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: spacing.md,
  },
  galleryCaptionText: { color: '#ffffff', fontSize: typography.fontSize.sm, fontWeight: 'bold' },

  // Footer
  footer: { backgroundColor: colors.gray[900], paddingVertical: spacing['2xl'] },
  footerBrandRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginBottom: spacing.md },
  footerLogoIcon: { fontSize: 24 },
  footerBrandText: { fontSize: typography.fontSize.xl, fontWeight: 'bold', color: '#ffffff' },
  footerDesc: { fontSize: typography.fontSize.sm, color: colors.gray[400], marginBottom: spacing.lg },
  footerDivider: { height: 1, backgroundColor: colors.gray[800], marginVertical: spacing.lg },
  footerBottomRow: { gap: spacing.md },
  footerCopyright: { fontSize: typography.fontSize.sm, color: colors.gray[500] },
  footerLinks: { fontSize: typography.fontSize.sm, color: colors.gray[400] },
});