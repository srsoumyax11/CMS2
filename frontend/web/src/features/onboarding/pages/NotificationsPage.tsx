import React, { useState, useEffect } from 'react';
import { onboardingApi, AppNotification } from '../api';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Skeleton } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { Bell, CheckCircle2 } from 'lucide-react';

export const NotificationsPage: React.FC = () => {
  const { showSuccess, showError } = useToast();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);

  useEffect(() => {
    let ignore = false;
    onboardingApi.getNotifications().then((data) => {
      if (!ignore) {
        setNotifications(data);
        setIsLoading(false);
      }
    }).catch(() => {
      if (!ignore) {
        setIsError(true);
        setIsLoading(false);
      }
    });
    return () => {
      ignore = true;
    };
  }, []);

  const handleMarkRead = async (id: string) => {
    try {
      await onboardingApi.markNotificationRead(id);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
      showSuccess('Notification marked as read.');
    } catch {
      showError('Failed to update notification status.');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Notifications & Alerts</h1>
          <p className="text-sm text-muted-foreground">Stay updated on your role requests and campus activity</p>
        </div>
      </div>

      {isError && <ErrorState message="Failed to load notifications." onRetry={() => window.location.reload()} />}

      {isLoading && (
        <div className="space-y-3">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      )}

      {!isLoading && !isError && notifications.length === 0 && (
        <EmptyState
          title="No Notifications"
          description="You are all caught up! New campus updates will appear here."
          icon={<Bell className="h-6 w-6 text-muted-foreground" />}
        />
      )}

      {!isLoading && !isError && notifications.length > 0 && (
        <div className="divide-y divide-border border rounded-xl bg-card overflow-hidden">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`p-4 flex items-start justify-between gap-4 transition-colors ${
                !n.isRead ? 'bg-primary/5' : 'bg-card'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-sm text-foreground">{n.title}</h4>
                  {!n.isRead && (
                    <span className="h-2 w-2 rounded-full bg-primary" title="Unread" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{n.message}</p>
                <span className="text-[10px] text-muted-foreground block pt-1">{n.createdAt}</span>
              </div>

              {!n.isRead && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleMarkRead(n.id)}
                  className="text-xs gap-1 h-8"
                >
                  <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                  <span>Mark Read</span>
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
