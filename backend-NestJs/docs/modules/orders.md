# Orders Module

## What it does
Manages customer orders: creation, listing, status updates, and checkout from cart.

## Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/orders` | Session | User's orders |
| POST | `/api/orders` | Session | Create order |
| POST | `/api/orders/checkout` | Session | Checkout from cart |
| GET | `/api/orders/:id` | Session | Order details |
| PUT | `/api/orders/:id` | Session | Update order |
| DELETE | `/api/orders/:id` | Session | Delete order |

## How it works

### Direct Order Creation
`create()` accepts an array of items with product IDs, quantities, and unit prices. It calculates the total and uses a **Drizzle transaction** to atomically insert both the order and its items:

```typescript
return this.db.transaction(async (tx) => {
  const [order] = await tx.insert(orders).values({...}).returning();
  for (const item of dto.items) {
    await tx.insert(orderItems).values({...});
  }
  return order;
});
```

### Checkout from Cart
`checkout()` reads the user's cart items with their current prices (including any sale price), calculates totals, creates the order and items atomically, then clears the cart. This prevents the user from being charged outdated prices.

### Atomic Transactions
Both operations use PostgreSQL transactions via `this.db.transaction()`. If any step fails (e.g., inserting an order item), the entire operation rolls back, preventing partial orders.

## Decimal handling
Order totals and item prices are stored as numeric strings in Drizzle decimal columns. The service converts JavaScript numbers:

```typescript
total: total.toString(),
unitPrice: item.unitPrice.toString(),
subtotal: (item.unitPrice * item.quantity).toString(),
```

## Why this approach
- **Database transactions**: Critical for e-commerce — ensures an order never exists without items, or vice versa.
- **Price snapshot at order time**: During checkout, the current product price is read from the database and stored in `order_items.unit_price`. Future price changes don't affect completed orders.
- **Cart checkout flow**: The checkout endpoint simplifies the frontend flow — the frontend doesn't need to manually construct order line items; it just triggers checkout and the server reads the cart.
