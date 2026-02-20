'use client';

/**
 * Deterministic state machine — DOC-050 §16
 * Idle → InFlight → Success | Error | NetworkUnknown
 */
import { useState, useCallback, useRef, useEffect } from 'react';
import type { ErrorEnvelope } from '@/lib/api/client';

export type RequestState = 'idle' | 'in_flight' | 'success' | 'error' | 'network_unknown';

export function useRequestLifecycle() {
  const [state, setState] = useState<RequestState>('idle');
  const [error, setError] = useState<ErrorEnvelope | null>(null);
  const inFlightRef = useRef(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const execute = useCallback(async <T>(
    fn: () => Promise<T>,
  ): Promise<T | null> => {
    if (inFlightRef.current) return null; // §3.3 double-submit prevention
    inFlightRef.current = true;
    setState('in_flight');
    setError(null);

    try {
      const result = await fn();
      if (mountedRef.current) {
        setState('success');
        inFlightRef.current = false;
        // §16 Success → Idle after state reconciliation
        setTimeout(() => {
          if (mountedRef.current) setState('idle');
        }, 100);
      }
      return result;
    } catch (err) {
      inFlightRef.current = false;
      if (!mountedRef.current) return null; // §14.1 response after unmount ignored

      const envelope = err as ErrorEnvelope;
      if (envelope?.category === 'auth') {
        window.location.href = '/admin/login';
        return null;
      }

      if (envelope?.category === 'network_unknown') {
        setState('network_unknown');
      } else {
        setState('error');
      }
      setError(envelope);
      return null;
    }
  }, []);

  const reset = useCallback(() => {
    setState('idle');
    setError(null);
    inFlightRef.current = false;
  }, []);

  return { state, error, isLocked: state === 'in_flight', execute, reset };
}
