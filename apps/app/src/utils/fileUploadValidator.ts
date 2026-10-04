import { appConfig } from '@campus/config';

export function validateFileUpload(file: { name: string; sizeBytes: number; mimeType: string }): { valid: boolean; error?: string } {
  if (file.sizeBytes > appConfig.uploadLimits.maxSizeBytes) {
    return { valid: false, error: `File size exceeds max limit of ${appConfig.uploadLimits.maxSizeBytes / (1024 * 1024)}MB` };
  }
  if (!appConfig.uploadLimits.allowedMimeTypes.includes(file.mimeType)) {
    return { valid: false, error: `File type ${file.mimeType} is not permitted.` };
  }
  return { valid: true };
}
