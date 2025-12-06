# KodLaewLong

Ninite-style software installer web application for Windows. Browse, select, and generate a combined installer for multiple applications.

## Features

- Browse software by category (Web Browsers, Messaging, Media, Developer Tools, Utilities, Security)
- Select multiple applications with visual feedback
- View detailed app information with installation guides
- Generate combined installer (mock for MVP)
- User authentication (register, login, logout)
- Persistent user selections across sessions
- Admin panel for managing apps, categories, and users
- Thai language interface

## Tech Stack

### Frontend
- React 18 + TypeScript
- Vite 5
- Tailwind CSS 3
- React Router 6
- Supabase Auth Client

### Backend
- Node.js + Express 4
- TypeScript
- Drizzle ORM
- Supabase (PostgreSQL + Auth)
- Helmet (security headers)
- Rate limiting

### Infrastructure
- Docker + Docker Compose
- GitHub Actions CI/CD
- Nginx (production)

## Prerequisites

- Node.js 20+
- npm 9+
- Docker Desktop (for containerized deployment)
- Supabase account (free tier available)

## Quick Start

### 1. Clone and Install

```bash
git clone https://github.com/YINDEEINDY/KodLaewLong.git
cd KodLaewLong

# Install backend dependencies
cd server && npm install

# Install frontend dependencies
cd ../client && npm install
```

### 2. Setup Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **Settings > API** to get your keys
3. Go to **Settings > Database** to get your connection string

### 3. Configure Environment Variables

**Server (`server/.env`):**
```env
PORT=3001
NODE_ENV=development

# Database (Supabase PostgreSQL)
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@db.YOUR_PROJECT.supabase.co:5432/postgres

# Supabase Auth
SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# CORS
CORS_ORIGINS=http://localhost:5173,http://localhost:3000

# Security
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW_MINUTES=15
```

**Client (`client/.env`):**
```env
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Setup Database

```bash
cd server

# Run migrations
npm run db:migrate

# Seed initial data
npm run db:seed
```

### 5. Start Development Servers

**Terminal 1 - Backend (port 3001):**
```bash
cd server && npm run dev
```

**Terminal 2 - Frontend (port 5173):**
```bash
cd client && npm run dev
```

### 6. Open in Browser

Navigate to http://localhost:5173

## Docker Deployment

### 1. Create root `.env` file

```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@db.YOUR_PROJECT.supabase.co:5432/postgres
SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
CORS_ORIGINS=http://localhost
```

### 2. Build and Run

```bash
# Build images
docker-compose build

# Start containers
docker-compose up -d

# Check status
docker-compose ps
```

### 3. Access

- Frontend: http://localhost (port 80)
- Backend API: http://localhost:3001

### Docker Commands

```bash
docker-compose up -d      # Start in background
docker-compose down       # Stop containers
docker-compose logs -f    # View logs
docker-compose restart    # Restart containers
```

## Project Structure

```
KodLaewLong/
├── client/                 # React frontend
│   ├── src/
│   │   ├── api/           # API client utilities
│   │   ├── components/    # React components
│   │   ├── context/       # React Context (auth, selection)
│   │   ├── hooks/         # Custom hooks
│   │   ├── lib/           # Supabase client
│   │   ├── pages/         # Page components
│   │   │   └── admin/     # Admin panel pages
│   │   └── types/         # TypeScript types
│   ├── Dockerfile
│   └── nginx.conf
├── server/                 # Express backend
│   ├── src/
│   │   ├── controllers/   # Request handlers
│   │   ├── data/          # Repository & seed data
│   │   ├── db/            # Drizzle schema & connection
│   │   ├── lib/           # Supabase admin client
│   │   ├── middleware/    # Auth middleware
│   │   ├── routes/        # API routes
│   │   ├── services/      # Business logic
│   │   └── types/         # TypeScript types
│   ├── drizzle/           # Database migrations
│   └── Dockerfile
├── specs/                  # Feature specifications
├── .github/workflows/      # CI/CD pipeline
└── docker-compose.yml
```

## API Endpoints

### Public

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/api/apps` | List all apps by category |
| GET | `/api/apps/:id` | Get single app details |
| POST | `/api/generate` | Generate installer |

### Authenticated

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/selections` | Get user's selections |
| PUT | `/api/selections` | Save user's selections |
| DELETE | `/api/selections` | Clear user's selections |

### Admin Only

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/apps` | List all apps |
| POST | `/api/admin/apps` | Create app |
| PUT | `/api/admin/apps/:id` | Update app |
| DELETE | `/api/admin/apps/:id` | Delete app |
| GET | `/api/admin/categories` | List categories |
| POST | `/api/admin/categories` | Create category |
| PUT | `/api/admin/categories/:id` | Update category |
| DELETE | `/api/admin/categories/:id` | Delete category |
| GET | `/api/admin/users` | List users |
| PUT | `/api/admin/users/:id/role` | Update user role |

## Available Scripts

### Backend (`server/`)

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm start` | Run production build |
| `npm run lint` | Run ESLint |
| `npm run db:generate` | Generate migrations |
| `npm run db:migrate` | Apply migrations |
| `npm run db:seed` | Seed initial data |
| `npm run db:studio` | Open Drizzle Studio |

### Frontend (`client/`)

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

## Admin Access

To make a user an admin:

1. Register a new user
2. Go to Supabase Dashboard > Authentication > Users
3. Find the user and edit their metadata
4. Add: `{ "role": "admin" }`

Or use the admin panel if you already have an admin account.

## Security Features

- Helmet security headers
- Rate limiting (100 requests / 15 minutes)
- JWT token authentication
- Role-based access control
- Input validation
- CORS configuration
- Request body size limit (1MB)

## License Types

| Type | Description |
|------|-------------|
| FREE | Completely free software |
| FREEMIUM | Free with paid features |
| PAID | Requires purchase |
| TRIAL | Time-limited trial |

## CI/CD Pipeline

GitHub Actions runs on every push:

1. **Lint** - ESLint check for client and server
2. **Build** - Build both client and server
3. **Security** - npm audit for vulnerabilities
4. **Docker** - Build Docker images (main branch only)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run `npm run lint` in both client and server
5. Submit a pull request

## License

MIT
