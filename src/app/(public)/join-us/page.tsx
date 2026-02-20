/**
 * Supplier registration page — /join-us
 * Server component that renders the client-side SupplierForm.
 */
import type { Metadata } from 'next';
import { SupplierForm } from '@/components/public/SupplierForm';

export const metadata: Metadata = {
  title: 'הצטרפות למאגר ספקים | WDI',
  description:
    'הצטרפו למאגר הספקים של WDI — חברת בוטיק לניהול פרויקטים, פיקוח וייעוץ הנדסי. אנו מחפשים ספקים ונותני שירותים מקצועיים.',
  alternates: { canonical: '/join-us' },
};

const BENEFITS = [
  {
    title: 'פרויקטים מגוונים',
    description: 'גישה לפרויקטים בסקטורים שונים — ביטחון, מסחר, תעשייה, תשתיות ועוד.',
  },
  {
    title: 'שותפות ארוכת טווח',
    description: 'אנו מאמינים ביצירת קשרי עבודה יציבים ומתמשכים עם הספקים שלנו.',
  },
  {
    title: 'תשלום הוגן ובזמן',
    description: 'מחויבים לתנאי תשלום הוגנים ועמידה בזמני התשלום המוסכמים.',
  },
  {
    title: 'סטנדרטים גבוהים',
    description: 'עבודה עם חברה שמקפידה על איכות, בטיחות ומקצועיות בכל פרויקט.',
  },
];

const SPECIALTIES = [
  'עבודות שלד ובנייה',
  'מערכות חשמל',
  'מערכות אינסטלציה וביוב',
  'מערכות מיזוג אוויר',
  'עבודות גמר ואלומיניום',
  'עבודות פיתוח ותשתיות',
  'מערכות כיבוי אש',
  'מערכות אבטחה ותקשורת',
  'עבודות עפר וחפירה',
  'ציוד מכני הנדסי',
  'ייעוץ וליווי מקצועי',
  'שירותים נוספים',
];

export default function JoinUsPage() {
  return (
    <section className="py-16 lg:py-24" dir="rtl">
      <div className="max-w-container mx-auto px-4 lg:px-8">
        {/* Page heading */}
        <header className="mb-12 text-center">
          <h1 className="text-4xl lg:text-5xl font-bold text-wdi-primary mb-4">
            הצטרפות למאגר ספקים
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            WDI מחפשת ספקים ונותני שירותים מקצועיים בתחומי הבנייה והתשתיות.
            מלאו את הטופס וניצור קשר לבחינת שיתוף פעולה.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-16">
          {/* Form — right side (RTL) */}
          <div className="lg:col-span-3">
            <div className="rounded-2xl bg-white border border-gray-200 shadow-wdi-sm p-6 sm:p-8">
              <h2 className="text-2xl font-bold text-wdi-primary mb-6">
                פרטי הספק
              </h2>
              <SupplierForm />
            </div>
          </div>

          {/* Side info */}
          <aside className="lg:col-span-2">
            <div className="space-y-8">
              {/* Benefits */}
              <div className="rounded-2xl bg-wdi-primary text-white p-6">
                <h2 className="text-xl font-bold mb-5">למה לעבוד איתנו?</h2>
                <ul className="space-y-4">
                  {BENEFITS.map((benefit) => (
                    <li key={benefit.title} className="flex items-start gap-3">
                      <span className="text-wdi-secondary mt-0.5 flex-shrink-0" aria-hidden="true">
                        &#10003;
                      </span>
                      <div>
                        <p className="font-medium">{benefit.title}</p>
                        <p className="text-white/70 text-sm">{benefit.description}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Specialties we look for */}
              <div className="rounded-2xl bg-gray-50 border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-wdi-primary mb-5">
                  תחומים מבוקשים
                </h2>
                <ul className="grid grid-cols-1 gap-2">
                  {SPECIALTIES.map((specialty) => (
                    <li key={specialty} className="flex items-center gap-2 text-sm text-gray-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-wdi-secondary flex-shrink-0" aria-hidden="true" />
                      {specialty}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Requirements */}
              <div className="rounded-2xl bg-gray-50 border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-wdi-primary mb-5">
                  דרישות בסיסיות
                </h2>
                <ul className="space-y-3 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-wdi-primary mt-0.5 flex-shrink-0" aria-hidden="true">&#8226;</span>
                    רישום כחוק כעסק / חברה בישראל
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-wdi-primary mt-0.5 flex-shrink-0" aria-hidden="true">&#8226;</span>
                    ביטוחים מתאימים ותקפים
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-wdi-primary mt-0.5 flex-shrink-0" aria-hidden="true">&#8226;</span>
                    ניסיון מוכח בתחום ההתמחות
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-wdi-primary mt-0.5 flex-shrink-0" aria-hidden="true">&#8226;</span>
                    עמידה בתקני בטיחות ואיכות
                  </li>
                </ul>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
