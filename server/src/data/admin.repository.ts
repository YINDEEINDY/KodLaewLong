import { eq, asc, desc, count } from 'drizzle-orm';
import { db } from '../db/index.js';
import { apps, categories, userSelections, appChangelogs, auditLogs, type App as DbApp, type Category as DbCategory, type NewApp, type NewCategory, type AppChangelog as DbAppChangelog, type NewAppChangelog, type AuditLog as DbAuditLog, type NewAuditLog } from '../db/schema.js';
import { supabaseAdmin } from '../lib/supabase.js';

// Apps CRUD
export async function createApp(data: NewApp): Promise<DbApp> {
  const result = await db.insert(apps).values(data).returning();
  return result[0];
}

export async function updateApp(id: string, data: Partial<NewApp>): Promise<DbApp | null> {
  const result = await db
    .update(apps)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(apps.id, id))
    .returning();
  return result[0] || null;
}

export async function deleteApp(id: string): Promise<boolean> {
  const result = await db.delete(apps).where(eq(apps.id, id)).returning();
  return result.length > 0;
}

export async function getAllAppsRaw(): Promise<DbApp[]> {
  return await db.select().from(apps).orderBy(asc(apps.name));
}

export async function getAppByIdRaw(id: string): Promise<DbApp | null> {
  const result = await db.select().from(apps).where(eq(apps.id, id)).limit(1);
  return result[0] || null;
}

// Categories CRUD
export async function createCategory(data: NewCategory): Promise<DbCategory> {
  const result = await db.insert(categories).values(data).returning();
  return result[0];
}

export async function updateCategory(id: string, data: Partial<NewCategory>): Promise<DbCategory | null> {
  const result = await db
    .update(categories)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(categories.id, id))
    .returning();
  return result[0] || null;
}

export async function deleteCategory(id: string): Promise<boolean> {
  // Check if category has apps
  const appsInCategory = await db.select().from(apps).where(eq(apps.categoryId, id)).limit(1);
  if (appsInCategory.length > 0) {
    throw new Error('ไม่สามารถลบหมวดหมู่ที่มีแอปอยู่');
  }

  const result = await db.delete(categories).where(eq(categories.id, id)).returning();
  return result.length > 0;
}

export async function getAllCategories(): Promise<DbCategory[]> {
  return await db.select().from(categories).orderBy(asc(categories.order));
}

export async function getCategoryById(id: string): Promise<DbCategory | null> {
  const result = await db.select().from(categories).where(eq(categories.id, id)).limit(1);
  return result[0] || null;
}

// Dashboard Stats
export interface DashboardStats {
  totalApps: number;
  totalCategories: number;
  totalSelections: number;
  appsByCategory: { categoryName: string; count: number }[];
  popularApps: { appId: string; appName: string; selectionCount: number }[];
}

export async function getDashboardStats(): Promise<DashboardStats> {
  // Get counts
  const [appsCount] = await db.select({ count: count() }).from(apps);
  const [categoriesCount] = await db.select({ count: count() }).from(categories);
  const [selectionsCount] = await db.select({ count: count() }).from(userSelections);

  // Apps by category
  const allCategories = await db.select().from(categories).orderBy(asc(categories.order));
  const allApps = await db.select().from(apps);

  const appsByCategory = allCategories.map((cat) => ({
    categoryName: cat.name,
    count: allApps.filter((app) => app.categoryId === cat.id).length,
  }));

  // Popular apps (most selected)
  const allSelections = await db.select().from(userSelections);
  const selectionCounts = new Map<string, number>();
  allSelections.forEach((sel) => {
    selectionCounts.set(sel.appId, (selectionCounts.get(sel.appId) || 0) + 1);
  });

  const popularApps = Array.from(selectionCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([appId, selectionCount]) => {
      const app = allApps.find((a) => a.id === appId);
      return {
        appId,
        appName: app?.name || 'Unknown',
        selectionCount,
      };
    });

  return {
    totalApps: appsCount.count,
    totalCategories: categoriesCount.count,
    totalSelections: selectionsCount.count,
    appsByCategory,
    popularApps,
  };
}

// User Management
export interface UserInfo {
  id: string;
  email: string;
  role: 'user' | 'admin';
  createdAt: string;
  lastSignIn: string | null;
}

export async function getAllUsers(): Promise<UserInfo[]> {
  const { data, error } = await supabaseAdmin.auth.admin.listUsers();

  if (error) {
    throw new Error(`Failed to fetch users: ${error.message}`);
  }

  return data.users.map((user) => ({
    id: user.id,
    email: user.email || '',
    role: (user.user_metadata?.role as 'user' | 'admin') || 'user',
    createdAt: user.created_at,
    lastSignIn: user.last_sign_in_at || null,
  }));
}

export async function updateUserRole(userId: string, role: 'user' | 'admin'): Promise<void> {
  const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
    user_metadata: { role },
  });

  if (error) {
    throw new Error(`Failed to update user role: ${error.message}`);
  }
}

export async function deleteUser(userId: string): Promise<void> {
  // First, delete user's selections from database
  await db.delete(userSelections).where(eq(userSelections.userId, userId));

  // Then, delete user from Supabase Auth
  const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);

  if (error) {
    throw new Error(`Failed to delete user: ${error.message}`);
  }
}

// App Changelogs CRUD
export async function createChangelog(data: NewAppChangelog): Promise<DbAppChangelog> {
  const result = await db.insert(appChangelogs).values(data).returning();
  return result[0];
}

export async function updateChangelog(id: string, data: Partial<NewAppChangelog>): Promise<DbAppChangelog | null> {
  const result = await db
    .update(appChangelogs)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(appChangelogs.id, id))
    .returning();
  return result[0] || null;
}

export async function deleteChangelog(id: string): Promise<boolean> {
  const result = await db.delete(appChangelogs).where(eq(appChangelogs.id, id)).returning();
  return result.length > 0;
}

export async function getChangelogById(id: string): Promise<DbAppChangelog | null> {
  const result = await db.select().from(appChangelogs).where(eq(appChangelogs.id, id)).limit(1);
  return result[0] || null;
}

export async function getChangelogsByAppId(appId: string): Promise<DbAppChangelog[]> {
  return await db
    .select()
    .from(appChangelogs)
    .where(eq(appChangelogs.appId, appId))
    .orderBy(desc(appChangelogs.releaseDate));
}

export async function getAllChangelogs(): Promise<(DbAppChangelog & { appName: string })[]> {
  const changelogs = await db
    .select()
    .from(appChangelogs)
    .orderBy(desc(appChangelogs.releaseDate));

  const allApps = await db.select().from(apps);
  const appMap = new Map(allApps.map(app => [app.id, app.name]));

  return changelogs.map(changelog => ({
    ...changelog,
    appName: appMap.get(changelog.appId) || 'Unknown',
  }));
}

// Audit Logs
export interface AuditLogEntry {
  action: string;
  entityType: string;
  entityId?: string;
  entityName?: string;
  userId: string;
  userEmail: string;
  details?: string;
}

export async function createAuditLog(entry: AuditLogEntry): Promise<DbAuditLog> {
  const result = await db.insert(auditLogs).values(entry).returning();
  return result[0];
}

export async function getAuditLogs(limit: number = 100): Promise<DbAuditLog[]> {
  return await db
    .select()
    .from(auditLogs)
    .orderBy(desc(auditLogs.createdAt))
    .limit(limit);
}
