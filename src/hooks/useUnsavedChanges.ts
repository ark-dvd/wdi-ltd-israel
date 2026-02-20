'use client';

/**
 * Unsaved changes warning — DOC-050 §18.7
 * "יש לך שינויים שלא נשמרו. האם אתה בטוח שברצונך לצאת?"
 */
import { useEffect, useRef, useCallback } from 'react';

export function useUnsavedChanges(isDirty: boolean) {
  const dirtyRef = useRef(isDirty);
  dirtyRef.current = isDirty;

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (dirtyRef.current) {
        e.preventDefault();
      }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, []);

  const confirmNavigation = useCallback((callback: () => void) => {
    if (dirtyRef.current) {
      const ok = window.confirm('יש לך שינויים שלא נשמרו. האם אתה בטוח שברצונך לצאת?');
      if (ok) callback();
    } else {
      callback();
    }
  }, []);

  return { confirmNavigation };
}
