import { Router } from 'express';
import { AppsController } from '../controllers/apps.controller.js';

export const appsRouter = Router();

// GET /api/apps - List all apps by category
appsRouter.get('/apps', AppsController.getApps);

// GET /api/apps/:id - Get single app details
appsRouter.get('/apps/:id', AppsController.getAppById);

// GET /api/apps/:id/changelogs - Get changelogs for an app (public)
appsRouter.get('/apps/:id/changelogs', AppsController.getAppChangelogs);

// POST /api/generate - Generate installer
appsRouter.post('/generate', AppsController.generate);

// GET /api/downloads/:buildId - Download installer zip
appsRouter.get('/downloads/:buildId', AppsController.download);
