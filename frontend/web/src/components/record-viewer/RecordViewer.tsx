import { useState } from 'react';
import { ResourceConfig, ActionConfig, DetailTab } from '@/components/data/types';
import { FormRenderer } from '@/components/shared/FormRenderer';
import { StatusTimeline, TimelineEvent } from '@/components/shared/StatusTimeline';
import { CommentThread, CommentItem } from '@/components/shared/CommentThread';
import { AttachmentList, AttachmentItem } from '@/components/shared/AttachmentList';
import { PermissionGate } from '@/components/shared/PermissionGate';
import { ConfirmDialog, ReasonDialog } from '@/components/shared/ConfirmDialog';
import { Button } from '@/components/ui/Button';
import { createIdempotencyKey } from '@/lib/apiClient';
import { t } from '@/i18n';
import {
  ChevronLeft,
  ChevronRight,
  Edit3,
  Eye,
  FileText,
  History,
  MessageSquare,
  Paperclip,
  ShieldAlert,
  X,
} from 'lucide-react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface RecordViewerProps<T = any> {
  resource: ResourceConfig<T>;
  record: T | null;
  recordsList?: T[];
  isOpen: boolean;
  onClose: () => void;
  onSelectRecord?: (record: T) => void;
  onUpdateRecord?: (updatedRecord: T) => Promise<void>;
  onRefresh?: () => void;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function RecordViewer<T extends Record<string, any>>({
  resource,
  record,
  recordsList = [],
  isOpen,
  onClose,
  onSelectRecord,
  onUpdateRecord,
  onRefresh,
}: RecordViewerProps<T>) {
  const [mode, setMode] = useState<'view' | 'edit'>('view');
  const [activeTab, setActiveTab] = useState<DetailTab>('details');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [conflictError, setConflictError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Action Dialog states
  const [activeAction, setActiveAction] = useState<ActionConfig<T> | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  if (!isOpen || !record) return null;

  const availableTabs: DetailTab[] = resource.detailTabs || ['details'];

  // Next / Previous record navigation index
  const currentIndex = recordsList.findIndex(
    (r) => String(r[resource.idField]) === String(record[resource.idField])
  );
  const prevRecord = currentIndex > 0 ? recordsList[currentIndex - 1] : null;
  const nextRecord = currentIndex >= 0 && currentIndex < recordsList.length - 1 ? recordsList[currentIndex + 1] : null;

  const handleClose = () => {
    if (hasUnsavedChanges) {
      if (!window.confirm('You have unsaved changes. Are you sure you want to close?')) {
        return;
      }
    }
    setHasUnsavedChanges(false);
    setMode('view');
    setConflictError(null);
    onClose();
  };

  const handleSaveEdit = async (formValues: Record<string, unknown>) => {
    try {
      setIsSaving(true);
      setConflictError(null);

      const idempotencyKey = createIdempotencyKey();

      if (onUpdateRecord) {
        await onUpdateRecord({ ...record, ...formValues, idempotencyKey });
      }

      setHasUnsavedChanges(false);
      setMode('view');
      onRefresh?.();
    } catch (err: unknown) {
      const errorObj = err as { status?: number; message?: string };
      if (errorObj?.status === 409 || errorObj?.message?.toLowerCase().includes('conflict')) {
        setConflictError('Record was modified by another user. Reload latest version to merge updates.');
      } else {
        alert(err instanceof Error ? err.message : 'Failed to save changes.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleExecuteAction = async (action: ActionConfig<T>, reason?: string) => {
    try {
      setActionLoading(true);
      if (action.handler) {
        await action.handler(record, reason);
      }
      setActiveAction(null);
      onRefresh?.();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Action failed to execute.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full md:max-w-2xl bg-card border-l shadow-2xl h-full flex flex-col justify-between overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b flex items-center justify-between bg-muted/30">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                disabled={!prevRecord}
                onClick={() => prevRecord && onSelectRecord?.(prevRecord)}
                className="h-8 w-8 p-0"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={!nextRecord}
                onClick={() => nextRecord && onSelectRecord?.(nextRecord)}
                className="h-8 w-8 p-0"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            <div>
              <h2 className="font-bold text-foreground text-base leading-tight">
                {String(record.title || record.name || `${t(resource.titleKey)} #${record[resource.idField]}`)}
              </h2>
              <p className="text-xs text-muted-foreground font-mono mt-0.5">
                ID: {String(record[resource.idField])}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {mode === 'view' ? (
              <PermissionGate permission={resource.permissions?.edit}>
                <Button variant="outline" size="sm" onClick={() => setMode('edit')} className="gap-1.5 text-xs">
                  <Edit3 className="h-3.5 w-3.5" />
                  <span>Edit</span>
                </Button>
              </PermissionGate>
            ) : (
              <Button variant="outline" size="sm" onClick={() => setMode('view')} className="gap-1.5 text-xs">
                <Eye className="h-3.5 w-3.5" />
                <span>View</span>
              </Button>
            )}

            <Button variant="ghost" size="sm" onClick={handleClose} className="h-8 w-8 p-0 text-muted-foreground">
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Conflict Alert Banner */}
        {conflictError && (
          <div className="p-3 bg-red-500/10 border-b border-red-500/20 text-red-500 text-xs flex items-center justify-between px-6 font-medium">
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 shrink-0" />
              <span>{conflictError}</span>
            </div>
            <Button size="sm" variant="outline" onClick={onRefresh} className="h-7 text-xs border-red-500 text-red-500">
              Reload Record
            </Button>
          </div>
        )}

        {/* Detail Tabs Header */}
        {mode === 'view' && availableTabs.length > 1 && (
          <div className="flex gap-2 px-6 border-b bg-muted/10 pt-2">
            {availableTabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-2 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
                  activeTab === tab
                    ? 'border-primary text-primary font-bold'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab === 'details' && <FileText className="h-3.5 w-3.5" />}
                {tab === 'timeline' && <History className="h-3.5 w-3.5" />}
                {tab === 'comments' && <MessageSquare className="h-3.5 w-3.5" />}
                {tab === 'attachments' && <Paperclip className="h-3.5 w-3.5" />}
                <span className="capitalize">{tab}</span>
              </button>
            ))}
          </div>
        )}

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {mode === 'edit' ? (
            <FormRenderer
              fields={resource.fields}
              initialValues={record}
              isSubmitting={isSaving}
              onSave={handleSaveEdit}
              onCancel={() => setMode('view')}
            />
          ) : (
            <div>
              {activeTab === 'details' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {resource.fields.map((field) => {
                    const value = record[field.key];
                    return (
                      <div key={field.key} className="space-y-1 border-b pb-3">
                        <span className="text-[11px] font-semibold text-muted-foreground block">
                          {t(field.labelKey)}
                        </span>
                        <div className="text-xs font-medium text-foreground">
                          {field.render ? field.render(value, record) : String(value ?? '—')}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {activeTab === 'timeline' && (
                <StatusTimeline events={(record.timeline as TimelineEvent[]) || []} />
              )}

              {activeTab === 'comments' && (
                <CommentThread comments={(record.comments as CommentItem[]) || []} />
              )}

              {activeTab === 'attachments' && (
                <AttachmentList attachments={(record.attachments as AttachmentItem[]) || []} />
              )}

              {activeTab === 'audit' && (
                <div className="space-y-2 text-xs text-muted-foreground font-mono p-3 bg-muted/40 rounded-lg">
                  <p>Created At: {String(record.createdAt || 'N/A')}</p>
                  <p>Last Updated: {String(record.updatedAt || 'N/A')}</p>
                  <p>Version: {String(record.version || 1)}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {resource.rowActions && resource.rowActions.length > 0 && mode === 'view' && (
          <div className="p-4 sm:p-6 border-t bg-muted/20 flex flex-wrap items-center justify-end gap-2">
            {resource.rowActions
              .filter((act) => !act.visibleWhen || act.visibleWhen(record))
              .map((act) => (
                <PermissionGate key={act.key} permission={act.permission}>
                  <Button
                    variant={act.danger ? 'destructive' : 'primary'}
                    size="sm"
                    onClick={() => {
                      if (act.confirm === 'none') {
                        handleExecuteAction(act);
                      } else {
                        setActiveAction(act);
                      }
                    }}
                    className="text-xs"
                  >
                    {t(act.labelKey)}
                  </Button>
                </PermissionGate>
              ))}
          </div>
        )}
      </div>

      {/* Confirmation & Reason Dialogs */}
      {activeAction && activeAction.confirm === 'confirm' && (
        <ConfirmDialog
          isOpen={true}
          title={t(activeAction.labelKey)}
          description={`Are you sure you want to execute "${t(activeAction.labelKey)}"?`}
          danger={activeAction.danger}
          isLoading={actionLoading}
          onConfirm={() => handleExecuteAction(activeAction)}
          onClose={() => setActiveAction(null)}
        />
      )}

      {activeAction && activeAction.confirm === 'reason' && (
        <ReasonDialog
          isOpen={true}
          title={t(activeAction.labelKey)}
          description={`Please provide a reason for executing "${t(activeAction.labelKey)}":`}
          isLoading={actionLoading}
          onConfirm={(reason) => handleExecuteAction(activeAction, reason)}
          onClose={() => setActiveAction(null)}
        />
      )}
    </div>
  );
}
