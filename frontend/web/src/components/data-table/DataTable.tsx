import React, { useState, useEffect } from 'react';
import { ResourceConfig, ActionConfig } from '@/components/data/types';
import { useTablePrefs, TableDensity } from '@/hooks/useTablePrefs';
import { useUrlState } from '@/hooks/useUrlState';
import { exportToCSV } from '@/components/shared/CSVExporter';
import { PermissionGate } from '@/components/shared/PermissionGate';
import { ConfirmDialog, ReasonDialog } from '@/components/shared/ConfirmDialog';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Skeleton } from '@/components/ui/Skeleton';
import { apiClient } from '@/lib/apiClient';
import { env } from '@/config/env';
import { t } from '@/i18n';
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  CheckSquare,
  Columns,
  Download,
  Filter,
  RefreshCw,
  Search,
  Square,
  Maximize2,
  Minimize2,
  AlertTriangle,
} from 'lucide-react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface DataTableProps<T = any> {
  resource: ResourceConfig<T>;
  onSelectRow?: (row: T) => void;
  onRefreshTrigger?: () => void;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function DataTable<T extends Record<string, any>>({
  resource,
  onSelectRow,
}: DataTableProps<T>) {
  const { state: urlState, updateState: setUrlState } = useUrlState();
  const { visibleColumns, density, toggleColumn, setDensity, resetPrefs } = useTablePrefs(
    resource.id,
    resource.columns
  );

  const [records, setRecords] = useState<T[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [requestId, setRequestId] = useState<string>('');

  // Selected Rows & Bulk Action state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkActionResults, setBulkActionResults] = useState<Record<string, boolean> | null>(null);

  // Column Selector Dropdown state
  const [showColumnSelector, setShowColumnSelector] = useState<boolean>(false);

  // Action Confirmation state
  const [activeAction, setActiveAction] = useState<{ action: ActionConfig<T>; row: T } | null>(null);
  const [activeBulkAction, setActiveBulkAction] = useState<ActionConfig<T> | null>(null);
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  // Expanded Row state
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);

  // Debounced search
  const [searchInput, setSearchInput] = useState<string>(urlState.search || '');

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== urlState.search) {
        setUrlState({ search: searchInput, page: 1 });
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput, urlState.search, setUrlState]);

  const filterString = JSON.stringify(urlState.filters);

  useEffect(() => {
    let isCancelled = false;

    const loadData = async () => {
      setIsLoading(true);
      setIsError(false);

      try {
        if (env.VITE_USE_MOCKS && resource.mockFallback) {
          const mockRes = resource.mockFallback({
            page: urlState.page,
            limit: urlState.limit,
            search: urlState.search,
            sortKey: urlState.sortKey,
            sortOrder: urlState.sortOrder,
            filters: urlState.filters,
          });
          if (!isCancelled) {
            setRecords(mockRes.data);
            setTotalCount(mockRes.total);
            setIsLoading(false);
          }
          return;
        }

        // Fetch from API endpoint
        const query = new URLSearchParams();
        query.set('limit', String(urlState.limit));
        query.set('offset', String((urlState.page - 1) * urlState.limit));
        if (urlState.search) query.set('search', urlState.search);
        if (urlState.sortKey) query.set('sort', `${urlState.sortOrder === 'desc' ? '-' : ''}${urlState.sortKey}`);

        Object.entries(urlState.filters).forEach(([k, v]) => {
          if (v) query.set(k, v);
        });

        const endpointUrl = `${resource.endpoint.list}?${query.toString()}`;
        const data = await apiClient<unknown>(endpointUrl);

        if (isCancelled) return;

        const parsedData = data as { items?: T[]; data?: T[]; total?: number; count?: number } | T[];

        if (Array.isArray(parsedData)) {
          setRecords(parsedData);
          setTotalCount(parsedData.length);
        } else if (parsedData && Array.isArray(parsedData.items || parsedData.data)) {
          const items = parsedData.items || parsedData.data || [];
          setRecords(items);
          setTotalCount(parsedData.total || parsedData.count || items.length);
        } else {
          setRecords([]);
          setTotalCount(0);
        }
      } catch (err: unknown) {
        if (isCancelled) return;
        const errorObj = err as { message?: string; requestId?: string };
        setIsError(true);
        setErrorMessage(errorObj?.message || 'Failed to fetch resource data');
        setRequestId(errorObj?.requestId || 'REQ_ERR');
      } finally {
        if (!isCancelled) setIsLoading(false);
      }
    };

    loadData();

    return () => {
      isCancelled = true;
    };
  }, [
    resource,
    urlState.page,
    urlState.limit,
    urlState.search,
    urlState.sortKey,
    urlState.sortOrder,
    filterString,
    urlState.filters,
  ]);

  const fetchData = () => {
    // Manual reload trigger
    const query = new URLSearchParams();
    query.set('limit', String(urlState.limit));
    query.set('offset', String((urlState.page - 1) * urlState.limit));
    if (urlState.search) query.set('search', urlState.search);
    if (urlState.sortKey) query.set('sort', `${urlState.sortOrder === 'desc' ? '-' : ''}${urlState.sortKey}`);
    if (env.VITE_USE_MOCKS && resource.mockFallback) {
      const mockRes = resource.mockFallback({
        page: urlState.page,
        limit: urlState.limit,
        search: urlState.search,
        sortKey: urlState.sortKey,
        sortOrder: urlState.sortOrder,
        filters: urlState.filters,
      });
      setRecords(mockRes.data);
      setTotalCount(mockRes.total);
    }
  };

  const activeFields = resource.fields.filter((f) => visibleColumns.includes(f.key));

  const handleSort = (fieldKey: string) => {
    if (urlState.sortKey === fieldKey) {
      if (urlState.sortOrder === 'asc') {
        setUrlState({ sortKey: fieldKey, sortOrder: 'desc' });
      } else {
        setUrlState({ sortKey: undefined, sortOrder: undefined });
      }
    } else {
      setUrlState({ sortKey: fieldKey, sortOrder: 'asc' });
    }
  };

  const toggleSelectRow = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === records.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(records.map((r) => String(r[resource.idField])));
    }
  };

  const handleExecuteAction = async (action: ActionConfig<T>, row: T, reason?: string) => {
    try {
      setActionLoading(true);
      if (action.handler) {
        await action.handler(row, reason);
      }
      setActiveAction(null);
      fetchData();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Action failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleExecuteBulkAction = async (action: ActionConfig<T>) => {
    if (selectedIds.length === 0) return;
    try {
      setActionLoading(true);
      const selectedRows = records.filter((r) => selectedIds.includes(String(r[resource.idField])));
      if (action.bulkHandler) {
        const results = await action.bulkHandler(selectedRows);
        setBulkActionResults(results);
      } else {
        setBulkActionResults(
          Object.fromEntries(selectedIds.map((id) => [id, true]))
        );
      }
      setSelectedIds([]);
      setActiveBulkAction(null);
      fetchData();
    } catch {
      alert('Bulk action failed');
    } finally {
      setActionLoading(false);
    }
  };

  const totalPages = Math.ceil(totalCount / urlState.limit) || 1;

  return (
    <div className="space-y-4">
      {/* Top Toolbar: Search, Filters, Column Selector, Density, Refresh, Export */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border rounded-xl bg-card shadow-sm">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="h-4 w-4 absolute left-3 top-2.5 text-muted-foreground" />
            <Input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search records..."
              className="pl-9 text-xs h-9"
              aria-label="Search records"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Column Selector Dropdown */}
          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowColumnSelector(!showColumnSelector)}
              className="gap-1.5 text-xs h-9"
              aria-label="Toggle columns"
            >
              <Columns className="h-3.5 w-3.5" />
              <span>Columns</span>
            </Button>

            {showColumnSelector && (
              <div className="absolute right-0 mt-2 w-56 border rounded-xl bg-card p-3 shadow-xl z-30 space-y-2 text-xs">
                <div className="flex justify-between items-center border-b pb-1">
                  <span className="font-bold text-foreground">Visible Columns</span>
                  <button onClick={resetPrefs} className="text-primary hover:underline text-[11px]">
                    Reset
                  </button>
                </div>
                <div className="space-y-1 max-h-48 overflow-y-auto">
                  {resource.fields.map((f) => (
                    <label key={f.key} className="flex items-center gap-2 cursor-pointer p-1 hover:bg-muted/50 rounded">
                      <input
                        type="checkbox"
                        checked={visibleColumns.includes(f.key)}
                        onChange={() => toggleColumn(f.key)}
                        className="rounded border-input text-primary focus:ring-primary"
                      />
                      <span className="text-foreground">{t(f.labelKey)}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Density Toggle */}
          <div className="flex border rounded-lg overflow-hidden bg-muted/40 text-xs p-0.5">
            {(['compact', 'comfortable', 'expanded'] as TableDensity[]).map((d) => (
              <button
                key={d}
                onClick={() => setDensity(d)}
                className={`px-2 py-1 rounded text-[10px] font-bold uppercase transition-colors ${
                  density === d ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground'
                }`}
              >
                {d}
              </button>
            ))}
          </div>

          {/* Refresh Button */}
          <Button variant="outline" size="sm" onClick={fetchData} className="h-9 w-9 p-0" aria-label="Refresh">
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>

          {/* Export CSV Button */}
          {resource.exportable !== false && (
            <PermissionGate permission={resource.permissions?.export}>
              <Button
                variant="outline"
                size="sm"
                onClick={() => exportToCSV(resource.id, records, resource.fields, visibleColumns)}
                className="gap-1.5 text-xs h-9"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Export CSV</span>
              </Button>
            </PermissionGate>
          )}
        </div>
      </div>

      {/* Bulk Actions Header Bar */}
      {selectedIds.length > 0 && resource.bulkActions && (
        <div className="p-3 border rounded-xl bg-primary/10 border-primary/20 flex items-center justify-between text-xs animate-in fade-in">
          <span className="font-bold text-primary">
            {selectedIds.length} item(s) selected
          </span>
          <div className="flex gap-2">
            {resource.bulkActions.map((act) => (
              <PermissionGate key={act.key} permission={act.permission}>
                <Button
                  size="sm"
                  variant={act.danger ? 'destructive' : 'primary'}
                  onClick={() => setActiveBulkAction(act)}
                  className="h-8 text-xs"
                >
                  {t(act.labelKey)}
                </Button>
              </PermissionGate>
            ))}
          </div>
        </div>
      )}

      {/* Bulk Results Banner */}
      {bulkActionResults && (
        <div className="p-3 border rounded-xl bg-emerald-500/10 border-emerald-500/20 text-emerald-500 text-xs flex items-center justify-between">
          <span>Bulk operation completed successfully.</span>
          <Button size="sm" variant="ghost" onClick={() => setBulkActionResults(null)}>
            Dismiss
          </Button>
        </div>
      )}

      {/* Table States: Skeleton, Error, Empty, Data */}
      {isLoading ? (
        <div className="border rounded-xl p-6 bg-card space-y-3">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : isError ? (
        <div className="p-8 border-2 border-dashed border-red-500/30 rounded-xl bg-red-500/5 text-center space-y-3">
          <AlertTriangle className="h-10 w-10 text-red-500 mx-auto" />
          <p className="font-bold text-foreground text-base">Failed to Load Resource Data</p>
          <p className="text-xs text-muted-foreground">{errorMessage}</p>
          <p className="text-[10px] font-mono text-muted-foreground">Request ID: {requestId}</p>
          <Button size="sm" onClick={fetchData} className="gap-1.5">
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Retry Request</span>
          </Button>
        </div>
      ) : records.length === 0 ? (
        <div className="p-12 border-2 border-dashed rounded-xl text-center bg-card space-y-2">
          <Filter className="h-10 w-10 text-muted-foreground mx-auto" />
          <p className="font-bold text-foreground">No Records Found</p>
          <p className="text-xs text-muted-foreground">Try clearing search filters or checking permissions.</p>
        </div>
      ) : (
        <>
          {/* Responsive Mobile View (Card List) */}
          <div className="md:hidden space-y-3">
            {records.map((row) => (
              <div
                key={String(row[resource.idField])}
                onClick={() => onSelectRow?.(row)}
                className="border rounded-xl p-4 bg-card hover:shadow-md transition-shadow cursor-pointer space-y-2"
              >
                <div className="flex justify-between items-start border-b pb-2">
                  <span className="font-bold text-foreground text-sm">
                    {String(row.title || row.name || `#${row[resource.idField]}`)}
                  </span>
                  {row.status && <StatusBadge status={String(row.status)} />}
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  {activeFields.slice(0, 4).map((field) => (
                    <div key={field.key}>
                      <span className="text-[10px] text-muted-foreground block">{t(field.labelKey)}</span>
                      <span className="font-medium text-foreground">
                        {field.render ? field.render(row[field.key], row) : String(row[field.key] ?? '—')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto border rounded-xl bg-card shadow-sm">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b bg-muted/40 font-bold text-muted-foreground sticky top-0 z-10">
                  <th className="py-3 px-4 w-10 text-center bg-muted/40 sticky left-0 z-20">
                    <button onClick={toggleSelectAll} aria-label="Select all rows">
                      {selectedIds.length === records.length ? (
                        <CheckSquare className="h-4 w-4 text-primary" />
                      ) : (
                        <Square className="h-4 w-4" />
                      )}
                    </button>
                  </th>

                  {activeFields.map((field) => (
                    <th
                      key={field.key}
                      onClick={() => field.sortable !== false && handleSort(field.key)}
                      className={`py-3 px-4 select-none ${
                        field.sortable !== false ? 'cursor-pointer hover:text-foreground' : ''
                      }`}
                      style={{ width: field.width }}
                    >
                      <div className="flex items-center gap-1.5">
                        <span>{t(field.labelKey)}</span>
                        {field.sortable !== false && (
                          <span>
                            {urlState.sortKey === field.key ? (
                              urlState.sortOrder === 'asc' ? (
                                <ArrowUp className="h-3 w-3 text-primary" />
                              ) : (
                                <ArrowDown className="h-3 w-3 text-primary" />
                              )
                            ) : (
                              <ArrowUpDown className="h-3 w-3 opacity-30" />
                            )}
                          </span>
                        )}
                      </div>
                    </th>
                  ))}

                  {resource.rowActions && resource.rowActions.length > 0 && (
                    <th className="py-3 px-4 text-right">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y">
                {records.map((row) => {
                  const rowId = String(row[resource.idField]);
                  const isExpanded = expandedRowId === rowId;
                  const isSelected = selectedIds.includes(rowId);

                  return (
                    <React.Fragment key={rowId}>
                      <tr
                        onClick={() => onSelectRow?.(row)}
                        className={`hover:bg-muted/30 transition-colors cursor-pointer ${
                          isSelected ? 'bg-primary/5' : ''
                        } ${density === 'compact' ? 'py-1.5' : density === 'expanded' ? 'py-4' : 'py-3'}`}
                      >
                        <td className="py-3 px-4 text-center sticky left-0 bg-card z-10">
                          <button onClick={(e) => toggleSelectRow(rowId, e)} aria-label="Select row">
                            {isSelected ? (
                              <CheckSquare className="h-4 w-4 text-primary" />
                            ) : (
                              <Square className="h-4 w-4" />
                            )}
                          </button>
                        </td>

                        {activeFields.map((field) => (
                          <td key={field.key} className="py-3 px-4 font-medium text-foreground">
                            {field.render
                              ? field.render(row[field.key], row)
                              : field.type === 'status'
                              ? <StatusBadge status={String(row[field.key])} />
                              : String(row[field.key] ?? '—')}
                          </td>
                        ))}

                        {resource.rowActions && resource.rowActions.length > 0 && (
                          <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-end gap-1.5">
                              {density === 'expanded' && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setExpandedRowId(isExpanded ? null : rowId)}
                                  className="h-7 w-7 p-0"
                                >
                                  {isExpanded ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
                                </Button>
                              )}

                              {resource.rowActions
                                .filter((act) => !act.visibleWhen || act.visibleWhen(row))
                                .map((act) => (
                                  <PermissionGate key={act.key} permission={act.permission}>
                                    <Button
                                      size="sm"
                                      variant={act.danger ? 'destructive' : 'outline'}
                                      onClick={() => {
                                        if (act.confirm === 'none') {
                                          handleExecuteAction(act, row);
                                        } else {
                                          setActiveAction({ action: act, row });
                                        }
                                      }}
                                      className="h-7 text-[11px] px-2"
                                    >
                                      {t(act.labelKey)}
                                    </Button>
                                  </PermissionGate>
                                ))}
                            </div>
                          </td>
                        )}
                      </tr>

                      {/* Expanded Inline Row */}
                      {isExpanded && (
                        <tr className="bg-muted/20 border-b">
                          <td colSpan={activeFields.length + 2} className="p-4 space-y-2">
                            <h4 className="font-bold text-foreground text-xs uppercase tracking-wider">
                              Expanded Record Details
                            </h4>
                            <div className="grid grid-cols-3 gap-4 text-xs">
                              {resource.fields.map((f) => (
                                <div key={f.key}>
                                  <span className="text-[10px] font-semibold text-muted-foreground block">
                                    {t(f.labelKey)}
                                  </span>
                                  <span>{String(row[f.key] ?? '—')}</span>
                                </div>
                              ))}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 text-xs text-muted-foreground">
            <div>
              Showing {Math.min(totalCount, (urlState.page - 1) * urlState.limit + 1)} to{' '}
              {Math.min(totalCount, urlState.page * urlState.limit)} of {totalCount} records
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={urlState.page <= 1}
                onClick={() => setUrlState({ page: urlState.page - 1 })}
                className="h-8 text-xs"
              >
                Previous
              </Button>
              <span className="font-semibold text-foreground">
                Page {urlState.page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={urlState.page >= totalPages}
                onClick={() => setUrlState({ page: urlState.page + 1 })}
                className="h-8 text-xs"
              >
                Next
              </Button>
            </div>
          </div>
        </>
      )}

      {/* Confirmation & Reason Dialogs for Actions */}
      {activeAction && activeAction.action.confirm === 'confirm' && (
        <ConfirmDialog
          isOpen={true}
          title={t(activeAction.action.labelKey)}
          description={`Are you sure you want to execute "${t(activeAction.action.labelKey)}"?`}
          danger={activeAction.action.danger}
          isLoading={actionLoading}
          onConfirm={() => handleExecuteAction(activeAction.action, activeAction.row)}
          onClose={() => setActiveAction(null)}
        />
      )}

      {activeAction && activeAction.action.confirm === 'reason' && (
        <ReasonDialog
          isOpen={true}
          title={t(activeAction.action.labelKey)}
          description={`Please state a reason for "${t(activeAction.action.labelKey)}":`}
          isLoading={actionLoading}
          onConfirm={(reason) => handleExecuteAction(activeAction.action, activeAction.row, reason)}
          onClose={() => setActiveAction(null)}
        />
      )}

      {activeBulkAction && (
        <ConfirmDialog
          isOpen={true}
          title={`Bulk ${t(activeBulkAction.labelKey)}`}
          description={`Are you sure you want to apply "${t(activeBulkAction.labelKey)}" to ${selectedIds.length} selected items?`}
          danger={activeBulkAction.danger}
          isLoading={actionLoading}
          onConfirm={() => handleExecuteBulkAction(activeBulkAction)}
          onClose={() => setActiveBulkAction(null)}
        />
      )}
    </div>
  );
}
