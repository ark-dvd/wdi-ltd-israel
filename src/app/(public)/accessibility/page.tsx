/**
 * Accessibility Statement page — /accessibility
 * Fetches legalPage content from Sanity CMS.
 */
import { getLegalPage } from '@/lib/data-fetchers';
import { PageHeader } from '@/components/public/PageHeader';
import { PortableText } from '@/components/public/PortableText';
import { buildMetadata } from '@/lib/seo';

export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  return buildMetadata({
    title: 'הצהרת נגישות',
    description: 'הצהרת נגישות — המחויבות שלנו להנגשת האתר לאנשים עם מוגבלויות.',
    path: '/accessibility',
  });
}

export default async function AccessibilityPage() {
  const page = await getLegalPage('accessibility');

  return (
    <>
      <PageHeader title={page?.title ?? 'הצהרת נגישות'} breadcrumb="הצהרת נגישות" />
      <section className="section">
        <div className="container">
          <article className="prose prose-lg max-w-3xl mx-auto text-[#343a40] leading-relaxed" dir="rtl">
            {page?.content ? (
              <PortableText value={page.content} />
            ) : (
              <p>התוכן אינו זמין כרגע.</p>
            )}
            {page?.lastUpdated && (
              <p className="text-sm text-[#adb5bd] mt-12">
                עדכון אחרון: {new Date(page.lastUpdated).toLocaleDateString('he-IL', { year: 'numeric', month: 'long' })}
              </p>
            )}
          </article>
        </div>
      </section>
    </>
  );
}
