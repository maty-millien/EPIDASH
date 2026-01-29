# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

EPIDASH is an Electron desktop application for Epitech students to view their Epitest automated test results. It authenticates via Microsoft Azure AD SSO and fetches data from the Epitest API.

## Important

Never run dev servers (`bun start`). The user will run them manually.

**Keep this file up to date**: If you make any changes that affect information documented in this file (project structure, IPC handlers, state management, tech stack, etc.), you MUST update this file accordingly. This file should never be outdated.

## Build & Development Commands

```bash
bun start              # Development with hot reload
bun run package        # Package the app
bun run make           # Create distributable installers
bun run publish        # Publish to GitHub releases (requires .env with GITHUB_TOKEN)
```

## Releasing Updates

The app uses `electron-updater` for auto-updates via GitHub releases.

1. Copy `.env.example` to `.env` and add your GitHub token
2. Update version in `package.json`
3. Run `bun run publish` to create a draft release
4. Review and publish the draft on GitHub

## Tech Stack

- **Frontend**: React 19 + TypeScript + Vite + Tailwind CSS
- **Backend**: Electron (Node.js)
- **Package Manager**: Bun
- **Build Tool**: Electron Forge

## Project Structure (MUST FOLLOW)

```
src/
├── core/                    # Electron main process (Node.js)
│   ├── main.ts              # Entry point
│   ├── api.ts               # API calls to epitest.eu
│   ├── auth.ts              # Authentication flow
│   ├── ipc.ts               # IPC handlers
│   ├── menu.ts              # App menu
│   ├── state.ts             # Token state
│   ├── updater.ts           # Auto-update logic
│   └── window.ts            # Window state (BaseWindow + views)
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
| New React component (reusable) | `src/frontend/components/ui/`          | LoadingSpinner, Button       |
| New React component (feature)  | `src/frontend/components/{feature}/`   | SettingsPanel                |
| New view/page                  | `src/frontend/components/{view-name}/` | Create new folder            |
| Utility functions (React)      | `src/frontend/utils/`                  | formatDate, processData      |
| TypeScript types               | `src/shared/types/`                    | API types, UI types          |
| Constants/config               | `src/shared/constants/`                | Color mappings, module names |
| Electron main process code     | `src/core/`                            | New IPC handlers             |
| New IPC handler                | `src/core/ipc.ts`                      | Add to existing file         |

### Rules

1. **Never mix main and renderer code** - Main process runs in Node.js, renderer runs in browser
2. **No barrel exports** - Do NOT create `index.ts` files for re-exporting. Import directly from source files.
3. **No comments in code** - Write self-documenting code. Avoid comments unless absolutely necessary.
4. **Types go in shared** - All TypeScript interfaces/types go in `src/shared/types/`
5. **Constants go in shared** - Reusable constants go in `src/shared/constants/`
6. **Use path alias** - Import shared code with `@/shared/types/ui` not relative paths
7. **Feature folders** - Group related components in feature folders (e.g., `dashboard/`, `project-details/`)

### Import Patterns

```tsx
import type { ProcessedProject, FilterStatus } from "@/shared/types/ui";
import type { EpitestResult } from "@/shared/types/api";
import { MODULE_NAMES } from "@/shared/constants/modules";
import { LoadingState } from "./components/ui/LoadingState";
import { Dashboard } from "./components/dashboard/Dashboard";
```

## Architecture

### Window Architecture

The app uses `BaseWindow` + `WebContentsView` (modern Electron pattern):

- `mainWindow` - The container window (`BaseWindow`)
- `appView` - React app view (`WebContentsView`)
- `authView` - Auth overlay view (`WebContentsView`) - shown during login

Window state is managed in `src/core/window.ts`.

### Authentication Flow

1. User opens app → React checks if token exists via IPC
2. If not logged in → React calls `startLogin()`, shows `LoadingState`
3. Main process creates auth view overlay, loads `myresults.epitest.eu`
4. Auth view overlays the React app for Microsoft login
5. After Microsoft SSO completes, JavaScript extracts JWT from localStorage
6. Token passed via custom URL scheme: `epidash://token/{encoded_token}`
7. Main process stores token, hides auth view, notifies React via `auth:state-changed`
8. React receives notification, fetches data via IPC

### IPC Handlers (`src/core/ipc.ts`)

| Handler              | Purpose                                        |
| -------------------- | ---------------------------------------------- |
| `auth:is-logged-in`  | Check if token exists                          |
| `auth:start-login`   | Start login flow with auth view overlay        |
| `auth:logout`        | Clear token from state                         |
| `auth:reauth`        | Re-authenticate (used on 403 errors)           |
| `auth:get-state`     | Get current auth state (`{ inProgress }`)      |
| `auth:state-changed` | Event sent to renderer when auth state changes |
| `api:fetch-data`     | GET api.epitest.eu/me/2025 with Bearer token   |
| `api:fetch-details`  | GET /me/details/{test_run_id}                  |
| `api:fetch-history`  | GET /me/2025/{module}/{project}                |
| `update:get-state`   | Get current update state                       |
| `update:check`       | Trigger manual update check                    |
| `update:install`     | Quit and install downloaded update             |
| `update:downloaded`  | Event sent when update is ready to install     |
| `update:progress`    | Event sent with download progress percentage   |
| `update:error`       | Event sent when update check/download fails    |

### State Management

**Main Process** (`src/core/state.ts`):

- `token: string | null` - JWT from Microsoft
- `tokenExtracted: boolean` - prevents extraction loops
- `authInProgress: boolean` - tracks when auth flow is active

**React** (`src/frontend/App.tsx`):

- `isLoggedIn`, `authInProgress`, `apiData`, `fetching`, `error` state hooks

## API

**Endpoint**: `https://api.epitest.eu/me/2025`

Returns array of test results with project info, skill breakdowns, and pass/fail counts.

See `docs/EPITEST_API.md` for complete API documentation.

## Styling

Use Tailwind CSS over pure CSS. The project has Tailwind configured and all styling should leverage utility classes.

## Icons

Use `@tabler/icons-react` for all icons.

```tsx
import { IconRefresh, IconCheck } from "@tabler/icons-react";
<IconRefresh size={16} stroke={2} />;
```

## Animations

Use `framer-motion` for all animations. Keep animations subtle.
