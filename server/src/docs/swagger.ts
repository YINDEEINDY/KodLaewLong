import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'KodLaewLong API',
      version: '1.0.0',
      description: `
## KodLaewLong - Software Installer API

API สำหรับระบบติดตั้งซอฟต์แวร์แบบ batch คล้าย Ninite

### Features
- 📦 Browse and select software applications
- 🔍 Search and filter by category/license type
- 📥 Generate installation scripts
- 📊 Build statistics and popular apps
- 👤 User authentication and selections persistence

### Authentication
บาง endpoints ต้องการ authentication ผ่าน Bearer token:
\`\`\`
Authorization: Bearer <your-jwt-token>
\`\`\`
      `,
      contact: {
        name: 'KodLaewLong Support',
      },
      license: {
        name: 'MIT',
      },
    },
    servers: [
      {
        url: '/api',
        description: 'API Server',
      },
    ],
    tags: [
      { name: 'Apps', description: 'Application management endpoints' },
      { name: 'Generate', description: 'Installer generation endpoints' },
      { name: 'Stats', description: 'Statistics and analytics endpoints' },
      { name: 'Selections', description: 'User selections endpoints' },
      { name: 'Admin', description: 'Admin management endpoints' },
      { name: 'Changelogs', description: 'App changelog endpoints' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT token from Supabase Auth',
        },
      },
      schemas: {
        App: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid', example: '550e8400-e29b-41d4-a716-446655440000' },
            name: { type: 'string', example: 'Google Chrome' },
            description: { type: 'string', example: 'Fast and secure web browser' },
            categoryId: { type: 'string', format: 'uuid' },
            categoryName: { type: 'string', example: 'Web Browsers' },
            iconUrl: { type: 'string', format: 'uri', example: 'https://example.com/chrome.png' },
            licenseType: {
              type: 'string',
              enum: ['FREE', 'PAID', 'FREEMIUM', 'TRIAL'],
              example: 'FREE',
            },
            appType: {
              type: 'string',
              enum: ['GENERAL', 'ENTERPRISE', 'MANUAL'],
              example: 'GENERAL',
            },
            officialUrl: { type: 'string', format: 'uri' },
            downloadUrl: { type: 'string', format: 'uri', nullable: true },
            hasInstallGuide: { type: 'boolean', example: false },
            installGuideSteps: {
              type: 'array',
              items: { type: 'string' },
              nullable: true,
            },
            notes: { type: 'string', nullable: true },
            version: { type: 'string', example: '120.0.0' },
            vendor: { type: 'string', example: 'Google' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        CategoryWithApps: {
          type: 'object',
          properties: {
            categoryId: { type: 'string', format: 'uuid' },
            categoryName: { type: 'string', example: 'Web Browsers' },
            apps: {
              type: 'array',
              items: { $ref: '#/components/schemas/App' },
            },
          },
        },
        GenerateRequest: {
          type: 'object',
          required: ['appIds'],
          properties: {
            appIds: {
              type: 'array',
              items: { type: 'string', format: 'uuid' },
              minItems: 1,
              maxItems: 50,
              example: ['550e8400-e29b-41d4-a716-446655440000'],
            },
          },
        },
        GenerateResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            downloadUrl: { type: 'string', format: 'uri' },
            buildId: { type: 'string', format: 'uuid' },
            timestamp: { type: 'string', format: 'date-time' },
            appCount: { type: 'integer', example: 5 },
          },
        },
        Error: {
          type: 'object',
          properties: {
            error: { type: 'string', example: 'Error message' },
          },
        },
        Category: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string', example: 'Web Browsers' },
            slug: { type: 'string', example: 'web-browsers' },
            displayOrder: { type: 'integer', example: 1 },
          },
        },
        BuildStats: {
          type: 'object',
          properties: {
            totalBuilds: { type: 'integer', example: 150 },
            totalDownloads: { type: 'integer', example: 120 },
            uniqueAppsSelected: { type: 'integer', example: 45 },
            recentBuilds: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  buildId: { type: 'string' },
                  appCount: { type: 'integer' },
                  createdAt: { type: 'string', format: 'date-time' },
                },
              },
            },
          },
        },
      },
    },
  },
  apis: ['./src/routes/*.ts', './src/controllers/*.ts'],
};

const swaggerSpec = swaggerJsdoc(options);

export function setupSwagger(app: Express): void {
  // Swagger UI
  app.use(
    '/api/docs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
      customCss: `
        .swagger-ui .topbar { display: none }
        .swagger-ui .info { margin: 20px 0 }
        .swagger-ui .info .title { color: #6366f1 }
      `,
      customSiteTitle: 'KodLaewLong API Documentation',
      customfavIcon: '/favicon.svg',
    })
  );

  // JSON spec endpoint
  app.get('/api/docs.json', (_req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });
}

export { swaggerSpec };
