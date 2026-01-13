# CLAUDE.md

This file provides context for AI assistants working on this codebase.

## Project Overview

Horizons is a task/productivity application with a Bun + Hono backend and React + TypeScript frontend.

## Tech Stack

**Backend (`apps/backend`)**
- Runtime: Bun
- Framework: Hono
- Database: Drizzle ORM with SQLite
- Auth: better-auth
- Validation: Zod

**Frontend (`apps/frontend`)**
- Framework: React 19
- Build: Vite
- State: MobX
- Styling: Tailwind CSS v4
- UI: Radix UI primitives, Lucide icons
- Routing: React Router v7
- Drag & Drop: Atlaskit Pragmatic DnD

**Shared (`packages/shared`)**
- Shared types and utilities between frontend and backend

## Project Structure

```
apps/
  backend/
    src/
      db/         # Drizzle schema and migrations
      lib/        # Utilities
      middleware/ # Hono middleware
      routes/     # API routes
      index.ts    # Entry point
  frontend/
    src/
      api/        # API client
      components/ # React components
      config/     # App configuration
      lib/        # Utilities
      models/     # MobX stores
      pages/      # Route pages
      utils/      # Helper functions
packages/
  shared/         # Shared types/utilities
```

## Commands

```bash
bun dev           # Start both frontend and backend
bun dev:backend   # Backend only (http://localhost:3000)
bun dev:frontend  # Frontend only (http://localhost:5173)
bun lint          # Lint with Biome
bun format        # Format with Biome
bun type-check    # TypeScript check all packages
bun build         # Build frontend and copy to backend/public
```

## Database

```bash
bun run --filter backend db:generate  # Generate migrations
bun run --filter backend db:migrate   # Run migrations
```

## Code Style

- Biome for linting and formatting
- 2-space indentation
- Single quotes, no semicolons
- Tailwind classes must be sorted (enforced by Biome)
- Line width: 100 characters

## Development Notes

- Frontend proxies API requests to backend in dev mode
- Backend serves frontend static files in production
- Uses workspace dependencies via `workspace:*`
