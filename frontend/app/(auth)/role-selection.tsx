import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';
import { Tokens } from '../../src/theme/tokens';

interface RoleOption {
  id: 'student' | 'faculty' | 'warden' | 'parent';
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  desc: string;
  fieldLabel: string;
  placeholder: string;
}

const ROLES: RoleOption[] = [
  {
    id: 'student',
    title: 'Student Role',
    icon: 'school-outline',
    color: Tokens.colors.primary,
    desc: 'Access courses, timetable, digital outpass, fee invoices, and hostel menu.',
    fieldLabel: 'Student Admission Number',
    placeholder: 'e.g. 2026-CS-004',
  },
  {
    id: 'faculty',
    title: 'Faculty / Professor',
    icon: 'briefcase-outline',
    color: Tokens.colors.secondary,
    desc: 'Manage class sessions, dynamic QR attendance, assignments, and mentees.',
    fieldLabel: 'Employee Code & Department',
    placeholder: 'e.g. EMP-CSE-102',
  },
  {
    id: 'warden',
    title: 'Hostel Warden',
    icon: 'business-outline',
    color: Tokens.colors.accentOrange,
    desc: 'Approve digital outpasses, control room SOS alerts, roll calls, and room beds.',
    fieldLabel: 'Warden Staff Code & Hostel Block',
    placeholder: 'e.g. WDN-BH1-009',
  },
  {
    id: 'parent',
    title: 'Parent / Guardian',
    icon: 'people-outline',
    color: Tokens.colors.accentPurple,
    desc: 'Link child profile, approve outpass alerts, view fees, and track child safety.',
    fieldLabel: 'Linked Student Admission No + DOB',
    placeholder: 'e.g. 2026-CS-004 (DOB: 2004-05-15)',
  },
];

