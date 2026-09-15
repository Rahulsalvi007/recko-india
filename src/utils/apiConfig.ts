/**
 * API Base URL Resolver Utility
 * Resolves API endpoints dynamically based on environment variables.
 * In production (Netlify + Render setup), VITE_API_URL can be set to Render Web Service URL.
 */

export const getApiUrl = (endpoint: string): string => {
  const baseUrl = ((import.meta as any).env?.VITE_API_URL || '').trim().replace(/\/+$/, '');
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return baseUrl ? `${baseUrl}${cleanEndpoint}` : cleanEndpoint;
};
