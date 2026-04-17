# React Project Monorepo Documentation

This repository contains a full-stack e-commerce and gym-booking platform with:

- `React-project`: React + Vite frontend (customer and admin UI)
- `Node-backend`: Express + MongoDB API server

---

## 1) Project Overview

The platform supports:

- Product browsing and category filtering
- Cart management and checkout flow
- Wishlist management (authenticated users)
- User authentication (JWT)
- Gym listing, gym details, and gym membership booking
- User order history and gym booking history
- Admin dashboard for products, users, orders, gyms, and gym bookings

---

## 2) Tech Stack

### Frontend (`React-project`)

- React 19
- React Router
- Vite
- Tailwind CSS + Flowbite + DaisyUI
- Axios / Fetch API
- React Toastify
- Font Awesome / React Icons / Lucide

### Backend (`Node-backend`)

- Node.js + Express
- MongoDB + Mongoose
- JWT (`jsonwebtoken`)
- `bcryptjs` for password hashing
- `express-validator` for request validation
- `multer` for image uploads
- `cors`, `dotenv`

---

## 3) Repository Structure

```text
react-project/
├── React-project/                 # Frontend app
│   ├── src/
│   │   ├── admin/                 # Admin pages, routes, components
│   │   ├── components/            # User-facing UI and pages
│   │   ├── context/               # Product, user, auth, wishlist state
│   │   ├── styles/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
├── Node-backend/                  # API server
│   ├── middleware/
│   ├── model/
│   ├── routes/
│   ├── uploads/                   # Uploaded image files (runtime)
│   ├── db.js
│   ├── index.js
│   └── package.json
└── README.md
```

---

## 4) Prerequisites

- Node.js 18+ (recommended)
- npm 9+ (or compatible)
- MongoDB (local instance or MongoDB Atlas)

---

## 5) Environment Variables

Create a `.env` file inside `Node-backend`:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/react_project
JWT_SECRET=your_jwt_secret_here
CORS_ORIGIN=http://localhost:5173
```

Notes:

- `CORS_ORIGIN` supports comma-separated origins.
- Frontend mostly uses hardcoded `http://localhost:5000` endpoints, with partial support for `VITE_API_BASE` in some pages.

---

## 6) Installation and Run

Install dependencies:

```bash
# Frontend
cd React-project
npm install

# Backend
cd ../Node-backend
npm install
```

Run development servers (two terminals):

```bash
# Terminal 1 (backend)
cd Node-backend
npm run dev

# Terminal 2 (frontend)
cd React-project
npm run dev
```

Default local URLs:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`
- Uploaded assets: `http://localhost:5000/uploads/<filename>`

---

## 7) Frontend Details

### 7.1 Global Providers

`App.jsx` wraps the app in:

- `AuthProvider`
- `UserState`
- `WishlistState`
- `ProductState`

### 7.2 Public/User Routes

- `/` - Home
- `/contact-us` - Contact page
- `/login` - Login
- `/signup` - Signup
- `/women-products`, `/men-products`, `/supplements`, `/accsessories`
- `/search/:searchQuery`
- `/product/:id`
- `/wishlist`
- `/gyms`
- `/gym/:id`
- `/gym-booking/:id`
- `/gym-booking-success/:id`
- `/my-gym-bookings`
- `/checkout`
- `/order-success/:id`
- `/my-orders`
- `/cartitems`
- `/payment`
- `/profile`

### 7.3 Admin Routes

Base: `/admin/*`

- `/admin/login` (public admin login)
- `/admin` (dashboard)
- `/admin/products`
- `/admin/users`
- `/admin/orders`
- `/admin/gyms`
- `/admin/gym-bookings`

Admin access control:

- Implemented in `admin/AdminRoutes.jsx`
- Uses `useAuth()` + role check (`user?.role === "admin"`)

### 7.4 Frontend State Management

- `ProductState`
  - Product fetch with search/category query
  - Cart storage in `localStorage`
  - Derived `cartCount`, `cartSubtotal`
- `WishlistState`
  - Syncs wishlist with backend endpoints
  - Optimistic add/remove updates
- `AuthContext`
  - JWT decode from `localStorage`
  - `login()`, `logout()`, `isAuthenticated`
- `UserState`
  - Fetches profile via `/api/auth/getuser`
  - Exposes `isAdmin`

---

## 8) Backend Details

### 8.1 API Base

All APIs are served under:

`http://localhost:5000/api`

### 8.2 Mounted Route Groups

- `/api/auth`
- `/api/products`
- `/api/gyms`
- `/api/wishlist`
- `/api/orders`
- `/api/admin/orders`
- `/api/gym-bookings`
- `/api/admin/gym-bookings`
- `/api/admin/users`

### 8.3 Authentication & Authorization

