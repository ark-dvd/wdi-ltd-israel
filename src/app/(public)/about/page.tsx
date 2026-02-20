/**
 * About page — ORIGINAL_DESIGN_SPEC §13, DOC-070 §3.2
 * PageHeader, company description (rich text), values grid, press items, CTA.
 */
import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { getAboutPage, getActivePressItems } from '@/lib/data-fetchers';
import { PageHeader } from '@/components/public/PageHeader';
import { PortableText } from '@/components/public/PortableText';
import { sanityImageUrl } from '@/lib/sanity/image';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'אודות החברה',
  description: 'WDI - חברת בוטיק לניהול פרויקטים, פיקוח וייעוץ הנדסי בישראל',
  alternates: { canonical: '/about' },
};

export default async function AboutPage() {
  const [about, press] = await Promise.all([
    getAboutPage(),
    getActivePressItems(),
  ]);

  return (
    <>
      <PageHeader title={about?.pageTitle ?? 'אודות החברה'} subtitle="מאתגר להצלחה" />

      {/* Company Story — §13.1 */}
      <section className="section">
        <div className="container">
          <div className="company-story animate-on-scroll">
            {about?.companyDescription ? (
              <PortableText value={about.companyDescription} />
            ) : (
              <p>WDI הנדסה היא חברת בוטיק לניהול פרויקטים, פיקוח וייעוץ הנדסי. החברה הוקמה מתוך חזון לספק שירותי ניהול פרויקטים ברמה הגבוהה ביותר.</p>
            )}
          </div>
        </div>
      </section>

      {/* Values Grid — §13.2 */}
      {about?.values && about.values.length > 0 && (
        <section className="section bg-light">
          <div className="container">
            <div className="section-header">
              <h2>הערכים שלנו</h2>
            </div>
            <div className="values-grid">
              {about.values.map((v: { _key?: string; icon?: string; title?: string; description?: string }, i: number) => (
                <div key={v._key ?? i} className="value-card animate-on-scroll">
                  {v.icon && (
                    <div className="value-icon">
                      <i className={v.icon} />
                    </div>
                  )}
                  {v.title && <h3>{v.title}</h3>}
                  {v.description && <p>{v.description}</p>}
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
              <h2>כתבו עלינו</h2>
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
      <section className="cta-section">
        <div className="container">
          <h2>רוצים לשמוע עוד?</h2>
          <p>צוות WDI ישמח לספר לכם עוד על החברה והשירותים שלנו</p>
          <Link href="/contact" className="btn btn-primary">צור קשר</Link>
        </div>
      </section>
    </>
  );
}
