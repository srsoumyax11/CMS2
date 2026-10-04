export class AppError extends Error {
  public readonly code: string;
  public readonly status: number;
  public readonly requestId?: string;
  public readonly retryAfter?: number;

  constructor({
    code,
    message,
    status,
    requestId,
    retryAfter,
  }: {
    code: string;
    message: string;
    status: number;
    requestId?: string;
    retryAfter?: number;
  }) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.status = status;
    this.requestId = requestId;
    this.retryAfter = retryAfter;
  }
}
