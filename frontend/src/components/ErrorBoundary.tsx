// src/components/ErrorBoundary.tsx
import React from "react";
import { logger } from "@utils/logger";
import { sendFrontendLog } from "@utils/logger/sender";

type Props = { children: React.ReactNode };
type State = { hasError: boolean };

export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    logger.error("ErrorBoundary caught:", error, info);
    void sendFrontendLog("error", String(error.message), { componentStack: info.componentStack });
  }

  render() {
    if (this.state.hasError) {
      return <div>Something went wrong. Please refresh the page.</div>;
    }
    return this.props.children;
  }
}