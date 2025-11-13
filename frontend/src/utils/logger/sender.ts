// src/utils/logger/sender.ts
import type { LogLevel } from "./index";
import { LOGGING_ENABLED } from "./index";

/**
 * sendFrontendLog
 * - Samples events (VITE_FRONTEND_LOG_SAMPLE_RATE)
 * - Only forwards 'error' or 'warn' by default
 * - Uses navigator.sendBeacon when available (non-blocking)
 *
 * Env vars used:
 * - VITE_LOGGING_ENABLED (true/false)
 * - VITE_FRONTEND_LOG_SAMPLE_RATE (1 = send all, N = ~1 in N)
 * - VITE_API_URL (base API URL, e.g. https://api.example.com/api)
 * - VITE_APP_VERSION (optional)
 */
export async function sendFrontendLog(level: LogLevel, message: string, extra?: Record<string, unknown>) {
  try {
    if (!LOGGING_ENABLED) return;
    const lvl = (level || "error") as LogLevel;

    // Only forward critical levels (configurable)
    if (lvl !== "error" && lvl !== "warn") return;

    // Sampling
    const SAMPLE_RATE = Number(import.meta.env.VITE_FRONTEND_LOG_SAMPLE_RATE || "1");
    if (SAMPLE_RATE > 1 && Math.floor(Math.random() * SAMPLE_RATE) !== 0) return;

    const payload = {
      level: lvl,
      message,
      url: typeof window !== "undefined" ? window.location.href : null,
      userAgent: typeof navigator !== "undefined" ? navigator.userAgent : null,
      appVersion: import.meta.env.VITE_APP_VERSION || null,
      extra: extra || {},
      ts: new Date().toISOString(),
    };

    const endpointBase = import.meta.env.VITE_API_URL || "";
    const endpoint = endpointBase.replace(/\/$/, "") + "/frontend-logs/";

    const body = JSON.stringify(payload);

    // Prefer sendBeacon for reliability on unload and non-blocking behavior
    if (typeof navigator !== "undefined" && typeof (navigator as any).sendBeacon === "function") {
      try {
        (navigator as any).sendBeacon(endpoint, new Blob([body], { type: "application/json" }));
        return;
      } catch {
        // Fall back to fetch if beacon fails
      }
    }

    // Fallback fetch (keepalive helps on page unload where supported)
    await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
    });
  } catch (err) {
    // Never throw from logging — swallow errors; optionally show in DEV
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.warn("sendFrontendLog failed:", err);
    }
  }
}