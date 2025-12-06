// License type enum
export type LicenseType = 'FREE' | 'PAID' | 'FREEMIUM' | 'TRIAL';

// App type enum - for categorizing apps into tabs
export type AppType = 'GENERAL' | 'ENTERPRISE' | 'MANUAL';

// App entity
export interface App {
  id: string;
  name: string;
  category: string;
  description: string;
  iconUrl: string;
  licenseType: LicenseType;
  isPublicFree: boolean;
  officialWebsiteUrl: string;
  officialDownloadUrl?: string;
  isRecommended?: boolean;
  hasInstallGuide: boolean;
  installGuideTitle?: string;
  installGuideSteps?: string[];
  installNotes?: string;
  installerSourceUrl?: string;
  installerType?: string;
  silentArguments?: string;
  version?: string;
  vendor?: string;

  // App type classification
  appType: AppType;

  // Manual app specific fields
  manualDownloadUrl?: string;
  manualDownloadFileName?: string;

  // Winget package ID
  wingetId?: string;
}

// Category definition
export interface Category {
  name: string;
  slug: string;
  order: number;
}

// Category with apps (API response)
export interface CategoryWithApps {
  name: string;
  slug: string;
  apps: App[];
}

// Generate request
export interface GenerateRequest {
  appIds: string[];
}

// Generate response
export interface GenerateResponse {
  selectedApps: App[];
  generatedScript: string;
  downloadUrl: string;
  generatedAt: string;
  buildId: string;
}

// API responses
export interface AppsListResponse {
  categories: CategoryWithApps[];
}

export interface ErrorResponse {
  error: string;
  missing?: string[];
}
