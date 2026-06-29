# Backend — Mini E-Commerce Platform

## Stack

- **Framework:** NestJS (Node.js)
- **Language:** TypeScript
- **Database:** PostgreSQL
- **ORM:** TypeORM
- **Auth:** JWT (access token, no refresh token for simplicity)
- **Validation:** class-validator + class-transformer (NestJS pipes)
- **Password Hashing:** bcrypt
- **Payments:** Stripe test mode (or mock service)
- **Config:** `@nestjs/config` with `.env` file

---

## Project Structure

```
backend/
├── src/
│   ├── main.ts                   # Bootstrap, global pipes/filters, CORS
│   ├── app.module.ts
│   ├── config/
│   │   └── database.config.ts    # TypeORM config from env
│   ├── auth/
│   │   ├── auth.module.ts
│   │   ├── auth.controller.ts    # POST /auth/signup, POST /auth/login
│   │   ├── auth.service.ts
│   │   ├── jwt.strategy.ts       # Passport JWT strategy
│   │   ├── roles.guard.ts        # RolesGuard (admin vs customer)
│   │   └── dto/
│   │       ├── signup.dto.ts
│   │       └── login.dto.ts
│   ├── users/
│   │   ├── users.module.ts
│   │   ├── users.service.ts
│   │   └── user.entity.ts
│   ├── products/
│   │   ├── products.module.ts
│   │   ├── products.controller.ts
│   │   ├── products.service.ts
│   │   ├── product.entity.ts
│   │   └── dto/
│   │       ├── create-product.dto.ts
│   │       ├── update-product.dto.ts
│   │       └── product-query.dto.ts
│   ├── cart/
│   │   ├── cart.module.ts
│   │   ├── cart.controller.ts
│   │   ├── cart.service.ts
│   │   ├── cart.entity.ts
│   │   └── cart-item.entity.ts
│   ├── orders/
│   │   ├── orders.module.ts
│   │   ├── orders.controller.ts
│   │   ├── orders.service.ts
│   │   ├── order.entity.ts
│   │   ├── order-item.entity.ts
│   │   └── dto/
│   │       ├── create-order.dto.ts
│   │       └── update-order-status.dto.ts
│   ├── payments/
│   │   ├── payments.module.ts
│   │   ├── payments.controller.ts  # POST /payments/create-intent
│   │   └── payments.service.ts     # Stripe test or mock
│   ├── admin/
│   │   └── dashboard/
│   │       ├── dashboard.module.ts
│   │       ├── dashboard.controller.ts  # GET /admin/dashboard
│   │       └── dashboard.service.ts
│   └── common/
│       ├── filters/
│       │   └── http-exception.filter.ts  # Global exception filter
│       ├── guards/
│       │   └── jwt-auth.guard.ts
│       ├── decorators/
│       │   ├── roles.decorator.ts    # @Roles('admin')
│       │   └── current-user.decorator.ts
│       └── interceptors/
│           └── transform.interceptor.ts  # Wrap all responses in { data, message }
├── database/
│   └── seed.ts                   # Seed script (ts-node)
├── test/
│   ├── auth.e2e-spec.ts
│   ├── products.e2e-spec.ts
│   └── orders.e2e-spec.ts
├── .env.example
└── package.json
```

---

## Database Schema

### `users`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid (PK) | |
| email | varchar(255) | unique |
| passwordHash | varchar | bcrypt hash |
| name | varchar(100) | |
| role | enum('customer','admin') | default 'customer' |
| createdAt | timestamp | |

### `products`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid (PK) | |
| name | varchar(255) | |
| description | text | |
| price | decimal(10,2) | |
| imageUrl | varchar | nullable |
| category | varchar(100) | |
| stockQuantity | int | default 0 |
| createdAt | timestamp | |

### `carts`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid (PK) | |
| userId | uuid (FK → users) | unique (1 cart per user) |

### `cart_items`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid (PK) | |
| cartId | uuid (FK → carts) | |
| productId | uuid (FK → products) | |
| quantity | int | |

