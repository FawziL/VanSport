# Order Items Module

## What it does
Manages individual line items within orders. Provides read access to order contents and administrative deletion.

## Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/order-items` | Session | List items (optionally by order) |
| GET | `/api/order-items/:id` | Session | Get item by ID |
| DELETE | `/api/order-items/:id` | Session | Delete item |

## How it works
The `findAll()` method supports an optional `orderId` query parameter for filtering by order:

```typescript
@Get()
@ApiQuery({ name: 'orderId', required: false })
async findAll(@Query('orderId') orderId?: string) {
  if (orderId) {
    return this.orderItemsService.findByOrder(parseInt(orderId));
  }
  return this.orderItemsService.findAll();
}
```

This is used by the frontend to display order contents: `GET /api/order-items?orderId=5`.

## Why this module exists separately
- **Separation from Orders**: Order items have their own lifecycle (they can be queried independently of orders) and potential future features (individual item returns, partial refunds).
- **Flexible querying**: The optional `orderId` filter supports both "all my items" and "items for this specific order" views without duplicating logic.
