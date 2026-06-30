# E-Commerce Assessment Task — Project Notes

## Project Overview

A full-stack e-commerce platform called **LuxeShop** built as an assessment task. It covers a customer-facing storefront and an admin management panel, connected through a RESTful API backend.

- **Frontend:** Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **Backend:** NestJS + TypeScript + MongoDB (Mongoose)
- **Auth:** JWT (7-day expiry) + Passport.js + bcrypt
- **Payment:** Stripe test mode (with mock fallback)

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14 (App Router), React 18, TypeScript |
| Backend | NestJS, Node.js, TypeScript |
| Database | MongoDB with Mongoose ODM |
| Auth | JWT + Passport.js |
| Styling | Tailwind CSS + Radix UI |
| Forms | React Hook Form + Zod (client), class-validator (server) |
| State | Zustand (global), TanStack Query / React Query (server cache) |
| Charts | Recharts |
| Payment | Stripe test mode |
| Testing | Jest + Supertest (backend), Vitest + React Testing Library (frontend) |

---

## Project Structure

```
e-commerce-assesment-task/
├── .claude/
│   ├── backend.md          # Backend architecture reference
│   ├── frontend.md         # Frontend architecture reference
│   └── requirement.md      # Full project requirements
├── backend/                # NestJS backend app
│   └── src/
│       ├── auth/           # Login, signup, JWT strategy
│       ├── users/          # User schema & service
│       ├── products/       # Product catalog CRUD
│       ├── cart/           # Shopping cart management
│       ├── orders/         # Order creation & tracking
│       ├── payments/       # Stripe PaymentIntent
│       ├── admin/          # Admin dashboard analytics
│       └── common/         # Guards, decorators, filters
├── frontend/               # Next.js frontend app
│   └── src/
│       ├── app/
│       │   ├── (store)/    # Customer-facing pages
│       │   └── admin/      # Admin panel pages
│       ├── components/     # UI components
│       ├── store/          # Zustand stores (auth, cart)
│       └── lib/            # Axios instance, helpers
└── Fullstack_Assessment_Task_Final 3.md   # Original task spec
```

---

## Database Schema (MongoDB)

### users
| Field | Type | Notes |
|-------|------|-------|
| email | String | unique |
| passwordHash | String | bcrypt hashed |
| name | String | |
| role | Enum | `customer` \| `admin` |
| createdAt | Date | |

### products
| Field | Type | Notes |
|-------|------|-------|
| name | String | |
| description | String | |
| price | Number | |
| imageUrl | String | URL-based, no file upload |
| category | String | |
| stockQuantity | Number | decremented on purchase |
| createdAt | Date | |

### carts
| Field | Type | Notes |
|-------|------|-------|
| userId | ObjectId | unique — one cart per user |
| items | Array | `{ productId, quantity }` |

### orders
| Field | Type | Notes |
|-------|------|-------|
| userId | ObjectId | |
| items | Array | `{ productName, priceAtPurchase, quantity }` — snapshot at time of purchase |
| total | Number | calculated server-side |
| status | Enum | `pending → processing → shipped → delivered \| cancelled` |
| createdAt | Date | |

---

## API Endpoints Summary

### Auth
| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| POST | `/auth/signup` | Public | Register new customer |
| POST | `/auth/login` | Public | Login, returns JWT |

### Products
| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| GET | `/products` | Public | List with filter, sort, pagination |
| GET | `/products/:id` | Public | Single product detail |
| GET | `/products/:id/suggestions` | Public | Same-category + popular fallback |
| POST | `/products` | Admin | Create product |
| PATCH | `/products/:id` | Admin | Update product |
| DELETE | `/products/:id` | Admin | Delete product |

### Cart
| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| GET | `/cart` | Customer | Get user's cart |
| POST | `/cart/items` | Customer | Add item to cart |
| PATCH | `/cart/items/:productId` | Customer | Update item quantity |
| DELETE | `/cart/items/:productId` | Customer | Remove item |
| DELETE | `/cart` | Customer | Clear cart |

### Orders
| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| POST | `/orders` | Customer | Create order from cart |
| GET | `/orders` | Customer | User's order history |
| GET | `/orders/:id` | Customer | Single order detail |

