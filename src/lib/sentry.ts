/**
 * Sentry error monitoring — DOC-010 §2.2
 * Structured error tracking for production.
 */

export function initSentry(): void {
  // Sentry is initialized via @sentry/nextjs instrumentation
  // in sentry.client.config.ts and sentry.server.config.ts
  // This module provides helper utilities.
}

/** Report an error to Sentry with context */
export async function reportError(
  error: unknown,
  context?: Record<string, unknown>,
): Promise<void> {
  const Sentry = await import('@sentry/nextjs');
  if (context) {
    Sentry.setContext('additional', context);
  }
  Sentry.captureException(error);
}
