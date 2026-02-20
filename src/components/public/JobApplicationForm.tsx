'use client';

/**
 * Job application form — 'use client' component for /job-application page.
 * Uses Netlify Forms with data-netlify="true" per DOC-010 section 3.7.
 */
import { useState, useRef, type FormEvent } from 'react';

type FormStatus = 'idle' | 'submitting' | 'success' | 'error';

export function JobApplicationForm() {
  const [status, setStatus] = useState<FormStatus>('idle');
  const formRef = useRef<HTMLFormElement>(null);
  const [fileName, setFileName] = useState<string>('');

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus('submitting');

    try {
      const form = e.currentTarget;
      const formData = new FormData(form);

      const res = await fetch('/', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        setStatus('success');
        formRef.current?.reset();
        setFileName('');
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
      ref={formRef}
      name="job-application"
      method="POST"
      data-netlify="true"
      encType="multipart/form-data"
      onSubmit={handleSubmit}
      className="space-y-6"
      noValidate
    >
      {/* Netlify hidden form name field */}
      <input type="hidden" name="form-name" value="job-application" />

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
          name="name"
          type="text"
          required
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
        <label htmlFor="job-phone" className="block text-sm font-medium text-gray-700 mb-1">
          טלפון <span className="text-red-500" aria-hidden="true">*</span>
        </label>
        <input
          id="job-phone"
          name="phone"
          type="tel"
          required
          dir="ltr"
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
          name="position"
          type="text"
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
          name="message"
          rows={4}
          className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:border-wdi-primary focus:ring-2 focus:ring-wdi-primary/20 transition resize-y"
          placeholder="ספרו לנו קצת על עצמכם, הניסיון שלכם ומה מעניין אתכם..."
        />
      </div>

      {/* CV Upload */}
      <div>
        <label htmlFor="job-cv" className="block text-sm font-medium text-gray-700 mb-1">
          קורות חיים (PDF, DOC, DOCX)
        </label>
        <div className="relative">
          <input
            id="job-cv"
            name="cv"
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={(e) => setFileName(e.target.files?.[0]?.name || '')}
            className="sr-only"
          />
          <label
            htmlFor="job-cv"
            className="flex items-center justify-center gap-2 w-full rounded-lg border-2 border-dashed border-gray-300 px-4 py-6 text-gray-500 hover:border-wdi-primary hover:text-wdi-primary transition cursor-pointer"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            {fileName ? (
              <span className="text-sm font-medium text-wdi-primary">{fileName}</span>
            ) : (
              <span className="text-sm">לחצו כאן לבחירת קובץ או גררו לכאן</span>
            )}
          </label>
        </div>
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
