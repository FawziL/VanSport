# Setup — VanSport API

## Prerequisites

- Node.js 22+
- pnpm 11+
- PostgreSQL 15+

## Installation

```bash
cd backend-NestJs
pnpm install
```

## Environment Variables

Copy `.env.example` to `.env`:

```bash
# Database
DATABASE_URL=postgres://postgres:password@localhost:5432/vansport

# BetterAuth
BETTER_AUTH_SECRET=your-secret-key-here
BETTER_AUTH_URL=http://localhost:3000

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Exchange Rate API
EXCHANGE_RATE_API_URL=https://ve.dolarapi.com/v1

# Frontend URL (CORS)
FRONTEND_URL=http://localhost:5173

# Port
PORT=3000
```

## Database Setup

### Option A: Fresh database (migrate)

```bash
pnpm db:generate    # Generate SQL migration files
pnpm db:migrate     # Apply migrations to database
```

### Option B: Introspect existing database

```bash
pnpm db:pull        # Pull schema from existing DB
```

## Run

```bash
pnpm start:dev      # Development (watch mode)
pnpm start          # Production
```

## Verify

```bash
# Health check
curl http://localhost:3000/api/auth/ok

# API docs
open http://localhost:3000/api-docs

# OpenAPI JSON
curl http://localhost:3000/api/openapi.json
```

## Tests

```bash
pnpm test           # Unit tests
pnpm test:e2e       # E2E tests (requires DB)
```
