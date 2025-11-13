// src/utils/logger/index.ts
export type LogLevel = "debug" | "info" | "warn" | "error" | "off";

/**
 * Configuration (from Vite env)
 * - VITE_LOGGING_ENABLED: "true" | "false"
 * - VITE_LOG_LEVEL: "debug" | "info" | "warn" | "error" | "off"
 */
export const LOGGING_ENABLED = import.meta.env.VITE_LOGGING_ENABLED === "true";
export const LOG_LEVEL: LogLevel =
  (import.meta.env.VITE_LOG_LEVEL as LogLevel) || "info";

const LEVELS: LogLevel[] = ["debug", "info", "warn", "error"];

function shouldLog(level: LogLevel) {
  if (!LOGGING_ENABLED || LOG_LEVEL === "off") return false;
  const currentIndex = LEVELS.indexOf(LOG_LEVEL);
  const msgIndex = LEVELS.indexOf(level);
  return msgIndex >= currentIndex;
}

/** Console logger (use this everywhere in the app) */
export const logger = {
  debug: (...args: unknown[]) => (shouldLog("debug") ? console.debug("[DEBUG]", ...args) : undefined),
  info: (...args: unknown[]) => (shouldLog("info") ? console.info("[INFO]", ...args) : undefined),
  warn: (...args: unknown[]) => (shouldLog("warn") ? console.warn("[WARN]", ...args) : undefined),
  error: (...args: unknown[]) => (shouldLog("error") ? console.error("[ERROR]", ...args) : undefined),
};