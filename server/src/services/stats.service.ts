import { statsRepository, type AppWithStats, type BuildWithApps, type DashboardStats } from '../data/stats.repository.js';

export class StatsService {
  // Record a new build
  async recordBuild(buildId: string, appIds: string[]): Promise<void> {
    try {
      await statsRepository.createBuildStat(buildId, appIds);
      console.log(`Build stats recorded: ${buildId} with ${appIds.length} apps`);
    } catch (error) {
      console.error('Failed to record build stats:', error);
      // Don't throw - stats recording should not break the main flow
    }
  }

  // Record a download
  async recordDownload(buildId: string): Promise<void> {
    try {
      await statsRepository.incrementBuildDownloadCount(buildId);
      console.log(`Download recorded for build: ${buildId}`);
    } catch (error) {
      console.error('Failed to record download:', error);
      // Don't throw - stats recording should not break the main flow
    }
  }

  // Get dashboard statistics
  async getDashboardStats(): Promise<DashboardStats> {
    return await statsRepository.getDashboardStats();
  }

  // Get popular apps
  async getPopularApps(limit: number = 10): Promise<AppWithStats[]> {
    return await statsRepository.getPopularApps(limit);
  }

  // Get all app statistics
  async getAllAppStats(): Promise<AppWithStats[]> {
    return await statsRepository.getAllAppStats();
  }

  // Get recent builds
  async getRecentBuilds(limit: number = 10): Promise<BuildWithApps[]> {
    return await statsRepository.getRecentBuilds(limit);
  }

  // Get popular app IDs (for frontend badge)
  async getPopularAppIds(threshold: number = 5): Promise<string[]> {
    return await statsRepository.getPopularAppIds(threshold);
  }
}

export const statsService = new StatsService();
