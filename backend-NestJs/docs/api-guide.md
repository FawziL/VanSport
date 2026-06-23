# API Guide — VanSport API

All endpoints are prefixed with `/api`.

## Authentication

BetterAuth handles authentication. All auth endpoints are at `/api/auth/*`.

### Register

```bash
curl -X POST http://localhost:3000/api/auth/sign-up/email \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "securepass", "name": "John"}'
```

### Login

```bash
curl -X POST http://localhost:3000/api/auth/sign-in/email \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "securepass"}' \
  -c cookies.txt
```

### Get Session

```bash
curl http://localhost:3000/api/auth/session \
  -b cookies.txt
```

### Sign Out

```bash
curl -X POST http://localhost:3000/api/auth/sign-out \
  -b cookies.txt
```

### Current User Profile

```bash
curl http://localhost:3000/api/auth/me \
  -b cookies.txt
```

### Update Profile

```bash
curl -X PATCH http://localhost:3000/api/auth/me \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"name": "John", "lastName": "Doe", "phone": "+584141234567"}'
```

### Google OAuth

Redirect user to:
```
http://localhost:3000/api/auth/oauth2/authorize?provider=google
```

## Public Endpoints (no auth required)

### Categories
```bash
GET  /api/categories        # List all
GET  /api/categories/:id    # Get by ID
```

### Products
```bash
GET  /api/products          # List active products
GET  /api/products/:id      # Get by ID
```

### Reviews
```bash
GET  /api/reviews           # List all
GET  /api/reviews/:id       # Get by ID
GET  /api/reviews?productId=1  # By product
```

### Notifications
```bash
GET  /api/notifications              # List global
GET  /api/notifications/latest-banner  # Latest banner
GET  /api/notifications/:id          # Get by ID
```

### Exchange Rate
```bash
GET  /api/exchange-rate/dolar-bcv    # BCV rate
```

### Payment Methods
```bash
GET  /api/payment-methods            # List active
GET  /api/payment-methods/:id        # Get by ID
```

## Authenticated Endpoints (require session)

### Cart
```bash
GET    /api/cart                    # User cart
POST   /api/cart/add                # Add item
POST   /api/cart/update-quantity    # Update qty
POST   /api/cart/remove             # Remove item
POST   /api/cart/clear              # Clear cart
DELETE /api/cart/:id                # Delete cart item
```

### Orders
```bash
GET    /api/orders              # User orders
POST   /api/orders              # Create order
POST   /api/orders/checkout     # Checkout from cart
GET    /api/orders/:id          # Order details
PUT    /api/orders/:id          # Update order
DELETE /api/orders/:id          # Delete order
```

### Order Items
```bash
GET    /api/order-items             # List
GET    /api/order-items?orderId=1   # By order
GET    /api/order-items/:id         # By ID
DELETE /api/order-items/:id         # Delete
```

### Transactions
```bash
GET    /api/transactions            # User transactions
POST   /api/transactions            # Create
POST   /api/transactions/pay        # Pay
GET    /api/transactions/:id        # By ID
DELETE /api/transactions/:id        # Delete
```

### Shipments
```bash
GET    /api/shipments                # User shipments
POST   /api/shipments                # Create
GET    /api/shipments/order/:id      # By order
GET    /api/shipments/:id            # By ID
DELETE /api/shipments/:id            # Delete
```

### Bug Reports
```bash
GET    /api/bug-reports              # User reports
POST   /api/bug-reports              # Create
GET    /api/bug-reports/:id          # By ID
PUT    /api/bug-reports/:id          # Update
POST   /api/bug-reports/:id/followups  # Add follow-up
DELETE /api/bug-reports/:id          # Delete
```

### Notifications (user)
```bash
POST   /api/notifications              # Create
POST   /api/notifications/:id/mark-read  # Mark as read
DELETE /api/notifications/:id          # Delete
```

## Admin Endpoints (require is_staff = true)

### Categories Admin
```bash
POST   /api/categories           # Create
PUT    /api/categories/:id       # Update
PATCH  /api/categories/:id       # Partial update
DELETE /api/categories/:id       # Delete
```

### Products Admin
```bash
POST   /api/products             # Create
PUT    /api/products/:id         # Update
PATCH  /api/products/:id         # Partial update
DELETE /api/products/:id         # Delete
```

### Users Admin
```bash
GET    /api/users                # List all
GET    /api/users/:id            # By ID
PUT    /api/users/:id            # Update
PATCH  /api/users/:id            # Partial update
DELETE /api/users/:id            # Delete
```

### Payment Methods Admin
```bash
POST   /api/payment-methods      # Create
PUT    /api/payment-methods/:id  # Update
DELETE /api/payment-methods/:id  # Delete
```
