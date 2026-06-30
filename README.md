# LuxeShop — Full-Stack E-Commerce Assessment

A full-stack e-commerce platform with a customer storefront and an admin management panel.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14, React 18, TypeScript, Tailwind CSS |
| Backend | NestJS, Node.js, TypeScript |
| Database | MongoDB (Mongoose) |
| Auth | JWT + Passport.js + bcrypt |
| Payment | Stripe (test mode) |

---

## Prerequisites

Make sure the following are installed before running the project:

- [Node.js](https://nodejs.org/) v18 or above
- [npm](https://www.npmjs.com/) v9 or above
- [MongoDB](https://www.mongodb.com/try/download/community) running locally on port `27017`

---

## Folder Structure

```
e-commerce-assesment-task/
├── backend/      # NestJS REST API
├── frontend/     # Next.js App
└── README.md
```

---

## Backend Setup

### 1. Go to backend folder

```bash
cd backend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create environment file

Create a `.env` file inside the `backend/` folder:

```env
MONGODB_URI=mongodb://localhost:27017/luxeshop
JWT_SECRET=your_secret_key_here
JWT_EXPIRY=7d
STRIPE_SECRET_KEY=sk_test_your_stripe_key
PAYMENT_MODE=mock
PORT=3001
```

> `PAYMENT_MODE=mock` means no real Stripe key is needed. Set it to `stripe` if you want real Stripe integration.

### 4. Seed the database

```bash
npm run seed
```

This creates:
- Admin user: `admin@luxeshop.com` / `Admin@123`
- Customer user: `customer@luxeshop.com` / `Customer@123`
- 10 sample products

### 5. Start the backend

```bash
npm run start:dev
```

Backend will run on: **http://localhost:3001**

Swagger API docs: **http://localhost:3001/api**

---

## Frontend Setup

### 1. Go to frontend folder

```bash
cd frontend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create environment file

Create a `.env.local` file inside the `frontend/` folder:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_key
```

### 4. Start the frontend

```bash
npm run dev
```

Frontend will run on: **http://localhost:3000**

---

## Running Both Together

Open **two terminals** and run:

**Terminal 1 — Backend:**
```bash
cd backend
npm run start:dev
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
```

Then open **http://localhost:3000** in your browser.

---

## Default Login Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@luxeshop.com | Admin@123 |
| Customer | customer@luxeshop.com | Customer@123 |

---

## Running Tests

**Backend tests:**
```bash
cd backend
npm run test
```

**Frontend tests:**
```bash
cd frontend
npm run test
```

---

## Build for Production

**Backend:**
```bash
cd backend
npm run build
npm run start
```

**Frontend:**
```bash
cd frontend
npm run build
npm run start
```
