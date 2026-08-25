const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: any;
  error?: {
    code: string;
    message: string;
  };
}

export async function request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${endpoint}`;
  const config: RequestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  };

  try {
    const res = await fetch(url, config);
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      return {
        success: false,
        data: null as unknown as T,
        error: errData.error || { code: `HTTP_${res.status}`, message: res.statusText }
      };
    }
    const data = await res.json();
    return data;
  } catch (err: any) {
    return {
      success: false,
      data: null as unknown as T,
      error: { code: 'NETWORK_ERROR', message: err.message || 'Failed to communicate with backend' }
    };
  }
}
