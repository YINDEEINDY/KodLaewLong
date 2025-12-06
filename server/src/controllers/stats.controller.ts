import type { Request, Response } from 'express';
import { statsService } from '../services/stats.service.js';

export class StatsController {
  // GET /api/stats/dashboard - Get dashboard statistics (admin only)
  static async getDashboardStats(_req: Request, res: Response): Promise<void> {
    try {
      const stats = await statsService.getDashboardStats();
      res.json(stats);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูลสถิติ' });
    }
  }

  // GET /api/stats/apps - Get all app statistics (admin only)
  static async getAppStats(_req: Request, res: Response): Promise<void> {
    try {
      const stats = await statsService.getAllAppStats();
      res.json({ apps: stats });
    } catch (error) {
      console.error('Error fetching app stats:', error);
      res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูลสถิติ' });
    }
  }

  // GET /api/stats/apps/popular - Get popular apps (public)
  static async getPopularApps(req: Request, res: Response): Promise<void> {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const apps = await statsService.getPopularApps(Math.min(limit, 50));
      res.json({ apps });
    } catch (error) {
      console.error('Error fetching popular apps:', error);
      res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูล' });
    }
  }

  // GET /api/stats/apps/popular-ids - Get popular app IDs (for badge display)
  static async getPopularAppIds(req: Request, res: Response): Promise<void> {
    try {
      const threshold = parseInt(req.query.threshold as string) || 5;
      const appIds = await statsService.getPopularAppIds(threshold);
      res.json({ appIds });
    } catch (error) {
      console.error('Error fetching popular app IDs:', error);
      res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูล' });
    }
  }

  // GET /api/stats/builds - Get recent builds (admin only)
  static async getRecentBuilds(req: Request, res: Response): Promise<void> {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const builds = await statsService.getRecentBuilds(Math.min(limit, 50));
      res.json({ builds });
    } catch (error) {
      console.error('Error fetching recent builds:', error);
      res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูลสถิติ' });
    }
  }
}
