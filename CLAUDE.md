# CLAUDE.md

Instructions for Claude Code working on this project.

## Stack

- **Next.js 16** (App Router, Turbopack)
- **TypeScript** (strict mode)
- **Tailwind CSS v4** (`@import "tailwindcss"` syntax — no config file needed)
- **PostgreSQL 17** via `pg` library (`src/lib/db.ts`)
- **Docker / Docker Compose**

## Commands

```bash
# Local development (no Docker)
npm run dev

# Docker development (Next.js + PostgreSQL)
docker compose up

# Docker production
docker compose -f docker-compose.prod.yml up

# Lint
npm run lint

# Build
npm run build
```

## Environment Variables

Copy `.env.example` to `.env.local` before running.

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `POSTGRES_USER` | DB user (default: postgres) |
| `POSTGRES_PASSWORD` | DB password (default: password) |
| `POSTGRES_DB` | DB name (default: app_db) |

In Docker Compose, `DATABASE_URL` is automatically overridden to use `@db:5432` as the host.

## Project Structure

```
src/
├── app/           # Next.js App Router
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
└── lib/
    └── db.ts      # PostgreSQL pool (pg)
```

## Key Conventions

- Use `npm` (not bun or yarn) — `package-lock.json` is committed
- Use App Router only — no `pages/` directory
- Path alias: `@/*` maps to `src/*`
- DB access: use the pool from `src/lib/db.ts` directly in Server Components or Route Handlers
- `next.config.ts` has `output: "standalone"` — required for production Docker build

## Docker Notes

- `Dockerfile` — production multi-stage build (requires `output: standalone`)
- `Dockerfile.dev` — development with hot reload
- `docker-compose.yml` — dev environment (source code volume-mounted)
- `docker-compose.prod.yml` — production environment
- Node.js version: **24-alpine**
