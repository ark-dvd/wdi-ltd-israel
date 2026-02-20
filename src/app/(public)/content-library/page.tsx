/**
 * Content Library page — downloadable resources and articles. Server Component. DOC-060 §6.8
 */
import type { Metadata } from 'next';
import Image from 'next/image';
import { getActiveContentLibraryItems } from '@/lib/data-fetchers';
import { sanityImageUrl } from '@/lib/sanity/image';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'מאגר מידע',
  description:
    'מאגר המידע המקצועי של WDI — מאמרים, מדריכים ומשאבים מקצועיים בתחום ניהול פרויקטי בנייה, פיקוח הנדסי ותשתיות.',
  alternates: { canonical: '/content-library' },
};

const CATEGORY_LABELS: Record<string, string> = {
  article: 'מאמר',
  guide: 'מדריך',
  whitepaper: 'נייר עמדה',
  presentation: 'מצגת',
  report: 'דוח',
  video: 'סרטון',
  template: 'תבנית',
};

function groupByCategory(items: any[]) {
  const groups: Record<string, any[]> = {};
  for (const item of items) {
    const cat = item.category ?? 'general';
    if (!groups[cat]) groups[cat] = [];
    groups[cat].push(item);
  }
  return groups;
}

export default async function ContentLibraryPage() {
  const items = await getActiveContentLibraryItems();
  const grouped = groupByCategory(items);
  const categories = Object.keys(grouped);
  const hasMultipleCategories = categories.length > 1;

  return (
    <>
      {/* Hero */}
      <section className="bg-wdi-primary text-white py-16 lg:py-24">
        <div className="max-w-container mx-auto px-4 lg:px-8 text-center">
          <h1 className="text-4xl lg:text-5xl font-bold mb-4">מאגר מידע</h1>
          <p className="text-lg lg:text-xl text-white/80 max-w-2xl mx-auto">
            משאבים מקצועיים, מדריכים ותכנים מעשירים מעולם ניהול הפרויקטים והבנייה
          </p>
        </div>
      </section>

      {/* Content listing */}
      <section className="py-16 lg:py-24 bg-gray-50">
        <div className="max-w-container mx-auto px-4 lg:px-8">
          {items.length > 0 ? (
            <>
              {hasMultipleCategories ? (
                /* Grouped display */
                categories.map((category) => (
                  <div key={category} className="mb-14 last:mb-0">
                    <h2 className="text-2xl lg:text-3xl font-bold text-wdi-primary mb-8 border-b-2 border-wdi-secondary pb-3">
                      {CATEGORY_LABELS[category] ?? category}
                    </h2>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {(grouped[category] ?? []).map((item: any) => (
                        <ContentCard key={item._id} item={item} />
                      ))}
                    </ul>
                  </div>
                ))
              ) : (
                /* Flat display */
                <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {items.map((item: any) => (
                    <ContentCard key={item._id} item={item} />
                  ))}
                </ul>
              )}
            </>
          ) : (
            <div className="text-center py-16">
              <p className="text-gray-500 text-lg">
                מאגר המידע יתעדכן בקרוב עם תכנים מקצועיים.
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}

/* ─── Card sub-component ─────────────────────────────────────── */

function ContentCard({ item }: { item: any }) {
  const imgSrc = sanityImageUrl(item.image);
  const href = item.externalUrl || item.fileUrl;
  const isDownload = !item.externalUrl && !!item.fileUrl;

  return (
    <li className="bg-white rounded-xl shadow-wdi-md hover:shadow-wdi-lg transition-shadow overflow-hidden flex flex-col">
      {/* Thumbnail */}
      {imgSrc && (
        <div className="relative w-full aspect-video bg-gray-100">
          <Image
            src={imgSrc}
            alt={item.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover"
          />
        </div>
      )}

      <div className="p-5 lg:p-6 flex flex-col flex-1">
        {/* Category badge */}
        {item.category && (
          <span className="inline-block self-start bg-wdi-secondary/10 text-wdi-secondary px-3 py-1 rounded-full text-xs font-medium mb-3">
            {CATEGORY_LABELS[item.category] ?? item.category}
          </span>
        )}

        <h3 className="text-lg font-bold text-wdi-primary mb-2">
          {item.title}
        </h3>

        {item.description && (
          <p className="text-sm text-gray-600 leading-relaxed mb-4 flex-1 line-clamp-3">
            {item.description}
          </p>
        )}

        {href && (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            {...(isDownload ? { download: true } : {})}
            className="inline-flex items-center gap-2 text-wdi-primary hover:text-wdi-primary-light font-medium transition-colors self-start mt-auto"
          >
            {isDownload ? (
              <>
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                הורדת קובץ
              </>
            ) : (
              <>
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
                צפייה בתוכן
              </>
            )}
          </a>
        )}
      </div>
    </li>
  );
}
