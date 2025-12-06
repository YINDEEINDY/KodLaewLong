# Research: KodLaewLong - Ninite-style Software Installer

**Feature Branch**: `001-app-picker-webapp`
**Date**: 2025-11-30

## Research Summary

This document captures technical decisions and research findings for the KodLaewLong implementation.

---

## 1. Frontend State Management

**Decision**: React Context API with useContext hook

**Rationale**:
- Application state is simple (list of selected app IDs)
- No need for complex state management libraries
- Context provides clean cross-component state sharing
- Lightweight, no additional dependencies
- Sufficient for session-based, single-user scenarios

**Alternatives Considered**:
| Alternative | Why Rejected |
|-------------|--------------|
| Redux | Over-engineered for simple selection state |
| Zustand | Additional dependency not justified for scope |
| URL state (query params) | Doesn't persist across page navigations cleanly |
| Local Storage | Persists beyond session, not desired behavior |

---

## 2. Client-Server Communication

**Decision**: REST API with JSON payloads

**Rationale**:
- Simple CRUD operations on apps data
- POST for generate action with body payload
- Well-understood patterns for Express + fetch/axios
- Easy to test and debug
- Matches team expertise (standard REST)

**Alternatives Considered**:
| Alternative | Why Rejected |
|-------------|--------------|
| GraphQL | Overkill for 3 endpoints, adds complexity |
| tRPC | Adds build complexity, learning curve |
| WebSockets | No real-time requirements |

---

## 3. Frontend HTTP Client

**Decision**: Native fetch API

**Rationale**:
- No external dependencies
- Sufficient for simple GET/POST operations
- Modern browsers fully support fetch
- TypeScript types work well with fetch

**Alternatives Considered**:
| Alternative | Why Rejected |
|-------------|--------------|
| Axios | Additional dependency not needed for simple use case |
| React Query | Adds caching complexity not required for MVP |
| SWR | Same as React Query - over-engineering for scope |

---

## 4. Routing

**Decision**: React Router v6

**Rationale**:
- De facto standard for React routing
- Simple route configuration
- Supports nested routes if needed later
- Good TypeScript support

**Alternatives Considered**:
| Alternative | Why Rejected |
|-------------|--------------|
| TanStack Router | Newer, less documentation |
| Manual history API | Reinventing the wheel |
| Hash routing | Not needed, standard browser routing is fine |

---

## 5. Backend Data Layer Pattern

**Decision**: Repository pattern with in-memory array

**Rationale**:
- Abstracts data access behind interface
- Easy to swap to database later (PostgreSQL, MongoDB, etc.)
- Services depend on repository interface, not implementation
- Simple to test with mock repositories

**Implementation**:
```typescript
interface AppRepository {
  getAll(): Promise<App[]>;
  getById(id: string): Promise<App | null>;
  getByIds(ids: string[]): Promise<App[]>;
}
```

**Alternatives Considered**:
| Alternative | Why Rejected |
|-------------|--------------|
| Direct array access in services | Not extensible, harder to swap to DB |
| ORM (Prisma, TypeORM) | Over-engineering for in-memory MVP |
| JSON file storage | Adds file I/O complexity, not needed |

---

## 6. API Response Format

**Decision**: Grouped by category for list endpoint, flat for single item

**Rationale**:
- Frontend needs category grouping for display
- Sending grouped data reduces client-side processing
- Single app endpoint returns flat object for detail page

**Response Structures**:

GET /api/apps:
```json
{
  "categories": [
    { "name": "Web Browsers", "apps": [...] }
  ]
}
```

GET /api/apps/:id:
```json
{
  "id": "chrome",
  "name": "Google Chrome",
  ...
}
```

POST /api/generate:
```json
{
  "selectedApps": [...],
  "generatedScript": "...",
  "downloadUrl": "...",
  "generatedAt": "...",
  "buildId": "..."
}
```

---

## 7. Mock Installer Generation

**Decision**: Generate pseudo-script string + mock download URL

**Rationale**:
- Actual .exe building is out of scope
- Mock demonstrates the flow end-to-end
- downloadUrl points to placeholder (can be replaced with real builder later)
- generatedScript shows what would be executed

**Mock Logic**:
- For FREE apps: Generate install commands with official download URLs
- For PAID apps: Generate "open official website" commands only
- Build ID: UUID or timestamp-based identifier
- Download URL: Mock URL pattern like `https://kodlaewlong.example.com/download/{buildId}.exe`

---

## 8. Error Handling Strategy

**Decision**: Centralized error responses with consistent format

**Rationale**:
- All errors return JSON with `{ error: string }` format
- HTTP status codes: 400 (bad input), 404 (not found), 500 (server error)
- Frontend displays user-friendly messages based on error responses

**Error Response Format**:
```json
{
  "error": "Human-readable error message"
}
```

---

## 9. CORS Configuration

**Decision**: Allow frontend origin in development

**Rationale**:
- Frontend runs on localhost:5173 (Vite default)
- Backend runs on localhost:3001
- CORS needed for cross-origin requests in development
- Production would use same-origin or configure appropriately

**Configuration**:
```typescript
app.use(cors({
  origin: 'http://localhost:5173'
}));
```

---

## 10. Category List

**Decision**: Predefined categories based on Ninite-style groupings

**Categories**:
1. Web Browsers (Chrome, Firefox, Edge, Brave)
2. Messaging (Discord, Slack, Telegram, Zoom)
3. Media (VLC, Spotify, iTunes)
4. Developer Tools (VS Code, Git, Node.js, Python)
5. Utilities (7-Zip, WinRAR, Notepad++)
6. Security (Windows Defender - reference only, Malwarebytes)

**Rationale**:
- Covers common software categories
- Mix of free and paid applications
- Familiar to Ninite users

---

## 11. Sample Applications

**Decision**: Include 15-20 sample applications for demo

**Sample Data** (seed):
- Mix of FREE, PAID, FREEMIUM, TRIAL license types
- Each with realistic metadata (official URLs, descriptions)
- Some with installation guides, some without
- Cover all defined categories

---

## Technical Decisions Summary

| Area | Decision | Key Benefit |
|------|----------|-------------|
| State Management | React Context | Simple, no extra deps |
| HTTP Client | Native fetch | Zero dependencies |
| Routing | React Router v6 | Industry standard |
| Data Layer | Repository pattern | Future-proof for DB |
| API Format | REST + JSON | Simple, well-understood |
| Mock Installer | Pseudo-script + mock URL | Demonstrates flow |
| Error Handling | Consistent JSON format | Easy frontend handling |
