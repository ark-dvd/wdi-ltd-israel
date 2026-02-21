/**
 * About page — ORIGINAL_DESIGN_SPEC §13, DOC-070 §3.2
 * PageHeader, company description (rich text), values grid, press items, CTA.
 * INV-P01: ALL text from CMS — no hardcoded Hebrew.
 */
import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { getAboutPage, getActivePressItems } from '@/lib/data-fetchers';
import { PageHeader } from '@/components/public/PageHeader';
import { PortableText } from '@/components/public/PortableText';
import { sanityImageUrl } from '@/lib/sanity/image';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'About',
  alternates: { canonical: '/about' },
};

export default async function AboutPage() {
  const [about, press] = await Promise.all([
    getAboutPage(),
    getActivePressItems(),
  ]);

  return (
    <>
      <PageHeader title={about?.pageTitle ?? ''} subtitle={about?.subtitle ?? ''} />
      <div className="about-content">

      {/* Vision Section — FIRST content section on about page */}
      {about?.visionContent && (
        <section className="section">
          <div className="container">
            <div className="section-header">
              {about.visionTitle && <h2>{about.visionTitle}</h2>}
            </div>
            <div className="company-story animate-on-scroll">
              <PortableText value={about.visionContent} />
            </div>
          </div>
        </section>
      )}

      {/* Company Story — §13.1 */}
      {about?.companyDescription && (
        <section className="section">
          <div className="container">
            <div className="company-story animate-on-scroll">
              <PortableText value={about.companyDescription} />
            </div>
          </div>
        </section>
      )}

      {/* Vision text (old field, show if populated and no companyDescription) */}
      {!about?.companyDescription && about?.vision && (
        <section className="section">
          <div className="container">
            <div className="company-story animate-on-scroll">
              <p>{about.vision}</p>
            </div>
          </div>
        </section>
      )}

      {/* Values Grid — §13.2 */}
      {about?.values && about.values.length > 0 && (
        <section className="section bg-light">
          <div className="container">
            <div className="section-header">
              {about.valuesTitle && <h2>{about.valuesTitle}</h2>}
            </div>
            <div className="values-grid">
              {about.values.map((v: { _key?: string; icon?: string; title?: string; description?: any }, i: number) => (
                <div key={v._key ?? i} className="value-card animate-on-scroll">
                  {v.icon && (
                    <div className="value-icon">
                      <i className={v.icon} />
                    </div>
                  )}
                  {v.title && <h3>{v.title}</h3>}
                  {v.description && (
                    typeof v.description === 'string'
                      ? <p>{v.description}</p>
                      : <PortableText value={v.description} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Press Section — §13.3 */}
      {press.length > 0 && (
        <section className="section">
          <div className="container">
            <div className="section-header">
              {about?.pressTitle && <h2>{about.pressTitle}</h2>}
            </div>
            <div className="press-grid">
              {press.slice(0, 3).map((item: { _id: string; title: string; source?: string; publishDate?: string; excerpt?: string; externalUrl?: string; image?: { asset?: { _ref?: string } } }) => {
                const imgUrl = item.image ? sanityImageUrl(item.image) : '';
                return (
                  <a key={item._id} href={item.externalUrl ?? '#'} target="_blank" rel="noopener noreferrer" className="press-card animate-on-scroll">
                    {imgUrl && <Image src={imgUrl} alt={item.source ?? item.title} width={400} height={225} style={{ width: '100%', height: 'auto' }} />}
                    <div className="press-card-content">
                      {item.source && <p style={{ fontSize: '0.8rem', color: 'var(--gray-500)', marginBottom: 4 }}>{item.source}</p>}
                      {item.publishDate && <p style={{ fontSize: '0.8rem', color: 'var(--gray-400)', marginBottom: 8 }}>{new Date(item.publishDate).toLocaleDateString('he-IL')}</p>}
                      <h3>{item.title}</h3>
                      {item.excerpt && <p style={{ color: 'var(--gray-600)', fontSize: '0.9rem', lineHeight: '1.7' }}>{item.excerpt}</p>}
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      {(about?.ctaTitle || about?.ctaButtonText) && (
        <section className="cta-section">
          <div className="container">
            {about.ctaTitle && <h2>{about.ctaTitle}</h2>}
            {about.ctaSubtitle && <p>{about.ctaSubtitle}</p>}
            {about.ctaButtonText && (
              <Link href={about.ctaButtonLink ?? '/contact'} className="btn btn-primary">{about.ctaButtonText}</Link>
            )}
          </div>
        </section>
      )}
      </div>
    </>
  );
}
