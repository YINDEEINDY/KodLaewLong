import { Router } from 'express';
import { StatsController } from '../controllers/stats.controller.js';
import { requireAuth, requireAdmin } from '../middleware/auth.middleware.js';

const router = Router();

// Public endpoints
router.get('/apps/popular', StatsController.getPopularApps);
router.get('/apps/popular-ids', StatsController.getPopularAppIds);

// Admin-only endpoints
router.get('/dashboard', requireAuth, requireAdmin, StatsController.getDashboardStats);
router.get('/apps', requireAuth, requireAdmin, StatsController.getAppStats);
router.get('/builds', requireAuth, requireAdmin, StatsController.getRecentBuilds);

export default router;
