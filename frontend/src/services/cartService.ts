//import axios from "axios";
import api from "@services/api";

//C:\Ranjeet\Study\Projects\ecommerce-projects\micro-demos\shopping-cart-wishlist\frontend\src\api\actions.ts
// const api = axios.create({
//   baseURL: "http://127.0.0.1:8001/api",
// });

// Attach token for every request
// api.interceptors.request.use((config) => {
//   const token = sessionStorage.getItem("access");  // always fresh
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   } else {
//     delete config.headers.Authorization;
//   }
//   return config;
// });
// Handle token refresh on 401 responses



export const addToCart = async (productId: number) => {
  try {
    await api.post(`/cart/add/${productId}/`);
    return { success: true };
  } catch (err) {
    console.error("Error adding to cart:", err);
    return { success: false, error: err };
  }
};