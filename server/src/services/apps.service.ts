import type { App, AppType, CategoryWithApps } from '../types/index.js';
import { appRepository, type IAppRepository } from '../data/apps.repository.js';

export class AppsService {
  private repository: IAppRepository;

  constructor(repository: IAppRepository = appRepository) {
    this.repository = repository;
  }

  async getAllApps(): Promise<App[]> {
    return this.repository.getAllApps();
  }

  async getAppsByCategory(): Promise<CategoryWithApps[]> {
    return this.repository.getAppsByCategory();
  }

  async getAppsByCategoryAndType(appType: AppType): Promise<CategoryWithApps[]> {
    return this.repository.getAppsByCategoryAndType(appType);
  }

  async getAppById(id: string): Promise<App | undefined> {
    return this.repository.getAppById(id);
  }

  async getAppsByIds(ids: string[]): Promise<App[]> {
    return this.repository.getAppsByIds(ids);
  }
}

// Singleton instance
export const appsService = new AppsService();
