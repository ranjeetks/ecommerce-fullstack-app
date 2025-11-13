// src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "react-toastify/dist/ReactToastify.css";
import "./index.css"; // Tailwind styles
import { AuthProvider } from "./context/AuthContext";
import ErrorBoundary from "./components/ErrorBoundary";

// logger + sender (same imports style as your api.ts)
import { logger } from "@utils/logger";
import { sendFrontendLog } from "@utils/logger/sender";

// Read the frontend logging toggle (Vite env)
const FRONTEND_LOGGING_ENABLED = import.meta.env.VITE_LOGGING_ENABLED === "true";

if (FRONTEND_LOGGING_ENABLED) {
  // Capture uncaught exceptions (synchronous errors)
  window.onerror = function (message, source, lineno, colno, error) {
    try {
      const msg = typeof message === "string" ? message : String(message);
      const src = typeof source === "string" ? source : String(source);
      const location = `${src}:${lineno ?? "?"}:${colno ?? "?"}`;
      const stack = (error as any)?.stack;

      // Console + local log
      logger.error("uncaught error:", { msg, location, stack });

      // Fire-and-forget send to backend (non-blocking); don't await here
      void sendFrontendLog("error", msg, { location, stack });
    } catch (e) {
      // swallow any errors from the logging path
      // eslint-disable-next-line no-console
      console.warn("error while logging uncaught error:", e);
    }

    // Return false to let the default handler (if any) run as well.
    return false;
  };

  // Capture unhandled promise rejections
  window.addEventListener("unhandledrejection", (event: PromiseRejectionEvent) => {
    try {
      const reason = event.reason;
      const message = typeof reason === "string" ? reason : (reason && reason.message) || String(reason);
      const stack = (reason && (reason.stack || reason.stacktrace)) || undefined;

      logger.error("unhandledrejection:", { message, stack });

      void sendFrontendLog("error", "unhandledrejection: " + message, { stack });
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn("error while logging unhandledrejection:", e);
    }
  });
}

// Render app wrapped in ErrorBoundary to catch render-time errors
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>
);