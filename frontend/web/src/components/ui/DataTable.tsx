import React from 'react';
import { cn } from '@/lib/utils';
import { Skeleton } from './Skeleton';
import { EmptyState } from './EmptyState';
import { ErrorState } from './ErrorState';

export interface Column<T> {
  header: string;
  accessorKey?: keyof T;
  cell?: (row: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  isError?: boolean;
  errorMessage?: string;
  requestId?: string;
  onRetry?: () => void;
  emptyTitle?: string;
  emptyDescription?: string;
  className?: string;
}

export function DataTable<T extends { id?: string | number }>({
  columns,
  data,
  isLoading = false,
  isError = false,
  errorMessage,
  requestId,
  onRetry,
  emptyTitle,
  emptyDescription,
  className,
}: DataTableProps<T>) {
  if (isError) {
    return <ErrorState message={errorMessage} requestId={requestId} onRetry={onRetry} />;
  }

  if (isLoading) {
    return (
      <div className={cn('space-y-2 border rounded-lg p-4', className)}>
        <Skeleton className="h-8 w-full mb-4" />
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (!data || data.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <div className={cn('w-full overflow-x-auto border rounded-lg bg-card', className)}>
      <table className="w-full text-left text-sm">
        <thead className="bg-muted/50 text-xs font-semibold uppercase tracking-wider text-muted-foreground border-b">
          <tr>
            {columns.map((col, idx) => (
              <th key={idx} className={cn('px-4 py-3', col.className)}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {data.map((row, rowIdx) => (
            <tr key={row.id ? String(row.id) : rowIdx} className="hover:bg-muted/30 transition-colors">
              {columns.map((col, colIdx) => (
                <td key={colIdx} className={cn('px-4 py-3 text-foreground', col.className)}>
                  {col.cell ? col.cell(row) : col.accessorKey ? String(row[col.accessorKey] ?? '') : null}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
