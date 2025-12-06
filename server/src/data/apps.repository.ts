import { eq, inArray, asc } from 'drizzle-orm';
import { db, apps, categories } from '../db/index.js';
import type { App as DbApp } from '../db/schema.js';
import type { App, AppType, CategoryWithApps } from '../types/index.js';

// Repository interface for data access abstraction
export interface IAppRepository {
  getAllApps(): Promise<App[]>;
  getAppById(id: string): Promise<App | undefined>;
  getAppsByCategory(): Promise<CategoryWithApps[]>;
  getAppsByIds(ids: string[]): Promise<App[]>;
  getAppsByCategoryAndType(appType: AppType): Promise<CategoryWithApps[]>;
}

// Transform database app to API app format
function transformApp(dbApp: DbApp): App {
  return {
    id: dbApp.id,
    name: dbApp.name,
    category: dbApp.categoryId,
    description: dbApp.description,
    iconUrl: dbApp.iconUrl,
    licenseType: dbApp.licenseType,
    appType: dbApp.appType,
    isPublicFree: dbApp.isPublicFree,
    officialWebsiteUrl: dbApp.officialWebsiteUrl,
    officialDownloadUrl: dbApp.officialDownloadUrl ?? undefined,
    isRecommended: dbApp.isRecommended ?? undefined,
    hasInstallGuide: dbApp.hasInstallGuide,
    installGuideTitle: dbApp.installGuideTitle ?? undefined,
    installGuideSteps: dbApp.installGuideSteps ? JSON.parse(dbApp.installGuideSteps) : undefined,
    installNotes: dbApp.installNotes ?? undefined,
    installerSourceUrl: dbApp.installerSourceUrl ?? undefined,
    installerType: dbApp.installerType ?? undefined,
    silentArguments: dbApp.silentArguments ?? undefined,
    version: dbApp.version ?? undefined,
    vendor: dbApp.vendor ?? undefined,
    manualDownloadUrl: dbApp.manualDownloadUrl ?? undefined,
    manualDownloadFileName: dbApp.manualDownloadFileName ?? undefined,
  };
}

// Drizzle ORM implementation
export class DrizzleAppRepository implements IAppRepository {
  async getAllApps(): Promise<App[]> {
    const result = await db.select().from(apps);
    return result.map(transformApp);
  }

  async getAppById(id: string): Promise<App | undefined> {
    const result = await db.select().from(apps).where(eq(apps.id, id)).limit(1);
    return result[0] ? transformApp(result[0]) : undefined;
  }

  async getAppsByCategory(): Promise<CategoryWithApps[]> {
    const allCategories = await db.select().from(categories).orderBy(asc(categories.order));
    const allApps = await db.select().from(apps);

    return allCategories.map((category) => ({
      name: category.name,
      slug: category.slug,
      apps: allApps.filter((app) => app.categoryId === category.id).map(transformApp),
    }));
  }

  async getAppsByIds(ids: string[]): Promise<App[]> {
    if (ids.length === 0) return [];
    const result = await db.select().from(apps).where(inArray(apps.id, ids));
    return result.map(transformApp);
  }

  async getAppsByCategoryAndType(appType: AppType): Promise<CategoryWithApps[]> {
    const allCategories = await db.select().from(categories).orderBy(asc(categories.order));
    const filteredApps = await db.select().from(apps).where(eq(apps.appType, appType));

    return allCategories
      .map((category) => ({
        name: category.name,
        slug: category.slug,
        apps: filteredApps.filter((app) => app.categoryId === category.id).map(transformApp),
      }))
      .filter((category) => category.apps.length > 0);
  }
}

// Singleton instance
export const appRepository = new DrizzleAppRepository();
