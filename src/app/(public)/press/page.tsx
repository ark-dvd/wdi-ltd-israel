/**
 * Press page — media coverage and articles about WDI. Server Component. DOC-060 §6.6
 */
import type { Metadata } from 'next';
import Image from 'next/image';
import { getActivePressItems } from '@/lib/data-fetchers';
import { sanityImageUrl } from '@/lib/sanity/image';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'כתבו עלינו',
  description:
    'WDI בתקשורת — כתבות, ראיונות וסיקורים תקשורתיים על פרויקטים, חדשנות וניהול הנדסי מוביל בישראל.',
  alternates: { canonical: '/press' },
};

function formatHebrewDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString('he-IL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

export default async function PressPage() {
  const pressItems = await getActivePressItems();

  return (
    <>
      {/* Hero */}
      <section className="bg-wdi-primary text-white py-16 lg:py-24">
        <div className="max-w-container mx-auto px-4 lg:px-8 text-center">
          <h1 className="text-4xl lg:text-5xl font-bold mb-4">כתבו עלינו</h1>
          <p className="text-lg lg:text-xl text-white/80 max-w-2xl mx-auto">
            סיקורים תקשורתיים, כתבות וראיונות על הפרויקטים והפעילות שלנו
          </p>
        </div>
      </section>

      {/* Press listing */}
      <section className="py-16 lg:py-24 bg-gray-50">
        <div className="max-w-container mx-auto px-4 lg:px-8">
          {pressItems.length > 0 ? (
            <ul className="space-y-8">
              {pressItems.map((item: any) => {
                const imgSrc = sanityImageUrl(item.image);

                return (
                  <li key={item._id}>
                    <article className="bg-white rounded-xl shadow-wdi-md overflow-hidden hover:shadow-wdi-lg transition-shadow">
                      <div className="flex flex-col md:flex-row">
                        {/* Thumbnail */}
                        {imgSrc && (
                          <div className="relative w-full md:w-64 lg:w-80 aspect-video md:aspect-auto shrink-0">
                            <Image
                              src={imgSrc}
                              alt={item.title}
                              fill
                              sizes="(max-width: 768px) 100vw, 320px"
                              className="object-cover"
                            />
                          </div>
                        )}

                        {/* Content */}
                        <div className="p-6 lg:p-8 flex flex-col flex-1">
                          {/* Meta row */}
                          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 mb-3">
                            {item.source && (
                              <span className="bg-wdi-primary/10 text-wdi-primary px-3 py-1 rounded-full font-medium">
                                {item.source}
                              </span>
                            )}
                            {item.publishDate && (
                              <time dateTime={item.publishDate}>
                                {formatHebrewDate(item.publishDate)}
                              </time>
                            )}
                          </div>

                          <h2 className="text-xl lg:text-2xl font-bold text-wdi-primary mb-3">
                            {item.title}
                          </h2>

                          {item.excerpt && (
                            <p className="text-gray-600 leading-relaxed mb-4 flex-1 line-clamp-3">
                              {item.excerpt}
                            </p>
                          )}

                          {item.externalUrl && (
                            <a
                              href={item.externalUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 text-wdi-primary hover:text-wdi-primary-light font-medium transition-colors self-start"
                            >
                              לקריאת הכתבה המלאה
                              <svg
                                className="w-4 h-4 rtl:rotate-180"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                aria-hidden="true"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                />
                              </svg>
                            </a>
                          )}
                        </div>
                      </div>
                    </article>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="text-center py-16">
              <p className="text-gray-500 text-lg">
                תוכן תקשורתי יתעדכן בקרוב.
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
