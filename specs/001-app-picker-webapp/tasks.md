# Tasks: KodLaewLong - Ninite-style Software Installer

**Input**: Design documents from `/specs/001-app-picker-webapp/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/api.yaml

**Tests**: Not explicitly requested in specification - test tasks omitted.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Conventions

- **Backend**: `server/src/`
- **Frontend**: `client/src/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure for both client and server

- [x] T001 Create monorepo folder structure with `client/` and `server/` directories
- [x] T002 [P] Initialize backend Node.js project with TypeScript in `server/package.json`
- [x] T003 [P] Initialize frontend Vite + React + TypeScript project in `client/package.json`
- [x] T004 [P] Configure TypeScript for backend in `server/tsconfig.json`
- [x] T005 [P] Configure TypeScript for frontend in `client/tsconfig.json`
- [x] T006 [P] Setup Tailwind CSS configuration in `client/tailwind.config.js`
- [x] T007 [P] Configure Vite with proxy for API in `client/vite.config.ts`
- [x] T008 [P] Add Express and CORS dependencies to backend `server/package.json`
- [x] T009 [P] Add React Router dependency to frontend `client/package.json`
- [x] T010 Create `.gitignore` with node_modules, dist, and build artifacts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story

**Backend Foundation**

- [x] T011 Define TypeScript types (App, LicenseType, CategoryWithApps, GenerateRequest, GenerateResponse, ErrorResponse) in `server/src/types/index.ts`
- [x] T012 Create seed data with 15-20 sample apps across all categories in `server/src/data/apps.seed.ts`
- [x] T013 Implement AppRepository interface and in-memory implementation in `server/src/data/apps.repository.ts`
- [x] T014 Create Express server entry point with CORS configuration in `server/src/index.ts`
- [x] T015 Setup API routes structure in `server/src/routes/apps.routes.ts`

**Frontend Foundation**

- [x] T016 Define TypeScript types (App, LicenseType, CategoryWithApps, GenerateRequest, GenerateResponse) in `client/src/types/index.ts`
- [x] T017 Create SelectionContext for app selection state management in `client/src/context/SelectionContext.tsx`
- [x] T018 Create API client utility with fetch wrapper in `client/src/api/appsApi.ts`
- [x] T019 Setup React Router with routes for home, summary, and app detail in `client/src/App.tsx`
- [x] T020 Create main entry point in `client/src/main.tsx`
- [x] T021 Create base HTML template in `client/index.html`
- [x] T022 [P] Create Navbar component with logo and placeholder links in `client/src/components/Navbar.tsx`
- [x] T023 Add global Tailwind styles in `client/src/index.css`

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Browse and Select Software (Priority: P1)

**Goal**: Users can browse categorized software list and select/deselect applications with visual feedback and selection counter

**Independent Test**: Load application, verify apps display by category, select/deselect items, verify counter updates

### Backend for User Story 1

- [x] T024 [US1] Implement AppsService with getAllApps() and getAppsByCategory() in `server/src/services/apps.service.ts`
- [x] T025 [US1] Implement AppsController with GET /api/apps handler in `server/src/controllers/apps.controller.ts`
- [x] T026 [US1] Wire up GET /api/apps route in `server/src/routes/apps.routes.ts`

### Frontend for User Story 1

- [x] T027 [P] [US1] Create AppRow component with checkbox, icon, name, description, license badge in `client/src/components/AppRow.tsx`
- [x] T028 [P] [US1] Create AppCategorySection component displaying category name and app rows in `client/src/components/AppCategorySection.tsx`
- [x] T029 [US1] Create AppGrid component arranging categories in responsive grid in `client/src/components/AppGrid.tsx`
- [x] T030 [US1] Create BottomBar component with selection count and proceed button in `client/src/components/BottomBar.tsx`
- [x] T031 [US1] Create useAppSelection hook for selection state operations in `client/src/hooks/useAppSelection.ts`
- [x] T032 [US1] Implement AppSelectionPage with data fetching, grid, and bottom bar in `client/src/pages/AppSelectionPage.tsx`
- [x] T033 [US1] Add loading and error states to AppSelectionPage
- [x] T034 [US1] Style selected app rows with highlight effect using Tailwind

