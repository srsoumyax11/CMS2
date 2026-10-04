import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Modal, TouchableOpacity } from 'react-native';
import { Card, Button, FormRenderer, FieldConfig, DataList, RequestCard, StatusTimeline, RequestItemData, Input } from '@campus/ui';
import { colors, spacing, typography, radius } from '@campus/design-tokens';
import { useTranslation } from '@campus/i18n';
import { z } from 'zod';

export interface ComplaintComment {
  id: string;
  author: string;
  text: string;
  createdAt: string;
}

export interface ComplaintData extends RequestItemData {
  category: 'hostel' | 'academic' | 'mess' | 'infrastructure' | 'it';
  photoUrl?: string;
  comments?: ComplaintComment[];
}

export interface ComplaintsScreenProps {
  onGetSignedUploadUrl?: (filename: string) => Promise<{ signedUrl: string; fileUrl: string }>;
  onUploadPhoto?: (signedUrl: string, fileBytes: Blob) => Promise<void>;
  onCreateComplaint?: (payload: { category: string; title: string; description: string; photoUrl?: string }) => Promise<void>;
  onReopenComplaint?: (id: string, reason: string) => Promise<void>;
  onAddComment?: (id: string, comment: string) => Promise<void>;
}

const CREATE_COMPLAINT_FIELDS: FieldConfig[] = [
  { name: 'title', label: 'Complaint Title', type: 'text', required: true, placeholder: 'e.g. Broken water heater in Room 204' },
  {
    name: 'category',
    label: 'Category',
    type: 'select',
    required: true,
    options: [
      { label: 'Hostel Maintenance', value: 'hostel' },
      { label: 'Academic & Classroom', value: 'academic' },
      { label: 'Mess & Food Quality', value: 'mess' },
      { label: 'Campus Infrastructure', value: 'infrastructure' },
      { label: 'IT & Wi-Fi Network', value: 'it' },
    ],
  },
  { name: 'description', label: 'Detailed Description', type: 'textarea', required: true, placeholder: 'Describe the issue...' },
];

const CreateComplaintSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  category: z.string().min(1, 'Category is required'),
  description: z.string().min(5, 'Description must be at least 5 characters'),
});

type ComplaintFormValues = z.infer<typeof CreateComplaintSchema>;

const INITIAL_COMPLAINTS: ComplaintData[] = [
  {
    id: 'cmp_201',
    type: 'complaint',
    category: 'hostel',
    title: 'Room 102 Air Conditioner Leaking',
    description: 'AC unit dripping water onto study table since yesterday.',
    status: 'needs_info',
    createdAt: '2026-10-03 16:00',
    timeline: [
      { id: 'c1', title: 'Ticket Created', status: 'completed', timestamp: 'Oct 3, 16:00' },
      { id: 'c2', title: 'Assigned to Hostel Maintenance', status: 'completed', timestamp: 'Oct 3, 17:30' },
      { id: 'c3', title: 'Awaiting Student Feedback', status: 'active', timestamp: 'Oct 4, 09:00' },
    ],
    comments: [
      { id: 'cm_1', author: 'Hostel Manager', text: 'Technician visited today. Please verify if leak stopped.', createdAt: 'Oct 4 09:00' },
    ],
  },
  {
    id: 'cmp_200',
    type: 'complaint',
    category: 'it',
    title: 'Wi-Fi Signal Dropping in Library Block B',
    description: 'Frequent disconnections on 5GHz band.',
    status: 'approved', // resolved
    createdAt: '2026-09-28 11:00',
    timeline: [
      { id: 'c11', title: 'Ticket Created', status: 'completed', timestamp: 'Sep 28, 11:00' },
      { id: 'c12', title: 'Router Replaced', status: 'completed', timestamp: 'Sep 29, 14:00' },
      { id: 'c13', title: 'Resolved', status: 'completed', timestamp: 'Sep 29, 15:00' },
    ],
    comments: [
      { id: 'cm_10', author: 'IT Helpdesk', text: 'Replaced access point router in Library Block B.', createdAt: 'Sep 29 15:00' },
    ],
  },
];

