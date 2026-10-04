import React from 'react';
import { cn } from '@/lib/utils';
import { CheckCircle2, Clock, AlertCircle, XCircle } from 'lucide-react';

export interface TimelineStep {
  title: string;
  description?: string;
  timestamp?: string;
  status: 'completed' | 'current' | 'upcoming' | 'rejected' | 'needs_info';
}

interface StatusTimelineProps {
  steps: TimelineStep[];
  className?: string;
}

export const StatusTimeline: React.FC<StatusTimelineProps> = ({ steps, className }) => {
  return (
    <div className={cn('space-y-6', className)}>
      {steps.map((step, index) => {
        const isLast = index === steps.length - 1;

        const getIcon = () => {
          switch (step.status) {
            case 'completed':
              return <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />;
            case 'current':
              return <Clock className="h-5 w-5 text-amber-500 animate-pulse" />;
            case 'needs_info':
              return <AlertCircle className="h-5 w-5 text-blue-500" />;
            case 'rejected':
              return <XCircle className="h-5 w-5 text-rose-500" />;
            default:
              return <div className="h-3 w-3 rounded-full bg-muted-foreground/40" />;
          }
        };

        return (
          <div key={index} className="relative flex gap-4">
            {!isLast && (
              <span
                className={cn(
                  'absolute left-2.5 top-6 -bottom-6 w-0.5',
                  step.status === 'completed' ? 'bg-emerald-500' : 'bg-border',
                )}
                aria-hidden="true"
              />
            )}
            <div className="relative z-10 flex h-6 w-6 items-center justify-center rounded-full bg-background">
              {getIcon()}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-foreground">{step.title}</span>
              {step.description && <span className="text-xs text-muted-foreground mt-0.5">{step.description}</span>}
              {step.timestamp && <span className="text-[10px] text-muted-foreground mt-1">{step.timestamp}</span>}
            </div>
          </div>
        );
      })}
    </div>
  );
};
