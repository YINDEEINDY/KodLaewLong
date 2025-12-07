import { Router } from 'express';
import { SelectionsController } from '../controllers/selections.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

export const selectionsRouter = Router();

// All selection routes require authentication
selectionsRouter.use(requireAuth);

/**
 * @swagger
 * /selections:
 *   get:
 *     summary: Get user's saved selections
 *     tags: [Selections]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of selected app IDs
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 appIds:
 *                   type: array
 *                   items:
 *                     type: string
 *                     format: uuid
 *       401:
 *         description: Unauthorized
 */
selectionsRouter.get('/', SelectionsController.getSelections);

/**
 * @swagger
 * /selections:
 *   put:
 *     summary: Save user's selections (replace all)
 *     tags: [Selections]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - appIds
 *             properties:
 *               appIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uuid
 *     responses:
 *       200:
 *         description: Selections saved successfully
 *       401:
 *         description: Unauthorized
 */
selectionsRouter.put('/', SelectionsController.saveSelections);

/**
 * @swagger
 * /selections/{appId}:
 *   post:
 *     summary: Add single app to selections
 *     tags: [Selections]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: appId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: App added to selections
 *       401:
 *         description: Unauthorized
 */
selectionsRouter.post('/:appId', SelectionsController.addSelection);

/**
 * @swagger
 * /selections/{appId}:
 *   delete:
 *     summary: Remove single app from selections
 *     tags: [Selections]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: appId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: App removed from selections
 *       401:
 *         description: Unauthorized
 */
selectionsRouter.delete('/:appId', SelectionsController.removeSelection);

/**
 * @swagger
 * /selections:
 *   delete:
 *     summary: Clear all selections
 *     tags: [Selections]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All selections cleared
 *       401:
 *         description: Unauthorized
 */
selectionsRouter.delete('/', SelectionsController.clearSelections);
