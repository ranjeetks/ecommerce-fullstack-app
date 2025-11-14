# ⚙️ Backend — Django REST Framework (E-commerce API)

This is the backend powering the **Full-Stack E-Commerce Application**, built with **Django REST Framework**, **PostgreSQL**, **Stripe**, and **Cloudinary**.

---

## 🌍 Live Backend URLs

| Service | URL |
|--------|------|
| ⚙️ Backend API | https://ecommerce-backend-44e1.onrender.com |
| 📘 Swagger Docs | https://ecommerce-backend-44e1.onrender.com/api/schema/swagger-ui/ |

---

## 🧱 Tech Stack

- Django 5  
- Django REST Framework  
- PostgreSQL  
- Cloudinary Storage  
- SimpleJWT Authentication  
- Stripe Payments + Webhooks  
- DRF Spectacular (Swagger)

---

## 📂 Folder Structure

```
backend/
│
├── apps/
│   ├── users/
│   ├── catalog/
│   ├── cart/
│   ├── wishlist/
│   ├── orders/
│   ├── payments/
│   └── frontend_logs/
│
├── config/        # Settings, URLs, WSGI
├── core/          # Middleware, utilities, logger
├── manage.py
└── requirements.txt
```

---

## ⚙️ Local Setup

### 1️⃣ Create Virtual Environment
```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
```

### 2️⃣ Install Dependencies
```bash
pip install -r requirements.txt
```

### 3️⃣ Setup `.env`
```
DEBUG=True
SECRET_KEY=your_secret
DATABASE_URL=postgres://...
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
STRIPE_SECRET_KEY=...
STRIPE_WEBHOOK_SECRET=...
CORS_ALLOWED_ORIGINS=http://localhost:5173
```

### 4️⃣ Apply Migrations
```bash
python manage.py migrate
```

### 5️⃣ Run Server
```bash
python manage.py runserver
```

---

## 🧩 API Highlights

| Module | Endpoint | Description |
|--------|----------|-------------|
| Auth | `/api/auth/token/` | JWT Login |
| Products | `/api/products/` | Listing + Filters |
| Cart | `/api/cart/` | Manage cart items |
| Wishlist | `/api/wishlist/` | Manage wishlist |
| Orders | `/api/orders/` | Create/View Orders |
| Stripe | `/api/stripe/create-payment-intent/` | Payment Intent |
| Stripe Webhook | `/api/stripe/webhook/` | Updates order→PAID |

---

## 📘 API Documentation
- Swagger UI → `/api/schema/swagger-ui/`  
- Redoc → `/api/schema/redoc/`

---

## 🌩 Cloudinary Integration

Fully configured for media uploads using:

```python
DEFAULT_FILE_STORAGE = "cloudinary_storage.storage.MediaCloudinaryStorage"
```

---

## 🧾 Logging

Custom API logging middleware logs:

- User  
- Path  
- Status code  
- Duration  

---

## 🚀 Deployment Notes (Render)

### Start Command:
```bash
gunicorn config.wsgi:application
```

### Build Command:
```bash
pip install -r requirements.txt && python manage.py migrate
```

---

## 👨‍💻 Author  
**Ranjeet Singh**  
Full-Stack Developer  
