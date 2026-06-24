# Frontend Migration: Django → NestJS + BetterAuth + R2

## Status Overview

| Phase | Description | Status |
|-------|------------|--------|
| 1 | API Client + Auth (cookies) | ✅ Done |
| 2 | Route mapping (Django → NestJS) | ✅ Done |
| 3 | Image URLs (R2) | ✅ Done |
| 4 | Login / Register (BetterAuth) | ✅ Done |
| 5 | Admin CRUD pages (field mapping) | ⬜ Pending |
| 6 | Public pages (field mapping) | ⬜ Pending |
| 7 | Google OAuth (BetterAuth redirect) | ⬜ Pending |
| 8 | Password Reset (BetterAuth) | ⬜ Pending |

## Phase Details

### Phase 1 — API Client + Auth ✅
- [x] `config/api.jsx`: Remove localStorage token management
- [x] `config/api.jsx`: Change `credentials` to `'include'` (cookies)
- [x] `config/api.jsx`: Remove `Authorization` header (cookies handle auth)
- [x] `context/AuthContext.jsx`: Rewrite for BetterAuth cookie-based sessions
- [x] `context/AuthContext.jsx`: `login()` calls BetterAuth sign-in (cookie set automatically)
- [x] `context/AuthContext.jsx`: `logout()` calls BetterAuth sign-out (clears cookie)
- [x] `context/AuthContext.jsx`: Auth state derived from `/auth/me` response, not localStorage

### Phase 2 — Route Mapping ✅
- [x] `services/routes.jsx`: Rewrite all endpoints to match NestJS patterns
- [x] Remove trailing slashes from all URLs
- [x] Translate Spanish entity names to English
- [x] Map Django-style paths to NestJS routes
- [x] Remove separate `adminService` (same endpoints, auth guards on backend)

### Route Mapping Table

| Old (Django) | New (NestJS) | Entity |
|-------------|-------------|--------|
| `/auth/login/` | `POST /api/auth/email-password/sign-in` | BetterAuth |
| `/auth/register/` | `POST /api/auth/email-password/sign-up` | BetterAuth |
| `/auth/me/` | `GET /auth/me` | NestJS |
| `/auth/password-reset/` | `POST /api/auth/forget-password` | BetterAuth (pending) |
| `/auth/password-reset/confirm/` | `POST /api/auth/reset-password` | BetterAuth (pending) |
| `/auth/google/` | OAuth redirect | BetterAuth (pending) |
| `/api/categorias/` | `GET /categories` | Public |
| `/api/productos/` | `GET /products` | Public |
| `/api/productos/:id/` | `GET /products/:id` | Public |
| `/api/pedidos/` | `GET /orders` | Authenticated |
| `/api/pedidos/checkout/` | `POST /orders/checkout` | Authenticated |
| `/api/carrito/add/` | `POST /cart/add` | Authenticated |
| `/api/carrito/update-quantity/` | `POST /cart/update-quantity` | Authenticated |
| `/api/carrito/remove/` | `POST /cart/remove` | Authenticated |
| `/api/carrito/clear/` | `POST /cart/clear` | Authenticated |
| `/api/resenas/` | `GET /reviews` | Public |
| `/api/notificaciones/` | `GET /notifications` | Public |
| `/api/notificaciones/latest-banner/` | `GET /notifications/latest-banner` | Public |
| `/api/transacciones/` | `GET /transactions` | Authenticated |
| `/api/transacciones/pay/` | `POST /transactions/pay` | Authenticated |
| `/api/envios/` | `GET /shipments` | Authenticated |
| `/api/reportes-fallas/` | `GET /bug-reports` | Authenticated |
| `/api/reportes-fallas/:id/followups/` | `POST /bug-reports/:id/followups` | Authenticated |
| `/api/pagos/metodos/` | `GET /payment-methods` | Public |
| `/api/utils/dolar-bcv/` | `GET /exchange-rate/dolar-bcv` | Public |
| `/admin/categorias/` | `POST /categories` | Admin |
| `/admin/productos/` | `GET/POST /products` | Admin (same as public) |

### Phase 3 — Image URLs (R2) ✅
- [x] `utils/resolveUrl.jsx`: Return absolute R2 URLs as-is
- [x] `utils/resolveUrl.jsx`: Keep relative path fallback for dev mode
- [x] File upload fields preserved (`imagen`, `imagenes_adicionales`, `comprobante`, `video`)
- [x] All uploads go through NestJS to R2

