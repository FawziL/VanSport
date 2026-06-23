# Shipments Module

## What it does
Manages order shipping and delivery tracking. Supports multiple shipping methods with status updates and tracking codes.

## Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/shipments` | Session | User's shipments |
| POST | `/api/shipments` | Session | Create shipment |
| GET | `/api/shipments/order/:orderId` | Session | Get by order |
| GET | `/api/shipments/:id` | Session | Get by ID |
| PUT | `/api/shipments/:id` | Session | Update |
| PATCH | `/api/shipments/:id` | Session | Partial update |
| DELETE | `/api/shipments/:id` | Session | Delete |

## How it works

### User scoping
Like transactions, user shipments are retrieved via a join with orders:

```typescript
async findByUser(userId: string) {
  return this.db.select().from(shipments)
    .innerJoin(schema.orders, eq(shipments.orderId, schema.orders.id))
    .where(eq(schema.orders.userId, userId));
}
```

### Shipment fields
- `shippingMethod`: The carrier or method (e.g., "DHL", "Domestic Mail")
- `trackingCode`: Carrier tracking number for package tracking
- `shippedAt` / `estimatedDelivery`: Timestamps for the shipping timeline
- `cost`: Shipping cost (decimal, stored as string in Drizzle)
- `address`: Shipping address (may differ from order's shipping address)

## Why this design
- **Separate from Orders**: Shipping has its own lifecycle and fields, warranting a separate table. An order might not be shipped immediately, or might have multiple partial shipments.
- **Timeline tracking**: The `shippedAt` and `estimatedDelivery` timestamps enable delivery status displays and notifications.
- **Method flexibility**: The `shippingMethod` text field accepts any carrier name, avoiding the need for a shipping carriers reference table.
