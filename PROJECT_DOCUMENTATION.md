# FitLife E-Commerce Platform - Technical Documentation

**Project Type:** Full-Stack E-Commerce Web Application  
**Tech Stack:** React 19 + Vite (Frontend) | Express.js + MongoDB (Backend)  
**Generated:** April 2026

---

## 1. Executive Summary

This is a comprehensive e-commerce platform that combines:
- **E-Commerce Store** - Fitness products (men, women, supplements, accessories)
- **Gym Membership Booking** - Browse and book gym memberships
- **Admin Dashboard** - Full CMS for managing products, gyms, orders, and users
- **User Accounts** - Authentication, order history, wishlist, profile management

---

## 2. Project Architecture

### 2.1 Directory Structure

```
react-project/
├── React-project/              # Frontend Application
│   ├── src/
│   │   ├── admin/              # Admin Panel
│   │   ├── components/        # Reusable UI Components
│   │   ├── context/            # React Context (State Management)
│   │   ├── pages/              # Page Components
│   │   ├── styles/             # CSS Files
│   │   └── utils/              # Utility Functions
│   └── package.json
│
└── Node-backend/              # Backend API
    ├── model/                  # Mongoose Schemas
    ├── routes/                 # API Routes
    ├── middleware/             # Auth & Validation Middleware
    ├── uploads/                # File Storage
    └── package.json
```

---

## 3. Technology Stack

### 3.1 Frontend Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| React | ^19.0.0 | UI Framework |
| React Router DOM | ^7.5.3 | Client-side Routing |
| Axios | ^1.9.0 | HTTP Client |
| React Toastify | ^11.0.5 | Notifications |
| JWT Decode | ^4.0.0 | Token Parsing |
| Splide React | ^0.7.12 | Carousel/Slider |
| Font Awesome | ^6.7.2 | Icons |
| Recharts | ^3.8.1 | Dashboard Charts |
| Lucide React | ^0.562.0 | Icons |
| Flowbite | ^4.0.1 | UI Components |
| Tailwind CSS | ^4.1.18 | Styling |
| Vite | ^6.3.1 | Build Tool |

### 3.2 Backend Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| Express | ^5.1.0 | Web Framework |
| Mongoose | ^8.15.1 | MongoDB ODM |
| BcryptJS | ^3.0.2 | Password Hashing |
| JSONWebToken | ^9.0.2 | Authentication |
| CORS | ^2.8.5 | Cross-Origin Requests |
| Multer | ^2.0.1 | File Uploads |
| Express Validator | ^7.2.1 | Input Validation |
| Dotenv | ^16.5.0 | Environment Config |

---

## 4. Core Algorithms

### 4.1 Product Recommendation Algorithm

**Location:** `Node-backend/routes/Products.js` (Lines 82-179)

**Algorithm Type:** Hybrid Collaborative Filtering + Content-Based

**How It Works:**

1. **User Purchase History Analysis**
   - Fetches last 20 non-cancelled orders
   - Extracts product categories from past purchases
   - Weights categories by purchase frequency

2. **Product Scoring System**
   ```
   Final Score = Category Score + Title Score + Discount Score
   
   Category Score = categoryWeight × 5
   Title Score = tokenMatches × 2
   Discount Score = min(discount / 10, 3)
   ```

3. **Fallback Logic**
   - If user not logged in or has no orders
   - Returns products sorted by discount percentage and date

**Tokenization Process:**
- Removes stop words (the, a, an, etc.)
- Tokenizes product titles
- Compares against purchased product titles

---

### 4.2 Gym Ranking Algorithm

**Location:** `Node-backend/routes/Gyms.js` (Lines 78-109)

**Ranking Formula:**
```
Ranking Score = (Rating × 0.75) + (Affordability × 5 × 0.25)

Where:
- Rating: User rating (0-5 scale)
- Affordability = 1 - (price - minPrice) / (maxPrice - minPrice)
```

**Weight Distribution:**
- 75% weight on customer rating
- 25% weight on price affordability

---

### 4.3 Cart Management

**Location:** `React-project/src/context/product/ProductState.jsx`

**State Management:** React useReducer

**Actions:**
- `ADD_TO_CART` - Add item or increment quantity
- `REMOVE_FROM_CART` - Remove item by ID
- `UPDATE_QTY` - Update quantity (removes if qty ≤ 0)
- `CLEAR_CART` - Empty cart

**Persistence:** localStorage

**Derived Values:**
```javascript
cartCount = sum of all item quantities
cartSubtotal = sum of (price - discount) × quantity
```

