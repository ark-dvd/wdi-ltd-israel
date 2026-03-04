/**
 * Terms of Use page — /terms
 * Fetches legalPage content from Sanity CMS.
 */
import type { Metadata } from 'next';
import { getLegalPage } from '@/lib/data-fetchers';
import { PageHeader } from '@/components/public/PageHeader';
import { PortableText } from '@/components/public/PortableText';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'תנאי שימוש',
  description: 'תנאי שימוש באתר WDI',
  alternates: { canonical: '/terms' },
};

export default async function TermsPage() {
  const page = await getLegalPage('terms');

  return (
    <>
      <PageHeader title={page?.title ?? 'תנאי שימוש'} breadcrumb="תנאי שימוש" />
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
