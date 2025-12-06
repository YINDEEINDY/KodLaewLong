import type { Request, Response } from 'express';
import archiver from 'archiver';
import { appsService } from '../services/apps.service.js';
import { generateService, isValidBuildId } from '../services/generate.service.js';
import type { AppsListResponse, AppType, ErrorResponse, GenerateRequest } from '../types/index.js';

const VALID_APP_TYPES: AppType[] = ['GENERAL', 'ENTERPRISE', 'MANUAL'];

export class AppsController {
  // GET /api/apps - List all apps grouped by category
  // Optional query param: ?type=GENERAL|ENTERPRISE|MANUAL
  static async getApps(req: Request, res: Response<AppsListResponse>): Promise<void> {
    try {
      const { type } = req.query;

      let categories;
      if (type && VALID_APP_TYPES.includes(type as AppType)) {
        categories = await appsService.getAppsByCategoryAndType(type as AppType);
      } else {
        categories = await appsService.getAppsByCategory();
      }

      res.json({ categories });
    } catch (error) {
      console.error('Error fetching apps:', error);
      res.status(500).json({ categories: [] });
    }
  }

  // GET /api/apps/:id - Get single app by ID
  static async getAppById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const app = await appsService.getAppById(id);

      if (!app) {
        const errorResponse: ErrorResponse = { error: `App not found: ${id}` };
        res.status(404).json(errorResponse);
        return;
      }

      res.json(app);
    } catch (error) {
      console.error('Error fetching app:', error);
      res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูล' });
    }
  }

  // POST /api/generate - Generate installer
  static async generate(req: Request<object, object, GenerateRequest>, res: Response): Promise<void> {
    try {
      const { appIds } = req.body;
      const result = await generateService.generateInstallerAsync(appIds);

      if (!result.success) {
        res.status(result.status).json(result.error);
        return;
      }

      res.json(result.data);
    } catch (error) {
      console.error('Error generating installer:', error);
      res.status(500).json({ error: 'เกิดข้อผิดพลาดในการสร้าง installer' });
    }
  }

  // GET /api/downloads/:buildId - Download installer
  static download(req: Request, res: Response): void {
    const { buildId } = req.params;

    // Validate buildId format to prevent path traversal
    if (!buildId || !isValidBuildId(buildId)) {
      res.status(400).json({ error: 'รหัสไฟล์ไม่ถูกต้อง' });
      return;
    }

    const buildPath = generateService.getBuildPath(buildId);

    if (!buildPath) {
      res.status(404).json({ error: 'ไม่พบไฟล์ที่ต้องการดาวน์โหลด' });
      return;
    }

    // Check if EXE exists (preferred)
    const exePath = generateService.getExePath(buildId);
    if (exePath) {
      // Send EXE file directly
      res.setHeader('Content-Type', 'application/octet-stream');
      res.setHeader('Content-Disposition', `attachment; filename="KodLaewLong-Installer.exe"`);
      res.sendFile(exePath);
      return;
    }

    // Fallback: Send as ZIP
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="KodLaewLong-Installer-${buildId.slice(0, 8)}.zip"`);

    // Create zip archive and pipe to response
    const archive = archiver('zip', { zlib: { level: 9 } });

    archive.on('error', (err) => {
      console.error('Archive error:', err);
      res.status(500).json({ error: 'เกิดข้อผิดพลาดในการสร้างไฟล์' });
    });

    archive.pipe(res);

    // Add the build directory contents to the zip
    archive.directory(buildPath, 'KodLaewLong-Installer');

    archive.finalize();
  }
}
