import React from 'react';
import { cn } from '@/lib/utils';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from './Button';

interface ErrorStateProps {
  title?: string;
  message?: string;
  requestId?: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  message = 'An unexpected error occurred while fetching data.',
  requestId,
  onRetry,
  className,
}) => {
  return (
    <div className={cn('flex flex-col items-center justify-center p-6 text-center border border-destructive/30 rounded-lg bg-destructive/5', className)}>
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 mb-3 text-destructive">
        <AlertTriangle className="h-6 w-6" />
      </div>
      <h3 className="text-base font-semibold text-foreground">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-md mt-1 mb-2">{message}</p>

      {requestId && (
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-muted/80 text-[11px] font-mono text-muted-foreground mb-4">
          <span>Request ID:</span>
          <span className="font-semibold text-foreground select-all">{requestId}</span>
        </div>
      )}

      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry} className="gap-2">
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Retry Request</span>
        </Button>
      )}
    </div>
  );
};
