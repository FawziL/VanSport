# Database Schema — VanSport API

## Tables

### User & Auth (BetterAuth)

| Table | Purpose | Managed by |
|-------|---------|-----------|
| `user` | User accounts + custom fields | BetterAuth + Drizzle |
| `session` | User sessions | BetterAuth |
| `account` | OAuth accounts + password | BetterAuth |
| `verification` | Email verification codes | BetterAuth |

**Custom fields on `user`:**
- `last_name` — Last name
- `address` — Physical address
- `phone` — Phone number
- `is_staff` — Admin flag
- `is_active` — Active status
- `registered_at` — Registration timestamp

### Entity Tables

| Table | Purpose | Foreign Keys |
|-------|---------|-------------|
| `categories` | Product categories | — |
| `products` | Products for sale | `category_id` → `categories.id` |
| `orders` | Customer orders | `user_id` → `user.id` |
| `order_items` | Order line items | `order_id` → `orders.id`, `product_id` → `products.id` |
| `cart_items` | Shopping cart | `user_id` → `user.id`, `product_id` → `products.id` |
| `reviews` | Product reviews | `product_id` → `products.id`, `user_id` → `user.id` |
| `notifications` | System notifications | `user_id` → `user.id` (nullable) |
| `transactions` | Payment transactions | `order_id` → `orders.id` |
| `shipments` | Order shipments | `order_id` → `orders.id` |
| `bug_reports` | Bug/issue reports | `user_id` → `user.id` |
| `bug_report_followups` | Bug report follow-ups | `bug_report_id` → `bug_reports.id` |
| `payment_methods` | Available payment methods | — |

## Migrations

### Generate new migration
```bash
pnpm db:generate
```

### Apply migrations
```bash
pnpm db:migrate
```

### Push schema (dev only)
```bash
pnpm db:push
```

### Studio (GUI)
```bash
pnpm db:studio
```
