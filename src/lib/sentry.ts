/**
 * Sentry error monitoring — DOC-010 §2.2
 * If SENTRY_DSN is not set, falls back to console.error.
 */

const SENTRY_CONFIGURED = !!process.env.SENTRY_DSN;

if (!SENTRY_CONFIGURED) {
  console.warn(
    '[sentry] SENTRY_DSN not set — error reporting disabled. Using console.error as fallback.',
  );
}

export function initSentry(): void {
  if (!SENTRY_CONFIGURED) return;
  // Sentry is initialized via @sentry/nextjs instrumentation
  // in sentry.client.config.ts and sentry.server.config.ts
}

/** Report an error to Sentry with context, or console.error as fallback */
export async function reportError(
  error: unknown,
  context?: Record<string, unknown>,
): Promise<void> {
  if (!SENTRY_CONFIGURED) {
    console.error('[sentry:fallback]', error, context ?? '');
    return;
  }

  try {
    const Sentry = await import('@sentry/nextjs');
    if (context) {
      Sentry.setContext('additional', context);
    }
    Sentry.captureException(error);
  } catch {
    console.error('[sentry:fallback] Failed to report to Sentry:', error, context ?? '');
  }
}
