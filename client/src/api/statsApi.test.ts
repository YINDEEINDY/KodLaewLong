import { describe, it, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '../test/mocks/server';
import {
  mockDashboardStats,
  mockAppStats,
  mockPopularAppIds,
} from '../test/mocks/handlers';
import {
  fetchDashboardStats,
  fetchAppStats,
  fetchPopularApps,
  fetchPopularAppIds,
} from './statsApi';

const API_BASE = import.meta.env.VITE_API_URL || '';

describe('Stats API - Integration Tests', () => {
  describe('fetchDashboardStats', () => {
    it('should fetch dashboard stats with valid token', async () => {
      const stats = await fetchDashboardStats('valid-token');

      expect(stats).toEqual(mockDashboardStats);
      expect(stats.totalBuilds).toBe(150);
      expect(stats.totalDownloads).toBe(500);
    });

    it('should throw error without token', async () => {
      server.use(
        http.get(`${API_BASE}/api/stats/dashboard`, () => {
          return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 });
        })
      );

      await expect(fetchDashboardStats('')).rejects.toThrow('Failed to fetch dashboard stats');
    });

    it('should handle server error', async () => {
      server.use(
        http.get(`${API_BASE}/api/stats/dashboard`, () => {
          return HttpResponse.json({ error: 'Server error' }, { status: 500 });
        })
      );

      await expect(fetchDashboardStats('valid-token')).rejects.toThrow('Failed to fetch dashboard stats');
    });
  });

  describe('fetchAppStats', () => {
    it('should fetch app stats with valid token', async () => {
      const result = await fetchAppStats('valid-token');

      expect(result.apps).toHaveLength(2);
      expect(result.apps[0].appId).toBe('vscode');
      expect(result.apps[0].selectionCount).toBe(100);
    });

    it('should throw error without valid authentication', async () => {
      server.use(
        http.get(`${API_BASE}/api/stats/apps`, () => {
          return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 });
        })
      );

      await expect(fetchAppStats('')).rejects.toThrow('Failed to fetch app stats');
    });
  });

  describe('fetchPopularApps', () => {
    it('should fetch popular apps (public endpoint)', async () => {
      const result = await fetchPopularApps();

      expect(result.apps).toHaveLength(2);
      expect(result.apps[0].appName).toBe('Visual Studio Code');
    });

    it('should pass limit parameter', async () => {
      server.use(
        http.get(`${API_BASE}/api/stats/apps/popular`, ({ request }) => {
          const url = new URL(request.url);
          const limit = url.searchParams.get('limit');
          expect(limit).toBe('5');
          return HttpResponse.json({ apps: mockAppStats.apps.slice(0, 1) });
        })
      );

      const result = await fetchPopularApps(5);
      expect(result.apps).toBeDefined();
    });
  });

  describe('fetchPopularAppIds', () => {
    it('should fetch popular app IDs', async () => {
      const result = await fetchPopularAppIds();

      expect(result.appIds).toEqual(['vscode', 'chrome', 'firefox', 'nodejs', 'git']);
      expect(result.appIds).toHaveLength(5);
    });

    it('should pass threshold parameter', async () => {
      server.use(
        http.get(`${API_BASE}/api/stats/apps/popular-ids`, ({ request }) => {
          const url = new URL(request.url);
          const threshold = url.searchParams.get('threshold');
          expect(threshold).toBe('10');
          return HttpResponse.json(mockPopularAppIds);
        })
      );

      const result = await fetchPopularAppIds(10);
      expect(result.appIds).toBeDefined();
    });

    it('should handle empty response', async () => {
      server.use(
        http.get(`${API_BASE}/api/stats/apps/popular-ids`, () => {
          return HttpResponse.json({ appIds: [] });
        })
      );

      const result = await fetchPopularAppIds();
      expect(result.appIds).toEqual([]);
    });
  });
});
