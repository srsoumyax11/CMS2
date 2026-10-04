import React, { useState, useEffect } from 'react';
import { ApprovalInbox, ApprovalItem } from '@/components/ui/ApprovalInbox';
import { DataTable } from '@/components/data-table/DataTable';
import { adminRoleRequestsResource } from '@/resources/adminRoleRequests';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { MockBanner } from '@/components/ui/MockBanner';
import { apiClient } from '@/lib/apiClient';
import { env } from '@/config/env';
import {
  Bell,
  CheckCircle2,
  Megaphone,
  ShieldCheck,
  Users,
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'ROLES' | 'GUARDIANS' | 'BROADCAST'>('ROLES');

  const [roleRequests, setRoleRequests] = useState<ApprovalItem[]>([]);
  const [guardianRequests, setGuardianRequests] = useState<ApprovalItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Broadcast Form
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [targetRole, setTargetRole] = useState('ALL');
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [broadcastSuccess, setBroadcastSuccess] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const loadAdminData = async () => {
      try {
        if (env.VITE_USE_MOCKS) {
          if (isMounted) {
            setRoleRequests([
              {
                id: 'rr_1',
                title: 'Role Request: Student -> Faculty Assistant',
                requesterName: 'Dr. Priya Sharma',
                category: 'Role Request',
                status: 'PENDING',
                submittedAt: '2026-10-04 10:00 AM',
                details: {
                  Department: 'Computer Science & Engineering',
                  'Claimed Code': 'FAC-2026-CS-88',
                },
              },
            ]);

            setGuardianRequests([
              {
                id: 'gr_1',
                title: 'Parent Link Request for Student: Rahul Verma',
                requesterName: 'Sunil Verma (Father)',
                category: 'Guardian Link',
                status: 'PENDING',
                submittedAt: '2026-10-04 11:30 AM',
                details: {
                  'Student Roll': '21CS042',
                  'Student Email': 'rahul.v@campus.edu',
                },
              },
            ]);
          }
        } else {
          const [rrData, grData] = await Promise.all([
            apiClient<Record<string, unknown>[]>('/api/v1/approvals/role-requests'),
            apiClient<Record<string, unknown>[]>('/api/v1/admin/guardian-links'),
          ]);

          if (isMounted) {
            setRoleRequests(
              (rrData || []).map((r) => ({
                id: r.id as string,
                title: `Role Request: ${r.roleCode || 'Role'}`,
                requesterName: (r.userName as string) || 'User',
                category: 'Role Request',
                status: r.status as string,
                submittedAt: r.createdAt as string,
                details: {
                  Department: r.departmentName || 'N/A',
                  Code: r.claimedCode || 'N/A',
                },
              }))
            );

            setGuardianRequests(
              (grData || []).map((g) => ({
                id: g.id as string,
                title: `Parent Link Request for Student: ${g.studentName || 'Student'}`,
                requesterName: `${g.guardianName || 'Guardian'} (${g.relation || 'Parent'})`,
                category: 'Guardian Link',
                status: g.status as string,
                submittedAt: g.createdAt as string,
                details: {
                  'Student Roll': g.studentRoll || 'N/A',
                },
              }))
            );
          }
        }
      } catch {
        // ignore
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadAdminData();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleApproveGuardian = async (ids: string[]) => {
    if (!env.VITE_USE_MOCKS) {
      for (const id of ids) {
        await apiClient(`/api/v1/admin/guardian-links/${id}/approve`, { method: 'POST' });
      }
    }
    setGuardianRequests((prev) =>
      prev.map((item) => (ids.includes(item.id) ? { ...item, status: 'APPROVED' } : item))
    );
  };

  const handleRejectGuardian = async (id: string, reason: string) => {
    if (!env.VITE_USE_MOCKS) {
      await apiClient(`/api/v1/admin/guardian-links/${id}/reject`, {
        method: 'POST',
        body: JSON.stringify({ reason }),
      });
    }
    setGuardianRequests((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: 'REJECTED' } : item))
    );
  };

  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastTitle || !broadcastMessage) return;

    try {
      setIsBroadcasting(true);
      if (!env.VITE_USE_MOCKS) {
        await apiClient('/api/v1/admin/broadcast/emergency', {
          method: 'POST',
          body: JSON.stringify({
            title: broadcastTitle,
            message: broadcastMessage,
            targetRole,
          }),
        });
      }
      setBroadcastSuccess(true);
      setBroadcastTitle('');
      setBroadcastMessage('');
      setTimeout(() => setBroadcastSuccess(false), 3000);
    } catch {
      // ignore
    } finally {
      setIsBroadcasting(false);
    }
  };

  return (
    <div className="space-y-6">
      <MockBanner />

      {/* Header */}
      <div className="border-b pb-4">
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <ShieldCheck className="h-6 w-6 text-primary" />
          <span>System Administration & Governance</span>
        </h1>
        <p className="text-sm text-muted-foreground">
          Approve pending user role onboarding, verify parent/guardian student links, and issue campus emergency broadcasts.
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-2 border-b pb-2">
        <button
          onClick={() => setActiveTab('ROLES')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors flex items-center gap-2 ${
            activeTab === 'ROLES'
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:bg-muted'
          }`}
        >
          <Users className="h-4 w-4" />
          <span>Role Approvals ({roleRequests.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('GUARDIANS')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors flex items-center gap-2 ${
            activeTab === 'GUARDIANS'
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:bg-muted'
          }`}
        >
          <ShieldCheck className="h-4 w-4" />
          <span>Parent Links ({guardianRequests.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('BROADCAST')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors flex items-center gap-2 ${
            activeTab === 'BROADCAST'
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:bg-muted'
          }`}
        >
          <Megaphone className="h-4 w-4" />
          <span>Campus Broadcast</span>
        </button>
      </div>

      {/* Tab Contents */}
      {loading ? (
        <div className="text-center py-12 text-muted-foreground text-sm animate-pulse">
          Loading administration queues...
        </div>
      ) : (
        <div>
          {activeTab === 'ROLES' && (
            <DataTable resource={adminRoleRequestsResource} />
          )}

          {activeTab === 'GUARDIANS' && (
            <ApprovalInbox
              title="Pending Parent / Guardian Account Link Queue"
              items={guardianRequests}
              onApproveSingle={(id: string) => handleApproveGuardian([id])}
              onApproveBulk={handleApproveGuardian}
              onReject={handleRejectGuardian}
            />
          )}

          {activeTab === 'BROADCAST' && (
            <div className="border rounded-xl p-6 bg-card max-w-xl space-y-4">
              <div className="flex items-center gap-2 border-b pb-3">
                <Megaphone className="h-6 w-6 text-primary" />
                <div>
                  <h2 className="text-lg font-bold text-foreground">Create Campus Announcement / Alert</h2>
                  <p className="text-xs text-muted-foreground">Broadcast push notification to active web app sessions.</p>
                </div>
              </div>

              {broadcastSuccess && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs rounded-md flex items-center gap-2 font-semibold">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>Broadcast successfully transmitted across campus network!</span>
                </div>
              )}

              <form onSubmit={handleSendBroadcast} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-foreground">Target Role Audience</label>
                  <select
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs mt-1"
                  >
                    <option value="ALL">All Campus Users (Students, Faculty, Wardens)</option>
                    <option value="STUDENTS">Students Only</option>
                    <option value="FACULTY">Faculty Only</option>
                    <option value="WARDENS">Wardens Only</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground">Announcement Title</label>
                  <Input
                    value={broadcastTitle}
                    onChange={(e) => setBroadcastTitle(e.target.value)}
                    placeholder="e.g. Mid-Term Examination Schedule Released"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground">Message Content</label>
                  <textarea
                    value={broadcastMessage}
                    onChange={(e) => setBroadcastMessage(e.target.value)}
                    placeholder="Enter announcement details..."
                    rows={4}
                    className="w-full rounded-md border border-input bg-background p-3 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                    required
                  />
                </div>

                <Button type="submit" disabled={isBroadcasting} className="w-full gap-2">
                  <Bell className="h-4 w-4" />
                  <span>{isBroadcasting ? 'Broadcasting...' : 'Publish Announcement'}</span>
                </Button>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
