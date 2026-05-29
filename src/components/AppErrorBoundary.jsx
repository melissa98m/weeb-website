import React from "react";
import * as Sentry from "@sentry/react";

function ErrorFallback({ error, onRetry }) {
  const message =
    error?.message || "An unexpected error occurred while rendering this page.";

  return (
    <section className="min-h-screen flex items-center justify-center px-6 py-12 bg-light text-dark">
      <div className="w-full max-w-lg rounded-2xl border border-red-200 bg-white p-8 shadow-xl">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-red-600">
          Application Error
        </p>
        <h1 className="mt-3 text-3xl font-bold">Unable to render this screen</h1>
        <p className="mt-3 text-sm text-gray-600">
          {message}
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={onRetry}
            className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500"
          >
            Reload app
          </button>
        </div>
      </div>
    </section>
  );
}

export default class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, errorInfo) {
    Sentry.captureException(error, {
      extra: {
        componentStack: errorInfo?.componentStack,
      },
    });
  }

  handleRetry = () => {
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  };

  render() {
    if (this.state.error) {
      return <ErrorFallback error={this.state.error} onRetry={this.handleRetry} />;
    }

    return this.props.children;
  }
}
