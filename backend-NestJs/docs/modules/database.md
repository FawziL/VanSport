# Database Module

## What it does
Provides the Drizzle ORM client as a global NestJS dependency. Any module can inject the database client without importing the DatabaseModule directly.

## How it works

### Drizzle Client Setup
**File:** `db/index.ts`

Creates a PostgreSQL connection pool and initializes the Drizzle ORM client with all table schemas:

```typescript
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const db = drizzle({ client: pool, schema });
export { schema };
```

### NestJS Provider
**File:** `src/database.module.ts`

Wraps the Drizzle client in a `@Global()` NestJS module so it's available everywhere:

```typescript
@Global()
@Module({
  providers: [
    { provide: 'DRIZZLE', useValue: db },
  ],
  exports: ['DRIZZLE'],
})
export class DatabaseModule {}
```

### Injection in Services
Services inject the client using the `'DRIZZLE'` injection token:

```typescript
@Injectable()
export class CategoriesService {
  constructor(@Inject('DRIZZLE') private db: NodePgDatabase<typeof schema>) {}
}
```

### Schema Re-exports
**File:** `db/schema/index.ts`

All table schemas are re-exported from a single barrel file, making imports cleaner:

```typescript
export * from './auth-schema';
export * from './categories';
export * from './products';
// ... etc
```

## Why this design
- **Global Module Pattern**: The `@Global()` decorator means the database provider is available throughout the app without explicit imports in each feature module.
- **Drizzle ORM over raw SQL**: Drizzle provides type-safe queries with auto-completion, preventing SQL injection and runtime errors from typos.
- **Single connection pool**: Using a single `Pool` instance across the application reuses connections efficiently instead of creating new ones per request.
- **Bull barrel exports**: The `schema/index.ts` file provides a single import path for all tables, simplifying service code.
