# Quickstart: KodLaewLong

**Feature Branch**: `001-app-picker-webapp`
**Date**: 2025-11-30

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Git (for version control)

## Project Setup

### 1. Clone and Navigate

```bash
git clone <repository-url>
cd KodLaewLong
git checkout 001-app-picker-webapp
```

### 2. Install Dependencies

**Backend:**
```bash
cd server
npm install
```

**Frontend:**
```bash
cd client
npm install
```

### 3. Run Development Servers

**Backend (Terminal 1):**
```bash
cd server
npm run dev
# Server runs at http://localhost:3001
```

**Frontend (Terminal 2):**
```bash
cd client
npm run dev
# App runs at http://localhost:5173
```

### 4. Open the Application

Navigate to [http://localhost:5173](http://localhost:5173) in your browser.

---

## Project Structure Overview

```
KodLaewLong/
├── client/           # React frontend (Vite + TypeScript + Tailwind)
├── server/           # Express backend (TypeScript)
├── specs/            # Feature specifications
│   └── 001-app-picker-webapp/
│       ├── spec.md
│       ├── plan.md
│       ├── research.md
│       ├── data-model.md
│       ├── quickstart.md (this file)
│       └── contracts/
│           └── api.yaml
└── README.md
```

---

## Available Scripts

### Backend (server/)

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Compile TypeScript to JavaScript |
| `npm start` | Run compiled production server |
| `npm test` | Run tests |

### Frontend (client/)

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
| `npm test` | Run tests |

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/apps` | List all apps grouped by category |
| GET | `/api/apps/:id` | Get single app details |
| POST | `/api/generate` | Generate installer package |

See [contracts/api.yaml](./contracts/api.yaml) for full OpenAPI specification.

---

## User Flow

1. **Browse Apps**: User sees categorized list of applications
2. **Select Apps**: User checks applications they want to install
3. **Review**: User navigates to summary page to review selections
4. **Generate**: User clicks to generate installer
5. **Download**: User receives download link for mock installer

---

## Environment Variables

### Backend (server/)

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3001` | Server port |
| `BASE_DOWNLOAD_URL` | `https://kodlaewlong.example.com/download` | Base URL for download links |

### Frontend (client/)

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_URL` | `http://localhost:3001/api` | Backend API base URL |

---

## Technology Stack

### Frontend
- **Framework**: React 18+
- **Build Tool**: Vite 5.x
- **Styling**: Tailwind CSS 3.x
- **Routing**: React Router v6
- **Language**: TypeScript 5.3+

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express 4.x
- **Language**: TypeScript 5.3+
- **Data Storage**: In-memory (extensible to database)

---

## Common Development Tasks

### Adding a New Application

1. Edit `server/src/data/apps.seed.ts`
2. Add new App object to the apps array
3. Ensure category matches existing category slugs
4. Restart backend server

### Adding a New Category

1. Edit `server/src/data/apps.seed.ts`
2. Add new category to CATEGORIES array
3. Update any apps to use new category
4. Restart backend server

### Modifying API Response

1. Update types in `server/src/types/index.ts`
2. Update controller in `server/src/controllers/apps.controller.ts`
3. Update corresponding frontend types
4. Update API client if needed

---

## Troubleshooting

### CORS Errors

Ensure backend CORS is configured for frontend origin:
```typescript
// server/src/index.ts
app.use(cors({
  origin: 'http://localhost:5173'
}));
```

### Port Already in Use

Change port in environment or kill existing process:
```bash
# Find process on port 3001
npx kill-port 3001
```

### TypeScript Errors

Ensure both projects have matching TypeScript versions:
```bash
npm install typescript@5.3 --save-dev
```
