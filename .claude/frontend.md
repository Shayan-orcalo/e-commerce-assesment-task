# Frontend — Mini E-Commerce Platform

## Stack

- **Framework:** Next.js (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **State Management:** Zustand (cart + auth state)
- **Data Fetching:** TanStack Query (React Query)
- **Forms:** React Hook Form + Zod (client-side validation)
- **Charts (Admin):** Recharts
- **HTTP Client:** Axios (with interceptors for JWT attachment)

---

## Project Structure

```
frontend/
├── app/
│   ├── (store)/                  # Customer storefront layout
│   │   ├── page.tsx              # Product catalog / homepage
│   │   ├── products/
│   │   │   └── [id]/page.tsx     # Product detail page
│   │   ├── cart/page.tsx         # Shopping cart
│   │   ├── checkout/page.tsx     # Checkout flow
│   │   ├── orders/page.tsx       # Order history
│   │   └── auth/
│   │       ├── login/page.tsx
│   │       └── signup/page.tsx
│   ├── (admin)/                  # Admin panel layout (role-guarded)
│   │   ├── dashboard/page.tsx    # Analytics dashboard
│   │   ├── products/
│   │   │   ├── page.tsx          # Product list + CRUD
│   │   │   └── [id]/page.tsx     # Edit product
│   │   └── orders/page.tsx       # Order management
│   └── layout.tsx                # Root layout
├── components/
│   ├── ui/                       # Reusable primitives (Button, Input, Modal, Badge)
│   ├── store/                    # Storefront-specific components
│   │   ├── ProductCard.tsx
│   │   ├── ProductGrid.tsx
│   │   ├── ProductFilters.tsx
│   │   ├── CartDrawer.tsx
│   │   ├── CheckoutForm.tsx
│   │   └── ProductSuggestions.tsx
│   └── admin/                    # Admin-specific components
│       ├── ProductForm.tsx
│       ├── OrderTable.tsx
│       ├── StatusBadge.tsx
│       └── SalesChart.tsx
├── hooks/
│   ├── useAuth.ts
│   ├── useCart.ts
│   └── useProducts.ts
├── lib/
│   ├── api.ts                    # Axios instance + base URL
│   ├── auth.ts                   # Token helpers (get/set/clear)
│   └── validators.ts             # Zod schemas shared across forms
├── store/
│   ├── cartStore.ts              # Zustand cart state
│   └── authStore.ts              # Zustand auth state (user, token)
└── types/
    └── index.ts                  # Shared TS interfaces
```

---

## Pages & Features

### Customer Storefront

#### Product Catalog (`/`)
- Grid of `ProductCard` components
- Search input (debounced, query param driven)
- Sidebar/top filters: category (select), price range (min/max inputs)
- Sort controls: price asc/desc, newest
- Pagination: page-based or infinite scroll — use page-based (simpler, bookmarkable)
- All filter/sort/page state lives in URL query params (`?category=&minPrice=&sort=&page=`)

#### Product Detail (`/products/[id]`)
- Full product info: image, name, category, price, stock, description
- Quantity selector (1 → stockQuantity, disabled if out of stock)
- "Add to Cart" button
- `ProductSuggestions` component below fold (same-category + trending, see Open-Ended section)

#### Shopping Cart (`/cart`)
- List of cart items with image, name, unit price, quantity stepper, remove button
- Line total per item (qty × price)
- Order total at bottom
- "Proceed to Checkout" CTA
- Empty cart state with link back to catalog
- Cart state persisted in `localStorage` for guests; synced to server for logged-in users

#### Checkout (`/checkout`) — auth required
- Summary of items
- Mock payment form (card number, expiry, CVV — Stripe test mode fields or a clearly labelled mock)
- "Place Order" button → POST `/orders`
- On success: redirect to `/orders/[id]/confirmation`
- Handles: out-of-stock error from server, payment failure (mock)

#### Order History (`/orders`) — auth required
- Table/list of past orders: order ID, date, total, status badge
- Click through to order detail view

#### Auth (`/auth/login`, `/auth/signup`)
- Login: email + password, JWT stored in `authStore` + `localStorage`
- Signup: name, email, password (with confirm), role defaults to `customer`
- Redirect to intended page after login

---

### Admin Panel (`/admin/*`) — admin role required

#### Route Guard
- Middleware (`middleware.ts`) checks JWT role claim
- Non-admin users redirected to `/auth/login`

#### Dashboard (`/admin/dashboard`)
- Cards: total revenue, total orders, pending orders count
- Bar or line chart of orders by status (Recharts)
- Table of top 5 selling products (by units sold)

#### Product Management (`/admin/products`)
- Table: image thumbnail, name, category, price, stock, actions (edit/delete)
- "Add Product" button opens `ProductForm` modal
- Edit: same form pre-populated
- Delete: confirmation dialog; disabled if product has associated orders (show tooltip)
- Image: URL input field (no file upload — simpler, document this choice)

#### Order Management (`/admin/orders`)
- Table: order ID, customer email, date, total, status
- Status dropdown per row to update: `pending → processing → shipped → delivered | cancelled`
- Filter by status

---

## Open-Ended Feature — Product Suggestions

**Interpretation:** Hybrid relevance — same category + globally trending.

**Implementation:**
- On product detail page: fetch `/products/suggestions?productId=X` 
- Backend returns: up to 4 products from same category (excluding current), sorted by total units sold descending
- Frontend: `ProductSuggestions` component renders a horizontal scroll row of `ProductCard`s
- Label: "You might also like"

**Why this approach:** Simple, explainable, works without user history (day-1 problem). Degrade gracefully — if fewer than 4 same-category products exist, pad with globally popular products.

---

## State Management

| State | Where |
|-------|-------|
| Auth (user, token) | Zustand `authStore` + `localStorage` |
| Cart items | Zustand `cartStore` + `localStorage` (guest) / API sync (logged in) |
| Server data (products, orders) | TanStack Query cache |
| Filter/sort/page | URL query params |
| Form state | React Hook Form |
| Modal open/close | Local `useState` |

---

## API Integration

All requests go through `lib/api.ts` (Axios instance):
- `baseURL` from `NEXT_PUBLIC_API_URL` env var
- Request interceptor: attach `Authorization: Bearer <token>` if token exists
- Response interceptor: on 401, clear auth state and redirect to login

---

## Client-Side Validation (Zod schemas)

| Form | Validated Fields |
|------|-----------------|
| Signup | email (valid format), password (min 8 chars), name (required) |
| Login | email, password (required) |
| Product form (admin) | name, price (positive number), stock (non-negative int), category |
| Checkout | card number (16 digits mock), expiry (MM/YY), CVV (3 digits) |

---

## Environment Variables

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...   # if using Stripe test mode
```

---

## Error Handling

- API errors displayed as toast notifications (or inline form errors for validation)
- 401 → auto logout + redirect
- 404 product → dedicated empty state component
- Network error → retry prompt
- Never show raw error objects or stack traces to users

---

## Key Components Contract

### `ProductCard`
```ts
props: { id, name, price, imageUrl, category, stockQuantity }
```
Navigates to `/products/[id]` on click. Shows "Out of Stock" badge if `stockQuantity === 0`.

### `CartDrawer` (slide-in panel)
```ts
// Opened via Zustand cartStore.openCart()
// Shows cart items, totals, checkout CTA
```

### `StatusBadge`
```ts
props: { status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' }
// Color-coded: pending=yellow, processing=blue, shipped=purple, delivered=green, cancelled=red
```

---

## Testing

Focus areas (quality > quantity):
- `ProductFilters` — filter/sort state updates URL params correctly
- `cartStore` — add, remove, update quantity, total calculation
- Auth redirect — unauthenticated user hitting `/checkout` is redirected to login
- `CheckoutForm` — Zod validation rejects invalid card fields

Test runner: **Vitest** + **React Testing Library**

---

## Design Principles

- Clean, minimal storefront — white background, clear product grid, generous spacing
- Admin panel — sidebar nav, data-dense tables, muted palette
- Consistent typography and spacing via Tailwind config
- Mobile-responsive storefront; admin panel desktop-first
- Accessible: `aria-label` on icon buttons, keyboard-navigable forms
