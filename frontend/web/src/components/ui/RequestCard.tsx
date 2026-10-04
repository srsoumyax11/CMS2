import React from 'react';
import { cn } from '@/lib/utils';
import { StatusBadge } from './StatusBadge';
import { StatusTimeline, TimelineStep } from './StatusTimeline';
import { Calendar, ChevronRight } from 'lucide-react';

export interface RequestItem {
  id: string;
  title: string;
  subtitle?: string;
  status: string;
  createdAt: string;
  steps?: TimelineStep[];
  actions?: React.ReactNode;
  metadata?: Record<string, string | number>;
}

interface RequestCardProps {
  item: RequestItem;
  onClick?: () => void;
  className?: string;
}

export const RequestCard: React.FC<RequestCardProps> = ({ item, onClick, className }) => {
  return (
    <div
      onClick={onClick}
      className={cn(
        'border rounded-xl p-5 bg-card hover:border-primary/50 transition-all shadow-sm space-y-4',
        onClick && 'cursor-pointer hover:shadow-md',
        className,
      )}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h3 className="font-bold text-base text-foreground">{item.title}</h3>
            <StatusBadge status={item.status} />
          </div>
          {item.subtitle && <p className="text-xs text-muted-foreground">{item.subtitle}</p>}
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Calendar className="h-3.5 w-3.5" />
          <span>{item.createdAt}</span>
          {onClick && <ChevronRight className="h-4 w-4 ml-1" />}
        </div>
      </div>

      {item.metadata && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 border-t text-xs">
          {Object.entries(item.metadata).map(([key, val]) => (
            <div key={key}>
              <span className="text-muted-foreground block capitalize">{key.replace(/_/g, ' ')}:</span>
              <span className="font-medium text-foreground">{val}</span>
            </div>
          ))}
        </div>
      )}

      {item.steps && item.steps.length > 0 && (
        <div className="pt-2 border-t">
          <StatusTimeline steps={item.steps} />
        </div>
      )}

      {item.actions && <div className="flex justify-end gap-2 pt-2 border-t">{item.actions}</div>}
    </div>
  );
};

export const RequestList: React.FC<{
  items: RequestItem[];
  onItemClick?: (item: RequestItem) => void;
  className?: string;
}> = ({ items, onItemClick, className }) => {
  return (
    <div className={cn('space-y-4', className)}>
      {items.map((item) => (
        <RequestCard key={item.id} item={item} onClick={onItemClick ? () => onItemClick(item) : undefined} />
      ))}
    </div>
  );
};
