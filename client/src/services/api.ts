/// <reference types="vite/client" />

export const API_BASE_URL = import.meta.env.VITE_API_URL || '';

/**
 * Resolves full API endpoint URL taking base URL into consideration
 */
export const getApiUrl = (path: string): string => {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  if (cleanPath.startsWith('/api')) {
    return `${API_BASE_URL}${cleanPath}`;
  }
  return `${API_BASE_URL}/api/v1${cleanPath}`;
};

export interface ApiOptions extends Omit<RequestInit, 'headers'> {
  token?: string | null;
  params?: Record<string, string | number | boolean | undefined>;
  headers?: Record<string, string>;
}

/**
 * Centralized API client wrapper with auto-header injection & base URL resolution
 */
export const apiFetch = async <T = any>(
  endpoint: string,
  options: ApiOptions = {}
): Promise<T> => {
  const { token, params, headers = {}, ...restOptions } = options;

  let url = getApiUrl(endpoint);

  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += (url.includes('?') ? '&' : '?') + queryString;
    }
  }

  const tokenToUse = token ?? localStorage.getItem('adminToken');

  const combinedHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...headers,
  };

  if (tokenToUse) {
    combinedHeaders['Authorization'] = `Bearer ${tokenToUse}`;
  }

  const response = await fetch(url, {
    headers: combinedHeaders,
    ...restOptions,
  });

  return response.json();
};
