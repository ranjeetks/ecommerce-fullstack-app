# 💻 Frontend — React + Vite + TypeScript

This is the **React + TypeScript frontend** for the **Full-Stack E-commerce Application**, built with **Vite**, **Bootstrap 5**, and **Tailwind CSS**. It connects to a **Django REST backend** and supports authentication, cart, wishlist, and Stripe checkout.

---

## 🚀 Overview

This frontend is designed to be fast, scalable, and easy to deploy. It uses React Context for global state management and Axios for secure API integration.

| Service | URL |
|----------|-----|
| 🖥️ Live Frontend | [https://rs-ecommerce-frontend.vercel.app](https://rs-ecommerce-frontend.vercel.app) |
| ⚙️ Backend API | [https://ecommerce-projects-9cqe.onrender.com/api/](https://ecommerce-projects-9cqe.onrender.com/api/) |

---

## ⚙️ Setup Instructions

### 🪟 Windows PowerShell (Recommended)
```powershell
cd frontend
npm install
copy .env.example .env
npm run dev
```

### 🧩 Mac/Linux
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

The development server will start at:
👉 http://localhost:5173

---

## 🔐 Environment Variables

Create a `.env` file inside `/frontend/` with the following:

```bash
VITE_API_BASE_URL=https://ecommerce-projects-9cqe.onrender.com/api
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
VITE_LOGGING_ENABLED=true
VITE_LOG_LEVEL=debug
VITE_FRONTEND_LOG_SAMPLE_RATE=1
VITE_APP_VERSION=1.0.0
```

### 🧱 Example `.env.production`
```bash
VITE_API_BASE_URL=https://ecommerce-projects-9cqe.onrender.com/api
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx
VITE_LOGGING_ENABLED=false
VITE_LOG_LEVEL=error
VITE_FRONTEND_LOG_SAMPLE_RATE=20
VITE_APP_VERSION=1.0.0
```

---

## 🧩 Key Features

| Module | Description |
|---------|--------------|
| 🔐 **Auth** | JWT login/signup, token refresh |
| 🛍️ **Catalog** | Product listing, search, filtering |
| 🛒 **Cart** | Add/update/delete items, checkout summary |
| ❤️ **Wishlist** | Add/remove favorites |
| 💳 **Stripe Checkout** | Secure payment integration |
| 🧠 **Logger System** | Logs frontend errors & events to backend |
| 🧭 **Routing** | React Router DOM v6 |

---

## 🧠 Logger Integration

Frontend includes a **Smart Logger** to track UI or network issues.

```typescript
// Example usage
import { logFrontendEvent } from "@utils/logger";

logFrontendEvent("Cart item added", { productId: 5 });
```

You can send logs to the backend endpoint `/api/frontend_logs/` automatically.

Enable/disable via `.env`:
```bash
VITE_LOGGING_ENABLED=true
```

---

## 🧰 Build for Production

```bash
npm run build
```

The output folder `dist/` will be generated.

Preview locally:
```bash
npm run preview
```

---

## 🌐 Deployment (Vercel)

### ✅ Steps to Deploy:

1. Push your project to GitHub.
2. Go to [Vercel](https://vercel.com) → **New Project**.
3. Import your GitHub repository.
4. Select the **/frontend** folder.
5. Set the following settings:
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
6. Add Environment Variables (same as `.env.production`).
7. Click **Deploy**.

### 🔁 Redeploy After Updates
When you push new changes to the `main` branch, Vercel will automatically rebuild and redeploy.

### 🧾 Fix 404 Errors (SPA Redirect Rule)
Create a file `vercel.json` inside `frontend/`:
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

---

## 🧠 Folder Structure
```
frontend/
│
├── src/
│   ├── components/        # Reusable UI components
│   ├── pages/             # Page-level views
│   ├── context/           # Auth & Cart context
│   ├── services/          # API integration (Axios)
│   ├── interfaces/        # TypeScript models
│   ├── utils/             # Logger, formatters, constants
│   └── main.tsx           # App entry
│
├── public/
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## 🧠 Tips for Freelancing / Portfolio

- Add a short **demo video** showing login, product browsing, cart, and checkout.
- Use your **own product images** to personalize the app.
- Link the **Swagger backend URL** in your README.
- Include **frontend error logging** to show professionalism.

---

## 🧑‍💻 Author
**Ranjeet Singh**  
Full-Stack Developer (Django REST + React + TypeScript)  
💼 [LinkedIn](#) | 💻 [GitHub](#)

---

## 🪄 License
Licensed under the **MIT License** — use, modify, and deploy freely for personal or freelance use.

