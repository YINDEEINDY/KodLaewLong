import type { Request, Response } from 'express';
import * as adminRepo from '../data/admin.repository.js';
import type { NewApp, NewCategory, NewAppChangelog } from '../db/schema.js';

// Helper function to convert multi-line string to JSON array
function parseInstallGuideSteps(input: string | null | undefined): string | null {
  if (!input || typeof input !== 'string' || input.trim() === '') {
    return null;
  }

  // If it's already a valid JSON array, return as-is
  try {
    const parsed = JSON.parse(input);
    if (Array.isArray(parsed)) {
      return input;
    }
  } catch {
    // Not JSON, treat as multi-line string
  }

  // Convert multi-line string to JSON array
  const steps = input
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);

  return steps.length > 0 ? JSON.stringify(steps) : null;
}

// Helper function to convert JSON array back to multi-line string for form
function formatInstallGuideStepsForForm(input: string | null | undefined): string {
  if (!input) return '';

  try {
    const parsed = JSON.parse(input);
    if (Array.isArray(parsed)) {
      return parsed.join('\n');
    }
  } catch {
    // If it's not valid JSON, return as-is (might be already a multi-line string)
    return input;
  }

  return input;
}

export class AdminController {
  // ==================== APPS ====================

  // GET /api/admin/apps - List all apps (raw format for admin)
  static async getApps(_req: Request, res: Response): Promise<void> {
    try {
      const apps = await adminRepo.getAllAppsRaw();
      // Format installGuideSteps for form display
      const formattedApps = apps.map(app => ({
        ...app,
        installGuideSteps: formatInstallGuideStepsForForm(app.installGuideSteps),
      }));
      res.json({ apps: formattedApps });
    } catch (error) {
      console.error('Error fetching apps:', error);
      res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูล' });
    }
  }

  // GET /api/admin/apps/:id - Get single app
  static async getAppById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const app = await adminRepo.getAppByIdRaw(id);

      if (!app) {
        res.status(404).json({ error: 'ไม่พบแอปที่ต้องการ' });
        return;
      }

