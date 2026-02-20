'use client';

/**
 * Contact form — 'use client' component for /contact page.
 * Submits to POST /api/public/intake with submissionType 'general'.
 * INV-P01: ALL labels + subjects from CMS (passed as props).
 * CANONICAL-AMENDMENT-001
 */
import { useState, type FormEvent } from 'react';

interface FormLabels {
  nameLabel?: string;
  emailLabel?: string;
  phoneLabel?: string;
  companyLabel?: string;
  subjectLabel?: string;
  messageLabel?: string;
  submitText?: string;
  submittingText?: string;
  successTitle?: string;
  successMessage?: string;
  errorMessage?: string;
  sendAgainText?: string;
}

interface ContactFormProps {
  subjects?: string[];
  labels?: FormLabels;
}

interface FormData {
  name: string;
  email: string;
  phone: string;
  company: string;
  subject: string;
  message: string;
}

type FormStatus = 'idle' | 'submitting' | 'success' | 'error';

export function ContactForm({ subjects, labels }: ContactFormProps) {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    company: '',
    subject: '',
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
          submissionType: 'general',
          contactName: formData.name,
          contactEmail: formData.email,
          contactPhone: formData.phone || undefined,
          organization: formData.company || undefined,
          subject: formData.subject || undefined,
          message: formData.message,
          _honeypot: honeypot || undefined,
        }),
      });

      if (res.ok) {
        setStatus('success');
        setFormData({ name: '', email: '', phone: '', company: '', subject: '', message: '' });
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
        {labels?.successTitle && (
          <h3 className="text-xl font-bold text-green-800 mb-2">{labels.successTitle}</h3>
        )}
        {labels?.successMessage && (
          <p className="text-green-700">{labels.successMessage}</p>
        )}
        {labels?.sendAgainText && (
          <button
            type="button"
            onClick={() => setStatus('idle')}
            className="mt-6 text-sm font-medium text-wdi-primary hover:text-wdi-primary-light transition underline"
          >
            {labels.sendAgainText}
          </button>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      {status === 'error' && labels?.errorMessage && (
        <div
          className="rounded-lg bg-red-50 border border-red-200 p-4 text-red-700 text-sm"
          role="alert"
        >
          {labels.errorMessage}
        </div>
      )}

      {/* Name */}
      <div>
        <label htmlFor="contact-name" className="block text-sm font-medium text-gray-700 mb-1">
          {labels?.nameLabel ?? ''} <span className="text-red-500" aria-hidden="true">*</span>
        </label>
        <input
          id="contact-name"
          type="text"
          required
          value={formData.name}
          onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
          className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:border-wdi-primary focus:ring-2 focus:ring-wdi-primary/20 transition"
        />
      </div>

      {/* Email */}
      <div>
        <label htmlFor="contact-email" className="block text-sm font-medium text-gray-700 mb-1">
          {labels?.emailLabel ?? ''} <span className="text-red-500" aria-hidden="true">*</span>
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
          {labels?.phoneLabel ?? ''}
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
          {labels?.companyLabel ?? ''}
        </label>
        <input
          id="contact-company"
          type="text"
          value={formData.company}
          onChange={(e) => setFormData((prev) => ({ ...prev, company: e.target.value }))}
          className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:border-wdi-primary focus:ring-2 focus:ring-wdi-primary/20 transition"
        />
      </div>

      {/* Subject dropdown — from CMS contactFormSubjects */}
      {subjects && subjects.length > 0 && (
        <div>
          <label htmlFor="contact-subject" className="block text-sm font-medium text-gray-700 mb-1">
            {labels?.subjectLabel ?? ''}
          </label>
          <select
            id="contact-subject"
            value={formData.subject}
            onChange={(e) => setFormData((prev) => ({ ...prev, subject: e.target.value }))}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-wdi-primary focus:ring-2 focus:ring-wdi-primary/20 transition"
          >
            <option value="">---</option>
            {subjects.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      )}

      {/* Message */}
      <div>
        <label htmlFor="contact-message" className="block text-sm font-medium text-gray-700 mb-1">
          {labels?.messageLabel ?? ''} <span className="text-red-500" aria-hidden="true">*</span>
        </label>
        <textarea
          id="contact-message"
          required
          rows={5}
          value={formData.message}
          onChange={(e) => setFormData((prev) => ({ ...prev, message: e.target.value }))}
          className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:border-wdi-primary focus:ring-2 focus:ring-wdi-primary/20 transition resize-y"
        />
      </div>

      {/* Honeypot — hidden from humans, bots auto-fill it */}
      <div aria-hidden="true" className="absolute opacity-0 h-0 w-0 overflow-hidden">
        <label htmlFor="contact-honeypot">Leave this empty</label>
        <input
          id="contact-honeypot"
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
            {labels?.submittingText ?? '...'}
          </span>
        ) : (
          labels?.submitText ?? '\u2192'
        )}
      </button>
    </form>
  );
}
