# Implementation Plan: KodLaewLong - Ninite-style Software Installer

**Branch**: `001-app-picker-webapp` | **Date**: 2025-11-30 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-app-picker-webapp/spec.md`

## Summary

Build a full-stack web application that allows users to select multiple software applications from a categorized list and generate a combined installer. The frontend provides a clean, Ninite-style interface for browsing/selecting apps, while the backend serves application data and generates mock installer packages. The system distinguishes between free and paid software, providing legitimate installation guidance only.

## Technical Context

**Language/Version**: TypeScript 5.3+ (both frontend and backend)
**Primary Dependencies**:
- Frontend: React 18+, Vite 5.x, Tailwind CSS 3.x, React Router
- Backend: Node.js 18+, Express 4.x
**Storage**: In-memory data store (TypeScript array) with repository pattern for future DB migration
**Testing**: Vitest (frontend), Jest (backend)
**Target Platform**: Web browsers (Chrome, Firefox, Edge, Safari - latest 2 versions)
**Project Type**: Web application (frontend + backend)
**Performance Goals**: Page load under 3 seconds, interaction response under 100ms
**Constraints**: No authentication required, session-based client state, no actual .exe generation (mock only)
**Scale/Scope**: ~20-50 sample applications, single-user sessions, no concurrent user concerns for MVP

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Constitution is template-only (not configured for this project). Proceeding with standard best practices:

| Gate | Status | Notes |
|------|--------|-------|
| Separation of concerns | PASS | Frontend/Backend split, layered architecture |
| Testability | PASS | Repository pattern enables mocking |
| Security | PASS | No auth needed, no sensitive data, legal compliance enforced |
| Simplicity | PASS | Minimal dependencies, straightforward REST API |

## Project Structure

### Documentation (this feature)

```text
specs/001-app-picker-webapp/
├── spec.md              # Feature specification
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (API contracts)
│   └── api.yaml         # OpenAPI specification
├── checklists/          # Quality checklists
│   └── requirements.md  # Spec validation checklist
└── tasks.md             # Phase 2 output (created by /speckit.tasks)
```

### Source Code (repository root)

```text
client/                    # React frontend
├── src/
│   ├── main.tsx          # Application entry point
│   ├── App.tsx           # Root component with routing
│   ├── components/       # Reusable UI components
│   │   ├── AppGrid.tsx
│   │   ├── AppCategorySection.tsx
│   │   ├── AppRow.tsx
│   │   ├── BottomBar.tsx
│   │   ├── SummaryList.tsx
│   │   ├── DownloadPanel.tsx
│   │   └── Navbar.tsx
│   ├── pages/            # Route-level components
│   │   ├── AppSelectionPage.tsx
│   │   ├── SummaryPage.tsx
│   │   └── AppDetailPage.tsx
│   ├── hooks/            # Custom React hooks
│   │   └── useAppSelection.ts
│   ├── api/              # API client utilities
│   │   └── appsApi.ts
│   ├── types/            # TypeScript type definitions
│   │   └── index.ts
│   └── context/          # React context for state management
│       └── SelectionContext.tsx
├── public/               # Static assets
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js

server/                    # Express backend
├── src/
│   ├── index.ts          # Server entry point
│   ├── routes/           # Express route definitions
│   │   └── apps.routes.ts
│   ├── controllers/      # Request handlers
│   │   └── apps.controller.ts
│   ├── services/         # Business logic
│   │   ├── apps.service.ts
│   │   └── generate.service.ts
│   ├── data/             # Data layer (repository pattern)
│   │   ├── apps.repository.ts
│   │   └── apps.seed.ts
│   └── types/            # TypeScript type definitions
│       └── index.ts
├── package.json
└── tsconfig.json
```

**Structure Decision**: Web application structure with clear separation between `client/` (React frontend) and `server/` (Express backend). Both use TypeScript with shared type concepts but separate type files to maintain independence. Repository pattern in backend enables future database migration.

## Complexity Tracking

No constitution violations to justify. Architecture is minimal and appropriate for scope.