export default function RoleSelectionScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [selectedRole, setSelectedRole] = useState<'student' | 'faculty' | 'warden' | 'parent'>('student');
  const [claimedCode, setClaimedCode] = useState('');
  const [hasUploadedDoc, setHasUploadedDoc] = useState(false);
  const [submittedStatus, setSubmittedStatus] = useState<'IDLE' | 'PENDING' | 'APPROVED' | 'NEEDS_INFO'>('IDLE');

  const bg = isDark ? Tokens.colors.bgDark : Tokens.colors.bgLight;
  const surface = isDark ? Tokens.colors.surfaceDark : Tokens.colors.surfaceLight;
  const border = isDark ? Tokens.colors.borderDark : Tokens.colors.borderLight;
  const textPrimary = isDark ? Tokens.colors.textLight : Tokens.colors.textDark;

  const currentRoleObj = ROLES.find((r) => r.id === selectedRole)!;

  const handleSubmitRoleRequest = () => {
    if (!claimedCode.trim()) return;
    setSubmittedStatus('PENDING');
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: bg }]} contentContainerStyle={styles.scrollContent}>
      <View style={[styles.card, { backgroundColor: surface, borderColor: border }]}>
        <Text style={[styles.headerTitle, { color: textPrimary }]}>Select Operational Role</Text>
        <Text style={styles.headerSub}>Choose your role within the campus ecosystem to submit an official authorization request.</Text>

        {/* Role Cards Grid */}
        <View style={styles.roleGrid}>
          {ROLES.map((r) => {
            const isSelected = selectedRole === r.id;
            return (
              <TouchableOpacity
                key={r.id}
                style={[
                  styles.roleCard,
                  {
                    backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : Tokens.colors.bgLight,
                    borderColor: isSelected ? r.color : border,
                    borderWidth: isSelected ? Tokens.borderWidths.thick : Tokens.borderWidths.flat,
                  },
                ]}
                onPress={() => { setSelectedRole(r.id); setSubmittedStatus('IDLE'); }}
                activeOpacity={0.8}
              >
                <View style={styles.roleCardHeader}>
                  <View style={[styles.roleIconCircle, { backgroundColor: r.color }]}>
                    <Ionicons name={r.icon} size={20} color="#FFFFFF" />
                  </View>
                  {isSelected && (
                    <View style={[styles.selectedBadge, { backgroundColor: r.color }]}>
                      <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                    </View>
                  )}
                </View>
                <Text style={[styles.roleCardTitle, { color: textPrimary }]}>{r.title}</Text>
                <Text style={styles.roleCardDesc}>{r.desc}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Request Details Form */}
        {submittedStatus === 'IDLE' && (
          <View style={styles.formSection}>
            <Text style={[styles.sectionTitle, { color: textPrimary }]}>Request Details for {currentRoleObj.title}</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>{currentRoleObj.fieldLabel}</Text>
              <TextInput
                style={[styles.input, { backgroundColor: bg, borderColor: border, color: textPrimary }]}
                placeholder={currentRoleObj.placeholder}
                placeholderTextColor="#94A3B8"
                value={claimedCode}
                onChangeText={setClaimedCode}
              />
            </View>

            {/* Document Evidence Upload */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Supporting Evidence (ID Card / Offer Letter / Guardian Slip)</Text>
              <TouchableOpacity
                style={[
                  styles.uploadBox,
                  { backgroundColor: bg, borderColor: hasUploadedDoc ? Tokens.colors.secondary : border },
                ]}
                onPress={() => setHasUploadedDoc(!hasUploadedDoc)}
              >
                <Ionicons
                  name={hasUploadedDoc ? 'document-text' : 'cloud-upload-outline'}
                  size={24}
                  color={hasUploadedDoc ? Tokens.colors.secondary : Tokens.colors.textMuted}
                />
                <Text style={[styles.uploadText, { color: hasUploadedDoc ? Tokens.colors.secondary : Tokens.colors.textMuted }]}>
                  {hasUploadedDoc ? 'Proof Uploaded: identity_proof.pdf (1.2 MB)' : 'Tap to select document/photo'}
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.submitBtn, { backgroundColor: currentRoleObj.color }]}
              onPress={handleSubmitRoleRequest}
              activeOpacity={0.8}
            >
              <Text style={styles.submitBtnText}>Submit Role Application</Text>
              <Ionicons name="paper-plane-outline" size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        )}

        {/* Live Timeline Tracker */}
        {submittedStatus !== 'IDLE' && (
          <View style={styles.trackerContainer}>
            <Text style={[styles.sectionTitle, { color: textPrimary }]}>Application Tracking Status</Text>

            <View style={styles.timeline}>
              <View style={styles.timelineItem}>
                <View style={[styles.timelineDot, { backgroundColor: Tokens.colors.secondary }]}>
                  <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                </View>
                <View style={styles.timelineContent}>
                  <Text style={[styles.timelineTitle, { color: textPrimary }]}>Request Submitted</Text>
                  <Text style={styles.timelineSub}>Role: {currentRoleObj.title} ({claimedCode})</Text>
                </View>
              </View>

              <View style={styles.timelineLine} />

              <View style={styles.timelineItem}>
                <View style={[styles.timelineDot, { backgroundColor: Tokens.colors.accentOrange }]}>
                  <Ionicons name="time" size={12} color="#FFFFFF" />
                </View>
                <View style={styles.timelineContent}>
                  <Text style={[styles.timelineTitle, { color: textPrimary }]}>Under Review by Administration</Text>
                  <Text style={styles.timelineSub}>Automated verification against database records in progress...</Text>
                </View>
              </View>

              <View style={styles.timelineLine} />

              <View style={styles.timelineItem}>
                <View style={[styles.timelineDot, { backgroundColor: '#CBD5E1' }]}>
                  <Text style={{ fontSize: 10, fontWeight: '700', color: '#64748B' }}>3</Text>
                </View>
                <View style={styles.timelineContent}>
                  <Text style={[styles.timelineTitle, { color: Tokens.colors.textMuted }]}>Final Activation & Role Grant</Text>
                  <Text style={styles.timelineSub}>Account will automatically unlock role features upon approval.</Text>
                </View>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.submitBtn, { backgroundColor: Tokens.colors.primary, marginTop: Tokens.spacing.lg }]}
              onPress={() => router.replace('/' as any)}
            >
              <Text style={styles.submitBtnText}>Return to Home Dashboard</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: Tokens.spacing.md, alignItems: 'center' },
  card: { width: '100%', maxWidth: 640, borderRadius: Tokens.radii.lg, padding: Tokens.spacing.lg, borderWidth: Tokens.borderWidths.flat },
  headerTitle: { fontSize: 22, fontWeight: '900', marginBottom: 4 },
  headerSub: { fontSize: 12, color: Tokens.colors.textMuted, marginBottom: Tokens.spacing.lg },
  roleGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Tokens.spacing.md, marginBottom: Tokens.spacing.lg },
  roleCard: { width: '48%', minWidth: 260, flexGrow: 1, borderRadius: Tokens.radii.md, padding: Tokens.spacing.md },
  roleCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Tokens.spacing.sm },
  roleIconCircle: { width: 36, height: 36, borderRadius: Tokens.radii.sm, alignItems: 'center', justifyContent: 'center' },
  selectedBadge: { width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  roleCardTitle: { fontSize: 14, fontWeight: '800', marginBottom: 4 },
  roleCardDesc: { fontSize: 11, color: Tokens.colors.textMuted, lineHeight: 15 },
  formSection: { marginTop: Tokens.spacing.md, borderTopWidth: Tokens.borderWidths.flat, borderTopColor: '#CBD5E1', paddingTop: Tokens.spacing.md },
  sectionTitle: { fontSize: 16, fontWeight: '800', marginBottom: Tokens.spacing.md },
  inputGroup: { marginBottom: Tokens.spacing.md },
  label: { fontSize: 12, fontWeight: '700', color: Tokens.colors.textMuted, marginBottom: 6 },
  input: { paddingHorizontal: Tokens.spacing.md, paddingVertical: Tokens.spacing.sm, borderRadius: Tokens.radii.sm, borderWidth: Tokens.borderWidths.flat, fontSize: 14 },
  uploadBox: { flexDirection: 'row', alignItems: 'center', gap: Tokens.spacing.sm, padding: Tokens.spacing.md, borderRadius: Tokens.radii.sm, borderWidth: Tokens.borderWidths.flat, borderStyle: 'dashed' },
  uploadText: { fontSize: 12, fontWeight: '700' },
  submitBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: Tokens.spacing.md, borderRadius: Tokens.radii.sm, gap: Tokens.spacing.sm },
  submitBtnText: { color: '#FFFFFF', fontWeight: '900', fontSize: 14 },
  trackerContainer: { marginTop: Tokens.spacing.md },
  timeline: { paddingLeft: Tokens.spacing.sm },
  timelineItem: { flexDirection: 'row', alignItems: 'flex-start', gap: Tokens.spacing.md },
  timelineDot: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginTop: 2 },
  timelineContent: { flex: 1 },
  timelineTitle: { fontSize: 14, fontWeight: '800' },
  timelineSub: { fontSize: 12, color: Tokens.colors.textMuted },
  timelineLine: { width: 2, height: 24, backgroundColor: '#CBD5E1', marginLeft: 11, marginVertical: 2 },
});
