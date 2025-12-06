import { pgTable, varchar, text, boolean, integer, timestamp, pgEnum, uuid, primaryKey } from 'drizzle-orm/pg-core';

// Enums
export const licenseTypeEnum = pgEnum('license_type', ['FREE', 'PAID', 'FREEMIUM', 'TRIAL']);
export const appTypeEnum = pgEnum('app_type', ['GENERAL', 'ENTERPRISE', 'MANUAL']);

// Categories table
export const categories = pgTable('categories', {
  id: varchar('id', { length: 50 }).primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  slug: varchar('slug', { length: 100 }).notNull().unique(),
  order: integer('order').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Apps table
export const apps = pgTable('apps', {
  id: varchar('id', { length: 50 }).primaryKey(),
  name: varchar('name', { length: 200 }).notNull(),
  categoryId: varchar('category_id', { length: 50 }).notNull().references(() => categories.id),
  description: text('description').notNull(),
  iconUrl: varchar('icon_url', { length: 500 }).notNull(),
  licenseType: licenseTypeEnum('license_type').notNull().default('FREE'),
  appType: appTypeEnum('app_type').notNull().default('GENERAL'),
  isPublicFree: boolean('is_public_free').notNull().default(true),
  officialWebsiteUrl: varchar('official_website_url', { length: 500 }).notNull(),
  officialDownloadUrl: varchar('official_download_url', { length: 500 }),
  isRecommended: boolean('is_recommended').default(false),
  hasInstallGuide: boolean('has_install_guide').notNull().default(false),
  installGuideTitle: varchar('install_guide_title', { length: 200 }),
  installGuideSteps: text('install_guide_steps'), // JSON array stored as text
  installNotes: text('install_notes'),
  installerSourceUrl: varchar('installer_source_url', { length: 500 }),
  installerType: varchar('installer_type', { length: 20 }),
  silentArguments: varchar('silent_arguments', { length: 500 }),
  version: varchar('version', { length: 50 }),
  vendor: varchar('vendor', { length: 200 }),
  manualDownloadUrl: varchar('manual_download_url', { length: 500 }),
  manualDownloadFileName: varchar('manual_download_file_name', { length: 200 }),
  wingetId: varchar('winget_id', { length: 100 }), // Windows Package Manager ID
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// User selections table - stores which apps a user has selected
export const userSelections = pgTable('user_selections', {
  userId: uuid('user_id').notNull(),
  appId: varchar('app_id', { length: 50 }).notNull().references(() => apps.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  pk: primaryKey({ columns: [table.userId, table.appId] }),
}));

// Build statistics table - tracks each generated installer build
export const buildStats = pgTable('build_stats', {
  id: uuid('id').defaultRandom().primaryKey(),
  buildId: varchar('build_id', { length: 50 }).notNull().unique(),
  appCount: integer('app_count').notNull(),
  downloadCount: integer('download_count').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  lastDownloadAt: timestamp('last_download_at'),
});

// Build apps junction table - tracks which apps were in each build
export const buildApps = pgTable('build_apps', {
  buildId: varchar('build_id', { length: 50 }).notNull(),
  appId: varchar('app_id', { length: 50 }).notNull().references(() => apps.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  pk: primaryKey({ columns: [table.buildId, table.appId] }),
}));

// App statistics table - aggregated selection counts per app
export const appStats = pgTable('app_stats', {
  appId: varchar('app_id', { length: 50 }).primaryKey().references(() => apps.id, { onDelete: 'cascade' }),
  selectionCount: integer('selection_count').notNull().default(0),
  downloadCount: integer('download_count').notNull().default(0),
  lastSelectedAt: timestamp('last_selected_at'),
  lastDownloadedAt: timestamp('last_downloaded_at'),
});

// Type exports for TypeScript
export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;
export type App = typeof apps.$inferSelect;
export type NewApp = typeof apps.$inferInsert;
export type UserSelection = typeof userSelections.$inferSelect;
export type NewUserSelection = typeof userSelections.$inferInsert;
export type BuildStat = typeof buildStats.$inferSelect;
export type NewBuildStat = typeof buildStats.$inferInsert;
export type BuildApp = typeof buildApps.$inferSelect;
export type NewBuildApp = typeof buildApps.$inferInsert;
export type AppStat = typeof appStats.$inferSelect;
export type NewAppStat = typeof appStats.$inferInsert;
