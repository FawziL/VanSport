# Architecture — VanSport API

## Stack

| Layer | Technology |
|-------|-----------|
| Framework | NestJS 11 (Express platform) |
| Language | TypeScript 5 |
| ORM | Drizzle ORM 0.43 + drizzle-kit |
| Database | PostgreSQL |
| Auth | BetterAuth 1.x (session-based) |
| API Docs | Scalar (CDN) + @nestjs/swagger |
| Validation | class-validator + class-transformer |
| Testing | Vitest + Supertest |
| Package Manager | pnpm |

## Project Structure

```
backend/
├── src/
│   ├── main.ts                    # Entry point, BetterAuth mount, Swagger
│   ├── app.module.ts              # Root module (imports all modules)
│   ├── database.module.ts         # Drizzle client provider
│   ├── auth/                      # BetterAuth setup + controller
│   ├── categories/                # Categories CRUD
│   ├── products/                  # Products CRUD
│   ├── users/                     # User management (admin)
│   ├── orders/                    # Orders + checkout
│   ├── order-items/               # Order line items
│   ├── cart/                      # Shopping cart
│   ├── reviews/                   # Product reviews
│   ├── notifications/             # System notifications
│   ├── transactions/              # Payment transactions
│   ├── shipments/                 # Order shipments
│   ├── bug-reports/               # Bug/issue reports
│   ├── payment-methods/           # Payment method configuration
│   ├── exchange-rate/             # BCV dollar exchange rate
│   ├── common/                    # Guards, decorators, filters
│   └── api-docs/                  # Scalar API reference page
├── db/
│   ├── index.ts                   # Drizzle client + schema export
│   ├── schema/                    # Table definitions (14 + auth)
│   └── migrations/                # Generated SQL migrations
└── docs/                          # Project documentation
```

## Request Flow

```
Client → Express → BetterAuth (/api/auth/*) → NestJS middleware → Controller → Service → Drizzle → PostgreSQL
                         │
                    Guards (AuthGuard, RolesGuard)
                         │
                   @CurrentUser() decorator
```

## Key Patterns

### Decimal Fields
Drizzle's `decimal` type expects `string` values. All money/decimal fields receive `number` from the API (parsed by class-validator) and are converted to `string` at the service layer using `.toString()`.

### Auth Flow
- BetterAuth manages sessions via HTTP cookies (httpOnly, secure)
- Client sends credentials with `credentials: 'include'`
- `AuthGuard` calls `auth.api.getSession()` to verify
- `RolesGuard` checks `user.isStaff` for admin endpoints
- Custom fields: `lastName`, `address`, `phone`, `isStaff`, `isActive`, `registeredAt`

### Admin Endpoints
- Protected by `@UseGuards(AuthGuard, RolesGuard)` + `@Roles('admin')`
- `RolesGuard` checks `user.isStaff === true`
- Separate service methods for admin (e.g., `findAllAdmin()`, `findOneAdmin()`)
