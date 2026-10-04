import React, { useState, useEffect } from 'react';
import { outpassApi, OutpassRecord } from '@/features/outpass/api';
import { complaintsApi, ComplaintRecord } from '@/features/complaints/api';
import { DataTable } from '@/components/data-table/DataTable';
import { wardenOutpassResource } from '@/resources/wardenOutpasses';
import { Button } from '@/components/ui/Button';
import { MockBanner } from '@/components/ui/MockBanner';
import { apiClient } from '@/lib/apiClient';
import { env } from '@/config/env';
import {
  AlertTriangle,
  Building2,
  CheckCircle2,
  Clock,
  ShieldAlert,
  UserCheck,
  Wrench,
} from 'lucide-react';

import { usePolling } from '@/hooks/usePolling';

interface WardenSosItem {
  id: string;
  studentName: string;
  room: string;
  type: string;
  triggeredAt: string;
  status: string;
  updates?: string[];
}

interface WardenOutpassItem {
  id: string;
  title: string;
  requesterName: string;
  category: string;
  status: string;
  submittedAt: string;
  details: Record<string, string>;
}

export const WardenDashboardPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'OUTPASS_INBOX' | 'OVERDUE' | 'SOS_ROOM' | 'COMPLAINTS'>('OUTPASS_INBOX');

  // Outpass Inbox Items
  const [outpassItems, setOutpassItems] = useState<WardenOutpassItem[]>([]);
  const [overdueOutpasses, setOverdueOutpasses] = useState<OutpassRecord[]>([]);
  const [sosAlerts, setSosAlerts] = useState<WardenSosItem[]>([]);
  const [complaints, setComplaints] = useState<ComplaintRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendingSosActionId, setPendingSosActionId] = useState<string | null>(null);

  const fetchSosAlerts = React.useCallback(async () => {
    try {
      if (!env.VITE_USE_MOCKS) {
        const sosData = await apiClient<WardenSosItem[]>('/api/v1/warden/sos/active');
        setSosAlerts(sosData);
      }
    } catch {
      // ignore
    }
  }, []);

  // Poll active SOS alerts every 10 seconds (pauses when hidden, backs off on errors)
  usePolling(fetchSosAlerts, { intervalMs: 10000, enabled: activeTab === 'SOS_ROOM' });

  useEffect(() => {
    let isMounted = true;
    const loadWardenData = async () => {
      try {
        const [outpasses, overdue, complaintsData] = await Promise.all([
          outpassApi.getWardenOutpasses(),
          outpassApi.getWardenOverdueOutpasses(),
          complaintsApi.getStudentComplaints(),
        ]);

        const mappedOutpasses: WardenOutpassItem[] = outpasses.map((o) => ({
          id: o.id,
          title: `Outpass Request: ${o.destination}`,
          requesterName: o.studentName || 'Student',
          category: 'Outpass',
          status: o.status,
          submittedAt: o.appliedAt,
          details: {
            Reason: o.reason,
            'Departure Time': o.leaveTime,
            'Expected Return': o.expectedReturnTime,
            'Roll Number': o.studentRoll || 'N/A',
          },
        }));

        if (isMounted) {
          setOutpassItems(mappedOutpasses);
          setOverdueOutpasses(overdue);
          setComplaints(complaintsData);
        }

        if (env.VITE_USE_MOCKS) {
          if (isMounted) {
            setSosAlerts([
              {
                id: 'sos_w_1',
                studentName: 'Ankit Patel (Roll 21CS099)',
                room: 'Block B Room 104',
                type: 'MEDICAL',
                triggeredAt: '10 mins ago',
                status: 'ACTIVE',
                updates: ['Dispatched campus medical officer.'],
              },
            ]);
          }
        } else {
          const sosData = await apiClient<WardenSosItem[]>('/api/v1/warden/sos/active');
          if (isMounted) setSosAlerts(sosData);
        }
      } catch {
        // ignore
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadWardenData();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleAcknowledgeSos = async (id: string) => {
    try {
      setPendingSosActionId(`${id}_ack`);
      if (!env.VITE_USE_MOCKS) {
        await apiClient(`/api/v1/warden/sos/${id}/acknowledge`, { method: 'POST' });
      }
      setSosAlerts((prev) =>
        prev.map((s) => (s.id === id ? { ...s, status: 'ACKNOWLEDGED' } : s))
      );
    } finally {
      setPendingSosActionId(null);
    }
  };

  const handleAddUpdateSos = async (id: string) => {
    const updateNote = prompt('Enter incident progress update note:');
    if (!updateNote) return;

    try {
      setPendingSosActionId(`${id}_update`);
      if (!env.VITE_USE_MOCKS) {
        await apiClient(`/api/v1/warden/sos/${id}/update`, {
          method: 'POST',
          body: JSON.stringify({ note: updateNote }),
        });
      }
      setSosAlerts((prev) =>
        prev.map((s) => (s.id === id ? { ...s, updates: [...(s.updates || []), updateNote] } : s))
      );
    } finally {
      setPendingSosActionId(null);
    }
  };

  const handleEscalateSos = async (id: string) => {
    try {
      setPendingSosActionId(`${id}_esc`);
      if (!env.VITE_USE_MOCKS) {
        await apiClient(`/api/v1/warden/sos/${id}/escalate`, { method: 'POST' });
      }
      setSosAlerts((prev) =>
        prev.map((s) => (s.id === id ? { ...s, status: 'ESCALATED' } : s))
      );
    } finally {
      setPendingSosActionId(null);
    }
  };

  const handleCloseSos = async (id: string) => {
    try {
      setPendingSosActionId(`${id}_close`);
      if (!env.VITE_USE_MOCKS) {
        await apiClient(`/api/v1/warden/sos/${id}/close`, { method: 'POST' });
      }
      setSosAlerts((prev) => prev.filter((s) => s.id !== id));
    } finally {
      setPendingSosActionId(null);
    }
  };

  return (
    <div className="space-y-6">
      <MockBanner />

      {/* Header */}
      <div className="border-b pb-4">
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Building2 className="h-6 w-6 text-primary" />
          <span>Hostel Warden Administration Portal</span>
        </h1>
        <p className="text-sm text-muted-foreground">
          Manage student outpasses, monitor overdue return alerts, handle emergency SOS incidents, and assign maintenance tickets.
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b pb-2">
        <button
          onClick={() => setActiveTab('OUTPASS_INBOX')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors flex items-center gap-2 ${
            activeTab === 'OUTPASS_INBOX'
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:bg-muted'
          }`}
        >
          <UserCheck className="h-4 w-4" />
          <span>Outpass Approvals Inbox ({outpassItems.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('OVERDUE')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors flex items-center gap-2 ${
            activeTab === 'OVERDUE'
              ? 'bg-red-500 text-white'
              : 'text-muted-foreground hover:bg-muted'
          }`}
        >
          <Clock className="h-4 w-4 text-red-500" />
          <span>Overdue Returns ({overdueOutpasses.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('SOS_ROOM')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors flex items-center gap-2 ${
            activeTab === 'SOS_ROOM'
              ? 'bg-red-600 text-white'
              : 'text-muted-foreground hover:bg-muted'
          }`}
        >
          <ShieldAlert className="h-4 w-4" />
          <span>SOS Control Room ({sosAlerts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('COMPLAINTS')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors flex items-center gap-2 ${
            activeTab === 'COMPLAINTS'
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:bg-muted'
          }`}
        >
          <Wrench className="h-4 w-4" />
          <span>Hostel Complaints Board ({complaints.length})</span>
        </button>
      </div>

      {/* Tab Content */}
      {loading ? (
        <div className="text-center py-12 text-muted-foreground text-sm animate-pulse">
          Loading warden workspace...
        </div>
      ) : (
        <div>
          {activeTab === 'OUTPASS_INBOX' && (
            <DataTable resource={wardenOutpassResource} />
          )}

          {activeTab === 'OVERDUE' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b pb-2">
                <h2 className="text-lg font-bold text-foreground">Overdue Student Returns</h2>
                <span className="text-xs text-red-500 font-bold">
                  {overdueOutpasses.length} Student(s) Exceeded Expected Return Time
                </span>
              </div>

              {overdueOutpasses.length === 0 ? (
                <div className="text-center py-12 border rounded-xl bg-card text-muted-foreground space-y-2">
                  <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto" />
                  <p className="font-semibold text-foreground">All Outpasses On Time</p>
                  <p className="text-xs">No students are currently overdue for return.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {overdueOutpasses.map((item) => (
                    <div key={item.id} className="border-2 border-red-500/30 rounded-xl p-5 bg-card space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-bold text-foreground text-base">{item.studentName}</h3>
                          <p className="text-xs text-muted-foreground">Roll: {item.studentRoll}</p>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500 text-white">
                          OVERDUE
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">Destination: {item.destination}</p>
                      <p className="text-xs text-red-500 font-semibold">
                        Expected Return: {item.expectedReturnTime}
                      </p>
                      <Button size="sm" className="w-full text-xs gap-1 mt-2">
                        Contact Student / Parent Emergency Line
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'SOS_ROOM' && (
            <div className="space-y-4">
              <div className="border-b pb-2 flex justify-between items-center">
                <h2 className="text-lg font-bold text-foreground">Live Emergency SOS Control Room</h2>
                <span className="text-xs font-mono bg-red-500 text-white px-2 py-0.5 rounded font-bold">
                  {sosAlerts.length} Active Emergency Incident(s)
                </span>
              </div>

              {sosAlerts.length === 0 ? (
                <div className="text-center py-12 border rounded-xl bg-card text-muted-foreground space-y-2">
                  <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto" />
                  <p className="font-semibold text-foreground">Control Room Clear</p>
                  <p className="text-xs">No active emergency alerts in hostel block.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {sosAlerts.map((sos) => (
                    <div
                      key={sos.id}
                      className="border-2 border-red-500 rounded-xl p-5 bg-red-500/5 space-y-3"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-6 w-6 text-red-500 animate-bounce" />
                          <div>
                            <h3 className="font-bold text-foreground text-base">{sos.studentName}</h3>
                            <p className="text-xs text-muted-foreground">{sos.room}</p>
                          </div>
                        </div>
                        <span className="px-2 py-1 rounded text-xs font-bold bg-red-500 text-white">
                          TYPE: {sos.type}
                        </span>
                      </div>

                      <p className="text-xs text-muted-foreground">Triggered: {sos.triggeredAt}</p>

                      {sos.updates && sos.updates.length > 0 && (
                        <div className="p-2 bg-muted/40 rounded text-xs space-y-1">
                          <p className="font-bold text-[10px] text-muted-foreground uppercase">Incident Updates:</p>
                          {sos.updates.map((upd, idx) => (
                            <p key={idx} className="text-foreground">• {upd}</p>
                          ))}
                        </div>
                      )}

                      <div className="flex flex-wrap gap-2 pt-2">
                        {sos.status === 'ACTIVE' && (
                          <Button
                            onClick={() => handleAcknowledgeSos(sos.id)}
                            disabled={Boolean(pendingSosActionId)}
                            className="bg-amber-500 hover:bg-amber-600 text-white text-xs"
                          >
                            {pendingSosActionId === `${sos.id}_ack` ? 'Sending...' : 'Acknowledge'}
                          </Button>
                        )}
                        <Button
                          onClick={() => handleAddUpdateSos(sos.id)}
                          disabled={Boolean(pendingSosActionId)}
                          variant="outline"
                          className="text-xs"
                        >
                          {pendingSosActionId === `${sos.id}_update` ? 'Saving...' : 'Add Update'}
                        </Button>
                        <Button
                          onClick={() => handleEscalateSos(sos.id)}
                          disabled={Boolean(pendingSosActionId)}
                          variant="outline"
                          className="text-xs border-amber-500 text-amber-500"
                        >
                          {pendingSosActionId === `${sos.id}_esc` ? 'Escalating...' : 'Escalate'}
                        </Button>
                        <Button
                          onClick={() => handleCloseSos(sos.id)}
                          disabled={Boolean(pendingSosActionId)}
                          variant="outline"
                          className="border-emerald-500 text-emerald-500 hover:bg-emerald-500/10 text-xs"
                        >
                          {pendingSosActionId === `${sos.id}_close` ? 'Closing...' : 'Close Incident'}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'COMPLAINTS' && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-foreground">Hostel Maintenance Tickets</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {complaints.map((c) => (
                  <div key={c.id} className="border rounded-xl p-5 bg-card space-y-2">
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] font-bold text-primary uppercase">{c.category}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-muted text-muted-foreground">
                        {c.status}
                      </span>
                    </div>
                    <h3 className="font-bold text-foreground text-base">{c.title}</h3>
                    <p className="text-xs text-muted-foreground">{c.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
