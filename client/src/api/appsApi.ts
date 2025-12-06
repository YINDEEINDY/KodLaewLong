import type { AppsListResponse, App, AppType, GenerateRequest, GenerateResponse, ErrorResponse } from '../types';

const API_BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api';

async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  });

  if (!response.ok) {
    const errorData: ErrorResponse = await response.json().catch(() => ({
      error: `HTTP ${response.status}: ${response.statusText}`,
    }));
    throw new Error(errorData.error);
  }

  return response.json();
}

// Get all apps grouped by category (optionally filtered by type)
export async function getApps(appType?: AppType): Promise<AppsListResponse> {
  const params = appType ? `?type=${appType}` : '';
  return fetchApi<AppsListResponse>(`/apps${params}`);
}

// Get single app by ID
export async function getAppById(id: string): Promise<App> {
  return fetchApi<App>(`/apps/${id}`);
}

// Generate installer
export async function generateInstaller(appIds: string[]): Promise<GenerateResponse> {
  const request: GenerateRequest = { appIds };
  return fetchApi<GenerateResponse>('/generate', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}
