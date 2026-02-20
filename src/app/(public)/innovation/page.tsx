/**
 * Innovation page — /innovation
 * Server component: presentational content about WDI's innovative approach.
 * Fetches CMS data from innovationPage singleton; falls back to hardcoded Hebrew content.
 */
import type { Metadata } from 'next';
import Link from 'next/link';
import { getInnovationPage } from '@/lib/data-fetchers';

export const metadata: Metadata = {
  title: 'חדשנות וטכנולוגיה | WDI',
  description:
    'WDI מאמצת טכנולוגיות מתקדמות בתחום ניהול פרויקטי בנייה — BIM, ניהול דיגיטלי, קיימות ובנייה חכמה.',
};

const FALLBACK_SECTIONS = [
  {
    id: 'bim',
    title: 'טכנולוגיית BIM',
    subtitle: 'Building Information Modeling',
    description:
      'WDI מיישמת את טכנולוגיית BIM (מודל מידע בניין) ככלי מרכזי בניהול פרויקטים. מודלים תלת-ממדיים מאפשרים לנו לזהות בעיות תכנון עוד לפני תחילת הבנייה, לתאם בין מערכות שונות ולחסוך זמן ומשאבים.',
    features: [
      'מודלים תלת-ממדיים מדויקים לתיאום בין-תחומי',
      'זיהוי התנגשויות בין מערכות טרם ביצוע',
      'סימולציות בנייה לתכנון לוגיסטי מדויק',
      'ניהול כמויות ועלויות ישירות מהמודל',
      'תיעוד דיגיטלי מלא לאורך חיי הפרויקט',
    ],
  },
  {
    id: 'digital',
    title: 'ניהול פרויקטים דיגיטלי',
    subtitle: 'Digital Project Management',
    description:
      'אנו מפעילים מערכות דיגיטליות מתקדמות לניהול פרויקטים, המאפשרות שקיפות מלאה לכל בעלי העניין. דוחות בזמן אמת, מעקב אחר התקדמות ומערכות התראה חכמות מבטיחים שליטה מלאה בפרויקט.',
    features: [
      'דשבורדים בזמן אמת לכל בעלי העניין',
      'מערכות מעקב מתקדמות אחר לוחות זמנים',
      'ניהול מסמכים דיגיטלי ומרכזי',
      'דיווחים אוטומטיים ומעקב אחר ביצוע',
      'תקשורת משולבת בין צוותי פרויקט',
    ],
  },
  {
    id: 'sustainability',
    title: 'קיימות ובנייה ירוקה',
    subtitle: 'Sustainability & Green Building',
    description:
      'WDI מחויבת לקידום בנייה מקיימת ואחראית סביבתית. אנו מטמיעים עקרונות בנייה ירוקה בכל שלבי הפרויקט, מהתכנון ועד הביצוע, ועומדים בתקני LEED ותקן ישראלי 5281.',
    features: [
      'תכנון אנרגטי מתקדם לחיסכון במשאבים',
      'ליווי לקבלת תקני בנייה ירוקה (LEED, תקן 5281)',
      'שילוב חומרים מקיימים וידידותיים לסביבה',
      'ייעוץ לאנרגיה מתחדשת ומערכות חכמות',
      'ניהול פסולת בנייה בגישה מעגלית',
    ],
  },
  {
    id: 'smart',
    title: 'בנייה חכמה',
    subtitle: 'Smart Building',
    description:
      'אנו מלווים פרויקטים בהטמעת מערכות בנייה חכמה — מניהול אנרגיה ותאורה ועד מערכות אבטחה ובקרת אקלים. מבנים חכמים חוסכים בהוצאות תפעול ומשפרים את חווית המשתמש.',
    features: [
      'מערכות ניהול מבנה (BMS) מתקדמות',
      'אוטומציה של תאורה, אקלים ואנרגיה',
      'מערכות אבטחה ובקרת גישה משולבות',
      'חיישנים חכמים למעקב אחר ביצועי המבנה',
      'תשתיות IoT לניהול חכם של הנכס',
    ],
  },
];

