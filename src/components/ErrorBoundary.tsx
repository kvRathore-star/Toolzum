"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: string;
}

const MAX_RETRIES = 3;
const RETRY_DELAY = 1500;

export class ErrorBoundary extends Component<Props, State> {
  private retryCount = 0;
  private retryTimer: ReturnType<typeof setTimeout> | null = null;

  public state: State = {
    hasError: false,
    error: null,
    errorInfo: "",
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: error.message || "Unknown error" };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[tool-module-error]", error.message, errorInfo.componentStack?.slice(0, 500));
    this.setState({ errorInfo: errorInfo.componentStack || "" });
  }

  private handleRetry = () => {
    if (this.retryCount >= MAX_RETRIES) return;

    this.retryCount++;
    this.setState({ hasError: false, error: null, errorInfo: "" });
    this.props.onReset?.();

    if (this.retryTimer) clearTimeout(this.retryTimer);
    this.retryTimer = setTimeout(() => {
      this.retryCount = 0;
    }, 30000);
  };

  private handleCopyError = () => {
    const errorText = `Error: ${this.state.error?.message}\n\nStack: ${this.state.errorInfo}`;
    navigator.clipboard.writeText(errorText).catch(() => {});
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
      const isMemoryError = this.state.error?.message?.toLowerCase().includes('memory') ||
        this.state.error?.message?.toLowerCase().includes('allocation') ||
        this.state.error?.message?.toLowerCase().includes('out of memory');

      return (
        <div className="w-full bg-red-50 dark:bg-red-950/20 rounded-2xl border border-red-200 dark:border-red-900/50 p-8 flex flex-col items-center justify-center min-h-[400px] text-center">
          <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/50 mb-6 flex items-center justify-center">
            <span className="text-red-500 text-2xl font-bold">!</span>
          </div>
          <h2 className="text-xl font-bold text-red-700 dark:text-red-400 mb-2">{isMemoryError ? 'Browser memory limit reached' : 'Failed to load this tool'}</h2>
          <p className="text-red-600 dark:text-red-300 max-w-md mx-auto mb-2">
            {isMemoryError
              ? 'Large files may exceed browser memory limits on some devices. Try processing in smaller batches or close other browser tabs to free up memory.'
              : (this.state.error?.message || "There was a problem loading or rendering this module.")}
          </p>
          <p className="text-xs text-red-500 dark:text-red-400 mb-6 max-w-md font-mono opacity-60">
            {this.state.error?.name || "Error"} {canRetry ? `· ${MAX_RETRIES - this.retryCount} retries left` : "· No more retries"}
          </p>
          <div className="flex items-center gap-3">
            {canRetry && (
              <button
                onClick={this.handleRetry}
                className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-all active:scale-95 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                  Retry
                </button>
            )}
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2.5 bg-zinc-600 hover:bg-zinc-700 text-white rounded-xl font-medium transition-all active:scale-95"
            >
              Refresh Page
            </button>
            <button
              onClick={this.handleCopyError}
              className="px-3 py-2.5 text-xs text-red-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
              title="Copy error details"
            >
              Copy Error
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
