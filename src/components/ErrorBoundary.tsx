"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { ErrorMessage } from "@/components/ErrorMessage";
import { classifyError } from "@/lib/errorMessages";

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: string;
  retryPending: boolean;
}

const MAX_RETRIES = 3;
// Exponential backoff between retries: 1s, 2s, 4s. Transient WASM/CDN
// failures often clear on a delayed retry; immediate retries just
// re-hit the same failure.
const RETRY_DELAYS = [1000, 2000, 4000];

export class ErrorBoundary extends Component<Props, State> {
  private retryCount = 0;
  private retryTimer: ReturnType<typeof setTimeout> | null = null;

  public state: State = {
    hasError: false,
    error: null,
    errorInfo: "",
    retryPending: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: error.message || "Unknown error", retryPending: false };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[tool-module-error]", error.message, errorInfo.componentStack?.slice(0, 500));
    this.setState({ errorInfo: errorInfo.componentStack || "" });
  }

  private handleRetry = () => {
    if (this.retryCount >= MAX_RETRIES || this.state.retryPending) return;

    const delay = RETRY_DELAYS[Math.min(this.retryCount, RETRY_DELAYS.length - 1)];
    this.retryCount++;
    this.setState({ retryPending: true });
    if (this.retryTimer) clearTimeout(this.retryTimer);
    // Back off before resetting so transient load failures can clear.
    this.retryTimer = setTimeout(() => {
      this.setState({ hasError: false, error: null, errorInfo: "", retryPending: false });
      this.props.onReset?.();
    }, delay);

    setTimeout(() => {
      this.retryCount = 0;
    }, 30000);
  };

  public componentWillUnmount() {
    if (this.retryTimer) clearTimeout(this.retryTimer);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const canRetry = this.retryCount < MAX_RETRIES;
      const friendly = classifyError(this.state.error);

      return (
        <ErrorMessage
          title={friendly.title}
          message={friendly.message}
          detail={`${this.state.error?.name || "Error"}${canRetry ? ` · ${MAX_RETRIES - this.retryCount} retries left` : " · No more retries"}`}
          onRetry={canRetry ? this.handleRetry : undefined}
          retryPending={this.state.retryPending}
          onRefresh={() => window.location.reload()}
          copyText={`Error: ${this.state.error?.message}\n\nStack: ${this.state.errorInfo}`}
          debugText={`${this.state.error?.name}: ${this.state.error?.message}\n\n${this.state.errorInfo}`}
        />
      );
    }

    return this.props.children;
  }
}
