# Cart Module

## What it does
Manages the shopping cart. Users can add products, update quantities, remove items, and clear the entire cart.

## Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/cart` | Session | Get user's cart |
| GET | `/api/cart/:id` | Session | Get cart item by ID |
| POST | `/api/cart/add` | Session | Add item (or increment qty) |
| POST | `/api/cart/update-quantity` | Session | Set exact quantity |
| POST | `/api/cart/remove` | Session | Remove item by productId |
| POST | `/api/cart/clear` | Session | Clear entire cart |
| DELETE | `/api/cart/:id` | Session | Delete cart item by ID |

## How it works

### Add with quantity merge
When adding an item that already exists in the cart, the service **merges quantities** instead of creating a duplicate:

```typescript
const existing = await this.db.select().from(cartItems)
  .where(and(eq(cartItems.userId, userId), eq(cartItems.productId, dto.productId)));

if (existing.length > 0) {
  // Update: existing.quantity + new.quantity
  await this.db.update(cartItems)
    .set({ quantity: existing[0].quantity + dto.quantity })
    .where(eq(cartItems.id, existing[0].id));
}
```

### Scoped to user
All cart operations filter by `userId`, which comes from the authenticated session via the `@CurrentUser('id')` decorator. Users can only see and modify their own cart.

### Separate update vs. add
- `add`: Adds to existing quantity (intended for "Add to Cart" button clicks)
- `update-quantity`: Sets exact quantity (intended for cart page quantity selectors)
- `remove`: Removes by product ID (convenient when the frontend knows the product but not the cart item ID)

## Why this design
- **Quantity merging**: Prevents duplicate entries when a user clicks "Add to Cart" on a product already in their cart.
- **User-scoped data**: The `userId` foreign key on `cart_items` ensures data isolation between users.
- **Multiple remove strategies**: The product-based `remove` endpoint simplifies the frontend (no need to track cart item IDs), while the ID-based `DELETE` endpoint provides a standard RESTful alternative.
