// src/services/api.ts
import axios from "axios";
// Usage in a service or component

// =============================
// Token Helpers
// =============================
const ACCESS_KEY = "access_token";
const REFRESH_KEY = "refresh_token";
const USER_KEY = "user";
// VITE_API_BASE_URL=http://localhost:8000/api/
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// =============================
// Auth API Endpoints
// =============================
const AUTH_BASE = "auth/";

export const getAccessToken = () => localStorage.getItem(ACCESS_KEY);
export const getRefreshToken = () => localStorage.getItem(REFRESH_KEY);

export const saveTokens = (access: string, refresh: string) => {
  localStorage.setItem(ACCESS_KEY, access);
  localStorage.setItem(REFRESH_KEY, refresh);
};

export const clearTokens = () => {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem(USER_KEY);
};

// =============================
// Axios Instance
// =============================
const api = axios.create({
  baseURL: API_BASE_URL +"/api/",   // e.g. http://localhost:8000/api/
});

// 👉 Attach access token to all requests
// ✅ Request interceptor: attach token if exists
// 👉 Attach access token to all requests
api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// =============================
// Axios Response Interceptor (401 → refresh)
// =============================
// ✅ Response interceptor: auto-refresh token if expired (401)
// 🔁 Refresh token on 401 errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      getRefreshToken()
    ) {
      originalRequest._retry = true;

      try {
        const newAccessToken = await refreshAccessToken();
        axios.defaults.headers.common["Authorization"] =
          `Bearer ${newAccessToken}`;
        return api(originalRequest); // 🔁 Retry with new access
      } catch (err) {
        logout();
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);






// api.ts
export const login = async (username: string, password: string) => {
  // Step 1: get tokens
  const res = await api.post(`${AUTH_BASE}token/`, { username, password });
  const { access, refresh } = res.data;
  saveTokens(access, refresh);

  // Step 2: fetch user info
  const meRes = await api.get(`${AUTH_BASE}me/`, {
    headers: { Authorization: `Bearer ${access}` },
  });

  const user = meRes.data; // { id, username, email, roles: [...] }

  // Step 3: normalize roles
  const roleNames = Array.isArray(user.roles)
    ? user.roles.map((r: any) => (typeof r === "string" ? r : r.name))
    : [];

  // Step 4: Merge token response + user info + roleNames
  const merged = {
    ...res.data,   // { access, refresh }
    ...user,       // user object
    roleNames,     // e.g. ["ADMIN", "CUSTOMER"]
  };

  // Step 5: Save merged user in localStorage
  localStorage.setItem(USER_KEY, JSON.stringify(merged));

  // ✅ Return merged object
  return merged;
};



export const signup = async (
  email: string,
  password: string,
  username: string
) => {
  const res = await api.post(`${AUTH_BASE}register/`, {
    email,
    password,
    username,
  });
  return res.data;
};

export const logout = () => {
  clearTokens();
  window.location.href = "/";
};

export const getCurrentUser = () => {
  const user = localStorage.getItem(USER_KEY);
  return user ? JSON.parse(user) : null;
};

export const refreshAccessToken = async () => {
  const refresh = getRefreshToken();
  if (!refresh) throw new Error("No refresh token available");

  const res = await api.post(`${AUTH_BASE}token/refresh/`, { refresh });
  const { access } = res.data;
  localStorage.setItem(ACCESS_KEY, access);
  return access;
};

export const getTokens = () => {
  const access = localStorage.getItem(ACCESS_KEY);
  const refresh = localStorage.getItem(REFRESH_KEY);
  return access && refresh ? { access, refresh } : null;
};


export default api;