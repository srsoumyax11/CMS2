import React, { useState } from 'react';
import { StatusBadge } from './StatusBadge';
import { Button } from './Button';
import { FormField } from './FormField';
import { Input } from './Input';
import { DataTable, Column } from './DataTable';
import { useToast } from './Toast';
import { Check, X, ShieldAlert, CheckSquare, Square } from 'lucide-react';

export interface ApprovalRecord {
  id: string;
  title: string;
  applicantName?: string;
  requesterName?: string;
  claimedCode?: string;
  mismatchWarning?: string;
  type?: string;
  category?: string;
  status: string;
  submittedAt: string;
  details?: Record<string, unknown>;
}

export type ApprovalItem = ApprovalRecord;

export interface ApprovalInboxProps {
  title?: string;
  records?: ApprovalRecord[];
  items?: ApprovalItem[];
  isLoading?: boolean;
  isError?: boolean;
  onApprove?: (id: string) => Promise<void>;
  onApproveSingle?: (id: string) => Promise<void>;
  onReject: (id: string, reason: string) => Promise<void>;
  onBulkApprove?: (ids: string[]) => Promise<Record<string, boolean>>;
  onApproveBulk?: (ids: string[]) => Promise<void>;
  onRefresh?: () => void;
}

export const ApprovalInbox: React.FC<ApprovalInboxProps> = ({
  title,
  records,
  items,
  isLoading = false,
  isError = false,
  onApprove,
  onApproveSingle,
  onReject,
  onBulkApprove,
  onApproveBulk,
  onRefresh,
}) => {
  const { showSuccess, showError } = useToast();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [rejectingRecord, setRejectingRecord] = useState<ApprovalRecord | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string>('');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [isBulkProcessing, setIsBulkProcessing] = useState<boolean>(false);

  const displayRecords = items || records || [];
  const approveSingleHandler = onApproveSingle || onApprove;

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === displayRecords.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(displayRecords.map((r) => r.id));
    }
  };

  const handleApproveSingle = async (id: string) => {
    if (actionLoadingId || !approveSingleHandler) return;
    setActionLoadingId(id);
    try {
      await approveSingleHandler(id);
      showSuccess('Request approved successfully.');
      onRefresh?.();
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to approve request.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleRejectConfirm = async () => {
    if (!rejectingRecord || !rejectionReason.trim() || actionLoadingId) return;
    setActionLoadingId(rejectingRecord.id);
    try {
      await onReject(rejectingRecord.id, rejectionReason.trim());
      showSuccess('Request rejected.');
      setRejectingRecord(null);
      setRejectionReason('');
      onRefresh?.();
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to reject request.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleBulkApprove = async () => {
    if (selectedIds.length === 0 || isBulkProcessing) return;
    setIsBulkProcessing(true);
    try {
      if (onApproveBulk) {
        await onApproveBulk(selectedIds);
        showSuccess(`Approved ${selectedIds.length} selected requests.`);
      } else if (onBulkApprove) {
        const results = await onBulkApprove(selectedIds);
        const successCount = Object.values(results).filter(Boolean).length;
        showSuccess(`Approved ${successCount} of ${selectedIds.length} selected requests.`);
      }
      setSelectedIds([]);
      onRefresh?.();
    } catch {
      showError('Bulk approval failed.');
    } finally {
      setIsBulkProcessing(false);
    }
  };

  const columns: Column<ApprovalRecord>[] = [
    {
      header: 'Select',
      cell: (row) => (
        <button
          onClick={() => toggleSelect(row.id)}
          className="text-muted-foreground hover:text-foreground"
        >
          {selectedIds.includes(row.id) ? (
            <CheckSquare className="h-4 w-4 text-primary" />
          ) : (
            <Square className="h-4 w-4" />
          )}
        </button>
      ),
    },
    {
      header: 'Applicant & Title',
      cell: (row) => (
        <div>
          <div className="font-semibold text-foreground">{row.title}</div>
          <div className="text-xs text-muted-foreground">{row.applicantName || row.requesterName}</div>
          {row.claimedCode && (
            <div className="text-[11px] font-mono text-primary mt-0.5">Code: {row.claimedCode}</div>
          )}
          {row.mismatchWarning && (
            <div className="flex items-center gap-1 text-[11px] text-amber-600 font-semibold mt-1">
              <ShieldAlert className="h-3 w-3 shrink-0" />
              <span>{row.mismatchWarning}</span>
            </div>
          )}
        </div>
      ),
    },
    {
      header: 'Status',
      cell: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: 'Submitted At',
      accessorKey: 'submittedAt',
    },
    {
      header: 'Actions',
      cell: (row) => (
        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            size="sm"
            isLoading={actionLoadingId === row.id}
            onClick={() => handleApproveSingle(row.id)}
            className="h-8 px-2.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <Check className="h-3.5 w-3.5 mr-1" />
            <span>Approve</span>
          </Button>

          <Button
            variant="destructive"
            size="sm"
            disabled={actionLoadingId === row.id}
            onClick={() => setRejectingRecord(row)}
            className="h-8 px-2.5 text-xs"
          >
            <X className="h-3.5 w-3.5 mr-1" />
            <span>Reject</span>
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {title && <h2 className="text-lg font-bold text-foreground">{title}</h2>}

      {/* Bulk Action Header Bar */}
      {(onBulkApprove || onApproveBulk) && displayRecords.length > 0 && (
        <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/40 text-xs">
          <div className="flex items-center gap-2 font-medium">
            <button onClick={toggleSelectAll} className="flex items-center gap-1.5 hover:text-primary">
              {selectedIds.length === displayRecords.length && displayRecords.length > 0 ? (
                <CheckSquare className="h-4 w-4 text-primary" />
              ) : (
                <Square className="h-4 w-4" />
              )}
              <span>Select All ({selectedIds.length} selected)</span>
            </button>
          </div>

          {selectedIds.length > 0 && (
            <Button
              variant="primary"
              size="sm"
              isLoading={isBulkProcessing}
              onClick={handleBulkApprove}
              className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              Approve Selected ({selectedIds.length})
            </Button>
          )}
        </div>
      )}

      {/* Main Data Table */}
      <DataTable
        columns={columns}
        data={displayRecords}
        isLoading={isLoading}
        isError={isError}
        onRetry={onRefresh}
        emptyTitle="Approval Queue Empty"
        emptyDescription="No pending role or outpass requests require review at this moment."
      />

      {/* Rejection Reason Required Modal */}
      {rejectingRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-xl bg-background p-6 shadow-lg border border-border space-y-4">
            <h3 className="text-base font-bold text-foreground">Reject Request</h3>
            <p className="text-xs text-muted-foreground">
              Please enter a reason for rejecting <span className="font-semibold text-foreground">{rejectingRecord.title}</span> for {rejectingRecord.applicantName || rejectingRecord.requesterName}.
            </p>

            <FormField label="Rejection Reason" required>
              <Input
                type="text"
                placeholder="e.g. Invalid document attached or criteria not met"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
              />
            </FormField>

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" size="sm" onClick={() => setRejectingRecord(null)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                disabled={!rejectionReason.trim()}
                isLoading={actionLoadingId === rejectingRecord.id}
                onClick={handleRejectConfirm}
              >
                Confirm Rejection
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
