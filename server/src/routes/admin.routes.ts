import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller.js';
import { requireAuth, requireAdmin } from '../middleware/auth.middleware.js';

export const adminRouter = Router();

// All admin routes require authentication and admin role
adminRouter.use(requireAuth);
adminRouter.use(requireAdmin);

// ==================== DASHBOARD ====================
adminRouter.get('/stats', AdminController.getStats);

// ==================== APPS ====================
adminRouter.get('/apps', AdminController.getApps);
adminRouter.get('/apps/:id', AdminController.getAppById);
adminRouter.post('/apps', AdminController.createApp);
adminRouter.put('/apps/:id', AdminController.updateApp);
adminRouter.delete('/apps/:id', AdminController.deleteApp);

// ==================== CATEGORIES ====================
adminRouter.get('/categories', AdminController.getCategories);
adminRouter.get('/categories/:id', AdminController.getCategoryById);
adminRouter.post('/categories', AdminController.createCategory);
adminRouter.put('/categories/:id', AdminController.updateCategory);
adminRouter.delete('/categories/:id', AdminController.deleteCategory);

// ==================== USERS ====================
adminRouter.get('/users', AdminController.getUsers);
adminRouter.put('/users/:id/role', AdminController.updateUserRole);
