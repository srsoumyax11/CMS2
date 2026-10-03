// API Client for Campus7 ElysiaJS Backend (http://localhost:3000/api/v1)

const BASE_URL = 'http://localhost:3000/api/v1';

let authToken: string | null = null;

export const setAuthToken = (token: string | null) => {
  authToken = token;
};

export const getAuthToken = () => authToken;

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ success: boolean; data?: T; message?: string; error?: any }> {
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const json = await response.json();
    return json;
  } catch (err: any) {
    return {
      success: false,
      message: err.message || 'Network request failed',
      error: err,
    };
  }
}
