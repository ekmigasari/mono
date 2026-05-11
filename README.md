# mono-monorepo

Monorepo starter for a dashboard product with:

- `admin` web app
- `platform` web app
- `api` backend service
- shared UI package (`@monorepo/ui`)

This README is written to be easy for both humans and AI agents to parse quickly.

## What this project is

`mono-monorepo` is a `pnpm` workspace monorepo that groups multiple apps and shared packages in one codebase.

Current app status:

- `apps/admin`: React + Vite frontend (starter screen)
- `apps/platform`: React + Vite frontend (starter screen)
- `apps/api`: Hono API server (returns `"Hello Hono!"` at `/`)
- `packages/ui`: shared UI components/styles used by frontend apps

## How it works

### Monorepo structure

```text
.
├─ apps/
│  ├─ admin/      # Admin frontend
│  ├─ platform/   # Platform frontend
│  └─ api/        # Backend API
├─ packages/
│  ├─ ui/         # Shared UI system (components, styles, utilities)
│  └─ package-template/
├─ pnpm-workspace.yaml
└─ biome.json
```

Workspace packages are defined in `pnpm-workspace.yaml`:

- `apps/**`
- `packages/**`

### Runtime flow

1. Frontend apps (`admin`, `platform`) run with Vite and import shared components from `@monorepo/ui`.
2. API (`apps/api`) runs a Hono server on port `8000`.
3. Environment variables are loaded from root `.env` using `dotenv` wrappers in each app script.
4. Optional database tooling exists in `apps/api` via Prisma scripts.

## Tech stack

### Core tooling

- `pnpm` workspaces (`pnpm@10.33.3`)
- TypeScript
- Biome (format + lint)
- Husky (git hooks)

### Frontend (`apps/admin`, `apps/platform`)

- React 19
- React Router 7
- TanStack Query 5
- Vite 8
- Tailwind CSS 4 (via Vite plugin)
- React Compiler/Babel plugin

### Backend (`apps/api`)

- Hono
- `@hono/node-server`
- TypeScript + `tsx` watch mode
- Prisma + PostgreSQL adapter (`@prisma/adapter-pg`)

### Shared UI (`packages/ui`)

- Tailwind CSS 4
- Base UI (`@base-ui/react`)
- shadcn ecosystem
- `class-variance-authority`, `clsx`, `tailwind-merge`
- Zod

## Getting started

### 1) Install dependencies

```bash
pnpm install
```

### 2) Create environment file

Create `.env` in the repo root (same level as this README).  
Each app uses `dotenv -e ../../.env -- ...`, so root `.env` is the source of env vars.

### 3) Run development servers

Run all main apps in parallel:

```bash
pnpm dev
```

Run apps individually:

```bash
pnpm admin:dev
pnpm platform:dev
pnpm api:dev
```

Run UI package dev script:

```bash
pnpm ui:dev
```

## Useful scripts

From repo root:

```bash
pnpm lint
pnpm lint:fix
```

From `apps/api`:

```bash
pnpm db:generate
pnpm db:migrate
pnpm db:studio
```

## Current API example

`apps/api/src/index.ts` currently exposes:

- `GET /` -> `Hello Hono!`

Server default:

- `http://localhost:8000`

## Notes for AI agents

- Use this README as the high-level map first.
- Prefer workspace-aware commands (`pnpm --filter <pkg> ...`) when running one app/package.
- Shared UI imports are from `@monorepo/ui/*`.
- Frontend apps have similar setup; changes are often mirrored in both `admin` and `platform`.