- User token header: `auth-token`
- JWT payload stores `user.id` and `user.role`
- Middleware:
  - `fetchuser` - authenticated user required
  - `fetchUserOptional` - accepts guest or authenticated request
  - `adminOnly` / `adminAuth` - admin role enforcement

---

## 9) API Reference

### 9.1 Auth

- `POST /api/auth/createuser` - Register user
- `POST /api/auth/login` - Login user
- `GET /api/auth/getuser` - Get current user (auth required)

### 9.2 Products

- `GET /api/products` - List products (supports `search`, `category`)
- `POST /api/products/addproduct` - Add product (admin, multipart)
- `PUT /api/products/:id` - Update product (admin, multipart)
- `DELETE /api/products/:id` - Delete product (admin)

### 9.3 Gyms

- `GET /api/gyms` - List gyms (supports `search`)
- `GET /api/gyms/:id` - Get gym details
- `POST /api/gyms/addgym` - Add gym (admin, multipart)
- `PUT /api/gyms/:id` - Update gym (admin, multipart)
- `DELETE /api/gyms/:id` - Delete gym (admin)

### 9.4 Wishlist

- `GET /api/wishlist` - Get user wishlist
- `POST /api/wishlist/add` - Add product to wishlist
- `DELETE /api/wishlist/remove/:productId` - Remove product from wishlist

### 9.5 Orders

- `GET /api/orders/my` - Get logged-in user orders
- `GET /api/orders/:id` - Get order by ID
- `POST /api/orders` - Create order (guest/user supported)

### 9.6 Admin Orders

- `GET /api/admin/orders` - List orders with filters (`q`, `status`, `paymentMethod`)
- `GET /api/admin/orders/:id` - Get order detail
- `PUT /api/admin/orders/:id/status` - Update order status

### 9.7 Gym Bookings

- `GET /api/gym-bookings/my` - Logged-in user bookings
- `GET /api/gym-bookings/:id` - Booking detail
- `POST /api/gym-bookings` - Create gym booking (guest/user allowed by middleware)

### 9.8 Admin Gym Bookings

- `GET /api/admin/gym-bookings` - List all gym bookings
- `PUT /api/admin/gym-bookings/:id/status` - Update booking status

### 9.9 Admin Users

- `GET /api/admin/users` - List users (without passwords)
- `DELETE /api/admin/users/:id` - Delete non-admin user

---

## 10) Data Models (Mongoose)

### `User`

- `name`, `email`, `password`
- `role`: `user | admin`
- `wishlist`: array of `Product` object IDs

### `Product`

- `title`, `description`, `price`, `instock`, `discount`
- `image`: string array
- `category`: `Men | Women | Supplements | Accessories`

### `Gym`

- `name`, `description`, `location`, `rating`
- `image`: string array
- `membership`: `oneMonth`, `threeMonths`, `sixMonths`, `oneYear`

### `Order`

- `userId` (nullable for guest flow)
- `customer` object (`fullName`, `phone`, `city`, `address`, `notes`)
- `items` array (`productId`, `title`, `price`, `qty`, `lineTotal`)
- `deliveryType`, `deliveryFee`, `subtotal`, `total`
- `paymentMethod`: `cod | online`
- `status`: `pending | confirmed | shipped | delivered | cancelled`

### `GymBooking`

- `userId` (nullable)
- `gymId`, `gymName`, `gymLocation`
- `customer` object (`fullName`, `phone`, `address`, `notes`)
- `plan`: `1 Month | 3 Months | 6 Months | 1 Year`
- `price`, `startDate`, `paymentMethod`
- `status`: `pending | confirmed | completed | cancelled`

---

## 11) File Uploads

- Product and gym image uploads use `multer`.
- Upload directory: `Node-backend/uploads`.
- Backend serves this folder via `/uploads`.
- Supported image types: `jpeg`, `jpg`, `png`, `gif`.
- Max file size: 5 MB.

---

## 12) Scripts Reference

### Frontend (`React-project/package.json`)

- `npm run dev` - Start Vite dev server
- `npm run build` - Production build
- `npm run lint` - ESLint
- `npm run preview` - Preview build

### Backend (`Node-backend/package.json`)

- `npm run dev` - Start server with Nodemon
- `npm test` - Placeholder test command

---

## 13) Known Notes / Improvements

- Frontend API URLs are mostly hardcoded to `http://localhost:5000`; centralizing with `VITE_API_BASE` would improve deployability.
- No automated test suites are currently configured.
- Consider adding role/seed scripts for admin bootstrap and sample data setup.

---

## 14) Deployment Checklist (Suggested)

- Set production `MONGO_URI`, `JWT_SECRET`, and `CORS_ORIGIN`
- Configure frontend API base URL for production backend
- Serve frontend via static hosting (Vercel/Netlify) and backend via Node host
- Persist uploads (cloud storage recommended for production)
- Add process manager (PM2/systemd) for backend runtime

