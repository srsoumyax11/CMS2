import React from 'react';
import { FileText, Download, ExternalLink } from 'lucide-react';

export interface AttachmentItem {
  id: string;
  filename: string;
  fileUrl: string;
  fileSize?: string;
  uploadedAt?: string;
}

interface AttachmentListProps {
  attachments: AttachmentItem[];
}

export const AttachmentList: React.FC<AttachmentListProps> = ({ attachments }) => {
  if (attachments.length === 0) {
    return (
      <div className="text-center py-6 text-xs text-muted-foreground italic space-y-1">
        <FileText className="h-6 w-6 mx-auto text-muted-foreground/50" />
        <p>No attached files or documents.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2 text-xs">
      {attachments.map((att) => (
        <div key={att.id} className="border rounded-lg p-3 bg-card flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            <div>
              <p className="font-semibold text-foreground">{att.filename}</p>
              {att.fileSize && <span className="text-[10px] text-muted-foreground">{att.fileSize}</span>}
            </div>
          </div>

          <a
            href={att.fileUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Download</span>
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      ))}
    </div>
  );
};
