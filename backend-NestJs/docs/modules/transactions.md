# Transactions Module

## What it does
Manages payment transactions linked to orders. Supports transaction creation, payment confirmation, and status tracking.

## Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/transactions` | Session | User's transactions |
| POST | `/api/transactions` | Session | Create transaction |
| POST | `/api/transactions/pay` | Session | Confirm payment |
| GET | `/api/transactions/:id` | Session | Get transaction |
| PUT | `/api/transactions/:id` | Session | Update |
| PATCH | `/api/transactions/:id` | Session | Partial update |
| DELETE | `/api/transactions/:id` | Session | Delete |

## How it works

### Transaction lifecycle
1. **Created** as `pending` status
2. User uploads payment receipt or provides reference
3. **Pay** action updates status to `completed` and stores payment details

```typescript
async create(dto: CreateTransactionDto) {
  const result = await this.db.insert(transactions)
    .values({ ...dto, amount: dto.amount.toString(), status: 'pending' })
    .returning();
  return result[0];
}

async pay(id: number, dto: PayTransactionDto) {
  const result = await this.db.update(transactions)
    .set({ ...dto, status: 'completed' })
    .where(eq(transactions.id, id)).returning();
  return result[0] || null;
}
```

### User scope
User transactions are retrieved by joining with the `orders` table and filtering by `userId`:

```typescript
async findByUser(userId: string) {
  return this.db.select().from(transactions)
    .innerJoin(schema.orders, eq(transactions.orderId, schema.orders.id))
    .where(eq(schema.orders.userId, userId));
}
```

## Why this design
- **Payment method agnostic**: The `paymentMethod` field stores any method (card, transfer, cash), making the system flexible for different payment gateways.
- **Receipt storage**: The `receipt` field stores a file path for uploaded payment confirmations, supporting manual payment verification flows.
- **Two-step payment flow**: Create + Pay allows for draft transactions that are later confirmed, supporting both instant and manual payment methods.
