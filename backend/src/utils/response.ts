import { sanitizeErrorMessage } from './error-sanitizer';

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  timestamp: string;
}

export const successResponse = <T>(data: T, message?: string): ApiResponse<T> => {
  return {
    success: true,
    message,
    data,
    timestamp: new Date().toISOString(),
  };
};

export const errorResponse = (error: string, message?: string, fallbackDefault?: string): ApiResponse => {
  const safeMessage = message
    ? sanitizeErrorMessage(message, fallbackDefault || 'An error occurred while processing your request')
    : undefined;
  return {
    success: false,
    message: safeMessage,
    error,
    timestamp: new Date().toISOString(),
  };
};
