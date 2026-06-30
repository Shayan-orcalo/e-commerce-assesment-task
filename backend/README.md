# LuxeShop — Backend (NestJS)

REST API for the LuxeShop e-commerce platform built with NestJS, MongoDB, and JWT authentication.

---

## Tech Stack

| Technology | Purpose |
|------------|---------|
| NestJS | Backend framework |
| TypeScript | Language |
| MongoDB + Mongoose | Database |
| Passport.js + JWT | Authentication |
| bcryptjs | Password hashing |
| Stripe | Payment processing |
| Swagger | API documentation |
| Jest + Supertest | Testing |

---

## Prerequisites

- Node.js v18+
- npm v9+
- MongoDB running on `localhost:27017`

---

## Installation

```bash
npm install
```

---

## Environment Variables

Create a `.env` file in the `backend/` root:

```env
MONGODB_URI=mongodb://localhost:27017/luxeshop
JWT_SECRET=your_secret_key_here
JWT_EXPIRY=7d
STRIPE_SECRET_KEY=sk_test_your_stripe_key
PAYMENT_MODE=mock
PORT=3001
```

| Variable | Description |
|----------|-------------|
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret key for signing JWT tokens |
| `JWT_EXPIRY` | Token expiry duration (e.g. `7d`) |
| `STRIPE_SECRET_KEY` | Stripe secret key (test mode) |
| `PAYMENT_MODE` | `mock` to skip Stripe, `stripe` for real payments |
| `PORT` | Port the server runs on (default: 3001) |

---

## Seed Database

Run this once to populate the database with an admin user, a customer user, and 10 sample products:

```bash
npm run seed
```

**Seeded credentials:**

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@luxeshop.com | Admin@123 |
| Customer | customer@luxeshop.com | Customer@123 |

---

## Running the Server

**Development (watch mode):**
```bash
npm run start:dev
```

**Debug mode:**
```bash
npm run start:debug
```

**Production:**
```bash
npm run build
npm run start
```

Server runs on: **http://localhost:3001**

---

## API Documentation (Swagger)

Once the server is running, open:

**http://localhost:3001/api**

Swagger UI lists all available endpoints with request/response schemas.

---

## Project Structure

```
backend/
├── src/
│   ├── auth/           # Login, signup, JWT strategy & guard
│   ├── users/          # User schema & service
│   ├── products/       # Product catalog (CRUD, filter, sort, pagination)
│   ├── cart/           # Shopping cart (add, update, remove, clear)
│   ├── orders/         # Order creation & history
│   ├── payments/       # Stripe PaymentIntent creation
│   ├── admin/          # Dashboard analytics & order management
│   ├── common/         # Shared guards, decorators, exception filter
│   ├── app.module.ts   # Root module
│   └── main.ts         # Entry point
├── database/
│   └── seed.ts         # Database seeder
├── test/               # E2E tests
├── .env                # Environment variables (create this)
└── package.json
```

---

## API Endpoints

### Auth
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/auth/signup` | Public | Register new user |
| POST | `/auth/login` | Public | Login and receive JWT token |

### Products
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/products` | Public | List products (filter, sort, paginate) |
| GET | `/products/:id` | Public | Get single product |
| GET | `/products/:id/suggestions` | Public | Get related products |
| POST | `/products` | Admin | Create product |
| PATCH | `/products/:id` | Admin | Update product |
| DELETE | `/products/:id` | Admin | Delete product |

### Cart
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/cart` | Customer | Get user's cart |
| POST | `/cart/items` | Customer | Add item to cart |
| PATCH | `/cart/items/:productId` | Customer | Update item quantity |
| DELETE | `/cart/items/:productId` | Customer | Remove item from cart |
| DELETE | `/cart` | Customer | Clear entire cart |

### Orders
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/orders` | Customer | Create order from cart |
| GET | `/orders` | Customer | Get user's order history |
| GET | `/orders/:id` | Customer | Get single order |

### Payments
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/payments/create-intent` | Customer | Create Stripe PaymentIntent |

### Admin
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/admin/dashboard` | Admin | Analytics (revenue, top products, orders by status) |
| GET | `/admin/orders` | Admin | All orders |
| PATCH | `/admin/orders/:id/status` | Admin | Update order status |

---

## Authentication

All protected routes require a JWT token in the `Authorization` header:

```
Authorization: Bearer <your_token>
```

The token is returned from `/auth/login`.

**Roles:**
- `customer` — can access cart, orders, payments
- `admin` — can access all routes including product CRUD and admin dashboard

---

## Running Tests

**Unit tests:**
```bash
npm run test
```

**End-to-end tests:**
```bash
npm run test:e2e
```

---

## Order Status Flow

```
pending → processing → shipped → delivered
                              ↘ cancelled
```

Status updates are admin-only via `PATCH /admin/orders/:id/status`.
