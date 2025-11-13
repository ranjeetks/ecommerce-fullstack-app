// src/services/api.ts
import axios from "axios";
// Usage in a service or component
import { logger } from "@utils/logger";
import { sendFrontendLog } from "@utils/logger/sender";

/**
 * Utility: safely extract a message string from an unknown error value.
 * This avoids TypeScript complaints about `error.message`.
 */
function getErrorMessage(error: unknown): string {
  if (!error) return "";
  if (typeof error === "string") return error;
  if (error instanceof Error) return error.message;
  // try axios-like shapes
  const anyErr = error as any;
  try {
    if (anyErr?.response?.data) {
      // prefer structured message if available
      const d = anyErr.response.data;
      if (typeof d === "string") return d;
      if (d?.detail) return String(d.detail);
      if (d?.message) return String(d.message);
      // return JSON snippet if it's safe
      return JSON.stringify(d).slice(0, 500);
    }
  } catch {
    // fallthrough
  }
  if (anyErr?.message) return String(anyErr.message);
  try {
    return JSON.stringify(anyErr).slice(0, 500);
  } catch {
    return String(anyErr);
  }
}

/* =============================
   Token Helpers (localStorage keys)
   ============================= */
const ACCESS_KEY = "access_token";
const REFRESH_KEY = "refresh_token";
const USER_KEY = "user";

// VITE_API_BASE_URL expected like: http://localhost:8000
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

/* =============================
   Auth API Endpoints base
   ============================= */
const AUTH_BASE = "auth/";

/* =============================
   Token helper funcs
   ============================= */
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

/* =============================
   Axios Instance
   ============================= */
// baseURL aims to be like: `${API_BASE_URL}/api/`
const api = axios.create({
  //baseURL: `${API_BASE_URL}/api/`, // normalize double slashes --before 24th october 2025
  baseURL: `${API_BASE_URL}/api`, // normalize double slashes
});

/* =============================
   Request interceptor (attach access token)
   ============================= */
api.interceptors.request.use((config) => {
  try {
    const token = getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    logger.debug("➡️ API Request:", config.method, config.url, config.data ?? config.params);
  } catch (err) {
    // Do not throw from interceptor; just log
    logger.warn("api request interceptor error:", getErrorMessage(err));
  }
  return config;
});

/* =============================
   Response interceptor (401 -> refresh -> retry)
   - Preserves the existing logic but adds logging and frontend log forwarding
   ============================= */
api.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    // normalize to any for working with axios-like objects below
    const errAny = error as any;
    const originalRequest = errAny?.config;

    // If 401 and refresh token exists and we haven't retried yet -> try refresh
    if (
      errAny?.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      getRefreshToken()
    ) {
      originalRequest._retry = true;

      try {
        const newAccessToken = await refreshAccessToken();
        // apply to default headers and retry original request
        axios.defaults.headers.common["Authorization"] = `Bearer ${newAccessToken}`;
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }
        logger.info("Access token refreshed, retrying original request:", originalRequest.url);
        return api(originalRequest);
      } catch (err) {
        // refresh failed -> force logout and log error
        logger.error("Token refresh failed during interceptor:", getErrorMessage(err));
        try {
          // best-effort to send frontend log for diagnostics
          await sendFrontendLog(
            "error",
            `Token refresh failed for ${originalRequest?.url}`,
            { error: getErrorMessage(err), status: (err as any)?.response?.status }
          );
        } catch {
          /* swallow */
        }
        logout();
        return Promise.reject(err);
      }
    }

    // Non-refresh-related error: log and forward a minimal frontend log
    logger.error("API response error:", {
      url: errAny?.config?.url,
      status: errAny?.response?.status,
      message: getErrorMessage(errAny),
    });

    try {
      // send sampled frontend log to backend for critical diagnostics
      await sendFrontendLog(
        "error",
        `API error ${errAny?.config?.url} ${errAny?.response?.status}`,
        { status: errAny?.response?.status, message: getErrorMessage(errAny) }
      );
    } catch {
      // swallow send errors
    }

    return Promise.reject(errAny);
  }
);

/* =============================
   Auth / User functions (network calls wrapped with try/catch & logs)
   ============================= */

/**
 * login
 * - gets tokens
 * - fetches current user
 * - merges roleNames
 * - saves merged object to localStorage
 */
export const login = async (username: string, password: string) => {
  try {
    console.log("Posting login to:", api.defaults.baseURL + AUTH_BASE + "token/");
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
      ...res.data, // { access, refresh }
      ...user, // user object
      roleNames, // e.g. ["ADMIN", "CUSTOMER"]
    };

    // Step 5: Save merged user in localStorage
    localStorage.setItem(USER_KEY, JSON.stringify(merged));

    logger.info("User logged in:", { username: merged.username, id: merged.id });
    return merged;
  } catch (err) {
    logger.error("Login failed:", getErrorMessage(err));
    try {
      await sendFrontendLog("error", "Login failed", { username, error: getErrorMessage(err) });
    } catch {
      /* ignore */
    }
    // rethrow so caller can handle UI error
    throw err;
  }
};

/**
 * signup
 */
export const signup = async (email: string, password: string, username: string) => {
  try {
    const res = await api.post(`${AUTH_BASE}register/`, { email, password, username });
    logger.info("Signup successful (server accepted):", { email, username });
    return res.data;
  } catch (err) {
    logger.error("Signup failed:", getErrorMessage(err));
    try {
      await sendFrontendLog("error", "Signup failed", { email, username, error: getErrorMessage(err) });
    } catch {
      /* ignore */
    }
    throw err;
  }
};

/**
 * logout
 */
export const logout = () => {
  try {
    clearTokens();
    // simple client-side redirect to root (preserves existing behavior)
    window.location.href = "/";
  } catch (err) {
    logger.warn("Logout encountered an error:", getErrorMessage(err));
  }
};

/**
 * getCurrentUser (sync)
 */
export const getCurrentUser = () => {
  try {
    const user = localStorage.getItem(USER_KEY);
    return user ? JSON.parse(user) : null;
  } catch (err) {
    logger.error("Failed to parse current user from localStorage:", getErrorMessage(err));
    return null;
  }
};

/**
 * refreshAccessToken
 * - posts refresh token and updates access token in localStorage
 */
export const refreshAccessToken = async () => {
  const refresh = getRefreshToken();
  if (!refresh) {
    const msg = "No refresh token available";
    logger.warn(msg);
    throw new Error(msg);
  }

  try {
    const res = await api.post(`${AUTH_BASE}token/refresh/`, { refresh });
    const { access } = res.data;
    localStorage.setItem(ACCESS_KEY, access);
    logger.info("Access token refreshed successfully");
    return access;
  } catch (err) {
    logger.error("Failed to refresh access token:", getErrorMessage(err));
    try {
      await sendFrontendLog("error", "Refresh access token failed", { error: getErrorMessage(err) });
    } catch {
      /* ignore */
    }
    throw err;
  }
};

/**
 * getTokens (sync)
 */
export const getTokens = () => {
  try {
    const access = localStorage.getItem(ACCESS_KEY);
    const refresh = localStorage.getItem(REFRESH_KEY);
    return access && refresh ? { access, refresh } : null;
  } catch (err) {
    logger.error("getTokens error:", getErrorMessage(err));
    return null;
  }
};

/* =============================
   Export default axios instance
   ============================= */
export default api;