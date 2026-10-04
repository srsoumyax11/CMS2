import React from 'react';
import { Clock, CheckCircle2, AlertCircle } from 'lucide-react';

export interface TimelineEvent {
  id: string;
  status: string;
  actorName: string;
  actorRole: string;
  timestamp: string;
  comment?: string;
}

interface StatusTimelineProps {
  events: TimelineEvent[];
}

export const StatusTimeline: React.FC<StatusTimelineProps> = ({ events }) => {
  if (events.length === 0) {
    return <p className="text-xs text-muted-foreground italic text-center py-4">No status timeline available.</p>;
  }

  return (
    <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-muted">
      {events.map((event) => (
        <div key={event.id} className="relative text-xs space-y-1">
          <div className="absolute -left-6 top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-background border border-primary text-primary">
            {event.status === 'APPROVED' || event.status === 'RESOLVED' ? (
              <CheckCircle2 className="h-3 w-3 text-emerald-500" />
            ) : event.status === 'REJECTED' ? (
              <AlertCircle className="h-3 w-3 text-red-500" />
            ) : (
              <Clock className="h-3 w-3 text-amber-500" />
            )}
          </div>

          <div className="flex items-center justify-between">
            <span className="font-bold text-foreground">{event.status}</span>
            <span className="text-[10px] text-muted-foreground">{event.timestamp}</span>
          </div>

          <p className="text-[11px] text-muted-foreground">
            By <span className="font-semibold text-foreground">{event.actorName}</span> ({event.actorRole})
          </p>

          {event.comment && (
            <p className="p-2 rounded bg-muted/50 text-muted-foreground text-[11px] italic">
              &quot;{event.comment}&quot;
            </p>
          )}
        </div>
      ))}
    </div>
  );
};