      // Format installGuideSteps for form display
      res.json({
        ...app,
        installGuideSteps: formatInstallGuideStepsForForm(app.installGuideSteps),
      });
    } catch (error) {
      console.error('Error fetching app:', error);
      res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูล' });
    }
  }

  // POST /api/admin/apps - Create new app
  static async createApp(req: Request, res: Response): Promise<void> {
    try {
      const appData: NewApp = req.body;

      // Basic validation
      if (!appData.id || !appData.name || !appData.categoryId || !appData.description) {
        res.status(400).json({ error: 'กรุณากรอกข้อมูลที่จำเป็น (id, name, categoryId, description)' });
        return;
      }

      // Check if app ID already exists
      const existing = await adminRepo.getAppByIdRaw(appData.id);
      if (existing) {
        res.status(400).json({ error: 'รหัสแอปนี้มีอยู่แล้ว' });
        return;
      }

      // Parse installGuideSteps from multi-line string to JSON array
      const processedData: NewApp = {
        ...appData,
        installGuideSteps: parseInstallGuideSteps(appData.installGuideSteps as string),
      };

      const app = await adminRepo.createApp(processedData);
      // Return with formatted steps for form
      res.status(201).json({
        ...app,
        installGuideSteps: formatInstallGuideStepsForForm(app.installGuideSteps),
      });
    } catch (error) {
      console.error('Error creating app:', error);
      res.status(500).json({ error: 'เกิดข้อผิดพลาดในการสร้างแอป' });
    }
  }

  // PUT /api/admin/apps/:id - Update app
  static async updateApp(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updateData: Partial<NewApp> = req.body;

      // Don't allow changing the ID
      delete updateData.id;

      // Parse installGuideSteps from multi-line string to JSON array if provided
      if ('installGuideSteps' in updateData) {
        updateData.installGuideSteps = parseInstallGuideSteps(updateData.installGuideSteps as string);
      }

      const app = await adminRepo.updateApp(id, updateData);

      if (!app) {
        res.status(404).json({ error: 'ไม่พบแอปที่ต้องการแก้ไข' });
        return;
      }

      // Return with formatted steps for form
      res.json({
        ...app,
        installGuideSteps: formatInstallGuideStepsForForm(app.installGuideSteps),
      });
    } catch (error) {
      console.error('Error updating app:', error);
      res.status(500).json({ error: 'เกิดข้อผิดพลาดในการแก้ไขแอป' });
    }
  }

  // DELETE /api/admin/apps/:id - Delete app
  static async deleteApp(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const deleted = await adminRepo.deleteApp(id);

      if (!deleted) {
        res.status(404).json({ error: 'ไม่พบแอปที่ต้องการลบ' });
        return;
      }

      res.json({ success: true, message: 'ลบแอปสำเร็จ' });
    } catch (error) {
      console.error('Error deleting app:', error);
      res.status(500).json({ error: 'เกิดข้อผิดพลาดในการลบแอป' });
    }
  }

  // ==================== CATEGORIES ====================

  // GET /api/admin/categories - List all categories
  static async getCategories(_req: Request, res: Response): Promise<void> {
    try {
      const categories = await adminRepo.getAllCategories();
      res.json({ categories });
    } catch (error) {
      console.error('Error fetching categories:', error);
      res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูล' });
    }
  }

  // GET /api/admin/categories/:id - Get single category
  static async getCategoryById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const category = await adminRepo.getCategoryById(id);

      if (!category) {
        res.status(404).json({ error: 'ไม่พบหมวดหมู่ที่ต้องการ' });
        return;
      }

      res.json(category);
    } catch (error) {
      console.error('Error fetching category:', error);
      res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูล' });
    }
  }

  // POST /api/admin/categories - Create new category
  static async createCategory(req: Request, res: Response): Promise<void> {
    try {
      const categoryData: NewCategory = req.body;

      // Basic validation
      if (!categoryData.id || !categoryData.name || !categoryData.slug) {
        res.status(400).json({ error: 'กรุณากรอกข้อมูลที่จำเป็น (id, name, slug)' });
        return;
      }

      // Check if category ID already exists
      const existing = await adminRepo.getCategoryById(categoryData.id);
      if (existing) {
        res.status(400).json({ error: 'รหัสหมวดหมู่นี้มีอยู่แล้ว' });
        return;
      }

      const category = await adminRepo.createCategory(categoryData);
      res.status(201).json(category);
    } catch (error) {
      console.error('Error creating category:', error);
      res.status(500).json({ error: 'เกิดข้อผิดพลาดในการสร้างหมวดหมู่' });
    }
  }

  // PUT /api/admin/categories/:id - Update category
  static async updateCategory(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updateData: Partial<NewCategory> = req.body;

      // Don't allow changing the ID
      delete updateData.id;

      const category = await adminRepo.updateCategory(id, updateData);

      if (!category) {
        res.status(404).json({ error: 'ไม่พบหมวดหมู่ที่ต้องการแก้ไข' });
        return;
      }

      res.json(category);
    } catch (error) {
      console.error('Error updating category:', error);
      res.status(500).json({ error: 'เกิดข้อผิดพลาดในการแก้ไขหมวดหมู่' });
    }
  }

  // DELETE /api/admin/categories/:id - Delete category
  static async deleteCategory(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const deleted = await adminRepo.deleteCategory(id);

      if (!deleted) {
        res.status(404).json({ error: 'ไม่พบหมวดหมู่ที่ต้องการลบ' });
        return;
      }

      res.json({ success: true, message: 'ลบหมวดหมู่สำเร็จ' });
    } catch (error: unknown) {
      console.error('Error deleting category:', error);
      if (error instanceof Error && error.message.includes('มีแอป')) {
        res.status(400).json({ error: error.message });
        return;
      }
      res.status(500).json({ error: 'เกิดข้อผิดพลาดในการลบหมวดหมู่' });
    }
  }

  // ==================== DASHBOARD ====================

  // GET /api/admin/stats - Get dashboard statistics
  static async getStats(_req: Request, res: Response): Promise<void> {
    try {
      const stats = await adminRepo.getDashboardStats();
      res.json(stats);
    } catch (error) {
      console.error('Error fetching stats:', error);
      res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูลสถิติ' });
    }
  }

  // ==================== USERS ====================

  // GET /api/admin/users - List all users
  static async getUsers(_req: Request, res: Response): Promise<void> {
    try {
      const users = await adminRepo.getAllUsers();
      res.json({ users });
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้' });
    }
  }

  // PUT /api/admin/users/:id/role - Update user role
  static async updateUserRole(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { role } = req.body;

      // Validate role
      if (!role || !['user', 'admin'].includes(role)) {
        res.status(400).json({ error: 'Role ต้องเป็น "user" หรือ "admin"' });
        return;
      }

      // Prevent self-demotion
      if (req.user?.id === id && role !== 'admin') {
        res.status(400).json({ error: 'ไม่สามารถลด role ของตัวเองได้' });
        return;
      }

      await adminRepo.updateUserRole(id, role);
      res.json({ success: true, message: 'อัพเดท role สำเร็จ' });
    } catch (error) {
      console.error('Error updating user role:', error);
      res.status(500).json({ error: 'เกิดข้อผิดพลาดในการอัพเดท role' });
    }
  }

  // DELETE /api/admin/users/:id - Delete user
  static async deleteUser(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      // Prevent self-deletion
      if (req.user?.id === id) {
        res.status(400).json({ error: 'ไม่สามารถลบบัญชีของตัวเองได้' });
        return;
      }

      await adminRepo.deleteUser(id);
      res.json({ success: true, message: 'ลบผู้ใช้สำเร็จ' });
    } catch (error) {
      console.error('Error deleting user:', error);
      res.status(500).json({ error: 'เกิดข้อผิดพลาดในการลบผู้ใช้' });
    }
  }

  // ==================== CHANGELOGS ====================

  // GET /api/admin/changelogs - List all changelogs
  static async getChangelogs(_req: Request, res: Response): Promise<void> {
    try {
      const changelogs = await adminRepo.getAllChangelogs();
      res.json({ changelogs });
    } catch (error) {
      console.error('Error fetching changelogs:', error);
      res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูล changelog' });
    }
  }

  // GET /api/admin/changelogs/:id - Get single changelog
  static async getChangelogById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const changelog = await adminRepo.getChangelogById(id);

      if (!changelog) {
        res.status(404).json({ error: 'ไม่พบ changelog ที่ต้องการ' });
        return;
      }

      res.json(changelog);
    } catch (error) {
      console.error('Error fetching changelog:', error);
      res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูล' });
    }
  }

  // GET /api/admin/apps/:appId/changelogs - Get changelogs for an app
  static async getChangelogsByAppId(req: Request, res: Response): Promise<void> {
    try {
      const { appId } = req.params;
      const changelogs = await adminRepo.getChangelogsByAppId(appId);
      res.json({ changelogs });
    } catch (error) {
      console.error('Error fetching changelogs:', error);
      res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูล changelog' });
    }
  }

  // POST /api/admin/changelogs - Create new changelog
  static async createChangelog(req: Request, res: Response): Promise<void> {
    try {
      const changelogData: NewAppChangelog = req.body;

      // Basic validation
      if (!changelogData.appId || !changelogData.version || !changelogData.title || !changelogData.releaseDate) {
        res.status(400).json({ error: 'กรุณากรอกข้อมูลที่จำเป็น (appId, version, title, releaseDate)' });
        return;
      }

      // Convert releaseDate string to Date
      const processedData: NewAppChangelog = {
        ...changelogData,
        releaseDate: new Date(changelogData.releaseDate),
      };

      const changelog = await adminRepo.createChangelog(processedData);
      res.status(201).json(changelog);
    } catch (error) {
      console.error('Error creating changelog:', error);
      res.status(500).json({ error: 'เกิดข้อผิดพลาดในการสร้าง changelog' });
    }
  }

  // PUT /api/admin/changelogs/:id - Update changelog
  static async updateChangelog(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updateData: Partial<NewAppChangelog> = req.body;

      // Don't allow changing the ID
      delete (updateData as { id?: string }).id;

      // Convert releaseDate string to Date if provided
      if (updateData.releaseDate) {
        updateData.releaseDate = new Date(updateData.releaseDate);
      }

      const changelog = await adminRepo.updateChangelog(id, updateData);

      if (!changelog) {
        res.status(404).json({ error: 'ไม่พบ changelog ที่ต้องการแก้ไข' });
        return;
      }

      res.json(changelog);
    } catch (error) {
      console.error('Error updating changelog:', error);
      res.status(500).json({ error: 'เกิดข้อผิดพลาดในการแก้ไข changelog' });
    }
  }

  // DELETE /api/admin/changelogs/:id - Delete changelog
  static async deleteChangelog(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const deleted = await adminRepo.deleteChangelog(id);

      if (!deleted) {
        res.status(404).json({ error: 'ไม่พบ changelog ที่ต้องการลบ' });
        return;
      }

      res.json({ success: true, message: 'ลบ changelog สำเร็จ' });
    } catch (error) {
      console.error('Error deleting changelog:', error);
      res.status(500).json({ error: 'เกิดข้อผิดพลาดในการลบ changelog' });
    }
  }
}
