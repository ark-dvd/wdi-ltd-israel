/**
 * Innovation page — DOC-070 §3.10
 * PageHeader, CMS content (innovationPage singleton), sections.
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
  title: 'חדשנות וטכנולוגיה',
  description: 'הגישה החדשנית של WDI לניהול פרויקטים — AI, BIM, כלים דיגיטליים',
  alternates: { canonical: '/innovation' },
};

export default async function InnovationPage() {
  const page = await getInnovationPage();

  return (
    <>
      <PageHeader title={page?.pageTitle ?? 'חדשנות וטכנולוגיה'} subtitle="הגישה שלנו לעתיד הבנייה" />

      {/* Main content from CMS */}
      <section className="section">
        <div className="container">
          {page?.image && (
            <div className="animate-on-scroll" style={{ marginBottom: 40 }}>
              <Image src={sanityImageUrl(page.image)} alt={page.pageTitle ?? 'חדשנות'} width={1200} height={500} style={{ width: '100%', height: 'auto', borderRadius: 16 }} />
            </div>
          )}
          {page?.content ? (
            <div className="company-story animate-on-scroll">
              <PortableText value={page.content} />
            </div>
          ) : (
            <div className="company-story animate-on-scroll">
              <p>WDI הנדסה משלבת טכנולוגיות מתקדמות בניהול פרויקטים: מודלים BIM תלת-ממדיים, כלי AI לניתוח סיכונים, פלטפורמות ניהול דיגיטליות ודוחות אוטומטיים.</p>
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
      <section className="cta-section">
        <div className="container">
          <h2>רוצים לשמוע עוד על הגישה שלנו?</h2>
          <p>נשמח להדגים את הכלים והטכנולוגיות שאנחנו משתמשים בהם</p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/services" className="btn btn-primary">השירותים שלנו</Link>
            <Link href="/contact" className="btn btn-outline-light">צור קשר</Link>
          </div>
        </div>
      </section>
    </>
  );
}
