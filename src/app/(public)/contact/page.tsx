/**
 * Contact page — /contact
 * Server component with embedded client-side ContactForm.
 * Includes LocalBusinessJsonLd for structured data.
 */
import type { Metadata } from 'next';
import { ContactForm } from '@/components/public/ContactForm';
import { LocalBusinessJsonLd } from '@/components/public/JsonLd';

export const metadata: Metadata = {
  title: 'צור קשר | WDI',
  description:
    'צרו קשר עם WDI — חברת בוטיק לניהול פרויקטים, פיקוח וייעוץ הנדסי. נשמח לשמוע מכם ולסייע בפרויקט הבא שלכם.',
};

export default function ContactPage() {
  return (
    <>
      <LocalBusinessJsonLd />

      <section className="py-16 lg:py-24" dir="rtl">
        <div className="max-w-container mx-auto px-4 lg:px-8">
          {/* Page heading */}
          <header className="mb-12 text-center">
            <h1 className="text-4xl lg:text-5xl font-bold text-wdi-primary mb-4">
              צור קשר
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              נשמח לשמוע מכם. מלאו את הטופס ונחזור אליכם בהקדם האפשרי.
            </p>
          </header>

          {/* Two-column layout: form (right in RTL) + contact info (left in RTL) */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-16">
            {/* Form — right side (RTL) — takes 3 of 5 columns */}
            <div className="lg:col-span-3">
              <div className="rounded-2xl bg-white border border-gray-200 shadow-wdi-sm p-6 sm:p-8">
                <h2 className="text-2xl font-bold text-wdi-primary mb-6">
                  שלחו לנו פנייה
                </h2>
                <ContactForm />
              </div>
            </div>

            {/* Contact info — left side (RTL) — takes 2 of 5 columns */}
            <aside className="lg:col-span-2">
              <div className="space-y-8">
                {/* Office info */}
                <div className="rounded-2xl bg-gray-50 border border-gray-200 p-6">
                  <h2 className="text-xl font-bold text-wdi-primary mb-5">
                    פרטי התקשרות
                  </h2>
                  <dl className="space-y-4">
                    <div>
                      <dt className="text-sm font-medium text-gray-500 mb-1">טלפון</dt>
                      <dd>
                        <a
                          href="tel:+972-3-000-0000"
                          className="text-wdi-primary font-medium hover:text-wdi-primary-light transition"
                          dir="ltr"
                        >
                          03-000-0000
                        </a>
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500 mb-1">אימייל</dt>
                      <dd>
                        <a
                          href="mailto:info@wdi-israel.co.il"
                          className="text-wdi-primary font-medium hover:text-wdi-primary-light transition"
                          dir="ltr"
                        >
                          info@wdi-israel.co.il
                        </a>
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500 mb-1">כתובת</dt>
                      <dd className="text-gray-700">
                        ישראל
                      </dd>
                    </div>
                  </dl>
                </div>

                {/* Working hours */}
                <div className="rounded-2xl bg-gray-50 border border-gray-200 p-6">
                  <h2 className="text-xl font-bold text-wdi-primary mb-5">
                    שעות פעילות
                  </h2>
                  <dl className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-gray-600">ראשון - חמישי</dt>
                      <dd className="font-medium text-gray-800" dir="ltr">08:00 - 17:00</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-600">שישי</dt>
                      <dd className="font-medium text-gray-800" dir="ltr">08:00 - 13:00</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-600">שבת</dt>
                      <dd className="font-medium text-gray-800">סגור</dd>
                    </div>
                  </dl>
                </div>

                {/* Quick info */}
                <div className="rounded-2xl bg-wdi-primary text-white p-6">
                  <h2 className="text-xl font-bold mb-4">למה WDI?</h2>
                  <ul className="space-y-3 text-sm text-white/85">
                    <li className="flex items-start gap-2">
                      <span className="text-wdi-secondary mt-0.5" aria-hidden="true">&#10003;</span>
                      ניסיון של למעלה מעשור בניהול פרויקטים
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-wdi-secondary mt-0.5" aria-hidden="true">&#10003;</span>
                      צוות מהנדסים מנוסה ומקצועי
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-wdi-secondary mt-0.5" aria-hidden="true">&#10003;</span>
                      ליווי מקצה לקצה — מתכנון ועד מסירה
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-wdi-secondary mt-0.5" aria-hidden="true">&#10003;</span>
                      גישה בוטיקית ויחס אישי לכל לקוח
                    </li>
                  </ul>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </>
  );
}
