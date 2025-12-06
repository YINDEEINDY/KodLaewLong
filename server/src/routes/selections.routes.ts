import { Router } from 'express';
import { SelectionsController } from '../controllers/selections.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

export const selectionsRouter = Router();

// All selection routes require authentication
selectionsRouter.use(requireAuth);

// GET /api/selections - Get user's saved selections
selectionsRouter.get('/', SelectionsController.getSelections);

// PUT /api/selections - Save user's selections (replace all)
selectionsRouter.put('/', SelectionsController.saveSelections);

// POST /api/selections/:appId - Add single selection
selectionsRouter.post('/:appId', SelectionsController.addSelection);

// DELETE /api/selections/:appId - Remove single selection
selectionsRouter.delete('/:appId', SelectionsController.removeSelection);

// DELETE /api/selections - Clear all selections
selectionsRouter.delete('/', SelectionsController.clearSelections);
