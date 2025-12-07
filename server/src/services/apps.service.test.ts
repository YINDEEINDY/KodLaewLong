import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AppsService } from './apps.service.js';
import type { IAppRepository } from '../data/apps.repository.js';
import type { App, CategoryWithApps } from '../types/index.js';

// Mock app data
const mockApp: App = {
  id: 'test-app-1',
  name: 'Test App',
  description: 'A test application',
  categoryId: 'cat-1',
  categoryName: 'Test Category',
  iconUrl: 'https://example.com/icon.png',
  licenseType: 'FREE',
  officialUrl: 'https://example.com',
  downloadUrl: 'https://example.com/download',
  hasInstallGuide: false,
  installGuideSteps: null,
  notes: null,
  installerUrl: null,
  installerType: 'EXE',
  silentArgs: '/S',
  version: '1.0.0',
  vendor: 'Test Vendor',
  appType: 'GENERAL',
  manualDownloadUrl: null,
  manualDownloadFileName: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const mockApps: App[] = [
  mockApp,
  { ...mockApp, id: 'test-app-2', name: 'Another App' },
];

const mockCategoryWithApps: CategoryWithApps = {
  categoryId: 'cat-1',
  categoryName: 'Test Category',
  apps: mockApps,
};

describe('AppsService', () => {
  let service: AppsService;
  let mockRepository: IAppRepository;

  beforeEach(() => {
    mockRepository = {
      getAllApps: vi.fn().mockResolvedValue(mockApps),
      getAppsByCategory: vi.fn().mockResolvedValue([mockCategoryWithApps]),
      getAppsByCategoryAndType: vi.fn().mockResolvedValue([mockCategoryWithApps]),
      getAppById: vi.fn().mockResolvedValue(mockApp),
      getAppsByIds: vi.fn().mockResolvedValue(mockApps),
    };

    service = new AppsService(mockRepository);
  });

  describe('getAllApps', () => {
    it('should return all apps from repository', async () => {
      const result = await service.getAllApps();

      expect(mockRepository.getAllApps).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockApps);
    });
  });

  describe('getAppsByCategory', () => {
    it('should return apps grouped by category', async () => {
      const result = await service.getAppsByCategory();

      expect(mockRepository.getAppsByCategory).toHaveBeenCalledTimes(1);
      expect(result).toEqual([mockCategoryWithApps]);
    });
  });

  describe('getAppsByCategoryAndType', () => {
    it('should return apps filtered by type and grouped by category', async () => {
      const result = await service.getAppsByCategoryAndType('GENERAL');

      expect(mockRepository.getAppsByCategoryAndType).toHaveBeenCalledWith('GENERAL');
      expect(result).toEqual([mockCategoryWithApps]);
    });

    it('should filter by ENTERPRISE type', async () => {
      await service.getAppsByCategoryAndType('ENTERPRISE');

      expect(mockRepository.getAppsByCategoryAndType).toHaveBeenCalledWith('ENTERPRISE');
    });

    it('should filter by MANUAL type', async () => {
      await service.getAppsByCategoryAndType('MANUAL');

      expect(mockRepository.getAppsByCategoryAndType).toHaveBeenCalledWith('MANUAL');
    });
  });

  describe('getAppById', () => {
    it('should return an app by id', async () => {
      const result = await service.getAppById('test-app-1');

      expect(mockRepository.getAppById).toHaveBeenCalledWith('test-app-1');
      expect(result).toEqual(mockApp);
    });

    it('should return undefined for non-existent app', async () => {
      vi.mocked(mockRepository.getAppById).mockResolvedValueOnce(undefined);

      const result = await service.getAppById('non-existent');

      expect(result).toBeUndefined();
    });
  });

  describe('getAppsByIds', () => {
    it('should return apps by ids', async () => {
      const ids = ['test-app-1', 'test-app-2'];
      const result = await service.getAppsByIds(ids);

      expect(mockRepository.getAppsByIds).toHaveBeenCalledWith(ids);
      expect(result).toEqual(mockApps);
    });

    it('should handle empty ids array', async () => {
      vi.mocked(mockRepository.getAppsByIds).mockResolvedValueOnce([]);

      const result = await service.getAppsByIds([]);

      expect(result).toEqual([]);
    });
  });
});
