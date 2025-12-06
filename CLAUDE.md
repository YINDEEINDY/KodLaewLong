# yinde Development Guidelines

Auto-generated from all feature plans. Last updated: 2025-11-30

## Active Technologies

- TypeScript 5.3+ (both frontend and backend) (001-app-picker-webapp)
- React 18+ (001-app-picker-webapp)
- Tailwind CSS 3.x (001-app-picker-webapp)
- Vite 5.x (001-app-picker-webapp)
- Node.js + Express 4.x (001-app-picker-webapp)

## Project Structure

```text
client/                    # React frontend
  src/
    components/            # React components
    hooks/                 # Custom hooks
    api/                   # API client utilities
    types/                 # TypeScript types
server/                    # Express backend
  src/
    routes/                # Express routes
    controllers/           # Request handlers
    services/              # Business logic
    data/                  # Repository & seed data
    types/                 # TypeScript types
specs/                     # Feature specifications
```

## Commands

```bash
# Development
cd server && npm run dev   # Start backend (port 3001)
cd client && npm run dev   # Start frontend (port 5173)

# Production build
cd server && npm run build && npm start
cd client && npm run build && npm run preview

# Testing
npm test && npm run lint
```

## Code Style

- TypeScript 5.3+ (both frontend and backend): Follow standard conventions
- React: Functional components with hooks
- Backend: routes/controllers/services/data layer separation
- Use repository pattern for data access abstraction

## Recent Changes

- 001-app-picker-webapp: Full-stack app picker with React + Express

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
