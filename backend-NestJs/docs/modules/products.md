# Products Module

## What it does
Manages the product catalog. Public users browse active products; admins manage the full catalog including inactive items and Excel exports.

## Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/products` | None | List active products |
| GET | `/api/products/:id` | None | Get active product |
| POST | `/api/products` | Admin | Create product |
| PUT | `/api/products/:id` | Admin | Update product |
| PATCH | `/api/products/:id` | Admin | Partial update |
| DELETE | `/api/products/:id` | Admin | Delete product |

## How it works

### Active vs. Admin queries
Public endpoints filter by `isActive = true`:

```typescript
async findAll() {
  return this.db.select().from(products).where(eq(products.isActive, true));
}
```

Admin endpoints show all products regardless of active status:

```typescript
async findAllAdmin() {
  return this.db.select().from(products);
}
```

### Decimal field handling
Drizzle's `decimal` type stores values as strings to maintain precision. The service layer converts incoming numbers to strings:

```typescript
values: {
  price: dto.price.toString(),
  salePrice: dto.salePrice?.toString(),
}
```

### Product Image Support
Products support a main `imageUrl` and `additionalImages` (JSON array) for gallery views.

## Why this approach
- **Soft delete with `isActive`**: Products are never truly deleted — they're deactivated. This preserves order history and prevents broken references.
- **Decimal-as-string**: PostgreSQL's `numeric` type with Drizzle's `decimal` column type preserves exact precision for monetary values, avoiding floating-point rounding errors.
- **JSON for additional images**: A JSONB column for gallery images is more flexible than a separate images table and eliminates unnecessary joins for product listings.
