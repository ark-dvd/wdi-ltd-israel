/**
 * Privacy Policy page — /privacy
 * Server component with standard Hebrew privacy policy.
 */
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'מדיניות פרטיות',
  description: 'מדיניות הפרטיות של WDI',
  alternates: { canonical: '/privacy' },
};

export default function PrivacyPage() {
  return (
    <section className="py-16 lg:py-24">
      <div className="max-w-container mx-auto px-4 lg:px-8">
        <h1 className="text-4xl lg:text-5xl font-bold text-wdi-primary mb-12 text-center">
          מדיניות פרטיות
        </h1>

        <article className="prose prose-lg max-w-3xl mx-auto text-gray-700 leading-relaxed">
          {/* ── הקדמה ──────────────────────────────────────── */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-wdi-primary mb-4">הקדמה</h2>
            <p>
              WDI Ltd Israel (להלן: &quot;החברה&quot;, &quot;אנחנו&quot; או
              &quot;WDI&quot;) מכבדת את פרטיותם של המשתמשים באתר האינטרנט שלה
              (להלן: &quot;האתר&quot;). מדיניות פרטיות זו מפרטת כיצד אנו
              אוספים, משתמשים, מאחסנים ומגנים על מידע אישי הנמסר לנו באמצעות
              האתר. אנו ממליצים לקרוא מדיניות זו בעיון.
            </p>
          </section>

          {/* ── מידע שאנו אוספים ──────────────────────────── */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-wdi-primary mb-4">מידע שאנו אוספים</h2>
            <p>אנו עשויים לאסוף את סוגי המידע הבאים:</p>
            <ul className="list-disc list-inside mt-3 space-y-2">
              <li>
                <strong>מידע שנמסר באופן יזום:</strong> שם מלא, כתובת דוא&quot;ל,
                מספר טלפון, שם חברה ותוכן הפנייה — כאשר ממלאים טופס יצירת קשר,
                מגישים מועמדות לקריירה או פונים אלינו בכל דרך אחרת.
              </li>
              <li>
                <strong>מידע טכני:</strong> כתובת IP, סוג דפדפן, מערכת הפעלה,
                דפי הכניסה והיציאה, זמני גישה ומידע אנליטי — הנאסף באופן
                אוטומטי בעת הגלישה באתר.
              </li>
              <li>
                <strong>עוגיות (Cookies):</strong> קבצי מידע קטנים הנשמרים
                במכשיר המשתמש לצרכי תפעול האתר ושיפור חוויית הגלישה.
              </li>
            </ul>
          </section>

          {/* ── שימוש במידע ────────────────────────────────── */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-wdi-primary mb-4">שימוש במידע</h2>
            <p>המידע שנאסף משמש אותנו למטרות הבאות:</p>
            <ul className="list-disc list-inside mt-3 space-y-2">
              <li>מענה לפניות ובקשות של משתמשים</li>
              <li>שיפור תכני האתר וחוויית המשתמש</li>
              <li>ניתוח סטטיסטי של דפוסי גלישה (ללא זיהוי אישי)</li>
              <li>שליחת עדכונים ומידע מקצועי, בכפוף להסכמת המשתמש</li>
              <li>עמידה בדרישות חוקיות ורגולטוריות</li>
            </ul>
          </section>

          {/* ── שיתוף מידע עם צדדים שלישיים ───────────────── */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-wdi-primary mb-4">
              שיתוף מידע עם צדדים שלישיים
            </h2>
            <p>
              אנו לא מוכרים, סוחרים או מעבירים מידע אישי לצדדים שלישיים, למעט
              במקרים הבאים:
            </p>
            <ul className="list-disc list-inside mt-3 space-y-2">
              <li>
                <strong>ספקי שירות:</strong> שיתוף מידע עם ספקי שירות הפועלים
                מטעמנו (כגון שירותי אחסון, אנליטיקה ודוא&quot;ל), בכפוף
                להתחייבותם לשמירה על סודיות המידע.
              </li>
              <li>
                <strong>דרישה חוקית:</strong> כאשר חלה עלינו חובה חוקית לחשוף
                מידע, לרבות צווי בית משפט או דרישות של רשויות מוסמכות.
              </li>
              <li>
                <strong>הגנה על זכויות:</strong> כאשר השיתוף נדרש להגנה על
                זכויותינו, רכושנו או בטחון המשתמשים שלנו.
              </li>
            </ul>
          </section>

          {/* ── עוגיות ────────────────────────────────────── */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-wdi-primary mb-4">עוגיות (Cookies)</h2>
            <p>
              האתר משתמש בעוגיות לצרכי תפעול, אנליטיקה ושיפור חוויית המשתמש.
              העוגיות עשויות לכלול:
            </p>
            <ul className="list-disc list-inside mt-3 space-y-2">
              <li>
                <strong>עוגיות הכרחיות:</strong> נדרשות להפעלה תקינה של האתר.
              </li>
              <li>
                <strong>עוגיות אנליטיות:</strong> מסייעות לנו להבין כיצד
                מבקרים משתמשים באתר ולשפר את חוויית הגלישה.
              </li>
            </ul>
            <p className="mt-3">
              ניתן לנהל את הגדרות העוגיות בדפדפן שלכם. שימו לב כי חסימת
              עוגיות מסוימות עשויה לפגוע בתפקוד האתר.
            </p>
          </section>

          {/* ── אבטחת מידע ────────────────────────────────── */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-wdi-primary mb-4">אבטחת מידע</h2>
            <p>
              אנו נוקטים באמצעי אבטחה סבירים ומקובלים כדי להגן על המידע האישי
              מפני גישה בלתי מורשית, שימוש לרעה, שינוי או אובדן. עם זאת, אין
              שיטת העברה או אחסון באינטרנט שהיא מאובטחת ב-100%, ולכן איננו
              יכולים להבטיח אבטחה מוחלטת.
            </p>
          </section>

          {/* ── זכויות המשתמש ─────────────────────────────── */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-wdi-primary mb-4">זכויות המשתמש</h2>
            <p>בהתאם לחוק הגנת הפרטיות, התשמ&quot;א-1981, עומדות לכם הזכויות הבאות:</p>
            <ul className="list-disc list-inside mt-3 space-y-2">
              <li>זכות עיון במידע האישי המוחזק אודותיכם</li>
              <li>זכות לתיקון מידע שגוי או לא מדויק</li>
              <li>זכות לבקש מחיקת מידע אישי</li>
              <li>זכות להתנגד לשימוש במידע לצרכי דיוור ישיר</li>
            </ul>
            <p className="mt-3">
              למימוש זכויותיכם, ניתן לפנות אלינו בפרטי הקשר המופיעים להלן.
            </p>
          </section>

          {/* ── יצירת קשר ─────────────────────────────────── */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-wdi-primary mb-4">יצירת קשר</h2>
            <p>
              לכל שאלה, בקשה או תלונה בנוגע למדיניות הפרטיות או לטיפול במידע
              האישי שלכם, ניתן לפנות אלינו:
            </p>
            <ul className="list-none mt-3 space-y-1">
              <li>
                דוא&quot;ל:{' '}
                <a
                  href="mailto:info@wdi-israel.co.il"
                  className="text-wdi-primary font-semibold hover:underline"
                  dir="ltr"
                >
                  info@wdi-israel.co.il
                </a>
              </li>
              <li>
                באמצעות דף{' '}
                <a href="/contact" className="text-wdi-primary font-semibold hover:underline">
                  יצירת הקשר
                </a>{' '}
                באתר
              </li>
            </ul>
          </section>

          <p className="text-sm text-gray-400 mt-12">
            עדכון אחרון: פברואר 2026
          </p>
        </article>
      </div>
    </section>
  );
}
