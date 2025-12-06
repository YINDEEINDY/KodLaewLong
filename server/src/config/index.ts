import dotenv from 'dotenv';
import path from 'path';

// Load .env file
dotenv.config({ path: path.join(process.cwd(), '.env') });

export const config = {
  // Server
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  isDevelopment: process.env.NODE_ENV !== 'production',
  isProduction: process.env.NODE_ENV === 'production',

  // CORS
  corsOrigins: (process.env.CORS_ORIGINS || 'http://localhost:5173')
    .split(',')
    .map(origin => origin.trim()),

  // Rate Limiting
  rateLimit: {
    max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
    windowMinutes: parseInt(process.env.RATE_LIMIT_WINDOW_MINUTES || '15', 10),
  },

  // Build Configuration
  build: {
    maxAppsPerBuild: parseInt(process.env.MAX_APPS_PER_BUILD || '50', 10),
    retentionHours: parseInt(process.env.BUILD_RETENTION_HOURS || '24', 10),
  },
} as const;

export type Config = typeof config;
