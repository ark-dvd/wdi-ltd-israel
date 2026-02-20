/**
 * Job application page — /job-application
 * Server component that renders the client-side JobApplicationForm.
 */
import type { Metadata } from 'next';
import Link from 'next/link';
import { JobApplicationForm } from '@/components/public/JobApplicationForm';

export const metadata: Metadata = {
  title: 'הגשת מועמדות | WDI',
  description:
    'הגישו מועמדות למשרה ב-WDI — חברת בוטיק מובילה לניהול פרויקטים, פיקוח וייעוץ הנדסי בישראל.',
  alternates: { canonical: '/job-application' },
};

export default function JobApplicationPage() {
  return (
    <section className="py-16 lg:py-24" dir="rtl">
      <div className="max-w-container mx-auto px-4 lg:px-8">
        {/* Page heading */}
        <header className="mb-12 text-center">
          <h1 className="text-4xl lg:text-5xl font-bold text-wdi-primary mb-4">
            הגשת מועמדות
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            רוצים להצטרף לצוות WDI? מלאו את הטופס ונחזור אליכם בהקדם.
            תוכלו גם לעיין ב<Link href="/jobs" className="text-wdi-primary font-medium hover:text-wdi-primary-light transition underline">משרות הפתוחות</Link> שלנו.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-16">
          {/* Form — right side (RTL) */}
          <div className="lg:col-span-3">
            <div className="rounded-2xl bg-white border border-gray-200 shadow-wdi-sm p-6 sm:p-8">
              <h2 className="text-2xl font-bold text-wdi-primary mb-6">
                פרטי המועמדות
              </h2>
              <JobApplicationForm />
            </div>
          </div>

          {/* Side info */}
          <aside className="lg:col-span-2">
            <div className="space-y-8">
              {/* Why WDI */}
              <div className="rounded-2xl bg-wdi-primary text-white p-6">
                <h2 className="text-xl font-bold mb-4">למה לעבוד ב-WDI?</h2>
                <ul className="space-y-3 text-sm text-white/85">
                  <li className="flex items-start gap-2">
                    <span className="text-wdi-secondary mt-0.5" aria-hidden="true">&#10003;</span>
                    פרויקטים מאתגרים ומגוונים בכל הסקטורים
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-wdi-secondary mt-0.5" aria-hidden="true">&#10003;</span>
                    סביבת עבודה בוטיקית ומקצועית
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-wdi-secondary mt-0.5" aria-hidden="true">&#10003;</span>
                    אפשרויות צמיחה והתפתחות מקצועית
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-wdi-secondary mt-0.5" aria-hidden="true">&#10003;</span>
                    שימוש בטכנולוגיות מתקדמות (BIM, דיגיטל)
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-wdi-secondary mt-0.5" aria-hidden="true">&#10003;</span>
                    צוות מקצועי ותומך
                  </li>
                </ul>
              </div>

              {/* Process */}
              <div className="rounded-2xl bg-gray-50 border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-wdi-primary mb-5">
                  תהליך הגיוס
                </h2>
                <ol className="space-y-4">
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-wdi-primary text-white text-sm font-bold flex items-center justify-center">
                      1
                    </span>
                    <div>
                      <p className="font-medium text-gray-800">שליחת מועמדות</p>
                      <p className="text-sm text-gray-500">מילוי הטופס וצירוף קורות חיים</p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-wdi-primary text-white text-sm font-bold flex items-center justify-center">
                      2
                    </span>
                    <div>
                      <p className="font-medium text-gray-800">סינון ראשוני</p>
                      <p className="text-sm text-gray-500">בחינת ההתאמה לדרישות התפקיד</p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-wdi-primary text-white text-sm font-bold flex items-center justify-center">
                      3
                    </span>
                    <div>
                      <p className="font-medium text-gray-800">ראיון אישי</p>
                      <p className="text-sm text-gray-500">פגישת היכרות עם הצוות</p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-wdi-primary text-white text-sm font-bold flex items-center justify-center">
                      4
                    </span>
                    <div>
                      <p className="font-medium text-gray-800">קבלה לצוות</p>
                      <p className="text-sm text-gray-500">הצטרפות למשפחת WDI</p>
                    </div>
                  </li>
                </ol>
              </div>

              {/* Open positions link */}
              <div className="rounded-2xl bg-gray-50 border border-gray-200 p-6 text-center">
                <p className="text-gray-600 mb-4">
                  מחפשים משרה ספציפית?
                </p>
                <Link
                  href="/jobs"
                  className="inline-block rounded-lg bg-wdi-primary px-6 py-3 text-sm font-semibold text-white hover:bg-wdi-primary-light transition"
                >
                  צפייה במשרות הפתוחות
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
