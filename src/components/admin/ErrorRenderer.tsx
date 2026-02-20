'use client';

/**
 * Error rendering by category — DOC-050 §9
 */
import type { ErrorEnvelope } from '@/lib/api/client';

interface ErrorRendererProps {
  error: ErrorEnvelope | null;
  onReload?: () => void;
  onDismiss?: () => void;
}

export function ErrorRenderer({ error, onReload, onDismiss }: ErrorRendererProps) {
  if (!error) return null;

  // §9.1 Conflict banner
  if (error.category === 'conflict' || error.code === 'CONFLICT_DETECTED') {
    return (
      <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 mb-4">
        <p className="text-amber-800 font-medium">{error.message}</p>
        {onReload && (
          <button onClick={onReload} className="mt-2 text-sm font-medium text-amber-700 underline" type="button">
            טען מחדש
          </button>
        )}
      </div>
    );
  }

  // §9.1 Network unknown banner
  if (error.category === 'network_unknown') {
    return (
      <div className="rounded-lg border border-orange-300 bg-orange-50 p-4 mb-4">
        <p className="text-orange-800 font-medium">{error.message}</p>
        {onReload && (
          <button onClick={onReload} className="mt-2 text-sm font-medium text-orange-700 underline" type="button">
            טען מחדש
          </button>
        )}
      </div>
    );
  }

  // §9.1 Validation: top-level message + recordErrors
  if (error.category === 'validation') {
    return (
      <div className="rounded-lg border border-red-300 bg-red-50 p-4 mb-4">
        <p className="text-red-800 font-medium">{error.message}</p>
        {error.recordErrors && error.recordErrors.length > 0 && (
          <ul className="mt-2 space-y-1">
            {error.recordErrors.map((re, i) => (
              <li key={i} className="text-sm text-red-700">{re.message}</li>
            ))}
          </ul>
        )}
        {onDismiss && (
          <button onClick={onDismiss} className="mt-2 text-sm text-red-600 underline" type="button">סגור</button>
        )}
      </div>
    );
  }

  // §9.1 Server error
  if (error.category === 'server') {
    return (
      <div className="rounded-lg border border-red-300 bg-red-50 p-4 mb-4">
        <p className="text-red-800 font-medium">{error.message}</p>
        <p className="text-sm text-red-600 mt-1">נסה שוב</p>
      </div>
    );
  }

  // §9.1 Not found
  if (error.category === 'not_found') {
    return (
      <div className="rounded-lg border border-gray-300 bg-gray-50 p-4 mb-4">
        <p className="text-gray-800 font-medium">{error.message}</p>
      </div>
    );
  }

  // Default
  return (
    <div className="rounded-lg border border-red-300 bg-red-50 p-4 mb-4">
      <p className="text-red-800 font-medium">{error.message}</p>
    </div>
  );
}

/** Inline field error — §9.1 adjacent to fields */
export function FieldError({ error }: { error?: string }) {
  if (!error) return null;
  return <p className="text-sm text-red-600 mt-1">{error}</p>;
}
