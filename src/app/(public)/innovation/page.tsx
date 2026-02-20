/**
 * Innovation page — DOC-070 §3.10
 * PageHeader, CMS content (innovationPage singleton), sections.
 * INV-P01: ALL text from CMS — no hardcoded Hebrew.
 */
import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { getInnovationPage } from '@/lib/data-fetchers';
import { PageHeader } from '@/components/public/PageHeader';
import { PortableText } from '@/components/public/PortableText';
import { sanityImageUrl } from '@/lib/sanity/image';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Innovation',
  alternates: { canonical: '/innovation' },
};

export default async function InnovationPage() {
  const page = await getInnovationPage();

  return (
    <>
      <PageHeader title={page?.pageTitle ?? ''} subtitle={page?.subtitle ?? ''} />

      {/* Main content from CMS */}
      <section className="section">
        <div className="container">
          {page?.image && (
            <div className="animate-on-scroll" style={{ marginBottom: 40 }}>
              <Image src={sanityImageUrl(page.image)} alt={page.pageTitle ?? ''} width={1200} height={500} style={{ width: '100%', height: 'auto', borderRadius: 16 }} />
            </div>
          )}
          {page?.content && Array.isArray(page.content) && page.content.length > 0 && (
            <div className="company-story animate-on-scroll">
              <PortableText value={page.content} />
            </div>
          )}
          {/* Old introduction field fallback */}
          {(!page?.content || (Array.isArray(page.content) && page.content.length === 0)) && page?.introduction && (
            <div className="company-story animate-on-scroll">
              <p>{page.introduction}</p>
            </div>
          )}
        </div>
      </section>

      {/* Dynamic sections from CMS */}
      {page?.sections && page.sections.length > 0 && page.sections.map((s: Record<string, any>, i: number) => (
        <section key={s._key ?? i} className={`section${i % 2 === 0 ? ' bg-light' : ''}`}>
          <div className="container">
            <div className="section-header">
              {s.icon && <div className="value-icon" style={{ margin: '0 auto 16px' }}><i className={s.icon} /></div>}
              {s.title && <h2>{s.title}</h2>}
            </div>
            <div className="company-story animate-on-scroll">
              {s.content && <PortableText value={s.content} />}
              {/* Old description field fallback */}
              {!s.content && s.description && <p>{s.description}</p>}
            </div>
            {s.image && (
              <div style={{ marginTop: 32, textAlign: 'center' }}>
                <Image src={sanityImageUrl(s.image)} alt={s.title ?? ''} width={800} height={400} style={{ maxWidth: '100%', height: 'auto', borderRadius: 16 }} />
              </div>
            )}
          </div>
        </section>
      ))}

      {/* CTA */}
      {(page?.ctaTitle || page?.ctaButtonText) && (
        <section className="cta-section">
          <div className="container">
            {page.ctaTitle && <h2>{page.ctaTitle}</h2>}
            {page.ctaSubtitle && <p>{page.ctaSubtitle}</p>}
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
              {page.ctaButtonText && (
                <Link href={page.ctaButtonLink ?? '/services'} className="btn btn-primary">{page.ctaButtonText}</Link>
              )}
              {page.cta2ButtonText && (
                <Link href={page.cta2ButtonLink ?? '/contact'} className="btn btn-outline-light">{page.cta2ButtonText}</Link>
              )}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
