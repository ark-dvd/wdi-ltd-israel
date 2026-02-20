'use client';

/**
 * SlidePanel — DOC-050 §12.5
 * Slides from LEFT (RTL convention)
 */
import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

interface SlidePanelProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  wide?: boolean;
}

export function SlidePanel({ open, title, onClose, children, footer, wide }: SlidePanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      panelRef.current?.focus();
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/30 transition-opacity duration-300 ${
          open ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />
      {/* Panel — slides from LEFT */}
      <div
        ref={panelRef}
        tabIndex={-1}
        className={`fixed top-0 left-0 z-50 h-full bg-white shadow-wdi-xl transition-transform duration-300 flex flex-col outline-none ${
          wide ? 'w-full max-w-2xl' : 'w-full max-w-lg'
        } ${open ? 'translate-x-0' : '-translate-x-full'}`}
        dir="rtl"
      >
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-lg font-bold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="rounded p-1 text-gray-400 hover:text-gray-600 transition"
            type="button"
            aria-label="סגור"
          >
            <X size={20} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {children}
        </div>
        {footer && (
          <div className="border-t px-6 py-4">
            {footer}
          </div>
        )}
      </div>
    </>
  );
}
