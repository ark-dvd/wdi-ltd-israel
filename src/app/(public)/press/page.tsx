/**
 * Press page — ORIGINAL_DESIGN_SPEC §13.3, DOC-070 §3.9
 * PageHeader, press items list with images, source, date, excerpt.
 * INV-P01: ALL text from CMS — no hardcoded Hebrew.
 */
import type { Metadata } from 'next';
import Image from 'next/image';
import { getActivePressItems, getSiteSettings } from '@/lib/data-fetchers';
import { PageHeader } from '@/components/public/PageHeader';
import { sanityImageUrl } from '@/lib/sanity/image';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Press',
  alternates: { canonical: '/press' },
};

export default async function PressPage() {
  const [press, settings] = await Promise.all([
    getActivePressItems(),
    getSiteSettings(),
  ]);

  const ps = settings?.pageStrings?.press;

  return (
    <>
      <PageHeader title={ps?.pageTitle ?? ''} subtitle={ps?.subtitle ?? ''} />

      <section className="section">
        <div className="container">
          {press.length > 0 ? (
            <div className="press-grid">
              {press.map((item: {
                _id: string; title: string; source?: string; publishDate?: string;
                excerpt?: string; externalUrl?: string; image?: { asset?: { _ref?: string } };
              }) => {
                const imgUrl = item.image ? sanityImageUrl(item.image) : '';
                return (
                  <a
                    key={item._id}
                    href={item.externalUrl ?? '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="press-card animate-on-scroll"
                  >
                    {imgUrl && (
                      <Image src={imgUrl} alt={item.source ?? item.title} width={400} height={225} style={{ width: '100%', height: 'auto' }} />
                    )}
                    <div className="press-card-content">
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                        {item.source && (
                          <span style={{
                            background: 'var(--gray-100)', color: 'var(--gray-600)',
                            fontSize: '0.75rem', fontWeight: 600, padding: '4px 10px', borderRadius: 6,
                          }}>
                            {item.source}
                          </span>
                        )}
                        {item.publishDate && (
                          <span style={{ fontSize: '0.8rem', color: 'var(--gray-400)' }}>
                            {new Date(item.publishDate).toLocaleDateString('he-IL')}
                          </span>
                        )}
                      </div>
                      <h3>{item.title}</h3>
                      {item.excerpt && (
                        <p style={{ color: 'var(--gray-600)', fontSize: '0.9rem', lineHeight: 1.7, marginTop: 8 }}>
                          {item.excerpt}
                        </p>
                      )}
                    </div>
                  </a>
                );
              })}
            </div>
          ) : null}
        </div>
      </section>
    </>
  );
}
