/**
 * About page — /about
 * Server component: company story, facts, sectors, values, CTA.
 * Fetches CMS data from aboutPage singleton; falls back to hardcoded Hebrew content.
 */
import type { Metadata } from 'next';
import Link from 'next/link';
import { getAboutPage } from '@/lib/data-fetchers';
import { PortableText } from '@/components/public/PortableText';

export const metadata: Metadata = {
  title: 'אודות | WDI',
  description:
    'WDI היא חברת בוטיק לניהול פרויקטים, פיקוח וייעוץ הנדסי שנוסדה ב-2013. מובילים בתחומי הביטחון, המסחר, התעשייה, התשתיות, המגורים והציבור.',
  alternates: { canonical: '/about' },
};

const SECTORS = [
  {
    key: 'security',
    label: 'בטחוני',
    description: 'פרויקטים ביטחוניים ומתקנים מסווגים הדורשים רמת אבטחה ובקרה גבוהה במיוחד.',
  },
  {
    key: 'commercial',
    label: 'מסחרי',
    description: 'מרכזי מסחר, משרדים ומבני מסחר מודרניים בסטנדרטים בינלאומיים.',
  },
  {
    key: 'industrial',
    label: 'תעשייה',
    description: 'מפעלים, מחסנים לוגיסטיים ומתקני ייצור מתקדמים.',
  },
  {
    key: 'infrastructure',
    label: 'תשתיות',
    description: 'פרויקטי תשתית לאומיים — כבישים, מנהרות, מערכות מים וביוב.',
  },
  {
    key: 'residential',
    label: 'מגורים',
    description: 'מתחמי מגורים, פינוי-בינוי ופרויקטי תמ"א 38 ברמה הגבוהה ביותר.',
  },
  {
    key: 'public',
    label: 'ציבורי',
    description: 'מוסדות חינוך, בריאות ומבני ציבור לשרות הקהילה.',
  },
];

const FALLBACK_VALUES = [
  {
    title: 'מקצועיות',
    description: 'צוות מהנדסים בעלי ניסיון רב ומומחיות ייחודית בתחומי הבנייה והפיקוח.',
  },
  {
    title: 'יושרה',
    description: 'שקיפות מלאה מול הלקוח, עמידה בלוחות זמנים ובתקציב.',
  },
  {
    title: 'חדשנות',
    description: 'אימוץ טכנולוגיות מתקדמות, BIM ומערכות דיגיטליות לניהול פרויקטים.',
  },
  {
    title: 'גישה בוטיקית',
    description: 'יחס אישי לכל פרויקט, הקשבה לצרכי הלקוח והתאמת הפתרון הייחודי.',
  },
];

const FALLBACK_STATS = [
  { label: 'שנת הקמה', value: '2013' },
  { label: 'סוג חברה', value: 'בוטיק' },
  { label: 'סקטורים', value: '6' },
  { label: 'תחומי שירות', value: 'ניהול, פיקוח, ייעוץ' },
];

