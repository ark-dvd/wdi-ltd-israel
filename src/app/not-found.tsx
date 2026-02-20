/**
 * Custom 404 page — not-found.tsx
 * Displayed when a route is not matched.
 */
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: '404 — הדף לא נמצא',
};

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="text-center max-w-lg">
        {/* 404 badge */}
        <span className="inline-block text-8xl lg:text-9xl font-bold text-wdi-primary/15 select-none mb-2">
          404
        </span>

        <h1 className="text-3xl lg:text-4xl font-bold text-wdi-primary mb-4">
          הדף שחיפשת לא נמצא
        </h1>

        <p className="text-gray-600 text-lg mb-8 leading-relaxed">
          מצטערים, הדף המבוקש אינו קיים או שהועבר.
        </p>

        <Link
          href="/"
          className="inline-block bg-wdi-primary hover:bg-wdi-primary/90 text-white font-semibold text-lg px-8 py-4 rounded-lg transition-colors"
        >
          חזרה לדף הבית
        </Link>
      </div>
    </div>
  );
}