---

## 5. Database Schema

### 5.1 MongoDB Collections

#### User Collection
```javascript
{
  name: String,
  email: String (unique, required),
  password: String (bcrypt hashed),
  role: "user" | "admin",
  wishlist: [ObjectId → Product],
  createdAt: Date
}
```

#### Product Collection
```javascript
{
  title: String (required),
  description: String,
  price: Number (required),
  instock: Number,
  discount: Number (percentage),
  image: [String] (array of URLs),
  category: "Men" | "Women" | "Supplements" | "Accessories",
  date: Date (default: now)
}
```

#### Gym Collection
```javascript
{
  name: String (required),
  description: String,
  location: String,
  rating: Number (0-5),
  mainImage: String,
  gallery: [String],
  membership: {
    oneMonth: Number,
    threeMonths: Number,
    sixMonths: Number,
    oneYear: Number
  },
  date: Date
}
```

#### Order Collection
```javascript
{
  userId: ObjectId → User,
  customer: {
    fullName: String,
    phone: String,
    city: String,
    address: String,
    notes: String
  },
  items: [{
    productId: ObjectId,
    title: String,
    price: Number,
    qty: Number,
    lineTotal: Number
  }],
  deliveryType: "inside" | "outside",
  deliveryFee: Number,
  subtotal: Number,
  total: Number,
  paymentMethod: "cod" | "online",
  status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled",
  createdAt: Date
}
```

#### GymBooking Collection
```javascript
{
  userId: ObjectId → User,
  gymId: ObjectId → Gym,
  gymName: String,
  gymLocation: String,
  customer: {
    fullName: String,
    phone: String,
    address: String,
    notes: String
  },
  plan: "1 Month" | "3 Months" | "6 Months" | "1 Year",
  price: Number,
  startDate: Date,
  paymentMethod: "cod" | "online",
  status: "pending" | "confirmed" | "completed" | "cancelled",
  createdAt: Date
}
```

---

## 6. API Endpoints

### 6.1 Authentication API

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/createuser` | Register new user | Public |
| POST | `/api/auth/login` | User login | Public |
| GET | `/api/auth/getuser` | Get current user | JWT |

### 6.2 Products API

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/products` | Get all products | Public |
| GET | `/api/products/recommendations` | Personalized recs | JWT |
| GET | `/api/products/:id` | Get single product | Public |
| POST | `/api/products/addproduct` | Add product | Admin |
| PUT | `/api/products/:id` | Update product | Admin |
| DELETE | `/api/products/:id` | Delete product | Admin |

### 6.3 Gyms API

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/gyms` | Get all gyms | Public |
| GET | `/api/gyms/:id` | Get single gym | Public |
| POST | `/api/gyms/addgym` | Add gym | Admin |
| PUT | `/api/gyms/:id` | Update gym | Admin |
| DELETE | `/api/gyms/:id` | Delete gym | Admin |

### 6.4 Orders API

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/orders/my` | User's orders | User |
| GET | `/api/orders/:id` | Single order | User |
| POST | `/api/orders` | Create order | User |
| GET | `/api/admin/orders` | All orders | Admin |
| PUT | `/api/admin/orders/:id/status` | Update status | Admin |

### 6.5 Gym Bookings API

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/gym-bookings/my` | User's bookings | User |
| POST | `/api/gym-bookings` | Book a gym | User |
| GET | `/api/admin/gym-bookings` | All bookings | Admin |

### 6.6 Wishlist API

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/wishlist` | Get wishlist | User |
| POST | `/api/wishlist/add` | Add item | User |
| DELETE | `/api/wishlist/remove/:id` | Remove item | User |

