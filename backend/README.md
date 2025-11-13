# ⚙️ Backend Documentation — Django REST Framework (E-commerce API)

This backend powers the **Full-Stack E-commerce Application** using **Django REST Framework**, **PostgreSQL**, and **Cloudinary** for media storage. It provides secure JWT-based authentication, modular app design, and integrations for Stripe and Razorpay.

---

## 🚀 Overview

This is the backend API for the **E-commerce Full-Stack Platform** — built for production-readiness, scalability, and clarity. It supports both frontend consumption and external API access.

**Live URL:** [https://ecommerce-projects-9cqe.onrender.com](https://ecommerce-projects-9cqe.onrender.com)

**Swagger Docs:** [https://ecommerce-projects-9cqe.onrender.com/api/schema/swagger-ui/](https://ecommerce-projects-9cqe.onrender.com/api/schema/swagger-ui/)

---

## 🧱 Tech Stack

| Component | Technology |
|------------|-------------|
| **Framework** | Django 5.2 + Django REST Framework |
| **Database** | PostgreSQL (via `dj_database_url`) |
| **Auth** | JWT (SimpleJWT) |
| **Payments** | Stripe + Razorpay |
| **Media Storage** | Cloudinary (via `django-cloudinary-storage`) |
| **Docs** | DRF Spectacular (Swagger + Redoc) |
| **Logging** | Custom Smart Logger Middleware |

---

## 📂 Folder Structure

```
backend/
│
├── apps/
│   ├── users/          # Auth & profiles
│   ├── catalog/        # Product management
│   ├── cart/           # Cart logic
│   ├── wishlist/       # Wishlist APIs
│   ├── orders/         # Orders & checkout
│   ├── payments/       # Stripe & Razorpay integration
│   ├── frontend_logs/  # Frontend log ingestion
│   └── roles/          # Optional role management
│
├── config/             # Django settings, URLs, WSGI
├── core/               # Logging, mixins, constants
├── manage.py
└── requirements.txt
```

---

## ⚙️ Local Setup

### 1️⃣ Create Virtual Environment
```bash
cd backend
python -m venv venv
venv\Scripts\activate   # Windows
# source venv/bin/activate   # Mac/Linux
```

### 2️⃣ Install Dependencies
```bash
pip install -r requirements.txt
```

### 3️⃣ Setup Environment File (.env)
```
DEBUG=True
SECRET_KEY=your_secret_key_here
ALLOWED_HOSTS=localhost,127.0.0.1

# Database
DATABASE_URL=postgres://user:password@localhost:5432/ecommerce_db

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Stripe & Razorpay
STRIPE_SECRET_KEY=your_test_key_here
STRIPE_WEBHOOK_SECRET=your_webhook_secret_here
RAZORPAY_KEY_ID=rzp_test_xxx
RAZORPAY_KEY_SECRET=your_razorpay_secret_here

# CORS/CSRF
CORS_ALLOWED_ORIGINS=http://localhost:5173
CSRF_TRUSTED_ORIGINS=http://localhost:5173
```

### 4️⃣ Run Migrations
```bash
python manage.py migrate
```

### 5️⃣ Create Superuser
```bash
python manage.py createsuperuser
```

### 6️⃣ Start Development Server
```bash
python manage.py runserver
```

---

## 🧩 API Endpoints (Highlights)

| Category | Endpoint | Description |
|-----------|-----------|--------------|
| **Auth** | `/api/auth/signup/` | User registration |
| | `/api/auth/token/` | JWT token generation |
| | `/api/auth/me/` | Current user info |
| **Products** | `/api/products/` | Product list + search/sort |
| | `/api/products/<id>/` | Retrieve single product |
| **Cart** | `/api/cart/` | Manage cart items |
| **Wishlist** | `/api/wishlist/` | Manage wishlist |
| **Orders** | `/api/orders/` | View + create orders |
| **Payments** | `/api/stripe/create-payment-intent/` | Stripe checkout flow |
| **Logs** | `/api/frontend_logs/` | Capture frontend errors |

---

## 📘 API Documentation (Swagger)

| Type | URL |
|------|-----|
| **Swagger UI** | `/api/schema/swagger-ui/` |
| **Redoc** | `/api/schema/redoc/` |
| **OpenAPI JSON** | `/api/schema/` |

---

## 🌩️ Cloudinary Integration

All media (product images) are automatically uploaded to **Cloudinary**.

**Configured in `settings.py`:**
```python
DEFAULT_FILE_STORAGE = 'cloudinary_storage.storage.MediaCloudinaryStorage'
CLOUDINARY_STORAGE = {
    'CLOUD_NAME': os.getenv('CLOUDINARY_CLOUD_NAME'),
    'API_KEY': os.getenv('CLOUDINARY_API_KEY'),
    'API_SECRET': os.getenv('CLOUDINARY_API_SECRET'),
}
```

**Model Example:**
```python
image = models.ImageField(upload_to='products/', blank=True, null=True)
```

When uploaded, each product image automatically receives a **public Cloudinary URL**, accessible directly via API.

---

## 🧾 Logging

Logging is handled through Django’s logger + middleware:
```python
"core.utils.logger.middleware.APILogMiddleware"
```

- Logs all incoming API requests with user, status code, and duration.
- Stored in `/logs/app.log` (or console in DEBUG mode).

---

## 🔒 Security Best Practices
- Use `DEBUG=False` in production.
- Set `CSRF_TRUSTED_ORIGINS` for deployed frontend domains.
- Store secrets in `.env` or Render environment settings.
- Use HTTPS in production (Render + Vercel enforce this by default).

---

## 🚀 Deployment Notes (Render)

1. Push latest code to GitHub.
2. Connect your GitHub repo to Render.
3. Add environment variables under **Render → Environment → Environment Variables**.
4. Deploy — Render will auto-detect Django.

**Start Command:**
```bash
gunicorn config.wsgi:application
```

**Build Command (optional):**
```bash
pip install -r requirements.txt && python manage.py migrate
```

---

## 🧠 API Group Tags (Swagger)

| Tag | Description |
|------|--------------|
| **Auth** | JWT login, signup, refresh |
| **Products** | Product listing & admin CRUD |
| **Cart** | Cart item management |
| **Wishlist** | Wishlist management |
| **Orders** | Checkout & order management |
| **Payments** | Stripe integration APIs |
| **Logs** | Frontend logs capture |

---

## 🧑‍💻 Author
**Ranjeet Singh**  
Full-Stack Developer (Django REST + React + TypeScript)  
💼 [LinkedIn](#) | 💻 [GitHub](#)

---

## 🪄 License
Licensed under the **MIT License** — free for use, modification, and learning.