### `orders`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid (PK) | |
| userId | uuid (FK → users) | |
| total | decimal(10,2) | calculated at creation, immutable |
| status | enum | pending/processing/shipped/delivered/cancelled |
| createdAt | timestamp | |

### `order_items`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid (PK) | |
| orderId | uuid (FK → orders) | |
| productId | uuid (FK → products) | nullable (product may be deleted) |
| quantity | int | |
| priceAtPurchase | decimal(10,2) | snapshot — never changes |
| productName | varchar | snapshot — never changes |

---

## API Endpoints

### Auth
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/auth/signup` | Public | Register customer |
| POST | `/auth/login` | Public | Returns JWT |

### Products
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/products` | Public | List with filters/sort/pagination |
| GET | `/products/:id` | Public | Single product detail |
| GET | `/products/suggestions` | Public | Suggestions by productId query param |
| POST | `/products` | Admin | Create product |
| PATCH | `/products/:id` | Admin | Update product |
| DELETE | `/products/:id` | Admin | Delete product |

### Cart
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/cart` | Customer | Get current user's cart |
| POST | `/cart/items` | Customer | Add item (productId, quantity) |
| PATCH | `/cart/items/:itemId` | Customer | Update quantity |
| DELETE | `/cart/items/:itemId` | Customer | Remove item |
| DELETE | `/cart` | Customer | Clear cart |

### Orders
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/orders` | Customer | Create order from cart |
| GET | `/orders` | Customer | List own orders |
| GET | `/orders/:id` | Customer | Own order detail |
| GET | `/admin/orders` | Admin | List all orders |
| PATCH | `/admin/orders/:id/status` | Admin | Update order status |

### Payments
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/payments/create-intent` | Customer | Create Stripe PaymentIntent (test) or mock |

### Admin Dashboard
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/admin/dashboard` | Admin | Returns stats object |

---

## Query Parameters — `GET /products`

| Param | Type | Notes |
|-------|------|-------|
| search | string | ILIKE `%term%` on name |
| category | string | exact match |
| minPrice | number | price >= value |
| maxPrice | number | price <= value |
| sort | `price_asc` \| `price_desc` \| `newest` | default: newest |
| page | number | default: 1 |
| limit | number | default: 12, max: 50 |

Returns: `{ data: Product[], total: number, page: number, limit: number }`

---

## Business Logic

### `POST /orders` (create order)
1. Load current user's cart (must be non-empty, else 400)
2. For each cart item:
   - Fetch product, check `stockQuantity >= quantity` — if not, throw 409 with item name
   - Snapshot `priceAtPurchase` and `productName` into `order_item`
3. Calculate `order.total = SUM(priceAtPurchase × quantity)` server-side (never trust client total)
4. Decrement `stockQuantity` for each product in a single transaction
5. Create `order` + `order_items` in same transaction
6. Clear the cart
7. Return order

### `GET /products/suggestions?productId=X`
1. Load product X to get its `category`
2. Query: same category, `id != X`, order by total units sold (JOIN order_items, SUM qty), LIMIT 4
3. If result < 4, pad with globally top-selling products (excluding already included + X)
4. Return array of products

### Stock Decrement (Race Condition Mitigation)
Use a pessimistic lock or `UPDATE products SET stockQuantity = stockQuantity - $qty WHERE id = $id AND stockQuantity >= $qty` returning affected rows. If affected = 0, rollback and return 409.

### Admin: Delete Product
- Check if any `order_items` reference this product
- If yes: return 400 "Cannot delete product with existing orders" (frontend disables button but server enforces)
- If no: hard delete

---

## Auth & Authorization

### JWT Strategy
```
payload: { sub: userId, email, role }
secret: process.env.JWT_SECRET
expiresIn: '7d'
```

### Guards Applied
- `JwtAuthGuard` — verifies token, attaches user to request
- `RolesGuard` — checks `@Roles('admin')` decorator; must be used AFTER JwtAuthGuard

### Controller Usage
```ts
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Get('/admin/orders')
```

### Customer Isolation
- Cart and order services always filter by `userId` from JWT — never from request body
- Admin order endpoints do not filter by userId

