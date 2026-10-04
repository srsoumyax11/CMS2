import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Modal } from 'react-native';
import { Card, Button, Input, StatusTimeline, TimelineStep } from '@campus/ui';
import { colors, spacing, typography } from '@campus/design-tokens';

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
}

export interface UserRoleRequest {
  id: string;
  role: 'student' | 'faculty' | 'warden';
  status: 'pending' | 'needs_info' | 'approved' | 'rejected' | 'cancelled';
  submittedAt: string;
  rejectionReason?: string;
  infoRequestedText?: string;
}

export interface CommonDashboardScreenProps {
  user?: UserProfile;
  roleRequests?: UserRoleRequest[];
  onCancelRequest?: (id: string) => Promise<void>;
  onRespondNeedsInfo?: (id: string, responseText: string) => Promise<void>;
  onReapply?: (role: 'student' | 'faculty' | 'warden') => void;
  onRequestRoleClick?: () => void;
  onChangePassword?: (oldPass: string, newPass: string) => Promise<void>;
  onLogout?: () => void;
}

const DEFAULT_USER: UserProfile = {
  name: 'Alex Rivera',
  email: 'alex.rivera@campus.edu',
  phone: '+91 98765 43210',
};

const DEFAULT_REQUESTS: UserRoleRequest[] = [
  {
    id: 'req_501',
    role: 'student',
    status: 'pending',
    submittedAt: '2026-10-04',
  },
];

