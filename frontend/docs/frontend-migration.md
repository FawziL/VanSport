# Frontend Migration: Django → NestJS + BetterAuth + R2

## Status Overview

| Phase | Description | Status |
|-------|------------|--------|
| 1 | API Client + Auth (cookies) | ✅ Done |
| 2 | Route mapping (Django → NestJS) | ✅ Done |
| 3 | Image URLs (R2) | ✅ Done |
| 4 | Login / Register (BetterAuth) | ✅ Done |
| 5 | Admin CRUD pages (field mapping) | ✅ Done |
| 6 | Public pages (field mapping) | ✅ Done |
| 7 | Google OAuth (BetterAuth redirect) | ⬜ Pending |
| 8 | Password Reset (BetterAuth) | ⬜ Pending |
| 9 | Internacionalización (i18n ES/EN) | ✅ Done |

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
- [x] `ListProduct.jsx` — fields: `imageUrl`, `isActive`, `isFeatured`, `productId`
- [x] `CreateCategory.jsx` — fields: `name`, `description`, `imageUrl`
- [x] `EditCategory.jsx` — fields: `name`, `description`, `imageUrl`
- [x] `ListCategory.jsx` — fields: `imageUrl`, `isFeatured`
- [x] `CreateUser.jsx` — fields: `name`, `lastName`, `phone`, `isActive`, `isStaff`
- [x] `EditUser.jsx` — fields: `name`, `lastName`, `phone`, `isActive`, `isStaff`
- [x] `ListUsers.jsx` — fields: `id`, `name`, `lastName`, `isActive`, `isStaff`
- [x] `CreateReport.jsx` — fields: `category`, `title`, `description`, `section`
- [x] `EditReport.jsx` — same
- [x] `ListReport.jsx` — fields: `title`, `status`, `createdAt`
- [x] `Dashboard.jsx` — service references updated
- [x] `CreatePaymentMethod.jsx` — fields: `code`, `name`, `type`, `isActive`, `sortOrder`
- [x] `EditPaymentMethod.jsx` — fields: `code`, `name`, `type`, `isActive`, `sortOrder`
- [x] `ListPaymentMethods.jsx` — fields: `code`, `name`, `type`, `sortOrder`, `isActive`
- [x] `ListSales.jsx` — fields: `id`, `orderId`, `amount`, `reference`, `createdAt`, `status`
- [x] `PendingPayments.jsx` — fields: `id`, `orderId`, `amount`, `createdAt`, `status`
- [x] `EditSale.jsx` — WRITE: sends `status`, `paymentMethod`
- [x] `ListOrders.jsx` — fields: `id`, `status`, `total`, `createdAt`
- [x] `EditOrder.jsx` — WRITE: sends `status`, `shippingAddress`, `notes`
- [x] `ListShipments.jsx` — fields: `id`, `orderId`, `shippingMethod`, `cost`, `shippedAt`
- [x] `EditShipment.jsx` — WRITE: sends `status`, `shippingMethod`, `trackingCode`

### Phase 6 — Public pages ✅
- [x] `Productos.jsx` — fields: `price`, `name`, `imageUrl`, `id`
- [x] `VerProducto.jsx` — fields: `name`, `description`, `price`, `salePrice`, `categoryId`, `imageUrl`, `additionalImages`, `stock`
- [x] `CardProduct.jsx` — fields: `name`, `price`, `salePrice`, `imageUrl`, `id`, `stock`
- [x] `ProductReviews.jsx` — fields: `rating`, `comment`, `createdAt`
- [x] `Carrito.jsx` — fields: `id`, `name`, `price`, `quantity`, `productId`
- [x] `Checkout.jsx` — fields: `price`, `name`, `quantity`, `stock`
- [x] `MisPedidos.jsx` — fields: `id`, `status`, `total`, `createdAt`
- [x] `VerPedido.jsx` — fields: `status`, `total`, `createdAt`, `notes`
- [x] `NuevoReporte.jsx` — fields: `category`, `title`, `description`, `section`
- [x] `VerReporte.jsx` — fields: `title`, `status`, `createdAt`, `section`
- [x] `MisReportes.jsx` — fields: `title`, `status`, `createdAt`
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

### Phase 9 — Internacionalización (i18n) ✅ Done
- [x] Instalar dependencias: `react-i18next`, `i18next`, `i18next-http-backend`, `i18next-browser-languagedetector`
- [x] Configurar `src/i18n.js` con HttpBackend + LanguageDetector + fallbackLng: 'es'
- [x] Crear archivos de traducción en `public/locales/{es,en}/` con namespaces: `common`, `home`, `productos`, `producto`, `auth`, `carrito`, `pedido`, `perfil`, `reporte`, `admin`
- [x] Routing con prefijo de idioma (`/:lang/ruta`) estilo Next.js — `/es/productos`, `/en/productos`, etc.
- [x] Componente `LanguageRouter.jsx` que sincroniza URL ↔ i18next
- [x] `main.jsx` espera `initPromise` antes de montar React (cero flash de keys)
- [x] `LanguageToggle.jsx` navega a la misma ruta con el nuevo idioma
- [x] Helper `locPath()` para prefijar rutas con el idioma actual
- [x] Traducir `NavBar.jsx` (~15 strings)
- [x] Traducir `Footer.jsx` (~12 strings)
- [x] Traducir `Home.jsx` + `HomeBanner.jsx` (~25 strings)
- [x] Traducir `NotFound.jsx`
- [x] Traducir páginas de autenticación (Login, Register, PasswordReset, PasswordResetConfirm) — namespace `auth`
- [x] Traducir páginas de usuario (VerProducto, Carrito, Checkout, MisPedidos, VerPedido, Perfil, MisReportes, NuevoReporte, VerReporte) — namespaces `producto`, `carrito`, `pedido`, `perfil`, `reporte`
- [x] Traducir páginas Admin (Dashboard, CRUDs completos) — namespace `admin`
- [x] Traducir componentes compartidos (StatusBadge, Pagination, ConfirmModal, Table, PageSizeSelector, ProductFilters, ListCategories, ThemeToggleButton, AdminSideBar)

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
