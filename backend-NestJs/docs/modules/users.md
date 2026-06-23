# Users Module (Admin)

## What it does
Provides administrative user management. Admins can list, view, update, and delete user accounts.

## Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/users` | Admin | List all users |
| GET | `/api/users/:id` | Admin | Get user by ID |
| PUT | `/api/users/:id` | Admin | Update user |
| PATCH | `/api/users/:id` | Admin | Partial update |
| DELETE | `/api/users/:id` | Admin | Delete user |

## How it works
The `UsersService` queries the BetterAuth `user` table directly via Drizzle. It selects only safe fields (excluding passwords and tokens):

```typescript
await this.db
  .select({
    id: user.id,
    name: user.name,
    lastName: user.lastName,
    email: user.email,
    isStaff: user.isStaff,
    isActive: user.isActive,
    registeredAt: user.registeredAt,
  })
  .from(user);
```

## Profile updates (self-service)
Users update their own profile via `/api/auth/me` (PATCH) in the Auth module, which calls the same `UsersService.update()`.

## Why this structure
- **Admin-only access**: All user management routes require admin privileges (`@Roles('admin')`), preventing unauthorized user data access.
- **Field filtering**: The service explicitly selects which fields to return, preventing accidental exposure of sensitive data.
- **Shared service**: The same `UsersService` is used by both `AuthController` (for self-service) and `UsersController` (for admin), avoiding code duplication.