**Checkpoint**: User Story 1 complete - users can browse and select software

---

## Phase 4: User Story 2 - Review and Generate Installer (Priority: P2)

**Goal**: Users can review selected apps on summary page and generate installer with download link

**Independent Test**: Navigate to summary with selections, verify apps display with warnings for paid, click generate, verify download link appears

### Backend for User Story 2

- [x] T035 [US2] Implement GenerateService with generateInstaller() mock logic in `server/src/services/generate.service.ts`
- [x] T036 [US2] Implement POST /api/generate controller handler in `server/src/controllers/apps.controller.ts`
- [x] T037 [US2] Add POST /api/generate route in `server/src/routes/apps.routes.ts`
- [x] T038 [US2] Add validation for empty appIds and missing app IDs

### Frontend for User Story 2

- [x] T039 [P] [US2] Create SummaryList component showing selected apps with icons, categories, badges in `client/src/components/SummaryList.tsx`
- [x] T040 [P] [US2] Create DownloadPanel component with loading, success, error states in `client/src/components/DownloadPanel.tsx`
- [x] T041 [US2] Implement SummaryPage with app list, paid warning, and action buttons in `client/src/pages/SummaryPage.tsx`
- [x] T042 [US2] Add navigation from AppSelectionPage to SummaryPage with selection state
- [x] T043 [US2] Add "Go back to edit" functionality preserving selections
- [x] T044 [US2] Integrate generateInstaller API call in SummaryPage
- [x] T045 [US2] Display download link, buildId, and timestamp on success

**Checkpoint**: User Story 2 complete - full selection to download flow works

---

## Phase 5: User Story 3 - View Application Details (Priority: P3)

**Goal**: Users can view detailed app information including installation guide on dedicated page

**Independent Test**: Navigate to /apps/:id directly, verify all app details display including install guide

### Backend for User Story 3

- [x] T046 [US3] Add getAppById() to AppsService in `server/src/services/apps.service.ts`
- [x] T047 [US3] Implement GET /api/apps/:id controller handler in `server/src/controllers/apps.controller.ts`
- [x] T048 [US3] Add GET /api/apps/:id route in `server/src/routes/apps.routes.ts`
- [x] T049 [US3] Handle 404 error for non-existent app ID

### Frontend for User Story 3

- [x] T050 [US3] Implement AppDetailPage with full app info display in `client/src/pages/AppDetailPage.tsx`
- [x] T051 [US3] Add installation guide section with steps list when hasInstallGuide is true
- [x] T052 [US3] Add fallback message when no installation guide exists
- [x] T053 [US3] Add official website and download URL links
- [x] T054 [US3] Add "Details" link to AppRow component navigating to /apps/:id

**Checkpoint**: User Story 3 complete - app detail pages work independently

---

## Phase 6: User Story 4 - Add Application from Detail Page (Priority: P4)

**Goal**: Users can add/remove apps from their selection while on detail page

**Independent Test**: Navigate to detail page for unselected app, click add, verify selection updates

### Frontend for User Story 4

- [x] T055 [US4] Add "Add to installation list" button to AppDetailPage in `client/src/pages/AppDetailPage.tsx`
- [x] T056 [US4] Show "Already selected" state or remove button when app is selected
- [x] T057 [US4] Add "Back to selection" navigation button
- [x] T058 [US4] Ensure selection context updates correctly from detail page

**Checkpoint**: User Story 4 complete - all user stories functional

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Error handling, edge cases, and overall improvements

- [x] T059 [P] Add placeholder icon handling when iconUrl fails in AppRow
- [x] T060 [P] Add network error handling with retry option in AppSelectionPage
- [x] T061 [P] Add network error handling with retry option in SummaryPage
- [x] T062 [P] Add loading skeleton UI while fetching apps
- [x] T063 Implement responsive layout: 2-3 columns on desktop, 1 column on mobile
- [x] T064 Add Thai language text for all UI labels and messages
- [x] T065 Create README.md with setup and run instructions at project root
- [x] T066 Verify all acceptance scenarios from spec.md pass manually
- [x] T067 Run quickstart.md validation - test full dev setup flow

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 1: Setup
    │
    ▼