export const ComplaintsScreen: React.FC<ComplaintsScreenProps> = ({
  onGetSignedUploadUrl,
  onUploadPhoto,
  onCreateComplaint,
  onReopenComplaint,
  onAddComment,
}) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'list' | 'create'>('list');
  const [complaints, setComplaints] = useState<ComplaintData[]>(INITIAL_COMPLAINTS);
  const [selectedComplaint, setSelectedComplaint] = useState<ComplaintData | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [attachedPhotoUrl, setAttachedPhotoUrl] = useState<string | null>(null);
  const [newCommentText, setNewCommentText] = useState('');
  const [reopenReason, setReopenReason] = useState('');
  const [showReopenModal, setShowReopenModal] = useState(false);

  const handleSimulatePhotoUpload = async () => {
    setIsUploading(true);
    try {
      if (onGetSignedUploadUrl) {
        const { signedUrl, fileUrl } = await onGetSignedUploadUrl('complaint_photo.jpg');
        setAttachedPhotoUrl(fileUrl);
      } else {
        setAttachedPhotoUrl('https://example.com/uploads/complaint_sample.jpg');
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleCreateSubmit = async (values: ComplaintFormValues) => {
    if (onCreateComplaint) {
      await onCreateComplaint({
        category: values.category,
        title: values.title,
        description: values.description,
        photoUrl: attachedPhotoUrl || undefined,
      });
    }

    const newComplaint: ComplaintData = {
      id: `cmp_${Date.now()}`,
      type: 'complaint',
      category: (values.category as any) || 'hostel',
      title: values.title,
      description: values.description,
      status: 'pending',
      photoUrl: attachedPhotoUrl || undefined,
      createdAt: new Date().toLocaleString(),
      timeline: [
        { id: 't1', title: 'Ticket Logged', status: 'completed', timestamp: 'Just now' },
        { id: 't2', title: 'Pending Assignment', status: 'active' },
      ],
      comments: [],
    };

    setComplaints((prev) => [newComplaint, ...prev]);
    setAttachedPhotoUrl(null);
    setActiveTab('list');
  };

  const handleAddComment = async () => {
    if (!selectedComplaint || !newCommentText.trim()) return;
    if (onAddComment) await onAddComment(selectedComplaint.id, newCommentText);

    const newCm: ComplaintComment = {
      id: `cm_${Date.now()}`,
      author: 'You (Student)',
      text: newCommentText,
      createdAt: new Date().toLocaleTimeString(),
    };

    const updated = {
      ...selectedComplaint,
      comments: [...(selectedComplaint.comments || []), newCm],
    };

    setSelectedComplaint(updated);
    setComplaints((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    setNewCommentText('');
  };

  const handleReopen = async () => {
    if (!selectedComplaint || !reopenReason.trim()) return;
    if (onReopenComplaint) await onReopenComplaint(selectedComplaint.id, reopenReason);

    const updated: ComplaintData = {
      ...selectedComplaint,
      status: 'pending',
      timeline: [
        ...(selectedComplaint.timeline || []),
        { id: `t_reopen_${Date.now()}`, title: `Reopened: ${reopenReason}`, status: 'active', timestamp: 'Just now' },
      ],
    };

    setSelectedComplaint(updated);
    setComplaints((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    setShowReopenModal(false);
    setReopenReason('');
  };

  return (
    <View style={styles.container}>
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'list' && styles.activeTabBtn]}
          onPress={() => setActiveTab('list')}
          testID="tab-complaint-list"
        >
          <Text style={[styles.tabText, activeTab === 'list' && styles.activeTabText]}>My Tickets</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'create' && styles.activeTabBtn]}
          onPress={() => setActiveTab('create')}
          testID="tab-complaint-create"
        >
          <Text style={[styles.tabText, activeTab === 'create' && styles.activeTabText]}>New Ticket</Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'create' ? (
        <ScrollView style={styles.formScroll}>
          <Card style={styles.formCard}>
            <Text style={styles.formTitle}>File a Complaint / Helpdesk Ticket</Text>
            <FormRenderer<ComplaintFormValues>
              fields={CREATE_COMPLAINT_FIELDS}
              schema={CreateComplaintSchema}
              onSubmit={handleCreateSubmit}
              submitLabel="Submit Ticket"
            />

            <View style={styles.photoUploadBox}>
              <Text style={styles.photoBoxLabel}>Attach Photo Evidence (Signed URL flow)</Text>
              <Button
                label={attachedPhotoUrl ? 'Photo Attached ✓' : 'Upload Photo'}
                variant="secondary"
                onPress={handleSimulatePhotoUpload}
                isLoading={isUploading}
                testID="btn-upload-complaint-photo"
              />
              {attachedPhotoUrl && <Text style={styles.photoUrlText}>Attachment: {attachedPhotoUrl}</Text>}
            </View>
          </Card>
        </ScrollView>
      ) : (
        <DataList<ComplaintData>
          data={complaints}
          emptyTitle="No Complaints Registered"
          emptyDescription="You currently have no open or resolved tickets."
          renderItem={({ item }) => (
            <RequestCard
              item={item}
              onPress={() => setSelectedComplaint(item)}
              showTimeline={false}
            />
          )}
        />
      )}

      {/* Complaint Detail Modal */}
      {selectedComplaint && (
        <Modal transparent animationType="slide" visible={Boolean(selectedComplaint)}>
          <View style={styles.modalOverlay}>
            <Card style={styles.modalCard}>
              <ScrollView>
                <Text style={styles.modalTitle}>{selectedComplaint.title}</Text>
                <Text style={styles.categoryBadge}>CATEGORY: {selectedComplaint.category.toUpperCase()}</Text>
                <Text style={styles.modalSub}>{selectedComplaint.description}</Text>

                <Text style={styles.sectionHeader}>Status Timeline</Text>
                {selectedComplaint.timeline && <StatusTimeline steps={selectedComplaint.timeline} />}

                <Text style={styles.sectionHeader}>Comments & Updates</Text>
                {selectedComplaint.comments && selectedComplaint.comments.length > 0 ? (
                  selectedComplaint.comments.map((cm) => (
                    <View key={cm.id} style={styles.commentRow}>
                      <Text style={styles.commentAuthor}>{cm.author} ({cm.createdAt})</Text>
                      <Text style={styles.commentText}>{cm.text}</Text>
                    </View>
                  ))
                ) : (
                  <Text style={styles.noCommentsText}>No comments on this ticket yet.</Text>
                )}

                <View style={styles.addCommentBox}>
                  <Input
                    label="Add Comment / Reply"
                    placeholder="Type a message..."
                    value={newCommentText}
                    onChangeText={setNewCommentText}
                    testID="input-complaint-comment"
                  />
                  <Button
                    label="Post Comment"
                    variant="secondary"
                    onPress={handleAddComment}
                    disabled={!newCommentText.trim()}
                    testID="btn-post-comment"
                  />
                </View>

                <View style={styles.modalActions}>
                  {(selectedComplaint.status === 'approved' || selectedComplaint.status === 'rejected') && (
                    <Button
                      label="Reopen Ticket"
                      variant="danger"
                      onPress={() => setShowReopenModal(true)}
                      testID="btn-reopen-ticket"
                    />
                  )}
                  <Button
                    label="Close"
                    variant="secondary"
                    onPress={() => setSelectedComplaint(null)}
                  />
                </View>
              </ScrollView>
            </Card>
          </View>
        </Modal>
      )}

      {/* Reopen Ticket Modal */}
      {showReopenModal && (
        <Modal transparent animationType="fade" visible={showReopenModal}>
          <View style={styles.modalOverlay}>
            <Card style={styles.modalCard}>
              <Text style={styles.modalTitle}>Reopen Helpdesk Ticket</Text>
              <Input
                label="Reason for Reopening"
                placeholder="Explain why issue is unresolved..."
                value={reopenReason}
                onChangeText={setReopenReason}
                multiline
                numberOfLines={3}
                testID="input-reopen-reason"
              />
              <View style={styles.modalActions}>
                <Button label="Cancel" variant="secondary" onPress={() => setShowReopenModal(false)} />
                <Button
                  label="Confirm Reopen"
                  variant="danger"
                  onPress={handleReopen}
                  disabled={!reopenReason.trim()}
                  testID="btn-confirm-reopen"
                />
              </View>
            </Card>
          </View>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.gray[50], padding: spacing.md },
  tabContainer: { flexDirection: 'row', backgroundColor: colors.gray[200], borderRadius: radius.md, marginBottom: spacing.md, padding: 2 },
  tabBtn: { flex: 1, paddingVertical: spacing.sm, alignItems: 'center', borderRadius: radius.md },
  activeTabBtn: { backgroundColor: colors.white },
  tabText: { fontSize: typography.fontSize.sm, fontWeight: 'bold', color: colors.gray[600] },
  activeTabText: { color: colors.primary[600] },
  formScroll: { flex: 1 },
  formCard: { padding: spacing.lg },
  formTitle: { fontSize: typography.fontSize.lg, fontWeight: 'bold', color: colors.gray[900], marginBottom: spacing.md },
  photoUploadBox: { marginTop: spacing.md, paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.gray[200] },
  photoBoxLabel: { fontSize: typography.fontSize.xs, fontWeight: 'bold', color: colors.gray[700], marginBottom: spacing.xs },
  photoUrlText: { fontSize: typography.fontSize.xs, color: colors.success.dark, marginTop: spacing.xs },
  modalOverlay: { flex: 1, backgroundColor: colors.backdrop, justifyContent: 'center', padding: spacing.md },
  modalCard: { padding: spacing.lg, maxHeight: '85%' },
  modalTitle: { fontSize: typography.fontSize.lg, fontWeight: 'bold', color: colors.gray[900] },
  categoryBadge: { fontSize: 10, fontWeight: 'bold', color: colors.primary[600], marginTop: spacing.xs / 2 },
  modalSub: { fontSize: typography.fontSize.sm, color: colors.gray[600], marginVertical: spacing.xs },
  sectionHeader: { fontSize: typography.fontSize.sm, fontWeight: 'bold', color: colors.gray[800], marginTop: spacing.md, marginBottom: spacing.xs },
  commentRow: { backgroundColor: colors.gray[100], padding: spacing.sm, borderRadius: radius.sm, marginVertical: spacing.xs / 2 },
  commentAuthor: { fontSize: typography.fontSize.xs, fontWeight: 'bold', color: colors.gray[700] },
  commentText: { fontSize: typography.fontSize.sm, color: colors.gray[900], marginTop: 2 },
  noCommentsText: { fontSize: typography.fontSize.xs, color: colors.gray[400], fontStyle: 'italic' },
  addCommentBox: { marginTop: spacing.md },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: spacing.xs, marginTop: spacing.lg },
});