### 6.7 Admin Users API

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/admin/users` | All users | Admin |
| DELETE | `/api/admin/users/:id` | Delete user | Admin |

---

## 7. Component Architecture

### 7.1 Frontend Components

#### Public Components
| Component | Purpose |
|-----------|---------|
| `Header.jsx` | Navigation header |
| `Footer.jsx` | Site footer |
| `Navbar.jsx` | Main navigation |
| `GymCard.jsx` | Gym listing card |
| `ProductCard.jsx` | Product display card |
| `Banner.jsx` | Promotional banner |
| `Hero.jsx` | Homepage hero section |
| `Features.jsx` | Feature highlights |

#### Admin Components
| Component | Purpose |
|-----------|---------|
| `AdminDashboard.jsx` | Analytics & charts |
| `AdminProducts.jsx` | Product CRUD |
| `AdminGyms.jsx` | Gym CRUD |
| `AdminOrders.jsx` | Order management |
| `AdminUsers.jsx` | User management |
| `AdminLogin.jsx` | Admin authentication |

### 7.2 Pages

#### Public Pages
| Page | Route | Description |
|------|-------|-------------|
| Home | `/` | Landing page |
| Products | `/products` | Product listings |
| ProductDetails | `/product/:id` | Single product |
| Gyms | `/gyms` | Gym listings |
| GymDetails | `/gym/:id` | Single gym |
| CartItems | `/cart` | Shopping cart |
| Checkout | `/checkout` | Order form |
| Payment | `/payment` | Payment page |
| Wishlist | `/wishlist` | Saved items |
| Login | `/login` | User login |
| Signup | `/signup` | User registration |
| Profile | `/profile` | User account |
| MyOrders | `/myorders` | Order history |
| MyGymBookings | `/my-gym-bookings` | Gym bookings |

#### Admin Pages
| Page | Route |
|------|-------|
| AdminDashboard | `/admin` |
| AdminProducts | `/admin/products` |
| AdminGyms | `/admin/gyms` |
| AdminOrders | `/admin/orders` |
| AdminUsers | `/admin/users` |
| AdminGymBookings | `/admin/gym-bookings` |

---

## 8. Security Implementation

### 8.1 Authentication Flow
1. User registers/logins → JWT token generated
2. Token stored in localStorage
3. Token decoded on app load via jwt-decode
4. Token sent in Authorization header for protected routes

### 8.2 Role-Based Access Control
```javascript
// JWT Payload Structure
{
  user: {
    id: "...",
    role: "user" | "admin"
  }
}
```

### 8.3 Middleware Protection
| Middleware | Purpose |
|------------|---------|
| `fetchuser.js` | Extracts user from JWT |
| `adminAuth.js` | Verifies admin role |
| `adminOnly.js` | Additional admin check |
| `fetchUserOptional.js` | Optional user fetch |

### 8.4 Password Security
- BcryptJS hashing with salt
- Never stored in plain text

---

## 9. State Management

### 9.1 React Context API

| Context | Purpose |
|---------|---------|
| `AuthContext.jsx` | Authentication state, login/logout |
| `ProductContext.jsx` | Products, cart, recommendations |
| `UserContext.jsx` | User profile data |
| `WishlistContext.jsx` | Saved products |

---

## 10. Key Features

### 10.1 E-Commerce Features
- Product catalog with categories (Men, Women, Supplements, Accessories)
- Search and filter products
- Shopping cart with localStorage persistence
- Wishlist functionality
- Multiple payment methods (COD, Online)
- Order tracking and history

### 10.2 Gym Membership Features
- Browse gyms with ratings
- Multiple membership plans (1M, 3M, 6M, 1Y)
- Gym booking system
- Booking history

### 10.3 Admin Features
- Dashboard with revenue charts (Recharts)
- Product management (CRUD)
- Gym management (CRUD)
- Order management
- User management
- Booking management

---

## 11. Design & UI

### 11.1 Styling
- **Tailwind CSS** for utility-first styling
- **Flowbite** for pre-built UI components
- **Custom CSS** for specific components

### 11.2 Icons
- Font Awesome
- Lucide React

### 11.3 Animations
- Splide React for carousels
- CSS transitions for hover effects

---

## 12. Environment Configuration

### 12.1 Frontend (.env)
```
VITE_API_URL=http://localhost:5000
```

### 12.2 Backend (.env)
```
MONGO_URI=mongodb://localhost:27017/fitlife
JWT_SECRET=your_jwt_secret_key
PORT=5000
CORS_ORIGIN=http://localhost:5173
```

---

## 13. Running the Application

### 13.1 Backend
```bash
cd Node-backend
npm install
npm run dev
# Server runs on http://localhost:5000
```

### 13.2 Frontend
```bash
cd React-project
npm install
npm run dev
# Client runs on http://localhost:5173
```

---

## 14. Project Statistics

| Metric | Count |
|--------|-------|
| Frontend Components | 40+ |
| Backend Routes | 25+ |
| Database Models | 5 |
| API Endpoints | 30+ |
| Context Providers | 4 |

---

## 15. Conclusion

This is a production-ready e-commerce platform with:
- Modern React 19 architecture
- Secure RESTful API
- MongoDB database
- Smart recommendation algorithms
- Full admin dashboard
- Responsive design

The platform successfully combines e-commerce with gym membership booking, providing a unique fitness-focused shopping experience.

---

*Document generated on April 2026*
