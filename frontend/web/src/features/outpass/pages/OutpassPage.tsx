import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@/components/ui/Toast';
import { FormField } from '@/components/ui/FormField';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { RequestCard } from '@/components/ui/RequestCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Skeleton } from '@/components/ui/Skeleton';
import { outpassRequestSchema, OutpassRequestFormData } from '../schema';
import { outpassApi, OutpassRecord } from '../api';
import { Clock, Plus, CheckCircle, AlertTriangle } from 'lucide-react';

export const OutpassPage: React.FC = () => {
  const { showSuccess, showError } = useToast();
  const [outpasses, setOutpasses] = useState<OutpassRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);
  const [showApplyForm, setShowApplyForm] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [pendingError, setPendingError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<OutpassRequestFormData>({
    resolver: zodResolver(outpassRequestSchema),
  });

  const loadOutpasses = async () => {
    setIsLoading(true);
    setIsError(false);
    try {
      const data = await outpassApi.getStudentOutpasses();
      setOutpasses(data);
    } catch {
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let ignore = false;
    outpassApi
      .getStudentOutpasses()
      .then((data) => {
        if (!ignore) {
          setOutpasses(data);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (!ignore) {
          setIsError(true);
          setIsLoading(false);
        }
      });
    return () => {
      ignore = true;
    };
  }, []);

  const onApplySubmit = async (data: OutpassRequestFormData) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setPendingError(null);

    try {
      await outpassApi.createOutpass(data);
      showSuccess('Outpass application submitted.');
      reset();
      setShowApplyForm(false);
      loadOutpasses();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to apply for outpass.';
      if (msg.toLowerCase().includes('pending')) {
        setPendingError('You already have an active or pending outpass request. Please check in or wait for warden approval.');
      } else {
        showError(msg);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCheckIn = async (id: string) => {
    try {
      await outpassApi.checkInReturn(id);
      showSuccess('Return check-in confirmed.');
      loadOutpasses();
    } catch {
      showError('Failed to record return check-in.');
    }
  };

  const handleCancel = async (id: string) => {
    try {
      await outpassApi.cancelOutpass(id);
      showSuccess('Outpass request cancelled.');
      loadOutpasses();
    } catch {
      showError('Failed to cancel outpass.');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Digital Outpass Requests</h1>
          <p className="text-sm text-muted-foreground">Request and track hostel departure passes</p>
        </div>
        <Button onClick={() => setShowApplyForm(!showApplyForm)} className="gap-1.5">
          <Plus className="h-4 w-4" />
          <span>{showApplyForm ? 'Cancel Form' : 'Apply Outpass'}</span>
        </Button>
      </div>

      {pendingError && (
        <div className="flex items-start gap-3 p-4 rounded-xl border border-amber-300 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 text-xs">
          <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600" />
          <div>
            <p className="font-bold">Active Outpass Conflict</p>
            <p className="mt-0.5">{pendingError}</p>
          </div>
        </div>
      )}

      {showApplyForm && (
        <div className="border rounded-xl p-6 bg-card shadow-sm space-y-4 border-primary/30">
          <h3 className="font-bold text-base text-foreground pb-2 border-b">New Outpass Application</h3>

          <form onSubmit={handleSubmit(onApplySubmit)} className="space-y-4">
            <FormField label="Destination" error={errors.destination?.message} required>
              <Input type="text" placeholder="e.g. City Mall / Home" {...register('destination')} />
            </FormField>

            <FormField label="Reason for Leaving" error={errors.reason?.message} required>
              <Input type="text" placeholder="e.g. Doctor appointment / Family event" {...register('reason')} />
            </FormField>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="Departure Time" error={errors.leaveTime?.message} required>
                <Input type="datetime-local" {...register('leaveTime')} />
              </FormField>

              <FormField label="Expected Return Time" error={errors.expectedReturnTime?.message} required>
                <Input type="datetime-local" {...register('expectedReturnTime')} />
              </FormField>
            </div>

            <FormField label="Emergency Contact Number" error={errors.contactPhone?.message} required>
              <Input type="tel" placeholder="10-digit mobile number" {...register('contactPhone')} />
            </FormField>

            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => setShowApplyForm(false)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" isLoading={isSubmitting}>
                Submit Application
              </Button>
            </div>
          </form>
        </div>
      )}

      {isError && <ErrorState message="Failed to load outpass requests." onRetry={loadOutpasses} />}

      {isLoading && (
        <div className="space-y-3">
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
        </div>
      )}

      {!isLoading && !isError && outpasses.length === 0 && (
        <EmptyState
          title="No Outpass Records"
          description="You currently have no active or historical outpass applications."
          icon={<Clock className="h-6 w-6 text-muted-foreground" />}
          actionLabel="Apply New Outpass"
          onAction={() => setShowApplyForm(true)}
        />
      )}

      {!isLoading && !isError && outpasses.length > 0 && (
        <div className="space-y-4">
          {outpasses.map((item) => (
            <RequestCard
              key={item.id}
              item={{
                id: item.id,
                title: `Outpass to ${item.destination}`,
                subtitle: item.reason,
                status: item.status,
                createdAt: item.appliedAt,
                metadata: {
                  leave_time: item.leaveTime,
                  expected_return: item.expectedReturnTime,
                  ...(item.actualReturnTime ? { actual_return: item.actualReturnTime } : {}),
                },
                actions: (
                  <div className="flex items-center gap-2">
                    {item.status === 'APPROVED' && !item.actualReturnTime && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleCheckIn(item.id)}
                        className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700"
                      >
                        <CheckCircle className="h-3.5 w-3.5 mr-1" />
                        <span>Confirm Return Check-in</span>
                      </Button>
                    )}
                    {item.status === 'PENDING' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCancel(item.id)}
                        className="h-7 text-xs text-destructive hover:bg-destructive/10"
                      >
                        Cancel Request
                      </Button>
                    )}
                  </div>
                ),
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};
