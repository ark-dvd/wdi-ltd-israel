/**
 * Terms of Use page — /terms
 * Server component with standard Hebrew terms of use.
 */
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'תנאי שימוש',
  description: 'תנאי שימוש באתר WDI',
  alternates: { canonical: '/terms' },
};

export default function TermsPage() {
  return (
    <section className="py-16 lg:py-24">
      <div className="max-w-container mx-auto px-4 lg:px-8">
        <h1 className="text-4xl lg:text-5xl font-bold text-wdi-primary mb-12 text-center">
          תנאי שימוש
        </h1>

        <article className="prose prose-lg max-w-3xl mx-auto text-[#343a40] leading-relaxed">
          {/* ── הקדמה ──────────────────────────────────────── */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-wdi-primary mb-4">הקדמה</h2>
            <p>
              ברוכים הבאים לאתר האינטרנט של WDI Ltd Israel (להלן: &quot;החברה&quot;,
              &quot;אנחנו&quot; או &quot;WDI&quot;). השימוש באתר זה (להלן:
              &quot;האתר&quot;) כפוף לתנאי השימוש המפורטים להלן. הגלישה באתר
              ו/או השימוש בו מהווים הסכמה מצדכם לתנאים אלו. אם אינכם מסכימים
              לתנאי השימוש, אנא הימנעו משימוש באתר.
            </p>
          </section>

          {/* ── שימוש באתר ─────────────────────────────────── */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-wdi-primary mb-4">שימוש באתר</h2>
            <p>
              האתר מספק מידע אודות שירותי החברה, פרויקטים, צוות המומחים ותחומי
              הפעילות של WDI. השימוש באתר מיועד למטרות מידע בלבד ואינו מהווה
              ייעוץ מקצועי מכל סוג שהוא.
            </p>
            <p className="mt-3">
              המשתמש מתחייב להשתמש באתר בהתאם לכל דין ולהימנע מכל שימוש שעלול
              לפגוע באתר, בתכניו, בחברה או בצדדים שלישיים. אין להשתמש באתר
              לצרכים בלתי חוקיים או בלתי מורשים.
            </p>
          </section>

          {/* ── קניין רוחני ────────────────────────────────── */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-wdi-primary mb-4">קניין רוחני</h2>
            <p>
              כל התכנים המופיעים באתר, לרבות טקסטים, תמונות, גרפיקה, עיצוב,
              סימני מסחר, לוגואים וכל חומר אחר, הם רכושה הבלעדי של WDI או של
              צדדים שלישיים שהעניקו לחברה רישיון שימוש, ומוגנים על ידי חוקי
              קניין רוחני בישראל ובעולם.
            </p>
            <p className="mt-3">
              אין להעתיק, לשכפל, להפיץ, לפרסם, להציג בפומבי, לבצע בפומבי,
              להעביר לצד שלישי או לעשות כל שימוש מסחרי או אחר בתכני האתר, כולם
              או חלקם, ללא קבלת הסכמה מראש ובכתב מאת החברה.
            </p>
          </section>

          {/* ── הגבלת אחריות ──────────────────────────────── */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-wdi-primary mb-4">הגבלת אחריות</h2>
            <p>
              המידע באתר מוגש כפי שהוא (&quot;AS IS&quot;). החברה עושה מאמצים
              סבירים לוודא שהמידע המוצג באתר מדויק ועדכני, אולם אינה מתחייבת
              לכך ואינה נושאת באחריות לשגיאות, אי-דיוקים או השמטות בתכני האתר.
            </p>
            <p className="mt-3">
              החברה לא תישא באחריות לכל נזק ישיר, עקיף, תוצאתי או מיוחד
              הנובע מהשימוש באתר או מהסתמכות על המידע המופיע בו. האתר עשוי
              לכלול קישורים לאתרים חיצוניים — החברה אינה אחראית לתוכנם,
              למדיניות הפרטיות שלהם או לכל היבט אחר הקשור בהם.
            </p>
          </section>

          {/* ── שינויים בתנאים ────────────────────────────── */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-wdi-primary mb-4">שינויים בתנאים</h2>
            <p>
              החברה שומרת לעצמה את הזכות לעדכן ולשנות תנאי שימוש אלו בכל עת,
              לפי שיקול דעתה הבלעדי וללא הודעה מוקדמת. המשך השימוש באתר לאחר
              עדכון התנאים מהווה הסכמה לתנאים המעודכנים. מומלץ לעיין בתנאי
              השימוש מעת לעת.
            </p>
          </section>

          {/* ── יצירת קשר ─────────────────────────────────── */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-wdi-primary mb-4">יצירת קשר</h2>
            <p>
              לכל שאלה, הבהרה או בקשה בנוגע לתנאי השימוש, ניתן לפנות אלינו
              באמצעות דף{' '}
              <a href="/contact" className="text-wdi-primary font-semibold hover:underline">
                יצירת הקשר
              </a>{' '}
              באתר או באמצעות דוא&quot;ל לכתובת:{' '}
              <a
                href="mailto:info@wdi-israel.co.il"
                className="text-wdi-primary font-semibold hover:underline"
                dir="ltr"
              >
                info@wdi-israel.co.il
              </a>
            </p>
          </section>

          <p className="text-sm text-[#adb5bd] mt-12">
            עדכון אחרון: פברואר 2026
          </p>
        </article>
      </div>
    </section>
  );
}
