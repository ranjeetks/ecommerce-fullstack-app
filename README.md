# 🛍️ Full-Stack E-commerce Platform (Django REST + React + Cloudinary + Stripe)

A complete **production-ready e-commerce solution** featuring **secure authentication**, **payment integration**, **Cloudinary-based media handling**, and **modern frontend UI**. Designed as a **portfolio-grade and freelancer-ready project**.

---

## 🌍 Live URLs

| Service | URL |
|----------|-----|
| 🖥️ Frontend (Vercel) | [https://rs-ecommerce-frontend.vercel.app](https://rs-ecommerce-frontend.vercel.app) |
| ⚙️ Backend API (Render) | [https://ecommerce-projects-9cqe.onrender.com/api/schema/swagger-ui/](https://ecommerce-projects-9cqe.onrender.com/api/schema/swagger-ui/) |
| ☁️ Media (Cloudinary) | [Cloudinary Dashboard](https://cloudinary.com) |

---

## 💡 Why This Project
This project was developed to:
- ✅ Showcase **end-to-end full-stack capability** (backend + frontend + deployment)
- 💼 Serve as a **professional portfolio** for freelancing and interviews
- 🧠 Act as a reusable **e-commerce framework** for future product development

---

## 🧠 Tech Stack Overview

| Layer | Technologies |
|--------|---------------|
| **Backend** | Django 5, Django REST Framework, PostgreSQL, SimpleJWT, Cloudinary, Stripe |
| **Frontend** | React 18, TypeScript, Vite, Bootstrap 5, Tailwind CSS |
| **Deployment** | Render (Backend), Vercel (Frontend) |
| **Docs** | Swagger (drf-spectacular) |
| **Logging** | Smart Logger (Backend + Frontend) |

---

## ✅ Major Features

### 🔐 Authentication & Authorization
- JWT-based authentication (Login, Signup, Refresh)
- Role-based access control (Admin / User)

### 🛍️ Product Management
- CRUD operations for products
- Cloudinary-based image upload
- Search, sort, pagination, and filtering

### 🛒 Cart & Wishlist
- User-specific cart and wishlist APIs
- Add/remove/update item quantities

### 💳 Payments & Orders
- Stripe checkout integration (test mode)
- Order storage and history tracking

### ☁️ Media Handling
- Cloudinary storage integration for media uploads
- Fallback default images for missing products

### 🧾 Logging & Monitoring
- Centralized request/response logging (DRF middleware)
- Frontend error logging API

---

## 🧩 Folder Structure

```
ecommerce-full-app/
│
├── backend/                # Django REST backend
│   ├── apps/               # users, catalog, cart, wishlist, etc.
│   ├── config/             # settings, urls, wsgi
│   ├── core/               # middleware, utils, constants
│   └── README.md
│
├── frontend/               # React + TypeScript frontend
│   ├── src/
│   ├── components/
│   ├── pages/
│   ├── services/
│   └── README.md
│
└── README.md               # (This overview file)
```

---

## ⚙️ Quick Start

### 🔹 Backend Setup
```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### 🔹 Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

---

## 🧩 Environment Variables

### Backend (.env)
```bash
DEBUG=True
SECRET_KEY=your_secret_key
DATABASE_URL=postgres://user:password@host:port/dbname

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

STRIPE_SECRET_KEY=your_stripe_secret
STRIPE_WEBHOOK_SECRET=your_webhook_secret
```

### Frontend (.env)
```bash
VITE_API_BASE_URL=https://ecommerce-projects-9cqe.onrender.com/api/
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxx
```

---

## 📘 API Documentation (Swagger)

| Endpoint | Description |
|-----------|--------------|
| `/api/auth/signup/` | User registration |
| `/api/auth/token/` | Obtain JWT access + refresh token |
| `/api/products/` | Product listing + filters |
| `/api/cart/` | Manage cart items |
| `/api/wishlist/` | Manage wishlist |
| `/api/orders/` | Create/view orders |
| `/api/stripe/create-payment-intent/` | Stripe payment |

---

## 📦 Deployment

- **Backend:** Render (Python + Gunicorn)
- **Frontend:** Vercel (React + Vite)
- **Media:** Cloudinary (external storage)

---

## 🧠 API Groups (for Swagger)

| Tag | Description |
|-----|--------------|
| **Auth** | Login, signup, refresh tokens |
| **Products** | Product list, detail, admin CRUD |
| **Cart** | Add/remove cart items |
| **Wishlist** | Manage wishlist |
| **Orders** | Checkout & order retrieval |
| **Payments** | Stripe integration |
| **Logs** | Frontend logs |

---

## 📸 Screenshots

| Feature | Screenshot |
|----------|-------------|
| Swagger Docs | `/docs/screenshots/swagger.png` |
| Product Page | `/docs/screenshots/products.png` |
| Checkout Flow | `/docs/screenshots/checkout.png` |

---

## 🧑‍💻 Author
**Ranjeet Singh**  
Full-Stack Developer | Django REST + React + TypeScript  
💼 [LinkedIn](#) | 💻 [GitHub](#)

---

## 🪄 License
Licensed under the **MIT License**.  
Feel free to fork, modify, and reuse for learning or freelancing projects.

