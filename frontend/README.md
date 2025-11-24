<p align="center">
  <img src="https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/TypeScript-5-blue?logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Vite-Build-646CFF?logo=vite&logoColor=white" />
  <img src="https://img.shields.io/badge/Bootstrap-5-purple?logo=bootstrap&logoColor=white" />
  <img src="https://img.shields.io/badge/TailwindCSS-Utility-38B2AC?logo=tailwindcss&logoColor=white" />
  <img src="https://img.shields.io/badge/Deployment-Vercel-black?logo=vercel&logoColor=white" />
  <img src="https://img.shields.io/badge/License-MIT-yellow" />
</p>

# 💻 Frontend — React + Vite + TypeScript

This is the **React + TypeScript frontend** for the full-stack E-Commerce platform.  
It communicates with the Django API for authentication, products, wishlist, cart, and checkout.

---

## 🌍 Live Frontend URL

| Service | URL |
|--------|------|
| 🖥️ Live Frontend | https://ecommerce-frontend-rs.vercel.app |
| ⚙️ Backend API | https://ecommerce-backend-44e1.onrender.com |

---

## 🚀 Tech Stack

- React 18  
- TypeScript  
- Vite  
- Bootstrap 5  
- Tailwind CSS  
- Axios  
- React Router v6  

---

## 📂 Folder Structure

```
frontend/
│
├── src/
│   ├── components/
│   ├── pages/
│   ├── services/
│   ├── context/
│   ├── interfaces/
│   └── utils/
│
├── public/
├── package.json
└── vite.config.ts
```

---

## ⚙️ Local Setup

### Windows PowerShell
```powershell
cd frontend
npm install
copy .env.example .env
npm run dev
```

### Mac/Linux
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

---

## 🔐 Environment Variables

### `.env`
```
VITE_API_BASE_URL=https://ecommerce-backend-44e1.onrender.com
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
```

---

## 🛍️ Features

| Module | Description |
|--------|-------------|
| Auth | Login, Signup, JWT refresh |
| Products | Search, pagination, detail page |
| Cart | Add/update/remove items |
| Wishlist | Add/remove favorites |
| Checkout | Stripe Payment |
| Logger | Send errors to backend |
| Routing | React Router v6 |

---

## 🧱 Build for Production

```bash
npm run build
```

Preview production build:
```bash
npm run preview
```

---

## 🌐 Vercel Deployment

### Required settings:
- **Root Directory:** `frontend`
- **Build Command:** `npm run build`
- **Output:** `dist`

Add environment variables in Vercel dashboard.

---

## 👨‍💻 Author  
**Ranjeet Singh**  
Full-Stack Developer  
