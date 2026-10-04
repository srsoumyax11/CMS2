import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { t } from '@/i18n';
import { AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  description: string;
  danger?: boolean;
  isLoading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  description,
  danger = false,
  isLoading = false,
  onConfirm,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
      <div className="bg-card border rounded-xl max-w-md w-full p-6 shadow-xl space-y-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${danger ? 'bg-red-500/10 text-red-500' : 'bg-primary/10 text-primary'}`}>
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-bold text-foreground text-base">{title}</h3>
            <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t">
          <Button variant="outline" size="sm" onClick={onClose} disabled={isLoading}>
            {t('common.cancel')}
          </Button>
          <Button
            variant={danger ? 'destructive' : 'primary'}
            size="sm"
            disabled={isLoading}
            onClick={onConfirm}
          >
            {isLoading ? t('common.loading') : t('common.confirm')}
          </Button>
        </div>
      </div>
    </div>
  );
};

interface ReasonDialogProps {
  isOpen: boolean;
  title: string;
  description: string;
  placeholder?: string;
  isLoading?: boolean;
  onConfirm: (reason: string) => void;
  onClose: () => void;
}

export const ReasonDialog: React.FC<ReasonDialogProps> = ({
  isOpen,
  title,
  description,
  placeholder = 'Enter reason...',
  isLoading = false,
  onConfirm,
  onClose,
}) => {
  const [reason, setReason] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;
    onConfirm(reason.trim());
    setReason('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
      <div className="bg-card border rounded-xl max-w-md w-full p-6 shadow-xl space-y-4">
        <h3 className="font-bold text-foreground text-base">{title}</h3>
        <p className="text-xs text-muted-foreground">{description}</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={placeholder}
            required
            className="text-xs"
          />

          <div className="flex justify-end gap-2 pt-2 border-t">
            <Button variant="outline" size="sm" type="button" onClick={onClose} disabled={isLoading}>
              {t('common.cancel')}
            </Button>
            <Button variant="destructive" size="sm" type="submit" disabled={isLoading || !reason.trim()}>
              {isLoading ? t('common.loading') : t('common.confirm')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
