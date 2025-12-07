import { Router } from 'express';
import { StatsController } from '../controllers/stats.controller.js';
import { requireAuth, requireAdmin } from '../middleware/auth.middleware.js';

const router = Router();

/**
 * @swagger
 * /stats/apps/popular:
 *   get:
 *     summary: Get popular apps
 *     tags: [Stats]
 *     parameters:
 *       - in: query
 *         name: threshold
 *         schema:
 *           type: integer
 *           default: 3
 *         description: Minimum selection count to be considered popular
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Maximum number of apps to return
 *     responses:
 *       200:
 *         description: List of popular apps with selection counts
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 allOf:
 *                   - $ref: '#/components/schemas/App'
 *                   - type: object
 *                     properties:
 *                       selectionCount:
 *                         type: integer
 *                         example: 25
 */
router.get('/apps/popular', StatsController.getPopularApps);

/**
 * @swagger
 * /stats/apps/popular-ids:
 *   get:
 *     summary: Get IDs of popular apps
 *     tags: [Stats]
 *     parameters:
 *       - in: query
 *         name: threshold
 *         schema:
 *           type: integer
 *           default: 3
 *         description: Minimum selection count to be considered popular
 *     responses:
 *       200:
 *         description: List of popular app IDs
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: string
 *                 format: uuid
 */
router.get('/apps/popular-ids', StatsController.getPopularAppIds);

/**
 * @swagger
 * /stats/dashboard:
 *   get:
 *     summary: Get dashboard statistics (Admin only)
 *     tags: [Stats]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard statistics
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BuildStats'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.get('/dashboard', requireAuth, requireAdmin, StatsController.getDashboardStats);

/**
 * @swagger
 * /stats/apps:
 *   get:
 *     summary: Get app selection statistics (Admin only)
 *     tags: [Stats]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: App selection statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   appId:
 *                     type: string
 *                   appName:
 *                     type: string
 *                   selectionCount:
 *                     type: integer
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.get('/apps', requireAuth, requireAdmin, StatsController.getAppStats);

/**
 * @swagger
 * /stats/builds:
 *   get:
 *     summary: Get recent builds (Admin only)
 *     tags: [Stats]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Maximum number of builds to return
 *     responses:
 *       200:
 *         description: List of recent builds
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   buildId:
 *                     type: string
 *                   appCount:
 *                     type: integer
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                   downloaded:
 *                     type: boolean
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.get('/builds', requireAuth, requireAdmin, StatsController.getRecentBuilds);

export default router;
