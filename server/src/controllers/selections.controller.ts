import type { Request, Response } from 'express';
import { selectionsService } from '../services/selections.service.js';

export class SelectionsController {
  // GET /api/selections - Get user's saved selections
  static async getSelections(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ error: 'กรุณาเข้าสู่ระบบ' });
        return;
      }

      const appIds = await selectionsService.getUserSelections(userId);
      res.json({ appIds });
    } catch (error) {
      console.error('Error getting selections:', error);
      res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูล' });
    }
  }

  // PUT /api/selections - Save user's selections (replace all)
  static async saveSelections(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ error: 'กรุณาเข้าสู่ระบบ' });
        return;
      }

      const { appIds } = req.body;

      if (!Array.isArray(appIds)) {
        res.status(400).json({ error: 'appIds ต้องเป็น array' });
        return;
      }

      await selectionsService.saveUserSelections(userId, appIds);
      res.json({ success: true, message: 'บันทึกสำเร็จ' });
    } catch (error) {
      console.error('Error saving selections:', error);
      res.status(500).json({ error: 'เกิดข้อผิดพลาดในการบันทึก' });
    }
  }

  // POST /api/selections/:appId - Add single selection
  static async addSelection(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ error: 'กรุณาเข้าสู่ระบบ' });
        return;
      }

      const { appId } = req.params;

      await selectionsService.addSelection(userId, appId);
      res.json({ success: true, message: 'เพิ่มสำเร็จ' });
    } catch (error) {
      console.error('Error adding selection:', error);
      res.status(500).json({ error: 'เกิดข้อผิดพลาดในการเพิ่ม' });
    }
  }

  // DELETE /api/selections/:appId - Remove single selection
  static async removeSelection(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ error: 'กรุณาเข้าสู่ระบบ' });
        return;
      }

      const { appId } = req.params;

      await selectionsService.removeSelection(userId, appId);
      res.json({ success: true, message: 'ลบสำเร็จ' });
    } catch (error) {
      console.error('Error removing selection:', error);
      res.status(500).json({ error: 'เกิดข้อผิดพลาดในการลบ' });
    }
  }

  // DELETE /api/selections - Clear all selections
  static async clearSelections(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ error: 'กรุณาเข้าสู่ระบบ' });
        return;
      }

      await selectionsService.clearSelections(userId);
      res.json({ success: true, message: 'ล้างสำเร็จ' });
    } catch (error) {
      console.error('Error clearing selections:', error);
      res.status(500).json({ error: 'เกิดข้อผิดพลาดในการล้าง' });
    }
  }
}
