import { Router } from 'express';
import { AppsController } from '../controllers/apps.controller.js';

export const appsRouter = Router();

/**
 * @swagger
 * /apps:
 *   get:
 *     summary: Get all apps grouped by category
 *     tags: [Apps]
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [GENERAL, ENTERPRISE, MANUAL]
 *         description: Filter by app type
 *     responses:
 *       200:
 *         description: List of apps grouped by category
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/CategoryWithApps'
 */
appsRouter.get('/apps', AppsController.getApps);

/**
 * @swagger
 * /apps/{id}:
 *   get:
 *     summary: Get app details by ID
 *     tags: [Apps]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: App ID
 *     responses:
 *       200:
 *         description: App details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/App'
 *       404:
 *         description: App not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
appsRouter.get('/apps/:id', AppsController.getAppById);

/**
 * @swagger
 * /apps/{id}/changelogs:
 *   get:
 *     summary: Get changelogs for an app
 *     tags: [Changelogs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: App ID
 *     responses:
 *       200:
 *         description: List of changelogs
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   version:
 *                     type: string
 *                   changes:
 *                     type: string
 *                   releaseDate:
 *                     type: string
 *                     format: date-time
 */
appsRouter.get('/apps/:id/changelogs', AppsController.getAppChangelogs);

/**
 * @swagger
 * /generate:
 *   post:
 *     summary: Generate installer script
 *     tags: [Generate]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/GenerateRequest'
 *     responses:
 *       200:
 *         description: Installer generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GenerateResponse'
 *       400:
 *         description: Invalid request (empty appIds or invalid format)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
appsRouter.post('/generate', AppsController.generate);

/**
 * @swagger
 * /downloads/{buildId}:
 *   get:
 *     summary: Download generated installer
 *     tags: [Generate]
 *     parameters:
 *       - in: path
 *         name: buildId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Build ID from generate response
 *     responses:
 *       200:
 *         description: Installer zip file
 *         content:
 *           application/zip:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: Build not found
 */
appsRouter.get('/downloads/:buildId', AppsController.download);