Phase 2: Foundational ──────────────────────────────┐
    │                                                │
    ├─────────────┬─────────────┬─────────────┐     │
    ▼             ▼             ▼             ▼     │
Phase 3:      Phase 4:      Phase 5:      Phase 6:  │
US1 (P1)      US2 (P2)      US3 (P3)      US4 (P4)  │
    │             │             │             │     │
    └─────────────┴─────────────┴─────────────┘     │
                        │                           │
                        ▼                           │
                   Phase 7: Polish ◄────────────────┘
```

### User Story Dependencies

| Story | Depends On | Can Start After |
|-------|------------|-----------------|
| US1 (P1) | Phase 2 Foundation | T023 complete |
| US2 (P2) | Phase 2 Foundation, US1 navigation | T034 complete (recommended) |
| US3 (P3) | Phase 2 Foundation | T023 complete |
| US4 (P4) | US3 AppDetailPage | T054 complete |

### Within Each Story

1. Backend tasks before frontend (API must exist)
2. Components before pages
3. Core display before interactions
4. Base functionality before error handling

### Parallel Opportunities

**Phase 1 (all parallel)**:
- T002, T003 (backend/frontend init)
- T004, T005, T006, T007, T008, T009 (all config files)

**Phase 2 (partial parallel)**:
- T011, T016 (backend/frontend types)
- T022 (Navbar independent)
- After T011: T012, T013, T014 can proceed

**Phase 3 (partial parallel)**:
- T027, T028 (AppRow, AppCategorySection components)

**Phase 4 (partial parallel)**:
- T039, T040 (SummaryList, DownloadPanel components)

**Phase 5-7**: Most tasks are sequential within story

---

## Parallel Example: Phase 2 Foundation

```bash
# After T001 directory setup, launch in parallel:
Task: "Initialize backend Node.js project" (T002)
Task: "Initialize frontend Vite + React project" (T003)

# After both init complete, launch in parallel:
Task: "Configure TypeScript backend" (T004)
Task: "Configure TypeScript frontend" (T005)
Task: "Setup Tailwind CSS" (T006)
Task: "Configure Vite proxy" (T007)
```

---

## Parallel Example: User Story 1

```bash
# After backend foundation (T015), launch:
Task: "Implement AppsService" (T024)

# After T024, launch:
Task: "Implement AppsController" (T025)

# Frontend components can run in parallel:
Task: "Create AppRow component" (T027)
Task: "Create AppCategorySection component" (T028)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (~10 tasks)
2. Complete Phase 2: Foundational (~13 tasks)
3. Complete Phase 3: User Story 1 (~11 tasks)
4. **STOP and VALIDATE**: Test browsing and selection independently
5. Deploy/demo browsable app picker

### Incremental Delivery

| Increment | Stories | Value Delivered |
|-----------|---------|-----------------|
| MVP | US1 only | Browse and select apps |
| Release 2 | US1 + US2 | Full flow with download |
| Release 3 | US1-US3 | App details available |
| Release 4 | US1-US4 + Polish | Complete feature |

### Suggested Execution Order (Single Developer)

1. Phase 1: Setup (T001-T010)
2. Phase 2: Foundation (T011-T023)
3. Phase 3: US1 Backend (T024-T026)
4. Phase 3: US1 Frontend (T027-T034)
5. **Checkpoint**: Validate US1 works
6. Phase 4: US2 (T035-T045)
7. **Checkpoint**: Validate full flow works
8. Phase 5: US3 (T046-T054)
9. Phase 6: US4 (T055-T058)
10. Phase 7: Polish (T059-T067)

---

## Task Summary

| Phase | Story | Task Count | Parallel Tasks |
|-------|-------|------------|----------------|
| Phase 1 | Setup | 10 | 8 |
| Phase 2 | Foundation | 13 | 2 |
| Phase 3 | US1 | 11 | 2 |
| Phase 4 | US2 | 11 | 2 |
| Phase 5 | US3 | 9 | 0 |
| Phase 6 | US4 | 4 | 0 |
| Phase 7 | Polish | 9 | 4 |
| **Total** | | **67** | **18** |

---

## Phase 8: Security & Stability

**Purpose**: Harden the application for production deployment

### Security Fixes

