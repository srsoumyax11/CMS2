import { validateFileUpload } from '../src/utils/fileUploadValidator';

describe('File Upload Validation (Item 13)', () => {
  it('accepts valid PDF document within 10MB limit', () => {
    const validFile = { name: 'bonafide.pdf', sizeBytes: 2 * 1024 * 1024, mimeType: 'application/pdf' };
    const res = validateFileUpload(validFile);
    expect(res.valid).toBe(true);
    expect(res.error).toBeUndefined();
  });

  it('rejects file exceeding max size limit', () => {
    const oversizedFile = { name: 'huge_video.mp4', sizeBytes: 25 * 1024 * 1024, mimeType: 'application/pdf' };
    const res = validateFileUpload(oversizedFile);
    expect(res.valid).toBe(false);
    expect(res.error).toContain('exceeds max limit');
  });

  it('rejects forbidden file MIME type (e.g. .exe / .sh script)', () => {
    const forbiddenFile = { name: 'exploit.exe', sizeBytes: 500, mimeType: 'application/x-msdownload' };
    const res = validateFileUpload(forbiddenFile);
    expect(res.valid).toBe(false);
    expect(res.error).toContain('is not permitted');
  });
});
