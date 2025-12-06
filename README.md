# KodLaewLong

Ninite-style software installer web application for Windows. Browse, select, and generate a combined installer for multiple applications.

## Features

- Browse software by category (Web Browsers, Messaging, Media, Developer Tools, Utilities, Security)
- Select multiple applications with visual feedback
- View detailed app information with installation guides
- Generate combined installer (mock for MVP)
- Thai language interface

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, React Router
- **Backend**: Node.js, Express, TypeScript

## Prerequisites

- Node.js 18+
- npm 9+

## Quick Start

### 1. Clone and Install

```bash
git clone <repo-url>
cd KodLaewLong

# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

### 2. Start Development Servers

Open two terminal windows:

**Terminal 1 - Backend (port 3001):**
```bash
cd server
npm run dev
```

**Terminal 2 - Frontend (port 5173):**
```bash
cd client
npm run dev
```

### 3. Open in Browser

Navigate to http://localhost:5173

## Project Structure

```
KodLaewLong/
├── client/                 # React frontend
│   ├── src/
│   │   ├── api/           # API client
│   │   ├── components/    # React components
│   │   ├── context/       # React Context (selection state)
│   │   ├── hooks/         # Custom hooks
│   │   ├── pages/         # Page components
│   │   └── types/         # TypeScript types
│   └── index.html
├── server/                 # Express backend
│   └── src/
│       ├── controllers/   # Request handlers
│       ├── data/          # Repository & seed data
│       ├── routes/        # API routes
│       ├── services/      # Business logic
│       └── types/         # TypeScript types
└── specs/                  # Feature specifications
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/apps | List all apps by category |
| GET | /api/apps/:id | Get single app details |
| POST | /api/generate | Generate installer |

## Available Scripts

### Backend (`server/`)

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Run production build

### Frontend (`client/`)

- `npm run dev` - Start Vite development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## License Types

- **FREE**: Completely free software
- **FREEMIUM**: Free with paid features
- **PAID**: Requires purchase
- **TRIAL**: Time-limited trial

## Notes

- The installer generation is mocked for MVP
- All UI text is in Thai
- CORS is configured for localhost development