### Payments
| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| POST | `/payments/create-intent` | Customer | Create Stripe PaymentIntent |

### Admin
| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| GET | `/admin/dashboard` | Admin | Analytics (revenue, top products, orders by status) |
| GET | `/admin/orders` | Admin | All orders |
| PATCH | `/admin/orders/:id/status` | Admin | Update order status |

---

## Key Features

### Customer Storefront
- Product browse, search, filter by category and price range
- Sorting: price asc/desc, newest
- Pagination (12 per page by default)
- Product detail page with quantity selector
- Shopping cart (localStorage sync + API sync when logged in)
- Checkout with Stripe test payment
- Order history with status tracking
- Signup / Login with JWT auth

### Admin Panel
- Product CRUD (image via URL)
- Order management with status lifecycle control
- Analytics dashboard:
  - Total revenue card
  - Orders by status breakdown
  - Top-selling products table
  - Sales chart (Recharts)

### Cross-Cutting Concerns
- Input validation: Zod (client) + class-validator (server)
- Passwords hashed with bcrypt
- JWT stored in Zustand + localStorage
- Admin routes protected by middleware + guards
- Stock check + atomic decrement on order creation
- Price snapshot at purchase time (prevents retroactive price changes affecting orders)
- Server-side total calculation (client total not trusted)
- Global HTTP exception filter (no stack traces exposed)
- CORS configured
- `.env` managed via `@nestjs/config`

---

## Architecture Decisions & Trade-offs

| Decision | Reason |
|----------|--------|
| MongoDB over PostgreSQL | Simpler schema management for assessment scope; Mongoose ODM fits nested cart/order structures well |
| Stateless JWT (no refresh token) | Simplicity — adequate for assessment scope |
| Zustand for cart + auth | Lightweight, no boilerplate; persists to localStorage easily |
| TanStack Query for server state | Handles caching, background refetch, loading/error states automatically |
| URL-based product images | Avoids file upload complexity; sufficient for assessment |
| Stripe mock fallback | Allows running without real Stripe keys; toggle via env var |
| Price snapshot on order | Data integrity — product price changes must not alter historical orders |

---

## Setup & Running

### Backend
```bash
cd backend
cp .env.example .env        # fill in MONGODB_URI, JWT_SECRET, STRIPE_SECRET_KEY
npm install
npm run seed                # seeds admin, customer, 10 sample products
npm run start:dev
```

Default MongoDB URI: `mongodb://localhost:27017/luxeshop`

### Frontend
```bash
cd frontend
cp .env.local.example .env.local    # set NEXT_PUBLIC_API_URL=http://localhost:3001
npm install
npm run dev
```

Frontend runs on: `http://localhost:3000`
Backend runs on: `http://localhost:3001`

### Seed Credentials
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@luxeshop.com | Admin@123 |
| Customer | customer@luxeshop.com | Customer@123 |

---

## Testing

### Backend
```bash
cd backend
npm run test          # unit tests (Jest)
npm run test:e2e      # end-to-end tests (Supertest)
```

### Frontend
```bash
cd frontend
npm run test          # Vitest + React Testing Library
```

---

## Environment Variables

### Backend (`.env`)
```
MONGODB_URI=mongodb://localhost:27017/luxeshop
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRY=7d
STRIPE_SECRET_KEY=sk_test_...
PAYMENT_MODE=mock        # set to 'stripe' to use real Stripe
PORT=3001
```

### Frontend (`.env.local`)
```
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

---

## Known Assumptions

- One active cart per user (server-side enforced)
- No guest checkout — users must be logged in to place orders
- Stock quantity is not reserved during checkout, only decremented on order creation
- Admin cannot place orders (role-based restriction)
- Images are external URLs (no S3 / file upload)
- Order cancellation is admin-initiated only (customers cannot self-cancel)

---

## References

- [Assessment Task Spec](Fullstack_Assessment_Task_Final%203.md)
- [Backend Architecture](.claude/backend.md)
- [Frontend Architecture](.claude/frontend.md)
- [Requirements Summary](.claude/requirement.md)