const FALLBACK_HEADLINE = 'חדשנות וטכנולוגיה';
const FALLBACK_INTRODUCTION =
  'WDI מובילה את תעשיית ניהול הפרויקטים בישראל באימוץ טכנולוגיות חדשניות. אנו משלבים כלים דיגיטליים מתקדמים, מתודולוגיות BIM, עקרונות בנייה ירוקה ופתרונות בנייה חכמה — כדי לספק ללקוחותינו את התוצאות הטובות ביותר.';
const FALLBACK_VISION_TITLE = 'החזון שלנו';
const FALLBACK_VISION_TEXT =
  'אנו מאמינים שעתיד תעשיית הבנייה טמון בשילוב של טכנולוגיה, קיימות ומקצועיות. WDI פועלת ללא לאות כדי להיות בחזית החדשנות — ולהוביל את התעשייה לעבר סטנדרטים חדשים של יעילות, איכות ואחריות סביבתית.';

interface CmsSection {
  _key?: string;
  title: string;
  subtitle?: string;
  description?: string;
  features?: string[];
}

export default async function InnovationPage() {
  const data = await getInnovationPage();

  const headline = data?.headline || FALLBACK_HEADLINE;
  const introduction = data?.introduction || FALLBACK_INTRODUCTION;
  const sections: CmsSection[] = data?.sections?.length ? data.sections : FALLBACK_SECTIONS;
  const visionTitle = data?.visionTitle || FALLBACK_VISION_TITLE;
  const visionText = data?.visionText || FALLBACK_VISION_TEXT;

  return (
    <article dir="rtl">
      {/* Hero */}
      <section className="py-16 lg:py-24 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-container mx-auto px-4 lg:px-8">
          <header className="max-w-3xl">
            <h1 className="text-4xl lg:text-5xl font-bold text-wdi-primary mb-6">
              {headline}
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              {introduction}
            </p>
          </header>
        </div>
      </section>

      {/* Innovation sections */}
      {sections.map((section, index) => (
        <section
          key={section._key || index}
          className={`py-16 lg:py-20 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
        >
          <div className="max-w-container mx-auto px-4 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
              <div>
                {section.subtitle && (
                  <p className="text-sm font-medium text-wdi-secondary mb-2" dir="ltr">
                    {section.subtitle}
                  </p>
                )}
                <h2 className="text-3xl font-bold text-wdi-primary mb-4">
                  {section.title}
                </h2>
                {section.description && (
                  <p className="text-gray-600 leading-relaxed">
                    {section.description}
                  </p>
                )}
              </div>
              {section.features && section.features.length > 0 && (
                <div>
                  <ul className="space-y-3" role="list">
                    {section.features.map((feature, fIdx) => (
                      <li key={fIdx} className="flex items-start gap-3">
                        <span
                          className="flex-shrink-0 w-6 h-6 rounded-full bg-wdi-primary/10 flex items-center justify-center mt-0.5"
                          aria-hidden="true"
                        >
                          <svg className="w-3.5 h-3.5 text-wdi-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </span>
                        <span className="text-gray-700 leading-relaxed">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </section>
      ))}

      {/* Vision statement */}
      <section className="py-16 lg:py-20 bg-wdi-primary text-white">
        <div className="max-w-container mx-auto px-4 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6">{visionTitle}</h2>
          <p className="text-white/80 max-w-3xl mx-auto text-lg leading-relaxed mb-8">
            {visionText}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/services"
              className="inline-block rounded-lg bg-white text-wdi-primary px-8 py-3.5 text-base font-semibold hover:bg-gray-100 transition"
            >
              השירותים שלנו
            </Link>
            <Link
              href="/contact"
              className="inline-block rounded-lg border-2 border-white text-white px-8 py-3.5 text-base font-semibold hover:bg-white/10 transition"
            >
              צור קשר
            </Link>
          </div>
        </div>
      </section>
    </article>
  );
}