- [x] T068 Fix Command Injection vulnerability - replace `execSync` with `execFile` in `server/src/services/generate.service.ts`
- [x] T069 Add buildId UUID validation to prevent path traversal in `server/src/controllers/apps.controller.ts`
- [x] T070 Add input validation for appIds (array check, max limit 50, format validation) in `server/src/services/generate.service.ts`

### Environment & Configuration

- [x] T071 Create environment configuration system in `server/src/config/index.ts`
- [x] T072 [P] Create `.env.example` template file in `server/.env.example`
- [x] T073 [P] Create `.env` development configuration in `server/.env`

### Security Middleware

- [x] T074 Add Helmet security headers middleware in `server/src/index.ts`
- [x] T075 Add rate limiting middleware (100 req/15min) in `server/src/index.ts`
- [x] T076 Add request body size limit (1mb) in `server/src/index.ts`
- [x] T077 Update CORS to use environment variable in `server/src/index.ts`

### Dependencies

- [x] T078 Add `dotenv`, `helmet`, `express-rate-limit` to `server/package.json`

**Checkpoint**: Security hardening complete - application ready for production deployment

---

## Phase 9: Data Persistence (Drizzle + Supabase)

**Purpose**: Migrate from in-memory storage to persistent PostgreSQL database

### Database Setup

- [x] T079 Add Drizzle ORM and postgres dependencies to `server/package.json`
- [x] T080 Create database schema in `server/src/db/schema.ts`
- [x] T081 Create database connection in `server/src/db/index.ts`
- [x] T082 Create Drizzle config in `server/drizzle.config.ts`
- [x] T083 Update `.env` with DATABASE_URL for Supabase

### Migration & Seed

- [x] T084 Generate migration files using `drizzle-kit generate`
- [x] T085 Apply migrations to Supabase using `drizzle-kit migrate`
- [x] T086 Create seed script in `server/src/data/seed.ts`
- [x] T087 Run seed script to populate initial data

### Repository Refactor

- [x] T088 Update `IAppRepository` interface to async methods
- [x] T089 Implement `DrizzleAppRepository` in `server/src/data/apps.repository.ts`
- [x] T090 Update `AppsService` to async in `server/src/services/apps.service.ts`
- [x] T091 Update `AppsController` to async/await in `server/src/controllers/apps.controller.ts`
- [x] T092 Update `GenerateService` to use async service

### NPM Scripts

- [x] T093 Add database scripts to `package.json`: `db:generate`, `db:migrate`, `db:push`, `db:seed`, `db:studio`

**Checkpoint**: Data persistence complete - app data stored in Supabase PostgreSQL

---

## Phase 10: Authentication (Supabase Auth)

**Purpose**: Add user authentication with login and registration

### Backend Auth

- [x] T094 Install `@supabase/supabase-js` on server
- [x] T095 Create Supabase admin client in `server/src/lib/supabase.ts`
- [x] T096 Create auth middleware in `server/src/middleware/auth.middleware.ts`
- [x] T097 Add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to `.env`

### Frontend Auth

- [x] T098 Install `@supabase/supabase-js` on client
- [x] T099 Create Supabase client in `client/src/lib/supabase.ts`
- [x] T100 Create AuthContext in `client/src/context/AuthContext.tsx`
- [x] T101 Create LoginPage in `client/src/pages/LoginPage.tsx`
- [x] T102 Create RegisterPage in `client/src/pages/RegisterPage.tsx`
- [x] T103 Create ProtectedRoute component in `client/src/components/ProtectedRoute.tsx`
- [x] T104 Update Navbar with auth state (login/logout buttons)
- [x] T105 Update App.tsx with AuthProvider and auth routes
- [x] T106 Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to client `.env`
- [x] T107 Create vite-env.d.ts for TypeScript support

**Checkpoint**: Authentication complete - users can register and login

---

## Phase 11: User Selections Persistence

**Purpose**: Save user's app selections to database so they persist across sessions

### Database Schema

- [x] T108 Add `user_selections` table to schema in `server/src/db/schema.ts`
- [x] T109 Generate and apply migration for user_selections table

### Backend Implementation

