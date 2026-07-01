# Common Module

## What it does
Houses shared infrastructure used across all feature modules: guards, decorators, and exception filters.

## Structure

```
common/
├── guards/
│   ├── auth.guard.ts       # Session verification
│   ├── roles.guard.ts      # Role-based access control
│   └── index.ts
├── decorators/
│   ├── current-user.decorator.ts  # Extract authenticated user
│   ├── roles.decorator.ts         # Set role metadata
│   └── index.ts
└── filters/
    └── http-exception.filter.ts    # Consistent error responses
```

## Guards

### AuthGuard
Verifies BetterAuth session. See [auth-guards-decorators.md](./auth-guards-decorators.md) for details.

### RolesGuard
Checks role metadata. See [auth-guards-decorators.md](./auth-guards-decorators.md) for details.

## Decorators

### @CurrentUser()
Extracts the authenticated user or a specific field from the request object. Supports optional field extraction:

```typescript
// Full user object
@CurrentUser() user

// Specific field
@CurrentUser('id') userId: string
```

### @Roles()
Sets role metadata on a handler for the RolesGuard:

```typescript
@Roles('admin')
```

## Exception Filter (HTTP)
The `http-exception.filter.ts` (template) provides consistent error response formatting. It can be expanded to:

```typescript
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    response.status(status).json({
      statusCode: status,
      message: exception.message,
      timestamp: new Date().toISOString(),
    });
  }
}
```

## Why this design
- **Single source of truth**: Common infrastructure lives in one place. Feature modules import from `../common/guards` or `../common/decorators`.
- **Barrel exports**: The `index.ts` files in each subdirectory provide clean import paths:

```typescript
import { AuthGuard, RolesGuard } from '../common/guards';
import { CurrentUser, Roles } from '../common/decorators';
```

- **Extensible**: New guards (e.g., `ThrottleGuard`, `OwnershipGuard`) or decorators (e.g., `@IpAddress()`) can be added without changing existing code.
