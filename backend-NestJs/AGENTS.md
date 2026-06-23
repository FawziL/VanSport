# AGENTS.md — Reglas del Proyecto

## Stack
- **Framework:** NestJS (Express platform)
- **ORM:** Drizzle ORM + drizzle-kit
- **Auth:** BetterAuth
- **API Docs:** Scalar (@scalar/nestjs-api-reference)
- **Validation:** class-validator + class-transformer (DTOs), Zod (opcional)
- **Package Manager:** pnpm
- **DB:** PostgreSQL
- **Tests:** Vitest + Supertest

## Convenciones

### Idioma
- Todo el código en **inglés**: nombres de tablas, columnas, carpetas, archivos, clases, métodos, variables, rutas API, DTOs.
- Comentarios y documentación en español (en docs/) o inglés (en código).

### Naming
- **Carpetas/archivos:** kebab-case (`categories/`, `products.controller.ts`)
- **Clases:** PascalCase (`CategoriesController`, `CreateProductDto`)
- **Métodos:** camelCase (`findAll()`, `create()`)
- **Variables:** camelCase
- **DTOs:** `Create<Entity>Dto`, `Update<Entity>Dto`
- **Tablas DB:** snake_case plural (`categories`, `order_items`)
- **Columnas DB:** snake_case (`is_active`, `created_at`)

### Estructura de módulos
```
module/
├── module-name.module.ts
├── module-name.controller.ts
├── module-name.service.ts
└── dto/
    ├── create-entity.dto.ts
    └── update-entity.dto.ts
```

### Rutas API
- **Públicas (AllowAny):** `GET /api/<resources>`
- **Autenticadas:** `POST/PUT/PATCH/DELETE /api/<resources>`
- **Admin:** `GET/POST/PUT/DELETE /api/admin/<resources>` (protegidas con `is_staff = true`)
- **Auth:** `POST /api/auth/*` (manejado por BetterAuth)

### Guards y Decoradores
- `@UseGuards(AuthGuard)` — verifica sesión BetterAuth
- `@UseGuards(RolesGuard)` — verifica `is_staff`
- `@Roles('admin')` — decorador para requerir rol admin
- `@CurrentUser()` — decorador para obtener usuario autenticado

### Orden de implementación
1. Scaffolding (NestJS + Drizzle + BetterAuth)
2. Auth module (guards, decorators, perfiles)
3. Módulos públicos (categories, products, reviews, notifications, exchange-rate, payment-methods)
4. Módulos autenticados (cart, orders, order-items, transactions, shipments, bug-reports)
5. Admin CRUDs
6. Scalar API docs
7. Tests

### Mejores prácticas
- Usar DTOs con `class-validator` para validación de entrada
- Inyectar Drizzle client como provider (`DRIZZLE_PROVIDER`)
- No exponer errores internos en producción
- Manejo de archivos: usar servicios dedicados
- Transacciones Drizzle para operaciones que afectan múltiples tablas
- Usar `@nestjs/swagger` decorators en todos los endpoints
