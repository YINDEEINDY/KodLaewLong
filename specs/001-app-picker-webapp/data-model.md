# Data Model: KodLaewLong

**Feature Branch**: `001-app-picker-webapp`
**Date**: 2025-11-30

## Entities

### App

The primary entity representing a software application available for installation.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | Yes | Unique identifier (slug format, e.g., "chrome", "vscode") |
| name | string | Yes | Display name (e.g., "Google Chrome") |
| category | string | Yes | Category slug (e.g., "web-browsers", "messaging") |
| description | string | Yes | Brief description (1-2 sentences) |
| iconUrl | string | Yes | URL to application icon image |
| licenseType | enum | Yes | One of: "FREE", "PAID", "FREEMIUM", "TRIAL" |
| isPublicFree | boolean | Yes | True if completely free (e.g., Chrome, Discord) |
| officialWebsiteUrl | string | Yes | Official website URL |
| officialDownloadUrl | string | No | Direct download page URL (if available) |
| isRecommended | boolean | No | Featured/recommended flag |
| hasInstallGuide | boolean | Yes | Whether detailed install guide exists |
| installGuideTitle | string | No | Title for installation guide section |
| installGuideSteps | string[] | No | Step-by-step installation instructions |
| installNotes | string | No | Additional notes (e.g., "Requires subscription") |
| installerSourceUrl | string | No | Direct installer download URL (for free apps) |
| installerType | string | No | Installer format: "exe", "msi", "zip" |
| silentArguments | string | No | Command-line args for silent install |
| version | string | No | Current version number |
| vendor | string | No | Software vendor/publisher name |

**Validation Rules**:
- `id` must be unique, lowercase, alphanumeric with hyphens only
- `category` must match a valid Category name
- `licenseType` must be one of the enum values
- `iconUrl` must be a valid URL or empty (use placeholder)
- `officialWebsiteUrl` must be a valid URL

---

### Category

Grouping for applications.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | Yes | Category display name (e.g., "Web Browsers") |
| slug | string | Yes | URL-friendly identifier (e.g., "web-browsers") |
| order | number | Yes | Display order (1 = first) |

**Predefined Categories**:

| Order | Slug | Name |
|-------|------|------|
| 1 | web-browsers | Web Browsers |
| 2 | messaging | Messaging |
| 3 | media | Media |
| 4 | developer-tools | Developer Tools |
| 5 | utilities | Utilities |
| 6 | security | Security |

---

### GenerateRequest

Request payload for installer generation.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| appIds | string[] | Yes | Array of app IDs to include in installer |

**Validation Rules**:
- `appIds` must not be empty
- Each ID must correspond to an existing App

---

### GenerateResponse

Response payload from installer generation.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| selectedApps | App[] | Yes | Full App objects for selected applications |
| generatedScript | string | Yes | Mock installation script/commands |
| downloadUrl | string | Yes | URL to download the generated installer |
| generatedAt | string | Yes | ISO 8601 timestamp of generation |
| buildId | string | Yes | Unique identifier for this build |

---

### CategoryWithApps

Response structure for app listing grouped by category.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | Yes | Category display name |
| slug | string | Yes | Category slug |
| apps | App[] | Yes | Applications in this category |

---

## State Transitions

### App Selection State (Frontend)

```
Initial State: Empty selection (Set<string>)
    │
    ├─► User checks app → Add appId to selection
    │
    ├─► User unchecks app → Remove appId from selection
    │
    ├─► Navigate to Summary → Selection preserved
    │
    ├─► Navigate to Detail → Selection preserved
    │
    ├─► Add from Detail → Add appId to selection
    │
    └─► Generate Installer → Selection used, not cleared
```

### Generate Flow State (Frontend)

```
Idle
    │
    ├─► Click "Download Installer"
    │
    ▼
Loading
    │
    ├─► API Success → Success (show download link)
    │
    └─► API Error → Error (show retry option)
```

---

## Relationships

```
Category (1) ────────< (many) App
     │
     │ Apps belong to exactly one category
     │
     └── Category.slug = App.category

Selection (frontend state)
     │
     └── Set<App.id> - user's current selection
```

---

## Sample Data

### Sample Apps (abbreviated)

```json
[
  {
    "id": "chrome",
    "name": "Google Chrome",
    "category": "web-browsers",
    "description": "Fast, secure web browser from Google",
    "iconUrl": "https://www.google.com/chrome/static/images/chrome-logo.svg",
    "licenseType": "FREE",
    "isPublicFree": true,
    "officialWebsiteUrl": "https://www.google.com/chrome/",
    "officialDownloadUrl": "https://www.google.com/chrome/",
    "hasInstallGuide": false
  },
  {
    "id": "premiere-pro",
    "name": "Adobe Premiere Pro",
    "category": "media",
    "description": "Professional video editing software",
    "iconUrl": "https://www.adobe.com/content/dam/cc/icons/premiere.svg",
    "licenseType": "PAID",
    "isPublicFree": false,
    "officialWebsiteUrl": "https://www.adobe.com/products/premiere.html",
    "hasInstallGuide": true,
    "installGuideTitle": "Installing Adobe Premiere Pro",
    "installGuideSteps": [
      "Visit Adobe Creative Cloud website",
      "Sign in or create an Adobe account",
      "Purchase a Premiere Pro subscription",
      "Download Adobe Creative Cloud installer",
      "Run installer and sign in",
      "Select Premiere Pro and click Install"
    ],
    "installNotes": "Requires active Adobe Creative Cloud subscription"
  }
]
```

---

## TypeScript Type Definitions

### Shared Types (conceptual - implemented separately in client/server)

```typescript
// License type enum
type LicenseType = 'FREE' | 'PAID' | 'FREEMIUM' | 'TRIAL';

// App entity
interface App {
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
}

// Category with apps (API response)
interface CategoryWithApps {
  name: string;
  slug: string;
  apps: App[];
}

// Generate request
interface GenerateRequest {
  appIds: string[];
}

// Generate response
interface GenerateResponse {
  selectedApps: App[];
  generatedScript: string;
  downloadUrl: string;
  generatedAt: string;
  buildId: string;
}

// API responses
interface AppsListResponse {
  categories: CategoryWithApps[];
}

interface ErrorResponse {
  error: string;
}
```
