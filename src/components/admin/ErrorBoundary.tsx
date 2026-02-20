'use client';

/**
 * Fatal rendering error boundary — DOC-050 §15
 * "משהו השתבש. אנא טען מחדש את הדף."
 */
import { Component, type ReactNode, type ErrorInfo } from 'react';

interface Props { children: ReactNode; }
interface State { hasError: boolean; }

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(_error: Error, _info: ErrorInfo) {
    // Could report to Sentry
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50" dir="rtl">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">משהו השתבש</h1>
            <p className="text-gray-600 mb-6">אנא טען מחדש את הדף.</p>
            <button
              onClick={() => window.location.reload()}
              className="rounded-lg bg-wdi-primary px-6 py-3 text-white font-medium hover:bg-wdi-primary-light transition"
              type="button"
            >
              טען מחדש
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
