import React, { useState } from 'react';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { StatusTimeline, TimelineStep } from '@/components/ui/StatusTimeline';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/Toast';
import { onboardingApi, RoleApplication } from '../api';
import { XCircle, RefreshCw, MessageSquare } from 'lucide-react';

interface MyApplicationsListProps {
  applications: RoleApplication[];
  isLoading?: boolean;
  isError?: boolean;
  onRefresh: () => void;
  onReapplyRequest: (role: string) => void;
}

export const MyApplicationsList: React.FC<MyApplicationsListProps> = ({
  applications,
  isLoading = false,
  isError = false,
  onRefresh,
  onReapplyRequest,
}) => {
  const { showSuccess, showError } = useToast();
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [isActionLoading, setIsActionLoading] = useState<boolean>(false);

  if (isError) {
    return <ErrorState message="Failed to load your role applications." onRetry={onRefresh} />;
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (!applications || applications.length === 0) {
    return (
      <EmptyState
        title="No Role Applications Yet"
        description="You have not submitted any role requests. Select a campus role above to get started."
      />
    );
  }

  const handleCancelConfirm = async () => {
    if (!cancellingId) return;
    setIsActionLoading(true);

    try {
      await onboardingApi.cancelApplication(cancellingId);
      showSuccess('Application cancelled.');
      onRefresh();
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to cancel application.');
    } finally {
      setIsActionLoading(false);
      setCancellingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="divide-y divide-border border rounded-xl bg-card overflow-hidden">
        {applications.map((app) => {
          const timelineSteps: TimelineStep[] = [
            {
              title: 'Submitted Application',
              description: `Applied for ${app.role} role`,
              timestamp: app.appliedAt,
              status: 'completed',
            },
            ...(app.status === 'NEEDS_INFO'
              ? [
                  {
                    title: 'Additional Information Requested',
                    description: app.infoRequestNote || 'Please provide updated documentation.',
                    status: 'needs_info' as const,
                  },
                ]
              : []),
            ...(app.status === 'REJECTED'
              ? [
                  {
                    title: 'Application Rejected',
                    description: app.rejectionReason || 'Role criteria not met.',
                    status: 'rejected' as const,
                  },
                ]
              : []),
            ...(app.status === 'APPROVED'
              ? [
                  {
                    title: 'Approved',
                    description: 'Role active on your campus profile.',
                    status: 'completed' as const,
                  },
                ]
              : []),
            ...(app.status === 'PENDING'
              ? [
                  {
                    title: 'Under Admin Review',
                    description: 'Your request is currently being verified by campus wardens.',
                    status: 'current' as const,
                  },
                ]
              : []),
          ];

          return (
            <div key={app.id} className="p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="font-bold text-base text-foreground">{app.role} Role Request</h3>
                    <StatusBadge status={app.status} />
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">Applied on {app.appliedAt}</p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-2 sm:pt-0">
                  {app.status === 'PENDING' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCancellingId(app.id)}
                      className="text-xs text-destructive hover:bg-destructive/10"
                    >
                      <XCircle className="h-3.5 w-3.5 mr-1" />
                      <span>Cancel Request</span>
                    </Button>
                  )}

                  {app.status === 'REJECTED' && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => onReapplyRequest(app.role)}
                      className="text-xs gap-1"
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                      <span>Reapply Role</span>
                    </Button>
                  )}

                  {app.status === 'NEEDS_INFO' && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => onReapplyRequest(app.role)}
                      className="text-xs gap-1"
                    >
                      <MessageSquare className="h-3.5 w-3.5" />
                      <span>Provide Info</span>
                    </Button>
                  )}
                </div>
              </div>

              {/* Status Timeline */}
              <div className="pt-2">
                <StatusTimeline steps={timelineSteps} />
              </div>
            </div>
          );
        })}
      </div>

      <ConfirmDialog
        isOpen={Boolean(cancellingId)}
        title="Cancel Application?"
        description="Are you sure you want to withdraw this role application? You will need to resubmit a fresh application."
        confirmLabel="Yes, Cancel Application"
        variant="destructive"
        isLoading={isActionLoading}
        onConfirm={handleCancelConfirm}
        onClose={() => setCancellingId(null)}
      />
    </div>
  );
};
