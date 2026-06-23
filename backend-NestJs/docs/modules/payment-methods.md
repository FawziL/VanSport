# Payment Methods Module

## What it does
Manages available payment method configurations visible to customers during checkout. Admins configure which methods are active and their display order.

## Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/payment-methods` | None | List active methods |
| GET | `/api/payment-methods/:id` | None | Get method by ID |
| POST | `/api/payment-methods` | Admin | Create method |
| PUT | `/api/payment-methods/:id` | Admin | Update |
| PATCH | `/api/payment-methods/:id` | Admin | Partial update |
| DELETE | `/api/payment-methods/:id` | Admin | Delete |

## How it works

### Active filtering
Public endpoints return only `isActive = true` methods, sorted by `sortOrder`:

```typescript
async findAll() {
  return this.db.select().from(paymentMethods)
    .where(eq(paymentMethods.isActive, true));
}
```

### Method configuration
Each payment method stores:
- `code`: Machine identifier (e.g., `paypal`, `pago_movil`)
- `name`: Human-readable name (e.g., "PayPal", "Mobile Payment")
- `type`: Payment type (e.g., `online`, `transfer`, `cash`)
- `config`: JSONB field for method-specific settings (e.g., API keys, account numbers)
- `instructions`: User-facing payment instructions (e.g., "Transfer to account #12345")
- `icon`: CSS class or icon identifier for UI rendering

## Why this design
- **Database-driven configuration**: Payment methods can be enabled/disabled without code changes — useful for promotions or temporary issues.
- **JSONB config**: The `config` field stores method-specific settings (API endpoints, account numbers) without needing a separate table per payment method.
- **Sort order**: The `sortOrder` field lets admins control display priority, pushing preferred methods to the top.
- **Public read, admin write**: Regular users can see available methods but cannot modify them, preventing payment configuration tampering.
