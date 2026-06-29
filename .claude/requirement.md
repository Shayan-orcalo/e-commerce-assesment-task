# Full-Stack Developer Assessment — Mini E-Commerce Platform

## Project Overview

Build a complete e-commerce platform with a **customer storefront** and an **admin panel**, sharing a single backend. Priority: working and coherent over polished or feature-complete.

**Requirements:**
- Built using agentic AI tools (Claude Code, Cursor, Windsurf, or similar)
- UI/UX design produced using design agents (Claude Design, v0, Figma AI, etc.) — no pre-made templates
- Format: supervised timed session (~5–6 hours)

---

## Tech Stack (Suggested, Not Mandatory)

| Layer | Suggested |
|-------|-----------|
| Backend | Node.js (NestJS) |
| Frontend | React / Next.js |
| Database | PostgreSQL, MySQL, or MongoDB |
| Auth | JWT or session-based |

---

## Data Model (Core Entities)

- **User** — id, email, passwordHash, role (`customer` | `admin`), createdAt
- **Product** — id, name, description, price, imageUrl, category, stockQuantity, createdAt
- **Cart** — userId, items: [{ productId, quantity }]
- **Order** — id, userId, items: [{ productId, quantity, priceAtPurchase }], total, status, createdAt
- **OrderStatus** — `pending` → `processing` → `shipped` → `delivered` (or `cancelled`)

---

## Part 1 — Customer Storefront

### 1. Product Catalog
- Browse products: name, description, price, image, category, stock quantity
- Search by product name
- Filter by category and price range
- Sort by price and by newest
- Paginated product list (no full-load)

### 2. Product Detail Page
- Full product information
- Add-to-cart with quantity selection

### 3. Shopping Cart
- Add, remove, update quantities
- Cart persists across sessions (logged-in user)
- Display line totals and order total

### 4. Checkout
- Capture order + mock/test payment (Stripe test mode recommended)
- On success: create order record + show confirmation
- No real payment integration

### 5. Order History
- Logged-in customer views past orders and statuses

### 6. Authentication
- Signup and login
- Customer can only access their own cart and orders

---

## Part 2 — Admin Panel

### 1. Product Management
- Create, edit, delete products
- Image support (upload or URL — document the choice)

### 2. Order Management
- View all orders
- Update order status: `pending → processing → shipped → delivered` (and `cancelled`)

### 3. Admin Dashboard
- Total sales figure
- Order count by status
- Top-selling products
- At least one chart

### 4. Access Control
- Admin panel and its API endpoints restricted to admin users
- Regular customers cannot access admin functionality

---

## Cross-Cutting Requirements

| Requirement | Details |
|-------------|---------|
| **Input Validation** | Both client and server; handle bad input gracefully |
| **Error Handling** | Meaningful errors, correct HTTP status codes, no stack traces to users |
| **Data Integrity** | Order totals, stock levels, and statuses stay correct; handle edge cases (over-ordering, price mismatch) |
| **Security** | Auth enforced everywhere needed; authorization checked properly; secrets out of codebase; passwords hashed |
| **Seed Script** | Populate DB with sample products, ≥1 admin user, ≥1 customer user |
| **README** | Prerequisites, env vars, start commands, seeded credentials |
| **Tests** | A few meaningful automated tests on important logic (quality > quantity) |

---

## Open-Ended Requirement

> **Customers should be able to see product suggestions that are relevant to them.**

This is intentionally ambiguous. Define what "relevant" means, implement a reasonable version, and document your interpretation and reasoning in `NOTES.md`.

Possible interpretations:
- Same-category products on the product detail page
- "Customers also bought" based on order co-occurrence
- Recently viewed products
- Trending/popular products globally
- Personalized scoring based on purchase history

---

## Deliverables

1. **Full source code** — backend, frontend, seed script, tests, README
2. **Coherent Git history** — logical incremental commits (no single "final" dump)
3. **`NOTES.md`** covering:
   - Agent workflow — tools used, how tasks were scoped, how context was managed (e.g. `CLAUDE.md`)
   - Where the agent helped and where it failed — mistakes caught and corrected
   - Supervision & verification — how agent output was reviewed
   - Design workflow — which design agents, how directed, iteration process
   - Assumptions — every ambiguous decision made
   - Trade-offs and scope — what was built fully, mocked, or cut
4. **Agent session transcripts/logs** (Claude Code generates these automatically)

---

## Evaluation Dimensions

| Dimension | Weight/Focus |
|-----------|-------------|
| Agentic workflow & orchestration | Headline dimension — scoping, steering, context management, recovery |
| Verification & judgment | Evidence of reviewing agent output; tests; caught mistakes; edge cases |
| Correctness & completeness | Runs from clean clone; meets spec |
| Code quality & architecture | Coherent and maintainable structure |
| Handling ambiguity | Reasoned decisions documented in NOTES.md |
| Design & UX | Cohesive, usable, deliberately styled via design agents |
| Security & data integrity | Auth, authorization, secrets, money/stock/state correctness |

---

## Suggested Build Order

1. Skim spec → sketch data model and API endpoints
2. Pick stack → scaffold project → "hello world" on both ends
3. Set up DB, models, and seed script
4. **Build auth first** (underpins everything)
5. Storefront read paths (catalog, detail, filtering)
6. Storefront write paths (cart, checkout)
7. Orders, then admin panel
8. Open-ended feature + dashboard
9. Tests and `NOTES.md` (write as you go, not at the end)
10. Clean-clone test — follow your own README from scratch

---

## Key Edge Cases to Handle

- Ordering quantity > stock available
- Product price changes after item added to cart (capture `priceAtPurchase`)
- Cart with out-of-stock items at checkout time
- Admin attempting to delete a product that has existing orders
- Concurrent checkout requests reducing stock (basic race condition awareness)

---

## Ground Rules

- Agentic workflow is **required** — drive the build through an agent
- **Own your code** — understand everything submitted; expect a walkthrough in follow-up
- **Ask if blocked** — document assumptions in NOTES.md otherwise
- **Don't over-build** — breadth that connects end-to-end beats depth in one corner
