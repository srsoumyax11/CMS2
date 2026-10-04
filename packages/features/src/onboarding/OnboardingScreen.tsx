import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Button, Input, Card } from '@campus/ui';
import { colors, spacing, typography } from '@campus/design-tokens';
import { appConfig } from '@campus/config';
import { en } from '@campus/i18n';
import { z } from 'zod';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ApiClient, AppError } from '@campus/api-client';

export interface RequestableRole {
  roleId: string;
  name: string;
  evidenceRequired: boolean;
}

const roleRequestSchema = z.object({
  roleId: z.string().min(1, 'Role selection is required'),
  claimedCode: z.string().min(2, 'Claimed identification code is required'),
  departmentOrHostel: z.string().min(2, 'Department or Hostel is required'),
});

const parentLinkSchema = z.object({
  admissionNo: z.string().min(2, 'Admission number is required'),
  dob: z.string().min(8, 'DOB is required (YYYY-MM-DD)'),
  relation: z.string().min(2, 'Relation is required'),
});

type RoleRequestFormData = z.infer<typeof roleRequestSchema>;
type ParentLinkFormData = z.infer<typeof parentLinkSchema>;

interface OnboardingScreenProps {
  apiClient: ApiClient;
  onRequestSubmitted: (requestId: string) => void;
  i18nDict?: typeof en;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({
  apiClient,
  onRequestSubmitted,
  i18nDict = en,
}) => {
  const [status, setStatus] = useState<string>('registered');
  const [nextStep, setNextStep] = useState<string>('select_role');
  const [requestableRoles, setRequestableRoles] = useState<RequestableRole[]>([]);
  const [activeTab, setActiveTab] = useState<'role' | 'parent'>('role');

  const [evidenceFile, setEvidenceFile] = useState<{ name: string; size: number } | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [evidenceUrl, setEvidenceUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const [generalError, setGeneralError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    control: roleControl,
    handleSubmit: handleRoleSubmit,
    setValue: setRoleValue,
    watch: watchRole,
    formState: { errors: roleErrors },
  } = useForm<RoleRequestFormData>({
    resolver: zodResolver(roleRequestSchema),
    defaultValues: { roleId: '', claimedCode: '', departmentOrHostel: '' },
  });

  const {
    control: parentControl,
    handleSubmit: handleParentSubmit,
    formState: { errors: parentErrors },
  } = useForm<ParentLinkFormData>({
    resolver: zodResolver(parentLinkSchema),
    defaultValues: { admissionNo: '', dob: '', relation: 'father' },
  });

  const selectedRoleId = watchRole('roleId');

  useEffect(() => {
    fetchOnboardingData();
  }, []);

  const fetchOnboardingData = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch user onboarding status
      const onboarding = await apiClient.get(
        '/me/onboarding',
        z.object({ status: z.string(), nextStep: z.string() })
      );
      setStatus(onboarding.status);
      setNextStep(onboarding.nextStep);

      // 2. Fetch requestable roles dynamically from backend (NOT hardcoded)
      const rolesRes = await apiClient.get(
        '/roles/requestable',
        z.array(z.object({ roleId: z.string(), name: z.string(), evidenceRequired: z.boolean() }))
      );
      setRequestableRoles(rolesRes);
      if (rolesRes.length > 0) {
        setRoleValue('roleId', rolesRes[0].roleId);
      }
    } catch (err: unknown) {
      if (err instanceof AppError) {
        setGeneralError(err.message + (err.requestId ? ` (Req ID: ${err.requestId})` : ''));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSimulateFileUpload = async () => {
    const mockFile = { name: 'id_evidence.pdf', size: 2 * 1024 * 1024 }; // 2MB
    if (mockFile.size > appConfig.uploadLimits.maxSizeBytes) {
      setGeneralError('File exceeds max allowed size limit');
      return;
    }
    setEvidenceFile(mockFile);
    setIsUploading(true);
    setUploadProgress(0);

    // Simulate signed URL upload flow
    for (let p = 20; p <= 100; p += 20) {
      await new Promise((res) => setTimeout(res, 150));
      setUploadProgress(p);
    }
    setEvidenceUrl('https://storage.campus.edu/evidence/id_evidence.pdf');
    setIsUploading(false);
  };

  const onRoleFormSubmit = async (data: RoleRequestFormData) => {
    setIsLoading(true);
    setGeneralError(null);
    try {
      const idempotencyKey = apiClient.generateIdempotencyKey();
      const res = await apiClient.post(
        '/role-requests',
        z.object({ id: z.string(), status: z.string() }),
        {
          roleId: data.roleId,
          claimedCode: data.claimedCode,
          departmentOrHostel: data.departmentOrHostel,
          evidenceUrl,
        },
        { idempotencyKey }
      );
      onRequestSubmitted(res.id);
    } catch (err: unknown) {
      if (err instanceof AppError) {
        setGeneralError(err.message + (err.requestId ? ` (Req ID: ${err.requestId})` : ''));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const onParentFormSubmit = async (data: ParentLinkFormData) => {
    setIsLoading(true);
    setGeneralError(null);
    try {
      const idempotencyKey = apiClient.generateIdempotencyKey();
      const res = await apiClient.post(
        '/guardian-links',
        z.object({ id: z.string(), status: z.string() }),
        {
          admissionNo: data.admissionNo,
          dob: data.dob,
          relation: data.relation,
        },
        { idempotencyKey }
      );
      onRequestSubmitted(res.id);
    } catch (err: unknown) {
      if (err instanceof AppError) {
        setGeneralError(err.message + (err.requestId ? ` (Req ID: ${err.requestId})` : ''));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Card style={styles.card}>
        <Text style={styles.title}>{i18nDict.onboarding.title}</Text>
        <Text style={styles.statusLabel}>
          {i18nDict.onboarding.accountStatus}: <Text style={styles.statusVal}>{status}</Text>
        </Text>
        <Text style={styles.statusLabel}>
          {i18nDict.onboarding.nextStep}: <Text style={styles.statusVal}>{nextStep}</Text>
        </Text>

        {generalError && (
          <Text style={styles.errorText} testID="onboarding-error">
            {generalError}
          </Text>
        )}

        <View style={styles.tabBar}>
          <Button
            label={i18nDict.onboarding.roleRequest}
            variant={activeTab === 'role' ? 'primary' : 'secondary'}
            onPress={() => setActiveTab('role')}
            testID="tab-role-request"
          />
          <Button
            label={i18nDict.onboarding.parentLink}
            variant={activeTab === 'parent' ? 'primary' : 'secondary'}
            onPress={() => setActiveTab('parent')}
            testID="tab-parent-link"
          />
        </View>

        {activeTab === 'role' ? (
          <View testID="form-role-request">
            <Text style={styles.sectionHeading}>{i18nDict.auth.selectRole}</Text>
            {requestableRoles.map((role) => (
              <Button
                key={role.roleId}
                label={role.name}
                variant={selectedRoleId === role.roleId ? 'primary' : 'secondary'}
                onPress={() => setRoleValue('roleId', role.roleId)}
                testID={`role-btn-${role.roleId}`}
              />
            ))}

            <Controller
              control={roleControl}
              name="claimedCode"
              render={({ field: { onChange, value } }) => (
                <Input
                  label={i18nDict.onboarding.claimedCode}
                  value={value}
                  onChangeText={onChange}
                  error={roleErrors.claimedCode?.message}
                  testID="input-claimed-code"
                />
              )}
            />

            <Controller
              control={roleControl}
              name="departmentOrHostel"
              render={({ field: { onChange, value } }) => (
                <Input
                  label={i18nDict.onboarding.departmentOrHostel}
                  value={value}
                  onChangeText={onChange}
                  error={roleErrors.departmentOrHostel?.message}
                  testID="input-dept-hostel"
                />
              )}
            />

            <Button
              label={evidenceFile ? `${evidenceFile.name} (Uploaded)` : i18nDict.onboarding.uploadEvidence}
              onPress={handleSimulateFileUpload}
              variant="secondary"
              isLoading={isUploading}
              testID="btn-upload-evidence"
            />
            {uploadProgress > 0 && (
              <Text style={styles.progressText}>
                {i18nDict.onboarding.uploadProgress.replace('{{percent}}', String(uploadProgress))}
              </Text>
            )}

            <Button
              label={i18nDict.common.submit}
              onPress={handleRoleSubmit(onRoleFormSubmit)}
              isLoading={isLoading}
              disabled={isLoading || isUploading}
              testID="btn-submit-role-request"
            />
          </View>
        ) : (
          <View testID="form-parent-link">
            <Controller
              control={parentControl}
              name="admissionNo"
              render={({ field: { onChange, value } }) => (
                <Input
                  label={i18nDict.onboarding.admissionNo}
                  value={value}
                  onChangeText={onChange}
                  error={parentErrors.admissionNo?.message}
                  testID="input-admission-no"
                />
              )}
            />
            <Controller
              control={parentControl}
              name="dob"
              render={({ field: { onChange, value } }) => (
                <Input
                  label={i18nDict.onboarding.dob}
                  value={value}
                  onChangeText={onChange}
                  error={parentErrors.dob?.message}
                  testID="input-dob"
                />
              )}
            />
            <Controller
              control={parentControl}
              name="relation"
              render={({ field: { onChange, value } }) => (
                <Input
                  label={i18nDict.onboarding.relation}
                  value={value}
                  onChangeText={onChange}
                  error={parentErrors.relation?.message}
                  testID="input-relation"
                />
              )}
            />

            <Button
              label={i18nDict.common.submit}
              onPress={handleParentSubmit(onParentFormSubmit)}
              isLoading={isLoading}
              disabled={isLoading}
              testID="btn-submit-parent-link"
            />
          </View>
        )}
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: spacing.md },
  card: { padding: spacing.lg },
  title: {
    fontSize: typography.fontSize.xl,
    fontWeight: 'bold',
    color: colors.gray[900],
    marginBottom: spacing.sm,
  },
  statusLabel: { fontSize: typography.fontSize.base, color: colors.gray[600], marginVertical: spacing.xs },
  statusVal: { fontWeight: 'bold', color: colors.gray[900] },
  tabBar: { flexDirection: 'row', gap: spacing.sm, marginVertical: spacing.md },
  sectionHeading: { fontSize: typography.fontSize.lg, color: colors.gray[700], marginVertical: spacing.xs },
  errorText: { color: colors.danger.main, marginVertical: spacing.xs },
  progressText: { color: colors.gray[600], fontSize: typography.fontSize.xs, marginVertical: spacing.xs },
});
