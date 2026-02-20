'use client';

/**
 * Contact form — 'use client' component for /contact page.
 * Submits to POST /api/public/leads with JSON body.
 */
import { useState, type FormEvent } from 'react';

const SERVICE_OPTIONS = [
  { value: 'project-management', label: 'ניהול פרויקטים' },
  { value: 'engineering-supervision', label: 'פיקוח הנדסי' },
  { value: 'consulting', label: 'ייעוץ הנדסי' },
  { value: 'bim', label: 'תכנון BIM' },
  { value: 'sustainability', label: 'בנייה ירוקה וקיימות' },
  { value: 'safety', label: 'בטיחות באתרי בנייה' },
];

interface FormData {
  name: string;
  email: string;
  phone: string;
  company: string;
  message: string;
  servicesInterested: string[];
}

type FormStatus = 'idle' | 'submitting' | 'success' | 'error';

export function ContactForm() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    company: '',
    message: '',
    servicesInterested: [],
  });
  const [status, setStatus] = useState<FormStatus>('idle');

  function handleServiceToggle(value: string) {
    setFormData((prev) => ({
      ...prev,
      servicesInterested: prev.servicesInterested.includes(value)
        ? prev.servicesInterested.filter((s) => s !== value)
        : [...prev.servicesInterested, value],
    }));
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus('submitting');

    try {
      // Turnstile token placeholder — integrate Cloudflare Turnstile widget here
      const turnstileToken = ''; // TODO: Get token from Turnstile widget

      const res = await fetch('/api/public/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone || undefined,
          company: formData.company || undefined,
          message: formData.message,
          servicesInterested:
            formData.servicesInterested.length > 0
              ? formData.servicesInterested
              : undefined,
          turnstileToken: turnstileToken || undefined,
        }),
      });

      if (res.ok) {
        setStatus('success');
        setFormData({
          name: '',
          email: '',
          phone: '',
          company: '',
          message: '',
          servicesInterested: [],
        });
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
          הפנייה נשלחה בהצלחה!
        </h3>
        <p className="text-green-700">ניצור איתך קשר בהקדם.</p>
        <button
          type="button"
          onClick={() => setStatus('idle')}
          className="mt-6 text-sm font-medium text-wdi-primary hover:text-wdi-primary-light transition underline"
        >
          שליחת פנייה נוספת
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      {status === 'error' && (
        <div
          className="rounded-lg bg-red-50 border border-red-200 p-4 text-red-700 text-sm"
          role="alert"
        >
          שגיאה בשליחת הפנייה. אנא נסה שנית.
        </div>
      )}

      {/* Name */}
      <div>
        <label htmlFor="contact-name" className="block text-sm font-medium text-gray-700 mb-1">
          שם מלא <span className="text-red-500" aria-hidden="true">*</span>
        </label>
        <input
          id="contact-name"
          type="text"
          required
          value={formData.name}
          onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
          className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:border-wdi-primary focus:ring-2 focus:ring-wdi-primary/20 transition"
          placeholder="ישראל ישראלי"
        />
      </div>

      {/* Email */}
      <div>
        <label htmlFor="contact-email" className="block text-sm font-medium text-gray-700 mb-1">
          אימייל <span className="text-red-500" aria-hidden="true">*</span>
        </label>
        <input
          id="contact-email"
          type="email"
          required
          dir="ltr"
          value={formData.email}
          onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
          className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:border-wdi-primary focus:ring-2 focus:ring-wdi-primary/20 transition text-left"
          placeholder="email@example.com"
        />
      </div>

      {/* Phone */}
      <div>
        <label htmlFor="contact-phone" className="block text-sm font-medium text-gray-700 mb-1">
          טלפון
        </label>
        <input
          id="contact-phone"
          type="tel"
          dir="ltr"
          value={formData.phone}
          onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
          className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:border-wdi-primary focus:ring-2 focus:ring-wdi-primary/20 transition text-left"
          placeholder="050-0000000"
        />
      </div>

      {/* Company */}
      <div>
        <label htmlFor="contact-company" className="block text-sm font-medium text-gray-700 mb-1">
          חברה
        </label>
        <input
          id="contact-company"
          type="text"
          value={formData.company}
          onChange={(e) => setFormData((prev) => ({ ...prev, company: e.target.value }))}
          className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:border-wdi-primary focus:ring-2 focus:ring-wdi-primary/20 transition"
          placeholder="שם החברה"
        />
      </div>

      {/* Services Interested */}
      <fieldset>
        <legend className="block text-sm font-medium text-gray-700 mb-3">
          שירותים מבוקשים
        </legend>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {SERVICE_OPTIONS.map((service) => (
            <label
              key={service.value}
              className="flex items-center gap-3 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={formData.servicesInterested.includes(service.value)}
                onChange={() => handleServiceToggle(service.value)}
                className="h-4 w-4 rounded border-gray-300 text-wdi-primary focus:ring-wdi-primary/20"
              />
              <span className="text-sm text-gray-700">{service.label}</span>
            </label>
          ))}
        </div>
      </fieldset>

      {/* Message */}
      <div>
        <label htmlFor="contact-message" className="block text-sm font-medium text-gray-700 mb-1">
          הודעה <span className="text-red-500" aria-hidden="true">*</span>
        </label>
        <textarea
          id="contact-message"
          required
          rows={5}
          value={formData.message}
          onChange={(e) => setFormData((prev) => ({ ...prev, message: e.target.value }))}
          className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:border-wdi-primary focus:ring-2 focus:ring-wdi-primary/20 transition resize-y"
          placeholder="ספרו לנו כיצד נוכל לסייע..."
        />
      </div>

      {/* Turnstile placeholder */}
      {/* TODO: Add Cloudflare Turnstile widget here */}
      {/* <div id="turnstile-widget" className="my-4" /> */}

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
          'שליחת פנייה'
        )}
      </button>
    </form>
  );
}