export default async function AboutPage() {
  const data = await getAboutPage();

  const stats = data?.stats?.length ? data.stats : FALLBACK_STATS;
  const values = data?.values?.length ? data.values : FALLBACK_VALUES;
  const hasStoryContent = data?.storyContent && Array.isArray(data.storyContent) && data.storyContent.length > 0;
  const vision = data?.vision;

  return (
    <article dir="rtl">
      {/* Hero section */}
      <section className="py-16 lg:py-24 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-container mx-auto px-4 lg:px-8">
          <header className="max-w-3xl">
            <h1 className="text-4xl lg:text-5xl font-bold text-wdi-primary mb-6">
              אודות WDI
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              {vision ||
                'WDI היא חברת בוטיק מובילה בישראל בתחומי ניהול פרויקטי בנייה, פיקוח הנדסי וייעוץ. מאז הקמתה ב-2013, החברה מציעה שירותים ייחודיים ומקצועיים ללקוחות ממגוון מגזרים — מפרויקטים ביטחוניים ועד מתחמי מגורים יוקרתיים.'}
            </p>
          </header>
        </div>
      </section>

      {/* Company story */}
      <section className="py-16 lg:py-20">
        <div className="max-w-container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div>
              <h2 className="text-3xl font-bold text-wdi-primary mb-6">הסיפור שלנו</h2>
              {hasStoryContent ? (
                <div className="space-y-4 text-gray-600 leading-relaxed">
                  <PortableText value={data.storyContent} />
                </div>
              ) : (
                <div className="space-y-4 text-gray-600 leading-relaxed">
                  <p>
                    WDI נוסדה מתוך חזון ברור: לשנות את הדרך שבה מנוהלים פרויקטי בנייה בישראל.
                    מייסדי החברה, מהנדסים בעלי ניסיון של עשרות שנים בתעשיית הבנייה, זיהו את
                    הצורך בגישה בוטיקית ומקצועית שמעמידה את הלקוח במרכז.
                  </p>
                  <p>
                    לאורך למעלה מעשור של פעילות, WDI צברה מוניטין של מצוינות מקצועית ואמינות.
                    החברה ניהלה בהצלחה עשרות פרויקטים מורכבים בסקטורים מגוונים — ביטחון, מסחר,
                    תעשייה, תשתיות, מגורים ומבני ציבור.
                  </p>
                  <p>
                    הגישה הייחודית שלנו משלבת מקצוענות הנדסית עם טכנולוגיות חדשניות,
                    ומאפשרת לנו לספק ללקוחות שירות ברמה הגבוהה ביותר — מהתכנון הראשוני
                    ועד מסירת המפתח.
                  </p>
                </div>
              )}
            </div>
            <div className="bg-gray-50 rounded-2xl p-8 lg:p-10">
              <h3 className="text-xl font-bold text-wdi-primary mb-6">עובדות ונתונים</h3>
              <dl className="grid grid-cols-2 gap-6">
                {stats.map((stat: { label: string; value: string }, i: number) => (
                  <div key={stat.label || i}>
                    <dt className="text-sm text-gray-500 mb-1">{stat.label}</dt>
                    <dd className="text-lg font-bold text-wdi-primary leading-tight">
                      {stat.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>
      </section>

      {/* Core services summary */}
      <section className="py-16 lg:py-20 bg-gray-50">
        <div className="max-w-container mx-auto px-4 lg:px-8">
          <h2 className="text-3xl font-bold text-wdi-primary mb-4 text-center">
            תחומי הפעילות
          </h2>
          <p className="text-gray-600 text-center max-w-2xl mx-auto mb-12">
            WDI מציעה מגוון שירותים מקצועיים המכסים את כל שלבי חיי הפרויקט.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-wdi-sm text-center">
              <div className="w-14 h-14 rounded-full bg-wdi-primary/10 flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-wdi-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-wdi-primary mb-3">ניהול פרויקטים</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                ניהול מקצה לקצה של פרויקטי בנייה מורכבים — תכנון, תיאום, בקרת לוחות זמנים ותקציב.
              </p>
            </div>
            <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-wdi-sm text-center">
              <div className="w-14 h-14 rounded-full bg-wdi-primary/10 flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-wdi-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-wdi-primary mb-3">פיקוח הנדסי</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                פיקוח צמוד על ביצוע עבודות הבנייה, הבטחת איכות ועמידה בתקנים ודרישות התכנון.
              </p>
            </div>
            <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-wdi-sm text-center">
              <div className="w-14 h-14 rounded-full bg-wdi-primary/10 flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-wdi-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-wdi-primary mb-3">ייעוץ הנדסי</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                ייעוץ מקצועי בשלבי התכנון וההיתרים, ניתוח כלכלי וליווי טכני לאורך כל הדרך.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Sectors */}
      <section className="py-16 lg:py-20">
        <div className="max-w-container mx-auto px-4 lg:px-8">
          <h2 className="text-3xl font-bold text-wdi-primary mb-4 text-center">
            סקטורים
          </h2>
          <p className="text-gray-600 text-center max-w-2xl mx-auto mb-12">
            פעילות ענפה במגוון מגזרים — מפרויקטים ביטחוניים רגישים ועד מתחמי מגורים ומבני ציבור.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {SECTORS.map((sector) => (
              <div
                key={sector.key}
                className="group rounded-2xl border border-gray-200 bg-white p-6 hover:border-wdi-primary/30 hover:shadow-wdi-md transition-all duration-300"
              >
                <h3 className="text-lg font-bold text-wdi-primary mb-2 group-hover:text-wdi-primary-light transition">
                  {sector.label}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {sector.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 lg:py-20 bg-wdi-primary text-white">
        <div className="max-w-container mx-auto px-4 lg:px-8">
          <h2 className="text-3xl font-bold mb-4 text-center">הערכים שלנו</h2>
          <p className="text-white/70 text-center max-w-2xl mx-auto mb-12">
            העקרונות שמנחים אותנו בכל פרויקט ובכל אינטראקציה עם הלקוחות שלנו.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value: { title: string; description?: string }, i: number) => (
              <div key={value.title || i} className="text-center">
                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-4">
                  <span className="text-wdi-secondary text-xl font-bold" aria-hidden="true">
                    &#10003;
                  </span>
                </div>
                <h3 className="text-lg font-bold mb-2">{value.title}</h3>
                <p className="text-white/70 text-sm leading-relaxed">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Methodology */}
      <section className="py-16 lg:py-20">
        <div className="max-w-container mx-auto px-4 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-wdi-primary mb-6">המתודולוגיה שלנו</h2>
            <p className="text-gray-600 leading-relaxed mb-8">
              WDI פועלת בגישה שיטתית וסדורה שהוכיחה את עצמה לאורך שנים. אנו מאמינים בשילוב
              של תכנון קפדני, תקשורת שוטפת עם כל בעלי העניין, ושימוש בכלים טכנולוגיים מתקדמים.
              כל פרויקט מנוהל על ידי צוות ייעודי שמלווה את הלקוח מרגע התכנון הראשוני ועד למסירת
              המפתח — עם שקיפות מלאה, עמידה בלוחות זמנים ושמירה קפדנית על התקציב.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 lg:py-20 bg-gray-50">
        <div className="max-w-container mx-auto px-4 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-wdi-primary mb-4">
            רוצים לשמוע עוד?
          </h2>
          <p className="text-gray-600 max-w-xl mx-auto mb-8">
            נשמח ללוות אתכם בפרויקט הבא. צרו איתנו קשר ונתאם פגישת היכרות.
          </p>
          <Link
            href="/contact"
            className="inline-block rounded-lg bg-wdi-primary px-8 py-3.5 text-base font-semibold text-white hover:bg-wdi-primary-light transition"
          >
            צור קשר
          </Link>
        </div>
      </section>
    </article>
  );
}