### Phase 4 — Login / Register ✅
- [x] `Login.jsx`: Call `POST /api/auth/email-password/sign-in`
- [x] `Login.jsx`: Handle BetterAuth response `{ user, session }`
- [x] `Register.jsx`: Call `POST /api/auth/email-password/sign-up`
- [x] `Register.jsx`: Map form fields (`nombre` → `name`, `apellido` → no mapping needed)

### Phase 5 — Admin CRUD pages ✅
- [x] `CreateProduct.jsx` — fields: `name`, `description`, `price`, `isActive`, `categoryId`
- [x] `EditProduct.jsx` — fields: `name`, `description`, `price`, `isActive`, `categoryId`
- [x] `ListProduct.jsx` — service: `products.listAdmin()`, fields: `imageUrl`, `isActive`, `isFeatured`
- [x] `CreateCategory.jsx` — fields: `name`, `description`, `imageUrl`
- [x] `EditCategory.jsx` — fields: `name`, `description`, `imageUrl`
- [x] `ListCategory.jsx` — fields: `imageUrl`, `isFeatured`
- [x] `CreateUser.jsx` — fields: `name`, `lastName`, `phone`, `isActive`, `isStaff`
- [x] `EditUser.jsx` — fields: `name`, `lastName`, `phone`, `isActive`, `isStaff`
- [x] `ListUsers.jsx` — fields: `id`, `name`, `lastName`, `isActive`, `isStaff`
- [x] `CreateReport.jsx` — service: `bugReports`, fields: `category`, `title`, `description`, `section`
- [x] `EditReport.jsx` — same
- [x] `ListReport.jsx` — fields: `imageUrl`, `videoUrl`, `createdAt`, `status`
- [x] `Dashboard.jsx` — service references updated
- [x] All remaining admin pages: service references + field names updated

### Phase 6 — Public pages ✅
- [x] `Productos.jsx` — fields: `price`, `name`, `imageUrl`, `id`
- [x] `VerProducto.jsx` — fields: `name`, `description`, `price`, `salePrice`, `categoryId`, `imageUrl`, `additionalImages`, `stock`
- [x] `CardProduct.jsx` — fields: `name`, `price`, `salePrice`, `imageUrl`, `id`, `stock`
- [x] `ProductReviews.jsx` — service: `reviews`, fields: `rating`
- [x] `Carrito.jsx` — service: `cart`, fields: `id`, `name`, `price`, `quantity`, `productId`
- [x] `Checkout.jsx` — fields: `price`, `name`, `quantity`, `stock`
- [x] `MisPedidos.jsx` — fields: `id`, `status`, `total`, `createdAt`
- [x] `VerPedido.jsx` — fields: `status`, `total`, `createdAt`
- [x] `NuevoReporte.jsx` — fields: `category`, `title`, `description`, `section`
- [x] `VerReporte.jsx` — fields: `imageUrl`, `videoUrl`, `createdAt`, `status`
- [x] `MisReportes.jsx` — fields: `status`, `createdAt`
- [x] `Perfil.jsx` — fields: `id`, `name`, `lastName`, `phone`, `isStaff`
- [x] `NavBar.jsx` — fields: `name`, `lastName`, `isStaff`
- [x] `AdminSideBar.jsx` — fields: `name`, `lastName`
- [x] `ListCategories.jsx` — service: `categories`, fields: `name`
- [x] `HomeBanner.jsx` — fields: `createdAt`, `type`, `message`
- [x] `ProductFilters.jsx` — fields: `categoryId`

### Phase 7 — Google OAuth ⬜ Pending
BetterAuth uses redirect-based OAuth, not the Google One Tap pattern.
- Change from `@react-oauth/google` + `POST /auth/google/` to redirect to `POST /api/auth/oauth2/authorize?provider=google`
- Handle callback URL
- Google OAuth env vars already configured in NestJS

### Phase 8 — Password Reset ⬜ Pending
BetterAuth has built-in password reset:
- `POST /api/auth/forget-password` with `{ email, redirectTo }`
- `POST /api/auth/reset-password` with `{ newPassword, token }`
- Need to create/reset password pages

## Backend Gaps Found

- ~~Admin `findAll()` on products only returns active ones~~ ✅ Added `GET /products/admin` (admin-only)
- No separate admin controllers (same paths as public — intentional via guards)
- No global `/api` prefix on NestJS routes (BetterAuth uses `/api/auth/*`)
- Password reset may need BetterAuth config updates

## How to test

```bash
# Start NestJS backend
cd backend-NestJs
pnpm start:dev

# Start frontend
cd frontend
pnpm dev

# Login with email/password
# Create products/categories with images → they upload to R2
# Verify images serve from R2 public URL
```
