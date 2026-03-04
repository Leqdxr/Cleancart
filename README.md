# 🛒 CleanCart

**CleanCart** is a full-stack price comparison and decision support system for computer accessories. Add keyboards, mice, headsets, docks, and monitors to one cart and instantly see every store's total — so you always pick the best deal.

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![Express](https://img.shields.io/badge/Express-5-000000?logo=express&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite&logoColor=white)

---

## ✨ Features

### For Users
- **Store-by-store price comparison** — See prices, delivery fees, stock, and ratings side by side
- **Smart cart math** — Full cart totals calculated per store, including delivery
- **Multi-step checkout** — Select store → enter shipping → review & place order
- **Order dashboard** — Track order status (pending → processing → shipped → delivered)
- **Profile management** — Update name, profile picture, and password
- **Password reset** — Forgot password flow with email link (nodemailer)
- **Notifications** — Real-time notifications for order updates and admin broadcasts
- **Dark / Light mode** — Theme toggle with localStorage persistence

### For Admins
- **Admin dashboard** — View all orders, revenue stats, and update order statuses
- **Manage products** — Add/delete products with per-store pricing, stock, delivery cost, and ratings
- **Manage users** — Edit user details, reset passwords, delete accounts
- **Broadcast notifications** — Send announcements to all users

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, React Router 7, Axios, Vite 7 |
| **Backend** | Express 5, Sequelize 6 (ORM), JWT Authentication |
| **Database** | PostgreSQL |
| **Email** | Nodemailer (Gmail / Ethereal fallback) |
| **Auth** | JWT tokens, bcryptjs password hashing |
| **Styling** | Custom CSS with CSS variables, dark/light theme |

---

## 📁 Project Structure

```
CleanCart/
├── backend/
│   ├── config/          # Database & app constants
│   ├── controllers/     # Route handlers (auth, admin, password reset)
│   ├── middleware/       # JWT auth & admin authorization
│   ├── models/          # Sequelize User model
│   ├── routes/          # API route definitions
│   └── server.js        # Express app entry point
│
├── frontend/
│   ├── public/images/   # Static assets (logo, page images)
│   └── src/
│       ├── api/         # Axios instance with interceptors
│       ├── components/  # Navbar, Footer, ProtectedRoute
│       ├── context/     # Auth, Cart, Theme, Notification providers
│       ├── data/        # Store definitions (catalog.js)
│       ├── pages/       # All page components
│       └── styles/      # CSS files for each component/page
│
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18 or higher)
- **PostgreSQL** (v14 or higher)
- **npm** or **yarn**

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/CleanCart.git
cd CleanCart
```

### 2. Set Up the Database

Create the PostgreSQL database:

```sql
-- Using psql
psql -U postgres
CREATE DATABASE cleancart;
\q
```

Or use **pgAdmin** → Right-click Databases → Create → Name: `cleancart`

> See [`backend/DATABASE_SETUP.md`](backend/DATABASE_SETUP.md) for detailed instructions.

### 3. Configure Environment (Optional)

Create a `.env` file in the `backend/` folder:

```env
# Server
PORT=5000

# JWT
JWT_SECRET=your-secret-key-here

# Database (defaults are used if not set)
DB_NAME=cleancart
DB_USER=postgres
DB_PASS=aagaman
DB_HOST=localhost

# Email (optional — falls back to Ethereal test account)
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-app-password

# Frontend URL (for password reset links)
FRONTEND_URL=http://localhost:5173
```

### 4. Install Dependencies & Start

**Backend:**
```bash
cd backend
npm install
npm run dev
```
The backend runs on `http://localhost:5000`

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```
The frontend runs on `http://localhost:5173`

---

## 🔑 Default Admin Account

On first login with these credentials, an admin account is auto-created:

| Field | Value |
|-------|-------|
| Email | `admin@cleancart.com` |
| Password | `admin1234` |

---

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login & get JWT token |
| GET | `/api/auth/profile` | Get current user profile |
| PUT | `/api/auth/profile` | Update profile / password |
| POST | `/api/auth/forgot-password` | Request password reset email |
| POST | `/api/auth/reset-password` | Reset password with token |

### Admin (requires admin role)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/users` | Get all users |
| GET | `/api/admin/users/:id` | Get user by ID |
| PUT | `/api/admin/users/:id` | Update user |
| DELETE | `/api/admin/users/:id` | Delete user |

---

## 📸 Pages Overview

| Page | Route | Description |
|------|-------|-------------|
| Homepage | `/` | Landing page with features & CTA |
| Products | `/products` | Browsable product catalog with search & filters |
| Product Detail | `/products/:id` | Price comparison + checkout modal |
| Dashboard | `/dashboard` | User's orders & activity |
| Profile | `/profile` | Account settings & password change |
| Admin Dashboard | `/admin` | Order management & stats |
| Manage Users | `/admin/users` | User CRUD operations |
| Manage Products | `/admin/products` | Product catalog CRUD |
| Login | `/login` | User authentication |
| Register | `/register` | New account creation |
| Forgot Password | `/forgot-password` | Password reset request |
| Reset Password | `/reset-password/:token` | Set new password |
| About | `/about` | Platform information |

---

## 🌙 Theme Support

CleanCart supports **light** and **dark** modes. The preference is saved in `localStorage` and toggled via the navbar icon. All colors use CSS custom properties defined in `index.css`.

---

## 📝 License

This project is for educational purposes.

---

## 👤 Author

**Aagaman** — Built with React, Express, and PostgreSQL.
