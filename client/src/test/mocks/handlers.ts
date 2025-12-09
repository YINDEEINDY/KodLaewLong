import { http, HttpResponse } from 'msw';

const API_BASE = import.meta.env.VITE_API_URL || '';

// Mock data
export const mockDashboardStats = {
  totalBuilds: 150,
  totalDownloads: 500,
  totalAppsSelected: 1200,
  buildsToday: 10,
  downloadsToday: 25,
};

export const mockAppStats = {
  apps: [
    {
      appId: 'vscode',
      appName: 'Visual Studio Code',
      categoryId: 'dev-tools',
      selectionCount: 100,
      downloadCount: 80,
      lastSelectedAt: '2024-01-15T10:00:00Z',
      lastDownloadedAt: '2024-01-15T09:00:00Z',
    },
    {
      appId: 'chrome',
      appName: 'Google Chrome',
      categoryId: 'browsers',
      selectionCount: 95,
      downloadCount: 75,
      lastSelectedAt: '2024-01-15T11:00:00Z',
      lastDownloadedAt: '2024-01-15T10:30:00Z',
    },
  ],
};

export const mockPopularAppIds = {
  appIds: ['vscode', 'chrome', 'firefox', 'nodejs', 'git'],
};

export const mockApps = [
  {
    id: 'vscode',
    name: 'Visual Studio Code',
    description: 'Code editor by Microsoft',
    categoryId: 'dev-tools',
    licenseType: 'FREE',
    appType: 'GENERAL',
    iconUrl: 'https://example.com/vscode.png',
    officialUrl: 'https://code.visualstudio.com',
    downloadUrl: 'https://code.visualstudio.com/download',
  },
  {
    id: 'chrome',
    name: 'Google Chrome',
    description: 'Web browser by Google',
    categoryId: 'browsers',
    licenseType: 'FREE',
    appType: 'GENERAL',
    iconUrl: 'https://example.com/chrome.png',
    officialUrl: 'https://google.com/chrome',
    downloadUrl: 'https://google.com/chrome/download',
  },
];

export const mockCategories = [
  {
    categoryId: 'dev-tools',
    categoryName: 'Developer Tools',
    apps: [mockApps[0]],
  },
  {
    categoryId: 'browsers',
    categoryName: 'Web Browsers',
    apps: [mockApps[1]],
  },
];

// MSW Handlers
export const handlers = [
  // Dashboard stats (authenticated)
  http.get(`${API_BASE}/api/stats/dashboard`, ({ request }) => {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return HttpResponse.json(mockDashboardStats);
  }),

  // App stats (authenticated)
  http.get(`${API_BASE}/api/stats/apps`, ({ request }) => {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return HttpResponse.json(mockAppStats);
  }),

  // Popular apps (public)
  http.get(`${API_BASE}/api/stats/apps/popular`, () => {
    return HttpResponse.json(mockAppStats);
  }),

  // Popular app IDs (public)
  http.get(`${API_BASE}/api/stats/apps/popular-ids`, () => {
    return HttpResponse.json(mockPopularAppIds);
  }),

  // Get all apps
  http.get(`${API_BASE}/api/apps`, () => {
    return HttpResponse.json(mockApps);
  }),

  // Get apps by type
  http.get(`${API_BASE}/api/apps/type/:type`, ({ params }) => {
    const { type } = params;
    const filteredApps = mockApps.filter((app) => app.appType === type);
    return HttpResponse.json(filteredApps);
  }),

  // Get single app
  http.get(`${API_BASE}/api/apps/:id`, ({ params }) => {
    const { id } = params;
    const app = mockApps.find((a) => a.id === id);
    if (!app) {
      return HttpResponse.json({ error: 'App not found' }, { status: 404 });
    }
    return HttpResponse.json(app);
  }),

  // Get categories
  http.get(`${API_BASE}/api/categories`, () => {
    return HttpResponse.json(mockCategories);
  }),

  // Get categories with apps
  http.get(`${API_BASE}/api/categories/with-apps`, () => {
    return HttpResponse.json(mockCategories);
  }),
];
