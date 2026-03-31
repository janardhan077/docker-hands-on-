# ShopDash — Full-Stack E-Commerce App

## Stack
- **Frontend**: React 18 (SPA, no build step)
- **Backend**: Node.js + Express
- **Database**: MongoDB + Mongoose

---

## Project Structure
```
shopdash/
├── frontend/
│   └── shopdash-frontend.html    ← Open directly in browser (demo mode)
└── backend/
    ├── server.js                 ← Express API (all routes)
    ├── models/index.js           ← MongoDB Mongoose schemas
    ├── seed.js                   ← Seed script
    └── package.json
```

---

## Quick Start

### 1. Frontend (Demo — no backend needed)
```bash
# Just open the HTML file in any browser
open shopdash-frontend.html
```
Demo login:  `admin@shopdash.com` / `admin123`

### 2. Backend + Real Database
```bash
cd backend
npm install

# Copy .env and set your MongoDB URI
cp .env.example .env
# Edit MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/shopdash

# Seed the database
node seed.js

# Start dev server
npm run dev        # with nodemon
# or
npm start          # production
```

---

## API Endpoints

### Auth
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/api/auth/register` | — | Register new user |
| POST | `/api/auth/login` | — | Login, returns JWT |
| GET | `/api/auth/me` | ✅ | Get current user |

### Products
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/api/products` | — | List products (search, filter, paginate) |
| GET | `/api/products/:id` | — | Get single product |
| POST | `/api/products` | Admin | Create product |
| PUT | `/api/products/:id` | Admin | Update product |
| DELETE | `/api/products/:id` | Admin | Soft-delete product |

### Cart
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/api/cart` | ✅ | Get cart |
| POST | `/api/cart` | ✅ | Add item |
| PUT | `/api/cart/:productId` | ✅ | Update quantity |
| DELETE | `/api/cart/:productId` | ✅ | Remove item |

### Orders
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/api/orders` | ✅ | Place order |
| GET | `/api/orders/mine` | ✅ | My orders |
| GET | `/api/orders/:id` | ✅ | Order detail |
| PATCH | `/api/orders/:id/status` | Admin | Update status |

### Analytics (Admin only)
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/analytics/summary` | KPIs |
| GET | `/api/analytics/revenue` | Daily revenue (30d) |
| GET | `/api/analytics/top-products` | Best sellers |
| GET | `/api/analytics/orders-by-status` | Order breakdown |

---

## MongoDB Collections

| Collection | Purpose |
|-----------|---------|
| `users` | Customers + admins. Passwords bcrypt-hashed. |
| `products` | Full-text search indexed. Soft-delete via `isActive`. |
| `orders` | Line items, shipping, payment, status history. |
| `carts` | One per user. Auto-cleared on order. |
| `reviews` | One per user per product. Post-save hook updates product rating. |

---

## Frontend Stages (Multi-Step Flow)

1. **Store** → Browse + search + filter by category
2. **Product Detail** → Images, description, qty selector, add to cart
3. **Cart** → Review items, qty controls, order summary
4. **Checkout (3 steps)** → Shipping → Payment → Review
5. **Confirmation** → Success screen with order ID
6. **Auth** → Login / Register
7. **Admin Dashboard** → Overview, Orders, Products, Analytics
