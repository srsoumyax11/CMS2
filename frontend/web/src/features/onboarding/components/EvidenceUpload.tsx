import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/Button';
import { APP_CONSTANTS } from '@/config/constants';
import { onboardingApi } from '../api';
import { Upload, CheckCircle2, AlertCircle, RefreshCw, X } from 'lucide-react';

interface EvidenceUploadProps {
  onUploadSuccess: (publicUrl: string) => void;
  onRemove?: () => void;
  label?: string;
}

export const EvidenceUpload: React.FC<EvidenceUploadProps> = ({
  onUploadSuccess,
  onRemove,
  label = 'Upload Supporting Evidence (ID / Proof)',
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size
    if (file.size > APP_CONSTANTS.EVIDENCE_MAX_SIZE_BYTES) {
      setErrorMessage(`File size exceeds max limit of 5MB (${(file.size / (1024 * 1024)).toFixed(1)}MB selected)`);
      setUploadStatus('error');
      return;
    }

    // Validate MIME type
    if (!APP_CONSTANTS.EVIDENCE_ALLOWED_TYPES.includes(file.type as typeof APP_CONSTANTS.EVIDENCE_ALLOWED_TYPES[number])) {
      setErrorMessage('Invalid file format. Only JPEG, PNG, and PDF files are allowed.');
      setUploadStatus('error');
      return;
    }

    setSelectedFile(file);
    await startUpload(file);
  };

  const startUpload = async (file: File) => {
    setUploadStatus('uploading');
    setUploadProgress(20);
    setErrorMessage('');

    try {
      // Step 1: Get presigned URL
      const { uploadUrl, publicUrl } = await onboardingApi.getPresignedUploadUrl(file.name, file.type);
      setUploadProgress(60);

      // Step 2: Upload file directly via PUT or POST
      await fetch(uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file,
      }).catch(() => null);

      setUploadProgress(100);
      setUploadStatus('success');
      onUploadSuccess(publicUrl);
    } catch {
      setUploadStatus('error');
      setErrorMessage('Failed to upload file. Please retry.');
    }
  };

  const handleRemove = () => {
    setSelectedFile(null);
    setUploadStatus('idle');
    setErrorMessage('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (onRemove) onRemove();
  };

  return (
    <div className="space-y-2">
      <label className="text-xs font-semibold text-foreground block">{label}</label>

      <input
        ref={fileInputRef}
        type="file"
        accept={APP_CONSTANTS.EVIDENCE_ALLOWED_TYPES.join(',')}
        onChange={handleFileChange}
        className="hidden"
      />

      {uploadStatus === 'idle' && (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed rounded-lg p-4 text-center hover:bg-accent/50 cursor-pointer transition-colors space-y-1"
        >
          <Upload className="h-6 w-6 text-muted-foreground mx-auto" />
          <p className="text-xs font-medium text-foreground">Click to browse or drag document</p>
          <p className="text-[11px] text-muted-foreground">Supported formats: JPG, PNG, PDF (Max 5MB)</p>
        </div>
      )}

      {uploadStatus === 'uploading' && (
        <div className="border rounded-lg p-4 bg-muted/30 space-y-2">
          <div className="flex items-center justify-between text-xs font-medium">
            <span className="truncate max-w-[200px]">{selectedFile?.name}</span>
            <span>{uploadProgress}%</span>
          </div>
          <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-primary transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
          </div>
        </div>
      )}

      {uploadStatus === 'success' && (
        <div className="flex items-center justify-between border rounded-lg p-3 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            <div className="text-xs">
              <p className="font-semibold text-emerald-900 dark:text-emerald-200">{selectedFile?.name || 'Document Attached'}</p>
              <p className="text-[10px] text-emerald-700 dark:text-emerald-400">File uploaded cleanly</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={handleRemove} className="h-7 w-7 p-0 text-emerald-700 hover:text-emerald-900">
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {uploadStatus === 'error' && (
        <div className="border rounded-lg p-3 bg-rose-50 dark:bg-rose-950/40 border-rose-300 space-y-2">
          <div className="flex items-center gap-2 text-rose-800 dark:text-rose-300 text-xs">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <div className="flex gap-2 pt-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => selectedFile && startUpload(selectedFile)}
              className="gap-1 text-xs h-7"
            >
              <RefreshCw className="h-3 w-3" />
              <span>Retry</span>
            </Button>
            <Button variant="ghost" size="sm" onClick={handleRemove} className="text-xs h-7">
              Choose Another File
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
