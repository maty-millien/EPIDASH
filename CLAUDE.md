# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

EPIDASH is an Electron desktop application for Epitech students to view their Epitest automated test results. It authenticates via Microsoft Azure AD SSO and fetches data from the Epitest API.

## Important

Never run dev servers (`bun start`). The user will run them manually.

## Build & Development Commands

```bash
bun start              # Development with hot reload
bun run package        # Package the app
bun run make           # Create distributable installers
```

## Tech Stack

- **Frontend**: React 19 + TypeScript + Vite + Tailwind CSS
- **Backend**: Electron (Node.js)
- **Package Manager**: Bun
- **Build Tool**: Electron Forge

## Project Structure (MUST FOLLOW)

```
src/
├── main/                    # Electron main process (Node.js)
│   ├── main.ts              # Entry point
│   ├── api.ts               # API calls to epitest.eu
│   ├── auth.ts              # Authentication flow
│   ├── ipc.ts               # IPC handlers
│   ├── menu.ts              # App menu
│   └── state.ts             # Token state
│
├── preload/                 # Preload script (IPC bridge)
│   └── preload.ts
│
├── renderer/                # React frontend (browser context)
│   ├── components/
│   │   ├── ui/              # Reusable UI primitives (buttons, loaders, etc.)
│   │   ├── dashboard/       # Dashboard view components
│   │   └── project-details/ # Project details view components
│   ├── utils/               # Utility functions for renderer
│   ├── App.tsx              # Root React component
│   ├── App.css              # Global styles
│   └── index.tsx            # React entry point
│
├── shared/                  # Shared between main and renderer
│   ├── constants/           # Configuration constants
│   └── types/               # TypeScript type definitions
│
└── electron.d.ts            # Window.electronAPI type declarations
```

### Where to Put New Code

| Type of Code                   | Location                               | Example                      |
| ------------------------------ | -------------------------------------- | ---------------------------- |
| New React component (reusable) | `src/renderer/components/ui/`          | LoadingSpinner, Button       |
| New React component (feature)  | `src/renderer/components/{feature}/`   | SettingsPanel                |
| New view/page                  | `src/renderer/components/{view-name}/` | Create new folder            |
| Utility functions (React)      | `src/renderer/utils/`                  | formatDate, processData      |
| TypeScript types               | `src/shared/types/`                    | API types, UI types          |
| Constants/config               | `src/shared/constants/`                | Color mappings, module names |
| Electron main process code     | `src/main/`                            | New IPC handlers             |
| New IPC handler                | `src/main/ipc.ts`                      | Add to existing file         |

### Rules

1. **Never mix main and renderer code** - Main process runs in Node.js, renderer runs in browser
2. **Use barrel exports** - Each component folder must have an `index.ts` exporting its components
3. **Types go in shared** - All TypeScript interfaces/types go in `src/shared/types/`
4. **Constants go in shared** - Reusable constants go in `src/shared/constants/`
5. **Use path alias** - Import shared code with `@/shared/types` not relative paths
6. **Feature folders** - Group related components in feature folders (e.g., `dashboard/`, `project-details/`)

### Import Patterns

```tsx
// Types - always use path alias
import type { ProcessedProject, FilterStatus } from "@/shared/types"

// Constants - always use path alias
import { MODULE_NAMES } from "@/shared/constants/modules"

// UI components - import from barrel
import { LoadingState, ErrorState } from "./components/ui"

// Feature components - import from barrel
import { Dashboard } from "./components/dashboard"
```

## Architecture

### Authentication Flow

1. User opens app → check if token exists via IPC
2. If not logged in → navigate to myresults.epitest.eu
3. After Microsoft SSO completes, JavaScript extracts JWT from localStorage
4. Token passed via custom URL scheme: `epidash://token/{encoded_token}`
5. Main process stores token, navigates back to app
6. Frontend fetches data via IPC

### IPC Handlers (`src/main/ipc.ts`)

| Handler             | Purpose                                      |
| ------------------- | -------------------------------------------- |
| `auth:is-logged-in` | Check if token exists                        |
| `auth:start-login`  | Navigate to Microsoft login                  |
| `auth:logout`       | Clear token from state                       |
| `auth:reauth`       | Re-authenticate (used on 403 errors)         |
| `api:fetch-data`    | GET api.epitest.eu/me/2025 with Bearer token |
| `api:fetch-details` | GET /me/details/{test_run_id}                |
| `api:fetch-history` | GET /me/2025/{module}/{project}              |

### State Management

**Main Process** (`src/main/state.ts`):

- `token: string | null` - JWT from Microsoft
- `tokenExtracted: boolean` - prevents extraction loops

**React** (`src/renderer/App.tsx`):

- `isLoggedIn`, `apiData`, `fetching`, `error` state hooks

## API

**Endpoint**: `https://api.epitest.eu/me/2025`

Returns array of test results with project info, skill breakdowns, and pass/fail counts.

See `docs/EPITEST_API.md` for complete API documentation.

## Styling

Use Tailwind CSS over pure CSS. The project has Tailwind configured and all styling should leverage utility classes.

## Icons

Use `@tabler/icons-react` for all icons.

```tsx
import { IconRefresh, IconCheck } from "@tabler/icons-react"
;<IconRefresh size={16} stroke={2} />
```

## Animations

Use `framer-motion` for all animations. Keep animations subtle (0.2-0.4s duration).
