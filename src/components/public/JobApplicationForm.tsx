'use client';

/**
 * Job application form — 'use client' component for /job-application page.
 * Submits to POST /api/public/intake with submissionType 'job_application'.
 * CANONICAL-AMENDMENT-001
 * NOTE: CV file upload via /api/admin/upload is deferred for v1.0.
 *       Applicants are asked to email their CV separately.
 */
import { useState, type FormEvent } from 'react';

interface FormData {
  name: string;
  email: string;
  phone: string;
  position: string;
  message: string;
}

type FormStatus = 'idle' | 'submitting' | 'success' | 'error';

export function JobApplicationForm() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    position: '',
    message: '',
  });
  const [status, setStatus] = useState<FormStatus>('idle');

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus('submitting');

    try {
      const form = e.currentTarget;
      const honeypot = (form.elements.namedItem('_honeypot') as HTMLInputElement)?.value;

      const res = await fetch('/api/public/intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submissionType: 'job_application',
          contactName: formData.name,
          contactEmail: formData.email,
          contactPhone: formData.phone || undefined,
          positionAppliedFor: formData.position || undefined,
          message: formData.message || undefined,
          _honeypot: honeypot || undefined,
        }),
      });

      if (res.ok) {
        setStatus('success');
        setFormData({ name: '', email: '', phone: '', position: '', message: '' });
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
        <p className="text-green-700">נעבור על המועמדות שלך וניצור קשר בהקדם.</p>
        <button
          type="button"
          onClick={() => setStatus('idle')}
          className="mt-6 text-sm font-medium text-wdi-primary hover:text-wdi-primary-light transition underline"
        >
          שליחת מועמדות נוספת
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6"
      noValidate
    >
      {status === 'error' && (
        <div
          className="rounded-lg bg-red-50 border border-red-200 p-4 text-red-700 text-sm"
          role="alert"
        >
          שגיאה בשליחת הטופס. אנא נסה שנית.
        </div>
      )}

      {/* Name */}
      <div>
        <label htmlFor="job-name" className="block text-sm font-medium text-gray-700 mb-1">
          שם מלא <span className="text-red-500" aria-hidden="true">*</span>
        </label>
        <input
          id="job-name"
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
        <label htmlFor="job-email" className="block text-sm font-medium text-gray-700 mb-1">
          אימייל <span className="text-red-500" aria-hidden="true">*</span>
        </label>
        <input
          id="job-email"
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
        <label htmlFor="job-phone" className="block text-sm font-medium text-gray-700 mb-1">
          טלפון <span className="text-red-500" aria-hidden="true">*</span>
        </label>
        <input
          id="job-phone"
          type="tel"
          required
          dir="ltr"
          value={formData.phone}
          onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
          className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:border-wdi-primary focus:ring-2 focus:ring-wdi-primary/20 transition text-left"
          placeholder="050-0000000"
        />
      </div>

      {/* Position */}
      <div>
        <label htmlFor="job-position" className="block text-sm font-medium text-gray-700 mb-1">
          תפקיד מבוקש
        </label>
        <input
          id="job-position"
          type="text"
          value={formData.position}
          onChange={(e) => setFormData((prev) => ({ ...prev, position: e.target.value }))}
          className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:border-wdi-primary focus:ring-2 focus:ring-wdi-primary/20 transition"
          placeholder="למשל: מהנדס פיקוח, מנהל פרויקטים..."
        />
      </div>

      {/* Message */}
      <div>
        <label htmlFor="job-message" className="block text-sm font-medium text-gray-700 mb-1">
          מכתב מקדים / הערות
        </label>
        <textarea
          id="job-message"
          rows={4}
          value={formData.message}
          onChange={(e) => setFormData((prev) => ({ ...prev, message: e.target.value }))}
          className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:border-wdi-primary focus:ring-2 focus:ring-wdi-primary/20 transition resize-y"
          placeholder="ספרו לנו קצת על עצמכם, הניסיון שלכם ומה מעניין אתכם..."
        />
      </div>

      {/* CV note */}
      <div className="rounded-lg bg-blue-50 border border-blue-200 p-4 text-blue-700 text-sm">
        לצירוף קורות חיים, אנא שלחו אותם בדוא&quot;ל לכתובת: <strong dir="ltr">hr@wdi.co.il</strong>
      </div>

      {/* Honeypot — hidden from humans, bots auto-fill it */}
      <div aria-hidden="true" className="absolute opacity-0 h-0 w-0 overflow-hidden">
        <label htmlFor="job-honeypot">Leave this empty</label>
        <input
          id="job-honeypot"
          name="_honeypot"
          type="text"
          tabIndex={-1}
          autoComplete="off"
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
          'שליחת מועמדות'
        )}
      </button>
    </form>
  );
}
