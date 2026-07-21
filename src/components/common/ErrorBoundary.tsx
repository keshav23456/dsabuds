'use client';

import { Component, ErrorInfo, ReactNode } from 'react';

// TODO: Next.js App Router also supports a root-level app/error.tsx for
// route-segment error handling. This class component is kept for places
// that need to wrap a subtree imperatively; another agent owns app/error.tsx.

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#0D1117]">
          <div className="text-center p-8 max-w-2xl w-full">
            <h1 className="text-4xl font-bold text-white mb-4">Oops!</h1>
            <p className="text-gray-400 mb-4">Something went wrong. Please refresh the page.</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-primary px-6 py-3 rounded-lg font-bold hover:opacity-90 transition-opacity"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