export const CommonDashboardScreen: React.FC<CommonDashboardScreenProps> = ({
  user = DEFAULT_USER,
  roleRequests = DEFAULT_REQUESTS,
  onCancelRequest,
  onRespondNeedsInfo,
  onReapply,
  onRequestRoleClick,
  onChangePassword,
  onLogout,
}) => {
  const [requests, setRequests] = useState<UserRoleRequest[]>(roleRequests);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordNotice, setPasswordNotice] = useState<string | null>(null);
  const [infoModalId, setInfoModalId] = useState<string | null>(null);
  const [infoText, setInfoText] = useState('');

  const handleCancel = async (id: string) => {
    if (onCancelRequest) await onCancelRequest(id);
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'cancelled' } : r))
    );
  };

  const handleSaveInfoResponse = async () => {
    if (!infoModalId || !infoText.trim()) return;
    if (onRespondNeedsInfo) await onRespondNeedsInfo(infoModalId, infoText);
    setRequests((prev) =>
      prev.map((r) => (r.id === infoModalId ? { ...r, status: 'pending' } : r))
    );
    setInfoModalId(null);
    setInfoText('');
  };

  const handleChangePassSubmit = async () => {
    if (!oldPassword || !newPassword) return;
    if (onChangePassword) await onChangePassword(oldPassword, newPassword);
    setPasswordNotice('Password changed successfully.');
    setShowPasswordModal(false);
    setOldPassword('');
    setNewPassword('');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Profile Card */}
      <Card style={styles.profileCard}>
        <Text style={styles.cardTitle}>User Account Profile</Text>
        <Text style={styles.nameText}>{user.name}</Text>
        <Text style={styles.metaText}>Email: {user.email}</Text>
        <Text style={styles.metaText}>Phone: {user.phone}</Text>

        <View style={styles.profileActions}>
          <Button
            label="Change Password"
            variant="secondary"
            onPress={() => setShowPasswordModal(true)}
            testID="btn-change-password"
          />
          <Button
            label="Logout"
            variant="secondary"
            onPress={() => onLogout?.()}
            testID="btn-user-logout"
          />
        </View>

        {passwordNotice && <Text style={styles.noticeText}>{passwordNotice}</Text>}
      </Card>

      {/* Role Request Promotion Card */}
      <Card style={styles.actionCard}>
        <Text style={styles.actionTitle}>No Active Operational Role</Text>
        <Text style={styles.actionDesc}>
          Role-specific campus features (Student dashboard, Faculty class logs, Warden outpasses) stay hidden until an official role application is approved by the admin team.
        </Text>
        <Button
          label="Request a Role"
          onPress={() => onRequestRoleClick?.()}
          testID="btn-request-a-role"
        />
      </Card>

      {/* My Applications Section */}
      <Text style={styles.sectionTitle}>My Applications</Text>
      {requests.map((req, reqIdx) => {
        const steps: TimelineStep[] = [
          { id: `step_1_${reqIdx}`, title: 'Application Submitted', description: `Submitted on ${req.submittedAt}`, status: 'completed' },
          {
            id: `step_2_${reqIdx}`,
            title: 'Admin Verification',
            description:
              req.status === 'needs_info'
                ? `Needs Info: ${req.infoRequestedText || 'Please provide additional document'}`
                : req.status === 'pending'
                ? 'Under Review by Approvals Committee'
                : req.status === 'rejected'
                ? `Rejected: ${req.rejectionReason || 'Document mismatch'}`
                : req.status === 'cancelled'
                ? 'Cancelled by user'
                : 'Approved',
            status:
              req.status === 'approved'
                ? 'completed'
                : req.status === 'rejected' || req.status === 'cancelled'
                ? 'rejected'
                : req.status === 'needs_info'
                ? 'active'
                : 'pending',
          },
        ];

        return (
          <Card key={req.id} style={styles.requestCard}>
            <View style={styles.rowBetween}>
              <Text style={styles.roleTitle}>{req.role.toUpperCase()} ROLE APPLICATION</Text>
              <Text style={styles.statusBadge}>{req.status.toUpperCase()}</Text>
            </View>

            <StatusTimeline steps={steps} />

            {req.status === 'pending' && (
              <Button
                label="Cancel Application"
                variant="secondary"
                onPress={() => handleCancel(req.id)}
                testID={`btn-cancel-request-${req.id}`}
              />
            )}

            {req.status === 'needs_info' && (
              <Button
                label="Provide Info / Evidence"
                onPress={() => setInfoModalId(req.id)}
                testID={`btn-info-request-${req.id}`}
              />
            )}

            {req.status === 'rejected' && (
              <Button
                label="Reapply for Role"
                onPress={() => onReapply && onReapply(req.role)}
                testID={`btn-reapply-${req.id}`}
              />
            )}
          </Card>
        );
      })}

      {/* Change Password Modal */}
      {showPasswordModal && (
        <Modal transparent animationType="slide" visible={showPasswordModal}>
          <View style={styles.modalOverlay}>
            <Card style={styles.modalCard}>
              <Text style={styles.modalTitle}>Change Password</Text>
              <Input
                label="Current Password"
                secureTextEntry
                value={oldPassword}
                onChangeText={setOldPassword}
              />
              <Input
                label="New Password"
                secureTextEntry
                value={newPassword}
                onChangeText={setNewPassword}
              />
              <View style={styles.modalActions}>
                <Button label="Cancel" variant="secondary" onPress={() => setShowPasswordModal(false)} />
                <Button label="Update Password" onPress={handleChangePassSubmit} disabled={!oldPassword || !newPassword} />
              </View>
            </Card>
          </View>
        </Modal>
      )}

      {/* Needs Info Response Modal */}
      {infoModalId && (
        <Modal transparent animationType="slide" visible={Boolean(infoModalId)}>
          <View style={styles.modalOverlay}>
            <Card style={styles.modalCard}>
              <Text style={styles.modalTitle}>Provide Requested Information</Text>
              <Input
                label="Response / Document Note"
                placeholder="Explain or paste updated document info..."
                value={infoText}
                onChangeText={setInfoText}
                multiline
              />
              <View style={styles.modalActions}>
                <Button label="Cancel" variant="secondary" onPress={() => setInfoModalId(null)} />
                <Button label="Submit Response" onPress={handleSaveInfoResponse} disabled={!infoText.trim()} />
              </View>
            </Card>
          </View>
        </Modal>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.gray[50] },
  content: { padding: spacing.md },
  profileCard: { padding: spacing.lg, marginBottom: spacing.md },
  cardTitle: { fontSize: typography.fontSize.xs, color: colors.gray[500], fontWeight: 'bold' },
  nameText: { fontSize: typography.fontSize.xl, fontWeight: 'bold', color: colors.gray[900], marginVertical: 2 },
  metaText: { fontSize: typography.fontSize.xs, color: colors.gray[700] },
  profileActions: { flexDirection: 'row', gap: spacing.xs, marginTop: spacing.md },
  noticeText: { fontSize: typography.fontSize.xs, color: colors.success.dark, fontWeight: 'bold', marginTop: spacing.xs },
  actionCard: { padding: spacing.md, backgroundColor: colors.primary[50], marginBottom: spacing.md },
  actionTitle: { fontSize: typography.fontSize.base, fontWeight: 'bold', color: colors.primary[900] },
  actionDesc: { fontSize: typography.fontSize.xs, color: colors.primary[700], marginVertical: spacing.xs },
  sectionTitle: { fontSize: typography.fontSize.lg, fontWeight: 'bold', color: colors.gray[800], marginBottom: spacing.xs },
  requestCard: { padding: spacing.md, marginBottom: spacing.sm, gap: spacing.xs },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  roleTitle: { fontSize: typography.fontSize.xs, fontWeight: 'bold', color: colors.gray[600] },
  statusBadge: { fontSize: 10, fontWeight: 'bold', color: colors.primary[600] },
  modalOverlay: { flex: 1, backgroundColor: colors.backdrop, justifyContent: 'center', padding: spacing.md },
  modalCard: { padding: spacing.lg, gap: spacing.sm },
  modalTitle: { fontSize: typography.fontSize.base, fontWeight: 'bold', color: colors.gray[900] },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: spacing.xs, marginTop: spacing.md },
});
