/**
 * 🌐 API Endpoints — Centralized backend URI definitions
 * ------------------------------------------------------
 * 🔹 Purpose:
 * - Eliminate hardcoded URLs in components
 * - Make API routes self-documenting
 * - Prevent baseURL mistakes (/api/api/)
 * - Enable autocompletion + consistent naming
 *
 * 🔹 Usage Example:
 * import { API_ENDPOINTS } from "@constants/apiEndpoints";
 * const res = await api.get(API_ENDPOINTS.PRODUCTS.LIST);
 */

/**
 * 🌐 API Base Config
 * ---------------------------------------------------
 * Define once, used by api.ts and endpoint builders.
 */
export const API_BASE = {
  PREFIX: "api/",  // global prefix, e.g. /api/ or /v1/
};

export const API_ENDPOINTS = {
  /* ----------------------------------------------------------------
   * 🔐 AUTHENTICATION & USER MANAGEMENT
   * ---------------------------------------------------------------- */
  AUTH: {
    // POST → Get access & refresh tokens
    LOGIN: "auth/token/",

    // POST → Refresh access token
    REFRESH: "auth/token/refresh/",

    // POST → Register new user
    REGISTER: "auth/register/",

    // GET → Get current logged-in user
    ME: "auth/me/",

    // POST → Logout (if backend endpoint implemented)
    LOGOUT: "auth/logout/",
  },

  /* ----------------------------------------------------------------
   * 🛒 PRODUCT CATALOG
   * ---------------------------------------------------------------- */
  PRODUCTS: {
    // GET → List all products (paginated)
    LIST: "products/",

    // GET → Retrieve product details
    DETAIL: (id: number | string) => `products/${id}/`,

    // POST → Create a new product (admin only)
    CREATE: "products/",

    // PUT/PATCH → Update product details (admin)
    UPDATE: (id: number | string) => `products/${id}/`,

    // DELETE → Delete product (admin)
    DELETE: (id: number | string) => `products/${id}/`,

    // 🔍 Search, filter, sort example → append ?search= or ?ordering=
    SEARCH: (query: string) => `products/?search=${encodeURIComponent(query)}`,
  },

  /* ----------------------------------------------------------------
   * 💖 WISHLIST
   * ---------------------------------------------------------------- */
  WISHLIST: {
    // GET → Get current user's wishlist
    BASE: "wishlist/",

    // POST → Add product to wishlist
    ADD: (id: number | string) => `wishlist/add/${id}/`,

    // DELETE → Remove product from wishlist
    REMOVE: (id: number | string) => `wishlist/remove/${id}/`,
  },

  /* ----------------------------------------------------------------
   * 🛍️ CART
   * ---------------------------------------------------------------- */
  CART: {
    // GET → Get current user's cart
    BASE: "cart/",

    // POST → Add product to cart
    ADD: (id: number | string) => `cart/add/${id}/`,

    // DELETE → Remove product from cart
    REMOVE: (id: number | string) => `cart/remove/${id}/`,
  },

  /* ----------------------------------------------------------------
   * 💳 CHECKOUT & PAYMENTS
   * ---------------------------------------------------------------- */
  CHECKOUT: {
    // POST → Start checkout process (Stripe or Razorpay)
    START: "checkout/",

    // GET → List all orders for current user
    ORDERS: "orders/",

    // GET → Single order detail
    DETAIL: (id: number | string) => `orders/${id}/`,

    // POST → Stripe/Razorpay webhook (server use)
    WEBHOOK: "webhook/",
  },

  /* ----------------------------------------------------------------
   * 📦 ORDER MANAGEMENT (Admin)
   * ---------------------------------------------------------------- */
  ADMIN_ORDERS: {
    // GET → List all orders (admin)
    LIST: "admin/orders/",

    // PATCH → Update order status
    UPDATE_STATUS: (id: number | string) => `admin/orders/${id}/status/`,

    // GET → Order analytics summary
    ANALYTICS: "admin/orders/analytics/",
  },

  /* ----------------------------------------------------------------
   * 🧾 LOGGING & MONITORING
   * ---------------------------------------------------------------- */
  LOGS: {
    // POST → Send frontend log (errors, warnings)
    FRONTEND: "frontend-logs/",

    // GET → Retrieve system logs (admin)
    SYSTEM: "admin/logs/",
  },

  /* ----------------------------------------------------------------
   * ⚙️ ADMIN DASHBOARD (Future Use)
   * ---------------------------------------------------------------- */
  ADMIN: {
    // GET → System overview dashboard
    DASHBOARD: "admin/dashboard/",

    // GET → Product performance report
    PRODUCT_STATS: "admin/products/stats/",

    // GET → User analytics summary
    USER_ANALYTICS: "admin/users/analytics/",
  },

  /* ----------------------------------------------------------------
   * 📊 ANALYTICS (Optional, for growth tracking)
   * ---------------------------------------------------------------- */
  ANALYTICS: {
    // GET → Top-selling products
    TOP_PRODUCTS: "analytics/top-products/",

    // GET → Daily sales performance
    SALES_DAILY: "analytics/sales/daily/",

    // GET → User engagement metrics
    USER_METRICS: "analytics/users/",
  },
} as const;



/**
 * ✅ Example Usage
 * -------------------------------------------------------
 * import api from "@services/api";
 * import { API_ENDPOINTS } from "@constants/apiEndpoints";
 *
 * // Get paginated product list
 * const res = await api.get(API_ENDPOINTS.PRODUCTS.LIST);
 *
 * // Get specific product details
 * const detail = await api.get(API_ENDPOINTS.PRODUCTS.DETAIL(5));
 *
 * // Add item to wishlist
 * await api.post(API_ENDPOINTS.WISHLIST.ADD(5));
 *
 * // Log frontend error
 * await api.post(API_ENDPOINTS.LOGS.FRONTEND, payload);
 */