---

## DTOs & Validation

All incoming data validated via `ValidationPipe` (global, `whitelist: true, forbidNonWhitelisted: true`).

### `CreateProductDto`
```ts
name: string (minLength 1, maxLength 255)
description: string (optional)
price: number (min 0.01)
imageUrl: string (optional, isUrl)
category: string (minLength 1)
stockQuantity: number (integer, min 0)
```

### `CreateOrderDto`
```ts
paymentIntentId: string (required — from payment step)
```

### `UpdateOrderStatusDto`
```ts
status: enum (processing | shipped | delivered | cancelled)
// 'pending' excluded — orders start as pending, admin moves forward
```

---

## Error Handling

Global `HttpExceptionFilter` catches all exceptions and returns:
```json
{
  "statusCode": 400,
  "message": "Insufficient stock for: Blue Hoodie",
  "timestamp": "2026-06-29T...",
  "path": "/orders"
}
```
- No stack traces in responses (only logged server-side)
- TypeORM unique constraint violations → 409
- Entity not found → 404
- Unauthorized role → 403

---

## Payment (Stripe Test Mode)

```ts
// payments.service.ts
async createPaymentIntent(amount: number): Promise<string> {
  const intent = await this.stripe.paymentIntents.create({
    amount: Math.round(amount * 100), // cents
    currency: 'gbp',
    payment_method_types: ['card'],
  })
  return intent.client_secret
}
```

Frontend uses Stripe.js with test card `4242 4242 4242 4242` to confirm.

**Mock fallback (if Stripe not configured):** Service returns a dummy `client_secret`; frontend skips Stripe.js confirmation and proceeds directly to order creation. Controlled by `PAYMENT_MODE=mock` env var.

---

## Admin Dashboard Response

```ts
GET /admin/dashboard
{
  totalRevenue: number,           // SUM of all order totals (status != cancelled)
  ordersByStatus: {
    pending: number,
    processing: number,
    shipped: number,
    delivered: number,
    cancelled: number
  },
  topProducts: [
    { productId, productName, unitsSold: number, revenue: number }
    // top 5, sorted by unitsSold desc
  ]
}
```

---

## Seed Script (`database/seed.ts`)

Run with: `npx ts-node database/seed.ts`

Creates:
- **Admin user:** `admin@shop.com` / `Admin1234!`
- **Customer user:** `customer@shop.com` / `Customer1234!`
- **10 products** across 3 categories (Electronics, Clothing, Books) with realistic prices and stock
- Clears existing data before seeding (idempotent)

---

## Environment Variables

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=yourpassword
DB_NAME=ecommerce

# Auth
JWT_SECRET=your-secret-key-here

# Stripe
STRIPE_SECRET_KEY=sk_test_...
PAYMENT_MODE=stripe    # or 'mock'

# App
PORT=3001
NODE_ENV=development
```

---

## Testing

### Unit Tests (Jest)
- `orders.service.spec.ts` — stock check logic, total calculation, cart-to-order conversion
- `auth.service.spec.ts` — password hashing, JWT signing, login failure on wrong password
- `products.service.spec.ts` — filter query builder, suggestions logic

### E2E Tests (Supertest)
- `POST /auth/signup` → `POST /auth/login` → `GET /cart` (auth flow)
- `POST /orders` with insufficient stock → expect 409
- Admin endpoint with customer JWT → expect 403

Run: `npm run test` (unit) / `npm run test:e2e`

---

## Security Checklist

- [ ] Passwords hashed with bcrypt (rounds: 12)
- [ ] JWT secret loaded from env, never hardcoded
- [ ] `.env` in `.gitignore`
- [ ] `ValidationPipe` with `whitelist: true` (strips unknown fields)
- [ ] Admin routes guarded at controller level (not just middleware)
- [ ] Order totals calculated server-side
- [ ] `priceAtPurchase` snapshotted — immune to product price changes
- [ ] CORS configured to allow only frontend origin in production
- [ ] No raw errors exposed to clients (global exception filter)
