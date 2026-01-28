# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

EpiDash is an Electron desktop application for Epitech students to view their Epitest automated test results. It authenticates via Microsoft Azure AD SSO and fetches data from the Epitest API.

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

## Architecture

### Authentication Flow

1. User opens app → check if token exists via IPC
2. If not logged in → navigate to myresults.epitest.eu
3. After Microsoft SSO completes, JavaScript extracts JWT from localStorage
4. Token passed via custom URL scheme: `epidash://token/{encoded_token}`
5. Main process stores token, navigates back to app
6. Frontend fetches data via IPC

### IPC Handlers (src/ipc.ts)

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

**Main Process** (`src/state.ts`):

- `token: string | null` - JWT from Microsoft
- `tokenExtracted: boolean` - prevents extraction loops

**React** (`src/App.tsx`):

- `isLoggedIn`, `apiData`, `fetching`, `error` state hooks

## Key Files

- `src/main.ts` - Electron main process entry
- `src/preload.ts` - Secure IPC bridge (contextBridge)
- `src/ipc.ts` - IPC handlers
- `src/auth.ts` - Authentication logic and protocol handler
- `src/api.ts` - API calls to epitest.eu
- `src/App.tsx` - Main React UI
- `forge.config.ts` - Electron Forge configuration
- `docs/EPITEST_API.md` - Complete API documentation

## API

**Endpoint**: `https://api.epitest.eu/me/2025`

Returns array of test results with project info, skill breakdowns, and pass/fail counts.

## Styling

Use Tailwind CSS over pure CSS. The project has Tailwind configured and all styling should leverage utility classes.

## Icons

Use `@tabler/icons-react` for all icons.

```tsx
import { IconRefresh, IconCheck } from "@tabler/icons-react";
<IconRefresh size={16} stroke={2} />;
```

## Animations

Use `framer-motion` for all animations. Keep animations subtle (0.2-0.4s duration).
