const API_BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api/admin`
  : '/api/admin';

// Types
export interface DbApp {
  id: string;
  name: string;
  categoryId: string;
  description: string;
  iconUrl: string;
  licenseType: 'FREE' | 'PAID' | 'FREEMIUM' | 'TRIAL';
  appType: 'GENERAL' | 'ENTERPRISE' | 'MANUAL';
  isPublicFree: boolean;
  officialWebsiteUrl: string;
  officialDownloadUrl: string | null;
  isRecommended: boolean | null;
  hasInstallGuide: boolean;
  installGuideTitle: string | null;
  installGuideSteps: string | null;
  installNotes: string | null;
  installerSourceUrl: string | null;
  installerType: string | null;
  silentArguments: string | null;
  version: string | null;
  vendor: string | null;
  manualDownloadUrl: string | null;
  manualDownloadFileName: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DbCategory {
  id: string;
  name: string;
  slug: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  totalApps: number;
  totalCategories: number;
  totalSelections: number;
  appsByCategory: { categoryName: string; count: number }[];
  popularApps: { appId: string; appName: string; selectionCount: number }[];
}

async function fetchWithAuth<T>(
  endpoint: string,
  token: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    ...options,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({
      error: `HTTP ${response.status}: ${response.statusText}`,
    }));
    throw new Error(errorData.error);
  }

  return response.json();
}

// Dashboard
export async function getStats(token: string): Promise<DashboardStats> {
  return fetchWithAuth<DashboardStats>('/stats', token);
}

// Apps
export async function getApps(token: string): Promise<{ apps: DbApp[] }> {
  return fetchWithAuth<{ apps: DbApp[] }>('/apps', token);
}

export async function getAppById(token: string, id: string): Promise<DbApp> {
  return fetchWithAuth<DbApp>(`/apps/${id}`, token);
}

export async function createApp(token: string, data: Partial<DbApp>): Promise<DbApp> {
  return fetchWithAuth<DbApp>('/apps', token, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateApp(token: string, id: string, data: Partial<DbApp>): Promise<DbApp> {
  return fetchWithAuth<DbApp>(`/apps/${id}`, token, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteApp(token: string, id: string): Promise<void> {
  await fetchWithAuth(`/apps/${id}`, token, {
    method: 'DELETE',
  });
}

// Categories
export async function getCategories(token: string): Promise<{ categories: DbCategory[] }> {
  return fetchWithAuth<{ categories: DbCategory[] }>('/categories', token);
}

export async function getCategoryById(token: string, id: string): Promise<DbCategory> {
  return fetchWithAuth<DbCategory>(`/categories/${id}`, token);
}

export async function createCategory(token: string, data: Partial<DbCategory>): Promise<DbCategory> {
  return fetchWithAuth<DbCategory>('/categories', token, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateCategory(token: string, id: string, data: Partial<DbCategory>): Promise<DbCategory> {
  return fetchWithAuth<DbCategory>(`/categories/${id}`, token, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteCategory(token: string, id: string): Promise<void> {
  await fetchWithAuth(`/categories/${id}`, token, {
    method: 'DELETE',
  });
}

// Users
export interface UserInfo {
  id: string;
  email: string;
  role: 'user' | 'admin';
  createdAt: string;
  lastSignIn: string | null;
}

export async function getUsers(token: string): Promise<{ users: UserInfo[] }> {
  return fetchWithAuth<{ users: UserInfo[] }>('/users', token);
}

export async function updateUserRole(token: string, userId: string, role: 'user' | 'admin'): Promise<void> {
  await fetchWithAuth(`/users/${userId}/role`, token, {
    method: 'PUT',
    body: JSON.stringify({ role }),
  });
}

// Changelogs
export interface DbChangelog {
  id: string;
  appId: string;
  appName?: string;
  version: string;
  releaseDate: string;
  changeType: 'major' | 'minor' | 'patch' | 'security' | 'update';
  title: string;
  description: string | null;
  changes: string | null;
  downloadUrl: string | null;
  isHighlighted: boolean | null;
  createdAt: string;
  updatedAt: string;
}

export async function getChangelogs(token: string): Promise<{ changelogs: DbChangelog[] }> {
  return fetchWithAuth<{ changelogs: DbChangelog[] }>('/changelogs', token);
}

export async function getChangelogById(token: string, id: string): Promise<DbChangelog> {
  return fetchWithAuth<DbChangelog>(`/changelogs/${id}`, token);
}

export async function getChangelogsByAppId(token: string, appId: string): Promise<{ changelogs: DbChangelog[] }> {
  return fetchWithAuth<{ changelogs: DbChangelog[] }>(`/apps/${appId}/changelogs`, token);
}

export async function createChangelog(token: string, data: Partial<DbChangelog>): Promise<DbChangelog> {
  return fetchWithAuth<DbChangelog>('/changelogs', token, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateChangelog(token: string, id: string, data: Partial<DbChangelog>): Promise<DbChangelog> {
  return fetchWithAuth<DbChangelog>(`/changelogs/${id}`, token, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteChangelog(token: string, id: string): Promise<void> {
  await fetchWithAuth(`/changelogs/${id}`, token, {
    method: 'DELETE',
  });
}
