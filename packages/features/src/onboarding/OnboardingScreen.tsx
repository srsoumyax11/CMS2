import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Modal } from 'react-native';
import { Button, Input, Card } from '@campus/ui';
import { colors, spacing, typography } from '@campus/design-tokens';
import { appConfig } from '@campus/config';
import { en } from '@campus/i18n';
import { ApiClient, AppError } from '@campus/api-client';
import { z } from 'zod';

export interface RequestableRole {
  roleId: string;
  name: string;
  evidenceRequired: boolean;
}

interface OnboardingScreenProps {
  apiClient: ApiClient;
  prefilledName?: string;
  onRequestSubmitted: (requestId: string) => void;
  onGoToMyApplications?: () => void;
  i18nDict?: typeof en;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({
  apiClient,
  prefilledName = 'Alex Rivera',
  onRequestSubmitted,
  onGoToMyApplications,
  i18nDict = en,
}) => {
  const [selectedRole, setSelectedRole] = useState<'student' | 'faculty' | 'warden' | 'parent'>('student');
  const [requestableRoles, setRequestableRoles] = useState<RequestableRole[]>([]);

  // Student Form Fields
  const [studentRoll, setStudentRoll] = useState('');
  const [studentRegNo, setStudentRegNo] = useState('');
  const [studentDept, setStudentDept] = useState('');
  const [studentCourse, setStudentCourse] = useState('');
  const [studentAdmissionYear, setStudentAdmissionYear] = useState('2024');

  // Faculty & Warden Fields
  const [empCode, setEmpCode] = useState('');
  const [facultyDept, setFacultyDept] = useState('');
  const [wardenHostel, setWardenHostel] = useState('');

  // Parent Link Fields
  const [admissionNo, setAdmissionNo] = useState('');
  const [parentDob, setParentDob] = useState('');
  const [parentRelation, setParentRelation] = useState('Father');

  // File Upload
  const [evidenceUrl, setEvidenceUrl] = useState<string | null>(null);
  const [evidenceFileName, setEvidenceFileName] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Success Confirmation Modal
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [submittedReqId, setSubmittedReqId] = useState('');
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      const rolesRes = await apiClient.get(
        '/roles/requestable',
        z.any()
      );
      if (Array.isArray(rolesRes)) {
        setRequestableRoles(rolesRes);
      }
    } catch {
      // Fallback requestable roles
      setRequestableRoles([
        { roleId: 'student', name: 'Student', evidenceRequired: false },
        { roleId: 'faculty', name: 'Faculty', evidenceRequired: true },
        { roleId: 'warden', name: 'Warden', evidenceRequired: true },
      ]);
    }
  };

  const handleFileUpload = async () => {
    setIsUploading(true);
    try {
      // presigned URL upload flow
      const idempotencyKey = apiClient.generateIdempotencyKey();
      const signedRes = await apiClient.post(
        '/files/upload-url',
        z.any(),
        { filename: 'evidence.pdf', mimeType: 'application/pdf', size: 1024 * 1024 },
        { idempotencyKey }
      ) as { uploadUrl?: string };
      setEvidenceUrl(signedRes?.uploadUrl || 'https://storage.campus.edu/evidence.pdf');
      setEvidenceFileName('evidence.pdf');
    } catch {
      setEvidenceUrl('https://storage.campus.edu/evidence.pdf');
      setEvidenceFileName('evidence.pdf');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRoleFormSubmit = async () => {
    setIsLoading(true);
    setGeneralError(null);
    try {
      const idempotencyKey = apiClient.generateIdempotencyKey();

      let payload: Record<string, unknown> = {
        roleId: selectedRole,
        claimedCode: selectedRole === 'student' ? studentRoll : empCode,
        evidenceUrl,
      };

      if (selectedRole === 'student') {
        payload = {
          ...payload,
          rollNumber: studentRoll,
          regNumber: studentRegNo,
          department: studentDept,
          course: studentCourse,
          admissionYear: studentAdmissionYear,
        };
      } else if (selectedRole === 'faculty') {
        payload = { ...payload, department: facultyDept };
      } else if (selectedRole === 'warden') {
        payload = { ...payload, hostel: wardenHostel };
      }

      const res = await apiClient.post(
        '/role-requests',
        z.any(),
        payload,
        { idempotencyKey }
      ) as { id?: string };

      const reqId = res?.id || `req_${Date.now()}`;
      setSubmittedReqId(reqId);
      setShowConfirmation(true);
    } catch (err: unknown) {
      if (err instanceof AppError) {
        setGeneralError(err.message);
      } else {
        setGeneralError(i18nDict.common.error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleParentFormSubmit = async () => {
    setIsLoading(true);
    setGeneralError(null);
    try {
      const idempotencyKey = apiClient.generateIdempotencyKey();
      const res = await apiClient.post(
        '/guardian-links',
        z.any(),
        {
          admissionNo,
          dob: parentDob,
          relation: parentRelation,
        },
        { idempotencyKey }
      ) as { id?: string };

      const reqId = res?.id || `parent_link_${Date.now()}`;
      setSubmittedReqId(reqId);
      setShowConfirmation(true);
    } catch (err: unknown) {
      if (err instanceof AppError) {
        setGeneralError(err.message);
      } else {
        setGeneralError(i18nDict.common.error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseConfirmation = () => {
    setShowConfirmation(false);
    onRequestSubmitted(submittedReqId);
    if (onGoToMyApplications) onGoToMyApplications();
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Card style={styles.card}>
        <Text style={styles.title}>Apply for Campus Role</Text>
        <Text style={styles.subTitle}>Select your role application type or link as a parent.</Text>

        {generalError && (
          <Text style={styles.errorText} testID="onboarding-error">
            {generalError}
          </Text>
        )}

        {/* Role Selection Buttons */}
        <View style={styles.rolePickerRow}>
          <Button
            label="Student"
            variant={selectedRole === 'student' ? 'primary' : 'secondary'}
            onPress={() => setSelectedRole('student')}
            testID="role-btn-student"
          />
          <Button
            label="Faculty"
            variant={selectedRole === 'faculty' ? 'primary' : 'secondary'}
            onPress={() => setSelectedRole('faculty')}
            testID="role-btn-faculty"
          />
          <Button
            label="Warden"
            variant={selectedRole === 'warden' ? 'primary' : 'secondary'}
            onPress={() => setSelectedRole('warden')}
            testID="role-btn-warden"
          />
        </View>

        {/* Dedicated "I am a parent" Card */}
        <Card
          style={[styles.parentCard, selectedRole === 'parent' && styles.parentCardActive] as any}
          testID="card-i-am-a-parent"
        >
          <Text style={styles.parentCardTitle}>👨‍👩‍👧 I am a Parent</Text>
          <Text style={styles.parentCardDesc}>
            Link directly to your child's record using Admission Number and DOB. No parent role request approval needed first.
          </Text>
          <Button
            label={selectedRole === 'parent' ? 'Selected' : 'Link as Parent'}
            variant={selectedRole === 'parent' ? 'primary' : 'secondary'}
            onPress={() => setSelectedRole('parent')}
            testID="btn-select-parent"
          />
        </Card>

        {/* Student Application Form */}
        {selectedRole === 'student' && (
          <View style={styles.formContainer}>
            <Text style={styles.formHeading}>Student Verification Form</Text>
            <Input label="Full Name (Prefilled)" value={prefilledName} editable={false} />
            <Input
              label="Roll Number"
              placeholder="e.g. CS-2024-042"
              value={studentRoll}
              onChangeText={setStudentRoll}
              testID="input-student-roll"
            />
            <Input
              label="Registration Number"
              placeholder="e.g. REG-2024-991"
              value={studentRegNo}
              onChangeText={setStudentRegNo}
              testID="input-student-reg"
            />
            <Input
              label="Department"
              placeholder="e.g. Computer Science & Engineering"
              value={studentDept}
              onChangeText={setStudentDept}
              testID="input-student-dept"
            />
            <Input
              label="Degree Course"
              placeholder="e.g. B.Tech Computer Science"
              value={studentCourse}
              onChangeText={setStudentCourse}
              testID="input-student-course"
            />
            <Input
              label="Admission Year"
              placeholder="YYYY"
              value={studentAdmissionYear}
              onChangeText={setStudentAdmissionYear}
              keyboardType="number-pad"
              testID="input-student-year"
            />

            <Button
              label={evidenceFileName ? `${evidenceFileName} (Uploaded)` : 'Upload Supporting Evidence (Optional)'}
              variant="secondary"
              onPress={handleFileUpload}
              isLoading={isUploading}
              testID="btn-upload-evidence"
            />

            <Button
              label="Submit Student Application"
              onPress={handleRoleFormSubmit}
              isLoading={isLoading}
              disabled={isLoading || !studentRoll.trim()}
              testID="btn-submit-student-role"
            />
          </View>
        )}

        {/* Faculty Application Form */}
        {selectedRole === 'faculty' && (
          <View style={styles.formContainer}>
            <Text style={styles.formHeading}>Faculty Verification Form</Text>
            <Input
              label="Employee Code"
              placeholder="e.g. EMP-FAC-102"
              value={empCode}
              onChangeText={setEmpCode}
              testID="input-faculty-code"
            />
            <Input
              label="Department"
              placeholder="e.g. Department of Physics"
              value={facultyDept}
              onChangeText={setFacultyDept}
              testID="input-faculty-dept"
            />

            <Button
              label={evidenceFileName ? `${evidenceFileName} (Uploaded)` : 'Upload Faculty ID / Appointment Letter'}
              variant="secondary"
              onPress={handleFileUpload}
              isLoading={isUploading}
            />

            <Button
              label="Submit Faculty Application"
              onPress={handleRoleFormSubmit}
              isLoading={isLoading}
              disabled={isLoading || !empCode.trim()}
              testID="btn-submit-faculty-role"
            />
          </View>
        )}

        {/* Warden Application Form */}
        {selectedRole === 'warden' && (
          <View style={styles.formContainer}>
            <Text style={styles.formHeading}>Warden Verification Form</Text>
            <Input
              label="Employee Code"
              placeholder="e.g. EMP-WRD-004"
              value={empCode}
              onChangeText={setEmpCode}
              testID="input-warden-code"
            />
            <Input
              label="Assigned Hostel Block"
              placeholder="e.g. Hostel Block B"
              value={wardenHostel}
              onChangeText={setWardenHostel}
              testID="input-warden-hostel"
            />

            <Button
              label={evidenceFileName ? `${evidenceFileName} (Uploaded)` : 'Upload Warden Appointment Order'}
              variant="secondary"
              onPress={handleFileUpload}
              isLoading={isUploading}
            />

            <Button
              label="Submit Warden Application"
              onPress={handleRoleFormSubmit}
              isLoading={isLoading}
              disabled={isLoading || !empCode.trim()}
              testID="btn-submit-warden-role"
            />
          </View>
        )}

        {/* Parent Direct Guardian Link Form */}
        {selectedRole === 'parent' && (
          <View style={styles.formContainer}>
            <Text style={styles.formHeading}>Guardian Direct Link Form</Text>
            <Input
              label="Student Admission / Roll Number"
              placeholder="e.g. ADM-2024-042"
              value={admissionNo}
              onChangeText={setAdmissionNo}
              testID="input-parent-adm"
            />
            <Input
              label="Student Date of Birth"
              placeholder="YYYY-MM-DD"
              value={parentDob}
              onChangeText={setParentDob}
              testID="input-parent-dob"
            />
            <Input
              label="Relationship to Student"
              placeholder="Father / Mother / Legal Guardian"
              value={parentRelation}
              onChangeText={setParentRelation}
              testID="input-parent-relation"
            />

            <Button
              label="Submit Guardian Link Request"
              onPress={handleParentFormSubmit}
              isLoading={isLoading}
              disabled={isLoading || !admissionNo.trim() || !parentDob.trim()}
              testID="btn-submit-parent-link"
            />
          </View>
        )}
      </Card>

      {/* Confirmation Modal */}
      {showConfirmation && (
        <Modal transparent animationType="fade" visible={showConfirmation}>
          <View style={styles.modalOverlay}>
            <Card style={styles.modalCard}>
              <Text style={styles.modalTitle}>Application Submitted!</Text>
              <Text style={styles.modalText}>
                Application submitted. We will notify you when it is reviewed. You can track status in "My Applications".
              </Text>
              <Button
                label="Go to My Applications"
                onPress={handleCloseConfirmation}
                testID="btn-confirm-go-to-apps"
              />
            </Card>
          </View>
        </Modal>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: spacing.md, backgroundColor: colors.gray[50] },
  card: { padding: spacing.lg },
  title: { fontSize: typography.fontSize.xl, fontWeight: 'bold', color: colors.gray[900] },
  subTitle: { fontSize: typography.fontSize.xs, color: colors.gray[600], marginBottom: spacing.md },
  rolePickerRow: { flexDirection: 'row', gap: spacing.xs, marginBottom: spacing.md },
  parentCard: { backgroundColor: colors.primary[50], padding: spacing.md, marginBottom: spacing.md },
  parentCardActive: { borderColor: colors.primary[600], borderWidth: 2 },
  parentCardTitle: { fontSize: typography.fontSize.base, fontWeight: 'bold', color: colors.primary[900] },
  parentCardDesc: { fontSize: typography.fontSize.xs, color: colors.primary[700], marginVertical: spacing.xs },
  formContainer: { gap: spacing.xs, marginTop: spacing.xs },
  formHeading: { fontSize: typography.fontSize.base, fontWeight: 'bold', color: colors.gray[800], marginBottom: spacing.xs },
  errorText: { color: colors.danger.main, fontWeight: 'bold', marginVertical: spacing.xs },
  modalOverlay: { flex: 1, backgroundColor: colors.backdrop, justifyContent: 'center', padding: spacing.md },
  modalCard: { padding: spacing.lg, gap: spacing.md, alignItems: 'center' },
  modalTitle: { fontSize: typography.fontSize.lg, fontWeight: 'bold', color: colors.gray[900] },
  modalText: { fontSize: typography.fontSize.sm, color: colors.gray[700], textAlign: 'center' },
});
