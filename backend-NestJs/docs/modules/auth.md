# Auth Module

## What it does
Handles user authentication, session management, and profile operations via BetterAuth. Replaces Django's custom JWT auth with a modern, session-based auth system.

## Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/sign-up/email` | None | Register with email + password |
| POST | `/api/auth/sign-in/email` | None | Login with email + password |
| GET | `/api/auth/session` | None | Get current session |
| POST | `/api/auth/sign-out` | Session | Logout |
| POST | `/api/auth/forgot-password` | None | Request password reset |
| POST | `/api/auth/reset-password` | None | Confirm password reset |
| GET | `/api/auth/oauth2/authorize` | None | Google OAuth redirect |
| GET | `/api/auth/ok` | None | Health check |
| GET | `/api/auth/me` | Session | Get user profile |
| PATCH | `/api/auth/me` | Session | Update user profile |

## How it works

### BetterAuth Integration
BetterAuth is mounted as Express middleware via `toNodeHandler()` in `main.ts`. It intercepts all requests starting with `/api/auth/` before NestJS processes them. This ensures BetterAuth handles its own body parsing and cookie management without interference.

```typescript
// main.ts
app.use((req, res, next) => {
  if (req.path.startsWith('/api/auth/')) {
    void betterAuthHandler(req, res);
  } else {
    next();
  }
});
```

### Session-based auth
Unlike Django's JWT tokens (stateless, client-stored), BetterAuth uses HTTP-only session cookies (stateful, server-stored). This is more secure against XSS attacks because JavaScript cannot access the cookie.

### Auth Guard
The `AuthGuard` calls `auth.api.getSession()` with the request headers. If no valid session exists, it throws `UnauthorizedException`. On success, it attaches the user and session objects to the request for downstream use.

### Roles Guard
The `RolesGuard` checks the `@Roles()` metadata on the route handler and verifies `user.isStaff === true` for admin routes.

### Custom user fields
BetterAuth's `user` table is extended with: `lastName`, `address`, `phone`, `isStaff`, `isActive`, `registeredAt`. These are configured via the `additionalFields` option in `auth.setup.ts`.

## Why this approach

- **BetterAuth over JWT**: Session-based auth eliminates token storage vulnerabilities on the client. HTTP-only cookies cannot be stolen by XSS.
- **Express middleware pattern**: Mounting BetterAuth before NestJS avoids conflicts with NestJS body parsers and global prefixes.
- **Custom fields on user**: Instead of a separate `profiles` table with 1:1 relationship, custom fields on the BetterAuth `user` table simplify queries and reduce joins.
- **Google OAuth built-in**: BetterAuth provides Google OAuth out of the box, replacing Django's manual Google token verification.
