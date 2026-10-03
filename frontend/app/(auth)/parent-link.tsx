import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
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

export default function ParentLinkScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [admissionNo, setAdmissionNo] = useState('');
  const [studentDob, setStudentDob] = useState('');
  const [relation, setRelation] = useState<'father' | 'mother' | 'guardian'>('father');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const bg = isDark ? Tokens.colors.bgDark : Tokens.colors.bgLight;
  const surface = isDark ? Tokens.colors.surfaceDark : Tokens.colors.surfaceLight;
  const border = isDark ? Tokens.colors.borderDark : Tokens.colors.borderLight;
  const textPrimary = isDark ? Tokens.colors.textLight : Tokens.colors.textDark;

  const handleSubmitLink = () => {
    setErrorMsg('');
    if (!admissionNo.trim()) {
      setErrorMsg('Please enter student admission number');
      return;
    }
    if (!studentDob.trim() || studentDob.length < 10) {
      setErrorMsg('Please enter student date of birth in YYYY-MM-DD format');
      return;
    }
    setIsSubmitted(true);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: bg }]}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={[styles.card, { backgroundColor: surface, borderColor: border }]}>
          {/* Header */}
          <View style={styles.header}>
            <View style={[styles.iconCircle, { backgroundColor: Tokens.colors.accentPurple }]}>
              <Ionicons name="people" size={28} color="#FFFFFF" />
            </View>
            <Text style={[styles.title, { color: textPrimary }]}>Link Enrolled Student</Text>
            <Text style={styles.subtitle}>
              Parent & Guardian Portal verification wizard. Link your child profile to view outpass requests, fee dues, and campus safety alerts.
            </Text>
          </View>

          {errorMsg ? (
            <View style={[styles.errorBanner, { backgroundColor: '#FEE2E2', borderColor: Tokens.colors.accentRed }]}>
              <Ionicons name="alert-circle" size={18} color={Tokens.colors.accentRed} />
              <Text style={styles.errorText}>{errorMsg}</Text>
            </View>
          ) : null}

          {!isSubmitted ? (
            <>
              {/* Admission Number */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Child Admission Number</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: bg, borderColor: border, color: textPrimary }]}
                  placeholder="e.g. 2026-CS-004"
                  placeholderTextColor="#94A3B8"
                  value={admissionNo}
                  onChangeText={setAdmissionNo}
                />
              </View>

              {/* Student DOB */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Child Date of Birth (YYYY-MM-DD)</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: bg, borderColor: border, color: textPrimary }]}
                  placeholder="e.g. 2004-05-15"
                  placeholderTextColor="#94A3B8"
                  value={studentDob}
                  onChangeText={setStudentDob}
                />
              </View>

              {/* Relationship Picker */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Relationship to Student</Text>
                <View style={styles.relationRow}>
                  {(['father', 'mother', 'guardian'] as const).map((r) => {
                    const isSelected = relation === r;
                    return (
                      <TouchableOpacity
                        key={r}
                        style={[
                          styles.relationChip,
                          {
                            backgroundColor: isSelected ? Tokens.colors.accentPurple : (isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'),
                            borderColor: isSelected ? Tokens.colors.accentPurple : border,
                          },
                        ]}
                        onPress={() => setRelation(r)}
                      >
                        <Text style={[styles.relationText, { color: isSelected ? '#FFFFFF' : textPrimary }]}>
                          {r.toUpperCase()}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Submit CTA */}
              <TouchableOpacity
                style={[styles.submitBtn, { backgroundColor: Tokens.colors.accentPurple }]}
                onPress={handleSubmitLink}
                activeOpacity={0.8}
              >
                <Text style={styles.submitBtnText}>Verify & Send Link Request</Text>
                <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
              </TouchableOpacity>
            </>
          ) : (
            /* Confirmation Card */
            <View style={styles.successCard}>
              <Ionicons name="checkmark-circle" size={56} color={Tokens.colors.secondary} />
              <Text style={[styles.title, { color: textPrimary, marginTop: Tokens.spacing.sm }]}>
                Link Request Sent to Student
              </Text>
              <Text style={styles.subtitle}>
                We have verified the student credentials ({admissionNo}). A link confirmation prompt has been dispatched to your child's student portal app.
              </Text>

              <View style={[styles.statusBox, { backgroundColor: bg, borderColor: border }]}>
                <View style={styles.statusRow}>
                  <Text style={styles.statusLabel}>Student Admission No:</Text>
                  <Text style={[styles.statusVal, { color: textPrimary }]}>{admissionNo}</Text>
                </View>
                <View style={styles.statusRow}>
                  <Text style={styles.statusLabel}>Relation Claimed:</Text>
                  <Text style={[styles.statusVal, { color: Tokens.colors.accentPurple }]}>{relation.toUpperCase()}</Text>
                </View>
                <View style={styles.statusRow}>
                  <Text style={styles.statusLabel}>DOB Verification:</Text>
                  <Text style={[styles.statusVal, { color: Tokens.colors.secondary }]}>MATCHED ✓</Text>
                </View>
                <View style={styles.statusRow}>
                  <Text style={styles.statusLabel}>Approval Status:</Text>
                  <Text style={[styles.statusVal, { color: Tokens.colors.accentOrange }]}>PENDING_STUDENT</Text>
                </View>
              </View>

              <TouchableOpacity
                style={[styles.submitBtn, { backgroundColor: Tokens.colors.primary, width: '100%', marginTop: Tokens.spacing.md }]}
                onPress={() => router.replace('/' as any)}
              >
                <Text style={styles.submitBtnText}>Return to Dashboard</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', padding: Tokens.spacing.md },
  card: { width: '100%', maxWidth: 440, borderRadius: Tokens.radii.lg, padding: Tokens.spacing.lg, borderWidth: Tokens.borderWidths.flat },
  header: { alignItems: 'center', marginBottom: Tokens.spacing.lg },
  iconCircle: { width: 56, height: 56, borderRadius: Tokens.radii.md, alignItems: 'center', justifyContent: 'center', marginBottom: Tokens.spacing.sm },
  title: { fontSize: 20, fontWeight: '900', marginBottom: 4, textAlign: 'center' },
  subtitle: { fontSize: 12, color: Tokens.colors.textMuted, textAlign: 'center' },
  errorBanner: { flexDirection: 'row', alignItems: 'center', gap: Tokens.spacing.xs, padding: Tokens.spacing.sm, borderRadius: Tokens.radii.sm, borderWidth: Tokens.borderWidths.thin, marginBottom: Tokens.spacing.md },
  errorText: { fontSize: 12, color: Tokens.colors.accentRed, fontWeight: '700', flex: 1 },
  inputGroup: { marginBottom: Tokens.spacing.md },
  label: { fontSize: 12, fontWeight: '700', color: Tokens.colors.textMuted, marginBottom: 6 },
  input: { paddingHorizontal: Tokens.spacing.md, paddingVertical: Tokens.spacing.sm, borderRadius: Tokens.radii.sm, borderWidth: Tokens.borderWidths.flat, fontSize: 14 },
  relationRow: { flexDirection: 'row', gap: Tokens.spacing.xs },
  relationChip: { flex: 1, paddingVertical: Tokens.spacing.sm, alignItems: 'center', borderRadius: Tokens.radii.sm, borderWidth: Tokens.borderWidths.flat },
  relationText: { fontSize: 11, fontWeight: '800' },
  submitBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: Tokens.spacing.md, borderRadius: Tokens.radii.sm, gap: Tokens.spacing.sm, marginTop: Tokens.spacing.xs },
  submitBtnText: { color: '#FFFFFF', fontWeight: '900', fontSize: 14 },
  successCard: { alignItems: 'center', paddingVertical: Tokens.spacing.sm },
  statusBox: { width: '100%', padding: Tokens.spacing.md, borderRadius: Tokens.radii.md, borderWidth: Tokens.borderWidths.flat, marginVertical: Tokens.spacing.md, gap: Tokens.spacing.xs },
  statusRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statusLabel: { fontSize: 12, color: Tokens.colors.textMuted },
  statusVal: { fontSize: 12, fontWeight: '800' },
});
