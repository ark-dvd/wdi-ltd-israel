'use client';

/**
 * Supplier registration form — 'use client' component for /join-us page.
 * Uses Netlify Forms via public/__forms.html detection (plugin-nextjs v5).
 */
import { useState, useRef, type FormEvent } from 'react';

type FormStatus = 'idle' | 'submitting' | 'success' | 'error';

export function SupplierForm() {
  const [status, setStatus] = useState<FormStatus>('idle');
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus('submitting');

    try {
      const form = e.currentTarget;
      const formData = new FormData(form);

      const res = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(formData as unknown as Record<string, string>).toString(),
      });

      if (res.ok) {
        setStatus('success');
        formRef.current?.reset();
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  }

  if (status === 'success') {
    return (
      <div
        className="rounded-2xl bg-green-50 border border-green-200 p-8 text-center"
        role="alert"
      >
        <svg
          className="w-16 h-16 text-green-500 mx-auto mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <h3 className="text-xl font-bold text-green-800 mb-2">
          הטופס נשלח בהצלחה!
        </h3>
        <p className="text-green-700">הפרטים שלכם נקלטו במערכת. ניצור קשר בהקדם.</p>
        <button
          type="button"
          onClick={() => setStatus('idle')}
          className="mt-6 text-sm font-medium text-wdi-primary hover:text-wdi-primary-light transition underline"
        >
          שליחת טופס נוסף
        </button>
      </div>
    );
  }

  return (
    <form
      ref={formRef}
      name="supplier-registration"
      method="POST"
      onSubmit={handleSubmit}
      className="space-y-6"
      noValidate
    >
      {/* Netlify hidden form name field */}
      <input type="hidden" name="form-name" value="supplier-registration" />

      {status === 'error' && (
        <div
          className="rounded-lg bg-red-50 border border-red-200 p-4 text-red-700 text-sm"
          role="alert"
        >
          שגיאה בשליחת הטופס. אנא נסה שנית.
        </div>
      )}

      {/* Company Name */}
      <div>
        <label htmlFor="supplier-company" className="block text-sm font-medium text-gray-700 mb-1">
          שם החברה / העסק <span className="text-red-500" aria-hidden="true">*</span>
        </label>
        <input
          id="supplier-company"
          name="company"
          type="text"
          required
          className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:border-wdi-primary focus:ring-2 focus:ring-wdi-primary/20 transition"
          placeholder="שם החברה"
        />
      </div>

      {/* Contact Name */}
      <div>
        <label htmlFor="supplier-name" className="block text-sm font-medium text-gray-700 mb-1">
          שם איש קשר <span className="text-red-500" aria-hidden="true">*</span>
        </label>
        <input
          id="supplier-name"
          name="contactName"
          type="text"
          required
          className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:border-wdi-primary focus:ring-2 focus:ring-wdi-primary/20 transition"
          placeholder="ישראל ישראלי"
        />
      </div>

      {/* Email */}
      <div>
        <label htmlFor="supplier-email" className="block text-sm font-medium text-gray-700 mb-1">
          אימייל <span className="text-red-500" aria-hidden="true">*</span>
        </label>
        <input
          id="supplier-email"
          name="email"
          type="email"
          required
          dir="ltr"
          className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:border-wdi-primary focus:ring-2 focus:ring-wdi-primary/20 transition text-left"
          placeholder="email@example.com"
        />
      </div>

      {/* Phone */}
      <div>
        <label htmlFor="supplier-phone" className="block text-sm font-medium text-gray-700 mb-1">
          טלפון <span className="text-red-500" aria-hidden="true">*</span>
        </label>
        <input
          id="supplier-phone"
          name="phone"
          type="tel"
          required
          dir="ltr"
          className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:border-wdi-primary focus:ring-2 focus:ring-wdi-primary/20 transition text-left"
          placeholder="050-0000000"
        />
      </div>

      {/* Specialty / Field */}
      <div>
        <label htmlFor="supplier-specialty" className="block text-sm font-medium text-gray-700 mb-1">
          תחום התמחות
        </label>
        <input
          id="supplier-specialty"
          name="specialty"
          type="text"
          className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:border-wdi-primary focus:ring-2 focus:ring-wdi-primary/20 transition"
          placeholder="למשל: חשמל, אינסטלציה, שלד, גמר..."
        />
      </div>

      {/* Message */}
      <div>
        <label htmlFor="supplier-message" className="block text-sm font-medium text-gray-700 mb-1">
          הערות נוספות
        </label>
        <textarea
          id="supplier-message"
          name="message"
          rows={4}
          className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:border-wdi-primary focus:ring-2 focus:ring-wdi-primary/20 transition resize-y"
          placeholder="מידע נוסף על החברה, ניסיון, פרויקטים מרכזיים..."
        />
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={status === 'submitting'}
        className="w-full rounded-lg bg-wdi-primary px-6 py-3.5 text-base font-semibold text-white hover:bg-wdi-primary-light transition disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {status === 'submitting' ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            שולח...
          </span>
        ) : (
          'הרשמה למאגר'
        )}
      </button>
    </form>
  );
}