- [x] T110 Create SelectionsRepository in `server/src/data/selections.repository.ts`
- [x] T111 Create SelectionsService in `server/src/services/selections.service.ts`
- [x] T112 Create SelectionsController in `server/src/controllers/selections.controller.ts`
- [x] T113 Create selections routes in `server/src/routes/selections.routes.ts`
- [x] T114 Register selections routes in `server/src/index.ts`
- [x] T115 Update CORS to allow PUT, DELETE methods and Authorization header

### Frontend Integration

- [x] T116 Create selections API client in `client/src/api/selectionsApi.ts`
- [x] T117 Update SelectionContext to sync with backend when user is logged in
- [x] T118 Add debounced save to avoid excessive API calls

**Checkpoint**: User selections persistence complete - selections saved per user

---

## Phase 12: Admin Panel

**Purpose**: Provide admin interface for managing apps and categories

### Backend Admin API

- [x] T119 Add UserRole type and requireAdmin middleware in `server/src/middleware/auth.middleware.ts`
- [x] T120 Create admin repository with CRUD operations in `server/src/data/admin.repository.ts`
- [x] T121 Create admin controller in `server/src/controllers/admin.controller.ts`
- [x] T122 Create admin routes in `server/src/routes/admin.routes.ts`
- [x] T123 Register admin routes in `server/src/index.ts`

### Frontend Admin UI

- [x] T124 Create admin API client in `client/src/api/adminApi.ts`
- [x] T125 Create AdminLayout with sidebar in `client/src/components/AdminLayout.tsx`
- [x] T126 Create AdminDashboard page in `client/src/pages/admin/AdminDashboard.tsx`
- [x] T127 Create AdminAppsPage with CRUD in `client/src/pages/admin/AdminAppsPage.tsx`
- [x] T128 Create AdminCategoriesPage with CRUD in `client/src/pages/admin/AdminCategoriesPage.tsx`
- [x] T129 Add admin routes to App.tsx
- [x] T130 Add Admin link to Navbar for admin users
- [x] T131 Add user management functions in `server/src/data/admin.repository.ts`
- [x] T132 Add user management endpoints in `server/src/controllers/admin.controller.ts`
- [x] T133 Add user routes in `server/src/routes/admin.routes.ts`
- [x] T134 Add user API client in `client/src/api/adminApi.ts`
- [x] T135 Create AdminUsersPage in `client/src/pages/admin/AdminUsersPage.tsx`
- [x] T136 Add Users link to admin sidebar

**Checkpoint**: Admin panel complete - admins can manage apps, categories, and user roles via UI

---

## Task Summary

| Phase | Story | Task Count | Parallel Tasks |
|-------|-------|------------|----------------|
| Phase 1 | Setup | 10 | 8 |
| Phase 2 | Foundation | 13 | 2 |
| Phase 3 | US1 | 11 | 2 |
| Phase 4 | US2 | 11 | 2 |
| Phase 5 | US3 | 9 | 0 |
| Phase 6 | US4 | 4 | 0 |
| Phase 7 | Polish | 9 | 4 |
| Phase 8 | Security | 11 | 2 |
| Phase 9 | Database | 15 | 2 |
| Phase 10 | Auth | 14 | 2 |
| Phase 11 | User Selections | 11 | 2 |
| Phase 12 | Admin Panel | 18 | 2 |
| **Total** | | **136** | **28** |

---

## Notes

- All types defined separately in client and server for independence
- Repository pattern allows future DB migration without service changes
- Mock .exe generation returns placeholder URL - replace with real builder later
- Thai language labels should be added in T064 for all user-facing text
- CORS configured via environment variable (default: localhost:5173, localhost:3000)
- Security headers added via Helmet middleware
- Rate limiting: 100 requests per 15 minutes per IP
- Request body limited to 1MB to prevent DoS
- Database: Supabase PostgreSQL with Drizzle ORM
- Migrations stored in `server/drizzle/` directory
- Authentication: Supabase Auth with JWT tokens
- User selections: Persisted per user in `user_selections` table with debounced sync
- Admin panel: Role-based access via user_metadata.role = 'admin' in Supabase
- Admin routes protected with requireAuth + requireAdmin middleware
- User management: Admins can promote/demote users to/from admin role via UI
