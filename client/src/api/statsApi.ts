const API_BASE = import.meta.env.VITE_API_URL || '';

export interface DashboardStats {
  totalBuilds: number;
  totalDownloads: number;
  totalAppsSelected: number;
  buildsToday: number;
  downloadsToday: number;
}

export interface AppWithStats {
  appId: string;
  appName: string;
  categoryId: string;
  selectionCount: number;
  downloadCount: number;
  lastSelectedAt: string | null;
  lastDownloadedAt: string | null;
}

export interface BuildWithApps {
  id: string;
  buildId: string;
  appCount: number;
  downloadCount: number;
  createdAt: string;
  lastDownloadAt: string | null;
  apps: string[];
}

// Admin endpoints (require authentication)
export async function fetchDashboardStats(token: string): Promise<DashboardStats> {
  const response = await fetch(`${API_BASE}/api/stats/dashboard`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error('Failed to fetch dashboard stats');
  }
  return response.json();
}

export async function fetchAppStats(token: string): Promise<{ apps: AppWithStats[] }> {
  const response = await fetch(`${API_BASE}/api/stats/apps`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error('Failed to fetch app stats');
  }
  return response.json();
}

export async function fetchRecentBuilds(token: string, limit: number = 10): Promise<{ builds: BuildWithApps[] }> {
  const response = await fetch(`${API_BASE}/api/stats/builds?limit=${limit}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error('Failed to fetch recent builds');
  }
  return response.json();
}

// Public endpoints
export async function fetchPopularApps(limit: number = 10): Promise<{ apps: AppWithStats[] }> {
  const response = await fetch(`${API_BASE}/api/stats/apps/popular?limit=${limit}`);
  if (!response.ok) {
    throw new Error('Failed to fetch popular apps');
  }
  return response.json();
}

export async function fetchPopularAppIds(threshold: number = 5): Promise<{ appIds: string[] }> {
  const response = await fetch(`${API_BASE}/api/stats/apps/popular-ids?threshold=${threshold}`);
  if (!response.ok) {
    throw new Error('Failed to fetch popular app IDs');
  }
  return response.json();
}
