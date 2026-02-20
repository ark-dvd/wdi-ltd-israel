'use client';

/**
 * Confirmation dialog — DOC-030 §12.2, DOC-050 §6.4
 */
import { useEffect } from 'react';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'default';
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open, title, message,
  confirmLabel = 'אישור', cancelLabel = 'ביטול',
  variant = 'default', onConfirm, onCancel,
}: ConfirmDialogProps) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50" dir="rtl">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-wdi-xl">
        <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 mb-6">{message}</p>
        <div className="flex gap-3 justify-start">
          <button
            onClick={onConfirm}
            className={`rounded-lg px-4 py-2 font-medium text-white transition ${
              variant === 'danger' ? 'bg-red-600 hover:bg-red-700' : 'bg-wdi-primary hover:bg-wdi-primary-light'
            }`}
            type="button"
          >
            {confirmLabel}
          </button>
          <button
            onClick={onCancel}
            className="rounded-lg border border-gray-300 px-4 py-2 font-medium text-gray-700 hover:bg-gray-50 transition"
            type="button"
          >
            {cancelLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
