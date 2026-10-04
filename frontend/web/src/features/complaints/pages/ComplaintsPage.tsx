import React, { useState, useEffect } from 'react';
import { complaintsApi, ComplaintRecord } from '@/features/complaints/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/app/providers/AuthProvider';
// import { env } from '@/config/env';
import { MockBanner } from '@/components/ui/MockBanner';
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  MessageSquare,
  Plus,
  Send,
  Wrench,
} from 'lucide-react';

export const ComplaintsPage: React.FC = () => {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState<ComplaintRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'ALL' | 'OPEN' | 'IN_PROGRESS' | 'RESOLVED'>('ALL');
  
  // New Complaint Form Modal State
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Plumbing');
  const [description, setDescription] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Selected ticket for comments
  const [selectedTicket, setSelectedTicket] = useState<ComplaintRecord | null>(null);
  const [newComment, setNewComment] = useState('');
  const [isPostingComment, setIsPostingComment] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchComplaints = async () => {
      try {
        const data = await complaintsApi.getStudentComplaints();
        if (isMounted) setComplaints(data);
      } catch {
        if (isMounted) {
          setComplaints([
            {
              id: 'cmp_101',
              title: 'Hostel Room Water Leakage',
              category: 'Plumbing',
              description: 'Bathroom pipe leakage in Room 302.',
              status: 'IN_PROGRESS',
              createdAt: '2026-10-03 14:20',
              assignedStaff: 'Warden Ramesh Kumar',
              comments: [
                {
                  id: 'cm_1',
                  authorName: 'Ramesh Kumar',
                  authorRole: 'Warden',
                  comment: 'Plumber dispatched. Expected completion by 5 PM.',
                  createdAt: '2026-10-03 16:00',
                },
              ],
            },
            {
              id: 'cmp_102',
              title: 'Study Lamp Socket Broken',
              category: 'Electrical',
              description: 'Main socket sparking near Desk B.',
              status: 'OPEN',
              createdAt: '2026-10-04 09:15',
            },
          ]);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchComplaints();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleCreateComplaint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setSubmitError('Please provide a title and detailed description.');
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitError(null);
      await complaintsApi.createComplaint({
        title,
        category,
        description,
        photoUrl: photoUrl.trim() || undefined,
        studentId: user?.id,
      });

      // Append to local state
      const newRecord: ComplaintRecord = {
        id: `cmp_${Date.now()}`,
        title,
        category,
        description,
        photoUrl: photoUrl.trim() || undefined,
        status: 'OPEN',
        createdAt: new Date().toLocaleString(),
      };
      setComplaints((prev) => [newRecord, ...prev]);

      // Reset
      setTitle('');
      setDescription('');
      setPhotoUrl('');
      setShowModal(false);
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to submit complaint ticket.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !newComment.trim()) return;

    try {
      setIsPostingComment(true);
      await complaintsApi.addComment(selectedTicket.id, newComment);
      
      // Update local state ticket comments
      const addedCommentObj = {
        id: `cm_${Date.now()}`,
        authorName: user?.fullName || 'Student',
        authorRole: 'Student',
        comment: newComment,
        createdAt: new Date().toLocaleString(),
      };

      const updated = complaints.map((c) =>
        c.id === selectedTicket.id
          ? { ...c, comments: [...(c.comments || []), addedCommentObj] }
          : c
      );

      setComplaints(updated);
      setSelectedTicket((prev) =>
        prev ? { ...prev, comments: [...(prev.comments || []), addedCommentObj] } : null
      );
      setNewComment('');
    } catch {
      // ignore
    } finally {
      setIsPostingComment(false);
    }
  };

  const filteredComplaints = complaints.filter((c) => {
    if (activeTab === 'ALL') return true;
    return c.status === activeTab;
  });

  return (
    <div className="space-y-6">
      <MockBanner />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Wrench className="h-6 w-6 text-primary" />
            <span>Hostel & Maintenance Complaints</span>
          </h1>
          <p className="text-sm text-muted-foreground">
            Log room issues, track technician resolution status, and communicate directly with staff.
          </p>
        </div>

        <Button onClick={() => setShowModal(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          <span>New Ticket</span>
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b pb-2">
        {(['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              activeTab === tab
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted'
            }`}
          >
            {tab.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Complaint List */}
      {loading ? (
        <div className="text-center py-12 text-muted-foreground animate-pulse text-sm">
          Loading complaint tickets...
        </div>
      ) : filteredComplaints.length === 0 ? (
        <div className="text-center py-12 border rounded-xl bg-card text-muted-foreground space-y-2">
          <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto" />
          <p className="font-semibold text-foreground">No active complaints</p>
          <p className="text-xs">There are no maintenance tickets matching your filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredComplaints.map((item) => (
            <div
              key={item.id}
              className="border rounded-xl p-5 bg-card hover:shadow-sm transition-shadow space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold uppercase bg-muted text-muted-foreground mb-1">
                      {item.category}
                    </span>
                    <h3 className="font-bold text-foreground text-base leading-tight">{item.title}</h3>
                  </div>

                  <StatusBadge status={item.status} />
                </div>

                <p className="text-xs text-muted-foreground line-clamp-2">{item.description}</p>
                {item.assignedStaff && (
                  <p className="text-[11px] text-primary font-medium">
                    Assigned: {item.assignedStaff}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between pt-3 border-t text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {item.createdAt}
                </span>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedTicket(item)}
                  className="gap-1.5 text-xs h-8"
                >
                  <MessageSquare className="h-3.5 w-3.5" />
                  <span>Discussion ({item.comments?.length || 0})</span>
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New Ticket Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border rounded-xl max-w-md w-full p-6 shadow-xl space-y-4">
            <h2 className="text-lg font-bold text-foreground">Submit Maintenance Complaint</h2>

            {submitError && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-xs rounded-md flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{submitError}</span>
              </div>
            )}

            <form onSubmit={handleCreateComplaint} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-foreground">Issue Title</label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Room 302 Fan Noise / AC Leak"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  <option value="Plumbing">Plumbing</option>
                  <option value="Electrical">Electrical</option>
                  <option value="Carpentry / Furniture">Carpentry / Furniture</option>
                  <option value="Cleanliness / Hygiene">Cleanliness / Hygiene</option>
                  <option value="Internet / Wi-Fi">Internet / Wi-Fi</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground">Detailed Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Explain the problem clearly including room number and location details..."
                  rows={3}
                  className="w-full rounded-md border border-input bg-background p-3 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground">Photo URL (Optional)</label>
                <Input
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  placeholder="https://..."
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" type="button" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Submitting...' : 'Submit Ticket'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Comments Thread Drawer/Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border rounded-xl max-w-lg w-full p-6 shadow-xl space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-start justify-between border-b pb-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-primary">
                  {selectedTicket.category}
                </span>
                <h2 className="text-lg font-bold text-foreground">{selectedTicket.title}</h2>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setSelectedTicket(null)}>
                ✕
              </Button>
            </div>

            <div className="text-xs bg-muted/50 p-3 rounded-md space-y-1">
              <p className="font-semibold text-foreground">Description:</p>
              <p className="text-muted-foreground">{selectedTicket.description}</p>
            </div>

            {/* Comments List */}
            <div className="flex-1 overflow-y-auto space-y-3 min-h-[150px] pr-2">
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
                Updates & Comments Thread
              </h3>
              {!selectedTicket.comments || selectedTicket.comments.length === 0 ? (
                <p className="text-xs text-muted-foreground italic text-center py-6">
                  No comments yet. Post an update below.
                </p>
              ) : (
                selectedTicket.comments.map((cm) => (
                  <div key={cm.id} className="border rounded-lg p-3 bg-background text-xs space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-foreground">
                        {cm.authorName} ({cm.authorRole})
                      </span>
                      <span className="text-muted-foreground">{cm.createdAt}</span>
                    </div>
                    <p className="text-muted-foreground">{cm.comment}</p>
                  </div>
                ))
              )}
            </div>

            {/* Comment Form */}
            <form onSubmit={handleAddComment} className="flex gap-2 pt-2 border-t">
              <Input
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write an update or reply..."
                className="text-xs flex-1"
              />
              <Button type="submit" disabled={isPostingComment || !newComment.trim()} size="sm" className="gap-1">
                <Send className="h-3.5 w-3.5" />
                <span>Send</span>
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const StatusBadge: React.FC<{ status: ComplaintRecord['status'] }> = ({ status }) => {
  switch (status) {
    case 'OPEN':
      return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">OPEN</span>;
    case 'IN_PROGRESS':
      return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-500 border border-blue-500/20">IN PROGRESS</span>;
    case 'RESOLVED':
      return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">RESOLVED</span>;
    case 'CLOSED':
      return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-muted text-muted-foreground">CLOSED</span>;
  }
};
