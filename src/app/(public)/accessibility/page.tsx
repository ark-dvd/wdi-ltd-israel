/**
 * Accessibility Statement page — /accessibility
 * Server component with Israeli accessibility statement per regulations.
 */
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'הצהרת נגישות',
  description: 'הצהרת נגישות אתר WDI',
};

export default function AccessibilityPage() {
  return (
    <section className="py-16 lg:py-24">
      <div className="max-w-container mx-auto px-4 lg:px-8">
        <h1 className="text-4xl lg:text-5xl font-bold text-wdi-primary mb-12 text-center">
          הצהרת נגישות
        </h1>

        <article className="prose prose-lg max-w-3xl mx-auto text-gray-700 leading-relaxed">
          {/* ── מחויבות לנגישות ────────────────────────────── */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-wdi-primary mb-4">מחויבות לנגישות</h2>
            <p>
              WDI Ltd Israel (להלן: &quot;החברה&quot;) מחויבת להנגשת אתר
              האינטרנט שלה לכלל הציבור, לרבות אנשים עם מוגבלויות, בהתאם לחוק
              שוויון זכויות לאנשים עם מוגבלות, התשנ&quot;ח-1998, ולתקנות שוויון
              זכויות לאנשים עם מוגבלות (התאמות נגישות לשירות), התשע&quot;ג-2013.
            </p>
            <p className="mt-3">
              אנו רואים חשיבות רבה במתן חוויית גלישה שוויונית, נגישה ונוחה
              לכל משתמשי האתר, ללא קשר ליכולותיהם או לטכנולוגיה המסייעת בה הם
              משתמשים.
            </p>
          </section>

          {/* ── תקני נגישות ────────────────────────────────── */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-wdi-primary mb-4">תקני נגישות</h2>
            <p>
              האתר נבנה ומתוחזק בהתאם להנחיות הנגישות לתוכן אינטרנט WCAG 2.1
              ברמה AA (Web Content Accessibility Guidelines), התקן הבינלאומי
              המקובל להנגשת אתרי אינטרנט, כנדרש בתקנות הנגישות הישראליות
              (תקן ישראלי 5568).
            </p>
          </section>

          {/* ── פעולות שננקטו ─────────────────────────────── */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-wdi-primary mb-4">פעולות שננקטו</h2>
            <p>
              במסגרת מחויבותנו לנגישות, ננקטו הפעולות הבאות להנגשת האתר:
            </p>
            <ul className="list-disc list-inside mt-3 space-y-2">
              <li>שימוש בתגיות HTML סמנטיות לצורך מבנה תוכן ברור ונגיש</li>
              <li>תמיכה בניווט מלא באמצעות מקלדת בלבד</li>
              <li>
                טקסט חלופי (alt) לתמונות ותוכן גרפי, המתאר את תוכן התמונה
              </li>
              <li>ניגודיות צבעים מספקת בין טקסט לרקע בהתאם לתקן</li>
              <li>מבנה כותרות היררכי ותקין המאפשר ניווט באמצעות קורא מסך</li>
              <li>
                תמיכה בטכנולוגיות מסייעות כגון קוראי מסך (Screen Readers)
              </li>
              <li>קישור &quot;דלג לתוכן הראשי&quot; בראש כל עמוד</li>
              <li>טפסים עם תוויות (labels) ברורות והודעות שגיאה מובנות</li>
              <li>עיצוב רספונסיבי המותאם למגוון גדלי מסך ומכשירים</li>
              <li>תמיכה בשינוי גודל טקסט ללא פגיעה בפריסת האתר</li>
            </ul>
          </section>

          {/* ── דרכי פנייה ────────────────────────────────── */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-wdi-primary mb-4">
              דרכי פנייה בנושא נגישות
            </h2>
            <p>
              אם נתקלתם בבעיית נגישות באתר, או אם יש לכם הצעות לשיפור הנגישות,
              אנא פנו אלינו ונטפל בכך בהקדם:
            </p>
            <ul className="list-none mt-4 space-y-2 bg-gray-50 rounded-xl p-6">
              <li>
                <strong>רכז/ת נגישות:</strong> WDI Ltd Israel
              </li>
              <li>
                <strong>דוא&quot;ל:</strong>{' '}
                <a
                  href="mailto:info@wdi-israel.co.il"
                  className="text-wdi-primary font-semibold hover:underline"
                  dir="ltr"
                >
                  info@wdi-israel.co.il
                </a>
              </li>
              <li>
                <strong>טופס מקוון:</strong>{' '}
                <a href="/contact" className="text-wdi-primary font-semibold hover:underline">
                  דף יצירת קשר
                </a>
              </li>
            </ul>
            <p className="mt-4">
              אנו מתחייבים לטפל בכל פנייה בנושא נגישות תוך 14 ימי עסקים.
            </p>
          </section>

          {/* ── עדכון אחרון ───────────────────────────────── */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-wdi-primary mb-4">עדכון אחרון</h2>
            <p>
              הצהרת נגישות זו עודכנה לאחרונה בתאריך פברואר 2026. אנו בוחנים
              ומעדכנים את הנגשת האתר באופן שוטף ופועלים לשיפור מתמיד של רמת
              הנגישות.
            </p>
          </section>
        </article>
      </div>
    </section>
  );
}
