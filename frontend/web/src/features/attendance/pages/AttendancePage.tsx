import React, { useState, useEffect } from 'react';
import { attendanceApi, AttendanceSummary, AttendanceDisputeRecord } from '@/features/attendance/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { MockBanner } from '@/components/ui/MockBanner';
import {
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  KeyRound,
  FileSpreadsheet,
  Plus,
} from 'lucide-react';

export const AttendancePage: React.FC = () => {
  const [summary, setSummary] = useState<AttendanceSummary | null>(null);
  const [disputes, setDisputes] = useState<AttendanceDisputeRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // 6-digit OTP code entry
  const [code, setCode] = useState('');
  const [isSubmittingCode, setIsSubmittingCode] = useState(false);
  const [codeFeedback, setCodeFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Dispute Modal state
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [disputeSubject, setDisputeSubject] = useState('');
  const [disputeDate, setDisputeDate] = useState('');
  const [disputeReason, setDisputeReason] = useState('');
  const [isSubmittingDispute, setIsSubmittingDispute] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      try {
        const [sumData, dispData] = await Promise.all([
          attendanceApi.getAttendanceSummary(),
          attendanceApi.getDisputes(),
        ]);
        if (isMounted) {
          setSummary(sumData);
          setDisputes(dispData);
        }
      } catch {
        // ignore, mock fallback
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) {
      setCodeFeedback({ type: 'error', message: 'Please enter a valid 6-digit code.' });
      return;
    }

    try {
      setIsSubmittingCode(true);
      setCodeFeedback(null);
      const res = await attendanceApi.submitAttendanceCode(code);
      setCodeFeedback({ type: 'success', message: res.message || 'Attendance marked!' });
      setCode('');
      loadData();
    } catch (err: unknown) {
      setCodeFeedback({
        type: 'error',
        message: err instanceof Error ? err.message : 'Invalid or expired attendance session code.',
      });
    } finally {
      setIsSubmittingCode(false);
    }
  };

  const handleDisputeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!disputeSubject || !disputeDate || !disputeReason) return;

    try {
      setIsSubmittingDispute(true);
      await attendanceApi.createDispute({
        subjectCode: disputeSubject,
        date: disputeDate,
        reason: disputeReason,
      });

      setShowDisputeModal(false);
      setDisputeSubject('');
      setDisputeDate('');
      setDisputeReason('');
      loadData();
    } catch {
      // ignore
    } finally {
      setIsSubmittingDispute(false);
    }
  };

  return (
    <div className="space-y-6">
      <MockBanner />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" />
            <span>Academic Attendance & Sessions</span>
          </h1>
          <p className="text-sm text-muted-foreground">
            Track subject percentages, enter live classroom attendance codes, and submit attendance disputes.
          </p>
        </div>

        <Button onClick={() => setShowDisputeModal(true)} variant="outline" className="gap-2">
          <Plus className="h-4 w-4" />
          <span>Raise Attendance Dispute</span>
        </Button>
      </div>

      {/* Code Entry Card */}
      <div className="border rounded-xl p-5 bg-gradient-to-r from-primary/5 via-card to-card space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <KeyRound className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-bold text-foreground text-base">Live Classroom Session Check-in</h2>
            <p className="text-xs text-muted-foreground">
              Enter the 6-digit OTP code broadcasted by your faculty in lecture.
            </p>
          </div>
        </div>

        {codeFeedback && (
          <div
            className={`p-3 text-xs rounded-md flex items-center gap-2 ${
              codeFeedback.type === 'success'
                ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                : 'bg-red-500/10 text-red-500 border border-red-500/20'
            }`}
          >
            {codeFeedback.type === 'success' ? (
              <CheckCircle2 className="h-4 w-4 shrink-0" />
            ) : (
              <AlertTriangle className="h-4 w-4 shrink-0" />
            )}
            <span>{codeFeedback.message}</span>
          </div>
        )}

        <form onSubmit={handleCodeSubmit} className="flex flex-col sm:flex-row items-center gap-3 max-w-md">
          <Input
            value={code}
            onChange={(e) => setCode(e.target.value.trim().toUpperCase())}
            placeholder="ENTER 6-DIGIT CODE (e.g. A8X92K)"
            maxLength={6}
            className="text-center font-mono tracking-widest uppercase font-bold text-base h-11"
          />
          <Button type="submit" disabled={isSubmittingCode || code.length !== 6} className="w-full sm:w-auto h-11 px-6">
            {isSubmittingCode ? 'Checking...' : 'Submit Code'}
          </Button>
        </form>
      </div>

      {/* Overall Breakdown */}
      {loading ? (
        <div className="text-center py-12 text-muted-foreground text-sm animate-pulse">
          Loading attendance metrics...
        </div>
      ) : summary ? (
        <div className="space-y-6">
          <div className="border rounded-xl p-6 bg-card flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center md:text-left">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Overall Term Attendance
              </span>
              <div className="flex items-baseline gap-2 justify-center md:justify-start">
                <span className="text-4xl font-extrabold text-foreground">
                  {summary.overallPercentage.toFixed(1)}%
                </span>
                <span className="text-xs text-muted-foreground">
                  ({summary.totalAttended} / {summary.totalClasses} classes)
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Minimum required threshold for exam eligibility: <span className="font-bold text-foreground">75.0%</span>
              </p>
            </div>

            {summary.overallPercentage < 75 ? (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 max-w-xs space-y-1 text-center">
                <AlertTriangle className="h-6 w-6 mx-auto" />
                <p className="font-bold text-sm">Attendance Warning</p>
                <p className="text-xs">Your overall attendance is below 75%. Please contact your mentor.</p>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 max-w-xs space-y-1 text-center">
                <CheckCircle2 className="h-6 w-6 mx-auto" />
                <p className="font-bold text-sm">Good Standing</p>
                <p className="text-xs">You satisfy the exam hall ticket attendance eligibility.</p>
              </div>
            )}
          </div>

          {/* Subject Wise Cards */}
          <div className="space-y-3">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5 text-primary" />
              <span>Subject Breakdown</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {summary.subjects.map((sub) => (
                <div key={sub.subjectId} className="border rounded-xl p-5 bg-card space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-primary px-2 py-0.5 rounded bg-primary/10">
                        {sub.subjectCode}
                      </span>
                      <h3 className="font-bold text-foreground text-base mt-1">{sub.subjectName}</h3>
                    </div>

                    <span
                      className={`text-lg font-black ${
                        sub.percentage < 75 ? 'text-red-500' : 'text-emerald-500'
                      }`}
                    >
                      {sub.percentage.toFixed(1)}%
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1">
                    <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          sub.percentage < 75 ? 'bg-red-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.min(100, sub.percentage)}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[11px] text-muted-foreground">
                      <span>Attended: {sub.attendedClasses} / {sub.totalClasses}</span>
                      {sub.thresholdWarning && (
                        <span className="text-red-500 font-semibold flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" /> Shortage
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      {/* Disputes Section */}
      {disputes.length > 0 && (
        <div className="space-y-3 pt-4 border-t">
          <h2 className="text-base font-bold text-foreground">Recent Attendance Disputes</h2>
          <div className="space-y-2">
            {disputes.map((d) => (
              <div key={d.id} className="border rounded-lg p-3 bg-card flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-foreground mr-2">{d.subjectCode}</span>
                  <span className="text-muted-foreground">({d.date}): {d.reason}</span>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">
                  {d.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Dispute Modal */}
      {showDisputeModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border rounded-xl max-w-md w-full p-6 shadow-xl space-y-4">
            <h2 className="text-lg font-bold text-foreground">Raise Attendance Dispute</h2>
            <form onSubmit={handleDisputeSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-foreground">Subject Code</label>
                <Input
                  value={disputeSubject}
                  onChange={(e) => setDisputeSubject(e.target.value)}
                  placeholder="e.g. CS102"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground">Disputed Date</label>
                <Input
                  type="date"
                  value={disputeDate}
                  onChange={(e) => setDisputeDate(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground">Reason / Evidence Explanation</label>
                <textarea
                  value={disputeReason}
                  onChange={(e) => setDisputeReason(e.target.value)}
                  placeholder="Explain why your attendance was incorrectly marked absent..."
                  rows={3}
                  className="w-full rounded-md border border-input bg-background p-3 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" type="button" onClick={() => setShowDisputeModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmittingDispute}>
                  {isSubmittingDispute ? 'Submitting...' : 'Submit Dispute'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
function loadData() {
  throw new Error('Function not implemented.');
}

