# Horizons

Bun + Hono backend with React + TypeScript frontend

## Setup

```bash
# Install dependencies
bun install

# Copy backend env file
cp apps/backend/.env.example apps/backend/.env

# Run both frontend and backend
bun dev

# Or run individually
bun dev:backend  # Backend on http://localhost:3000
bun dev:frontend # Frontend on http://localhost:5173
```

## Commands

- `bun dev` - Start both apps
- `bun lint` - Lint all code
- `bun format` - Format all code
- `bun type-check` - Check types across all packages

## Structure

- `apps/backend` - Hono API server
- `apps/frontend` - React + Vite app
- `packages/shared` - Shared types and utilities
