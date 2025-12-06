import type { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../lib/supabase.js';

export type UserRole = 'user' | 'admin';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email?: string;
        role: UserRole;
      };
    }
  }
}

// Middleware to require authentication
export async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'กรุณาเข้าสู่ระบบ' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const user = await verifyToken(token);

    if (!user) {
      res.status(401).json({ error: 'Token ไม่ถูกต้องหรือหมดอายุ' });
      return;
    }

    // Get role from user metadata, default to 'user'
    const role = (user.user_metadata?.role as UserRole) || 'user';

    req.user = {
      id: user.id,
      email: user.email,
      role,
    };

    next();
  } catch (error) {
    console.error('Auth error:', error);
    res.status(401).json({ error: 'เกิดข้อผิดพลาดในการตรวจสอบสิทธิ์' });
  }
}

// Middleware to require admin role (must be used after requireAuth)
export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({ error: 'กรุณาเข้าสู่ระบบ' });
    return;
  }

  if (req.user.role !== 'admin') {
    res.status(403).json({ error: 'คุณไม่มีสิทธิ์เข้าถึงส่วนนี้' });
    return;
  }

  next();
}

// Optional auth - attaches user if token exists, but doesn't require it
export async function optionalAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];

    try {
      const user = await verifyToken(token);
      if (user) {
        const role = (user.user_metadata?.role as UserRole) || 'user';
        req.user = {
          id: user.id,
          email: user.email,
          role,
        };
      }
    } catch (error) {
      // Ignore errors for optional auth
    }
  }

  next();
}
