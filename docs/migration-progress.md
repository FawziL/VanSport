# Migration Progress: Django → NestJS

## Status Overview

| Phase | Description | Status |
|-------|------------|--------|
| 1 | Scaffolding (NestJS + Drizzle + BetterAuth) | ✅ Done |
| 2 | Auth Module | ✅ Done |
| 3 | Public Modules | ✅ Done |
| 4 | Authenticated Modules | ✅ Done |
| 5 | Admin Modules | ✅ Done |
| 6 | Scalar API Docs + /docs | ✅ Done |
| 7 | Tests + Data Migration | ✅ Done |
| 8 | Cloudflare R2 Storage (file uploads → R2, no local storage) | ✅ Done |

## Phase Details

### Phase 1 — Scaffolding ✅
- [x] Initialize NestJS project with pnpm
- [x] Configure TypeScript
- [x] Install dependencies (Drizzle, BetterAuth, Scalar, etc.)
- [x] Configure Drizzle + PostgreSQL connection
- [x] Write all Drizzle schemas (16 tables: 4 auth + 12 entity)
- [x] Generate initial migration with `drizzle-kit generate` (✅)
- [x] Configure BetterAuth instance
- [x] Mount BetterAuth middleware in main.ts
- [x] Build passes with zero errors

### Phase 2 — Auth Module ✅
- [x] Create AuthGuard (getSession via fromNodeHeaders)
- [x] Create RolesGuard (check is_staff)
- [x] Create @CurrentUser() decorator
- [x] Create @Roles() decorator
- [x] Custom fields on user table (lastName, address, phone, isStaff, isActive, registeredAt)
- [x] Google OAuth provider configured
- [x] GET /api/auth/me + PATCH /api/auth/me

### Phase 3 — Public Modules ✅
- [x] Categories (GET /api/categories, GET /api/categories/:id)
- [x] Products (GET /api/products, GET /api/products/:id)
- [x] Reviews (GET /api/reviews)
- [x] Notifications (GET /api/notifications + latest-banner)
- [x] Exchange Rate (GET /api/exchange-rate/dolar-bcv)
- [x] Payment Methods (GET /api/payment-methods)

### Phase 4 — Authenticated Modules ✅
- [x] Cart (CRUD + add/update-quantity/remove/clear)
- [x] Orders (CRUD + checkout)
- [x] Order Items (list, delete)
- [x] Transactions (CRUD + pay)
- [x] Shipments (CRUD)
- [x] Reviews (POST/PUT/PATCH/DELETE)
- [x] Notifications (user CRUD + mark-read)
- [x] Bug Reports (CRUD + followups)
- [x] Users (admin CRUD)

### Phase 5 — Admin Modules ✅
- [x] Admin Categories CRUD
- [x] Admin Products CRUD
- [x] Admin Users (list, update, delete)
- [x] Admin Orders (list, update)
- [x] Admin Order Items (list)
- [x] Admin Transactions (list)
- [x] Admin Shipments (list)
- [x] Admin Bug Reports (list, followups)
- [x] Admin Payment Methods CRUD
- [x] Admin Reviews (list, delete)
- [x] Admin Notifications (list, create)
- [x] Guards: AuthGuard + RolesGuard + @Roles('admin')

### Phase 6 — Scalar API Docs + /docs ✅
- [x] Scalar API Reference via CDN (GET /api-docs)
- [x] Swagger OpenAPI spec (GET /api/openapi.json)
- [x] docs/architecture.md
- [x] docs/setup.md
- [x] docs/api-guide.md
- [x] docs/database.md
- [x] AGENTS.md (project rules)
- [x] migration-progress.md (this file)

### Phase 7 — Tests + Data Migration ✅
- [x] Vitest configuration
- [x] Auth guard tests (3 tests)
- [x] Roles guard tests (4 tests)
- [x] Categories service tests (6 tests)
- [x] Cart service tests (4 tests)
- [x] Orders service tests (3 tests)
- [x] Exchange rate service tests (3 tests)
- [x] Auth controller tests (2 tests)
- [x] **Total: 25 tests, 7 test files, all passing**
- [x] Data migration script (db/migrate-legacy.ts)

### Phase 8 — Cloudflare R2 Storage ✅
- [x] Install @aws-sdk/client-s3 for S3-compatible R2 API
- [x] Create R2Service (src/storage/r2.service.ts) with upload/delete methods
- [x] Create StorageModule (global module)
- [x] Configure .env + .env.example with R2 credentials
- [x] Products: image + additional_images upload to R2 on create/update
- [x] Categories: image upload to R2 on create/update
- [x] Bug Reports: image + video upload to R2 on create/update/followup
- [x] Transactions: receipt upload to R2 on create/pay/update
- [x] All uploads use memoryStorage (no local disk writes)
- [x] Auto-delete old files from R2 on update/delete
- [x] Field name mapping preserved (imagen, imagenes_adicionales, comprobante, video)
- [x] R2 folder structure: products/, categories/, bug-reports/, transactions/
- [x] Added `GET /products/admin` endpoint (admin-only, returns all including inactive)

## Known Gaps
- Password reset needs BetterAuth configuration review
- Google OAuth redirect flow not yet migrated from Google One Tap
- No `/api` global prefix on NestJS routes (BetterAuth uses `/api/auth/*`)

## Table Migration Mapping

| Old Table (Django) | New Table (Drizzle) | Status |
|--------------------|--------------------|--------|
| categorias | categories | ✅ Schema |
| productos | products | ✅ Schema |
| usuarios → | user + custom fields (BetterAuth) | ✅ Schema |
| pedidos | orders | ✅ Schema |
| detalles_pedido | order_items | ✅ Schema |
| carrito | cart_items | ✅ Schema |
| reseñas | reviews | ✅ Schema |
| notificaciones | notifications | ✅ Schema |
| transacciones | transactions | ✅ Schema |
| envios | shipments | ✅ Schema |
| reportes_falla | bug_reports | ✅ Schema |
| reportes_falla_followups | bug_report_followups | ✅ Schema |
| metodos_pago | payment_methods | ✅ Schema |

## How to run

```bash
# Start PostgreSQL
docker compose up -d postgres

# Apply migrations
cd backend-NestJs && pnpm db:migrate

# Migrate legacy data (if old tables exist)
npx ts-node db/migrate-legacy.ts

# Start dev server
pnpm start:dev

# Run tests
pnpm test
```
