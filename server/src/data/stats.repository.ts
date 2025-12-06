import { eq, sql, desc } from 'drizzle-orm';
import { db } from '../db/index.js';
import { buildStats, buildApps, appStats, apps } from '../db/schema.js';
import type { BuildStat, AppStat } from '../db/schema.js';

export interface AppWithStats {
  appId: string;
  appName: string;
  categoryId: string;
  selectionCount: number;
  downloadCount: number;
  lastSelectedAt: Date | null;
  lastDownloadedAt: Date | null;
}

export interface BuildWithApps extends BuildStat {
  apps: string[];
}

export interface DashboardStats {
  totalBuilds: number;
  totalDownloads: number;
  totalAppsSelected: number;
  buildsToday: number;
  downloadsToday: number;
}

export class StatsRepository {
  // Build stats operations
  async createBuildStat(buildId: string, appIds: string[]): Promise<BuildStat> {
    const [stat] = await db.insert(buildStats).values({
      buildId,
      appCount: appIds.length,
      downloadCount: 0,
    }).returning();

    // Insert build-app relationships
    if (appIds.length > 0) {
      await db.insert(buildApps).values(
        appIds.map(appId => ({ buildId, appId }))
      );
    }

    // Update app selection stats
    for (const appId of appIds) {
      await this.incrementAppSelectionCount(appId);
    }

    return stat;
  }

  async incrementBuildDownloadCount(buildId: string): Promise<void> {
    await db.update(buildStats)
      .set({
        downloadCount: sql`${buildStats.downloadCount} + 1`,
        lastDownloadAt: new Date(),
      })
      .where(eq(buildStats.buildId, buildId));

    // Also increment download count for each app in this build
    const buildAppRecords = await db.select({ appId: buildApps.appId })
      .from(buildApps)
      .where(eq(buildApps.buildId, buildId));

    for (const record of buildAppRecords) {
      await this.incrementAppDownloadCount(record.appId);
    }
  }

  async getBuildStat(buildId: string): Promise<BuildStat | null> {
    const [stat] = await db.select()
      .from(buildStats)
      .where(eq(buildStats.buildId, buildId));
    return stat || null;
  }

  async getRecentBuilds(limit: number = 10): Promise<BuildWithApps[]> {
    const builds = await db.select()
      .from(buildStats)
      .orderBy(desc(buildStats.createdAt))
      .limit(limit);

    const buildsWithApps: BuildWithApps[] = [];
    for (const build of builds) {
      const appRecords = await db.select({ appId: buildApps.appId })
        .from(buildApps)
        .where(eq(buildApps.buildId, build.buildId));
      buildsWithApps.push({
        ...build,
        apps: appRecords.map(r => r.appId),
      });
    }

    return buildsWithApps;
  }

  // App stats operations
  async incrementAppSelectionCount(appId: string): Promise<void> {
    const [existing] = await db.select()
      .from(appStats)
      .where(eq(appStats.appId, appId));

    if (existing) {
      await db.update(appStats)
        .set({
          selectionCount: sql`${appStats.selectionCount} + 1`,
          lastSelectedAt: new Date(),
        })
        .where(eq(appStats.appId, appId));
    } else {
      await db.insert(appStats).values({
        appId,
        selectionCount: 1,
        downloadCount: 0,
        lastSelectedAt: new Date(),
      });
    }
  }

  async incrementAppDownloadCount(appId: string): Promise<void> {
    const [existing] = await db.select()
      .from(appStats)
      .where(eq(appStats.appId, appId));

    if (existing) {
      await db.update(appStats)
        .set({
          downloadCount: sql`${appStats.downloadCount} + 1`,
          lastDownloadedAt: new Date(),
        })
        .where(eq(appStats.appId, appId));
    } else {
      await db.insert(appStats).values({
        appId,
        selectionCount: 0,
        downloadCount: 1,
        lastDownloadedAt: new Date(),
      });
    }
  }

  async getAppStats(appId: string): Promise<AppStat | null> {
    const [stat] = await db.select()
      .from(appStats)
      .where(eq(appStats.appId, appId));
    return stat || null;
  }

  async getPopularApps(limit: number = 10): Promise<AppWithStats[]> {
    const results = await db.select({
      appId: appStats.appId,
      appName: apps.name,
      categoryId: apps.categoryId,
      selectionCount: appStats.selectionCount,
      downloadCount: appStats.downloadCount,
      lastSelectedAt: appStats.lastSelectedAt,
      lastDownloadedAt: appStats.lastDownloadedAt,
    })
      .from(appStats)
      .innerJoin(apps, eq(appStats.appId, apps.id))
      .orderBy(desc(appStats.selectionCount))
      .limit(limit);

    return results;
  }

  async getAllAppStats(): Promise<AppWithStats[]> {
    const results = await db.select({
      appId: appStats.appId,
      appName: apps.name,
      categoryId: apps.categoryId,
      selectionCount: appStats.selectionCount,
      downloadCount: appStats.downloadCount,
      lastSelectedAt: appStats.lastSelectedAt,
      lastDownloadedAt: appStats.lastDownloadedAt,
    })
      .from(appStats)
      .innerJoin(apps, eq(appStats.appId, apps.id))
      .orderBy(desc(appStats.selectionCount));

    return results;
  }

  // Dashboard stats
  async getDashboardStats(): Promise<DashboardStats> {
    // Get total builds
    const [buildCount] = await db.select({
      count: sql<number>`count(*)::int`,
    }).from(buildStats);

    // Get total downloads
    const [downloadSum] = await db.select({
      sum: sql<number>`coalesce(sum(${buildStats.downloadCount}), 0)::int`,
    }).from(buildStats);

    // Get total apps selected (sum of all selection counts)
    const [appSelectSum] = await db.select({
      sum: sql<number>`coalesce(sum(${appStats.selectionCount}), 0)::int`,
    }).from(appStats);

    // Get today's builds
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString();
    const [buildsToday] = await db.select({
      count: sql<number>`count(*)::int`,
    }).from(buildStats)
      .where(sql`${buildStats.createdAt} >= ${todayStr}`);

    // Get today's downloads
    const [downloadsToday] = await db.select({
      sum: sql<number>`coalesce(sum(${buildStats.downloadCount}), 0)::int`,
    }).from(buildStats)
      .where(sql`${buildStats.lastDownloadAt} >= ${todayStr}`);

    return {
      totalBuilds: buildCount?.count || 0,
      totalDownloads: downloadSum?.sum || 0,
      totalAppsSelected: appSelectSum?.sum || 0,
      buildsToday: buildsToday?.count || 0,
      downloadsToday: downloadsToday?.sum || 0,
    };
  }

  // Get popular app IDs for badge display (returns app IDs with selection count >= threshold)
  async getPopularAppIds(threshold: number = 5): Promise<string[]> {
    const results = await db.select({ appId: appStats.appId })
      .from(appStats)
      .where(sql`${appStats.selectionCount} >= ${threshold}`);

    return results.map(r => r.appId);
  }
}

export const statsRepository = new StatsRepository();
