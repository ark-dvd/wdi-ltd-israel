'use client';

import { signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function LoginForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') ?? '/admin';
  const error = searchParams.get('error');

  return (
    <main className="flex min-h-screen items-center justify-center bg-wdi-primary" dir="rtl">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-wdi-lg">
        <h1 className="mb-6 text-center text-2xl font-bold text-wdi-primary">
          WDI — כניסה למערכת
        </h1>

        {error && (
          <div className="mb-4 rounded bg-red-50 p-3 text-sm text-red-700">
            {error === 'AccessDenied'
              ? 'אין לך הרשאה לגשת למערכת'
              : 'שגיאה בהתחברות. נסה שנית.'}
          </div>
        )}

        <button
          onClick={() => signIn('google', { callbackUrl })}
          className="w-full rounded bg-wdi-primary px-4 py-3 font-semibold text-white transition hover:bg-wdi-primary-light"
          type="button"
        >
          התחבר עם Google
        </button>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <main className="flex min-h-screen items-center justify-center bg-wdi-primary">
        <div className="text-white">טוען...</div>
      </main>
    }>
      <LoginForm />
    </Suspense>
  );
}
