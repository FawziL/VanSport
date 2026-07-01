# Categories Module

## What it does
Manages product categories. Public users can list and view categories; admins can create, update, and delete them.

## Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/categories` | None | List all categories |
| GET | `/api/categories/:id` | None | Get category by ID |
| POST | `/api/categories` | Admin | Create category |
| PUT | `/api/categories/:id` | Admin | Update category |
| PATCH | `/api/categories/:id` | Admin | Partial update |
| DELETE | `/api/categories/:id` | Admin | Delete category |

## How it works
`CategoriesService` uses the Drizzle ORM to query the `categories` table. The service injects the Drizzle client via NestJS's DI system (`@Inject('DRIZZLE')`).

```typescript
@Injectable()
export class CategoriesService {
  constructor(@Inject('DRIZZLE') private db: NodePgDatabase<typeof schema>) {}
}
```

Admin routes are protected with both `AuthGuard` and `RolesGuard`:

```typescript
@Post()
@UseGuards(AuthGuard, RolesGuard)
@Roles('admin')
```

## Why this structure
- **Separation of concerns**: Controller handles HTTP concerns (routing, status codes), service handles business logic and database access.
- **DTO validation**: `CreateCategoryDto` and `UpdateCategoryDto` use `class-validator` decorators for automatic request validation via NestJS's `ValidationPipe`.
- **Partial updates**: `UpdateCategoryDto` extends `PartialType(CreateCategoryDto)` so any subset of fields can be updated via PATCH.
