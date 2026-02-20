/**
 * Services listing — ORIGINAL_DESIGN_SPEC §7, DOC-070 §3.5
 * PageHeader, grid of service cards (icon, name, description, "read more" link).
 */
import type { Metadata } from 'next';
import Link from 'next/link';
import { getActiveServices } from '@/lib/data-fetchers';
import { PageHeader } from '@/components/public/PageHeader';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'שירותים',
  description: 'השירותים שלנו — ניהול פרויקטים, פיקוח, ייעוץ הנדסי ועוד',
  alternates: { canonical: '/services' },
};

export default async function ServicesPage() {
  const services = await getActiveServices();

  return (
    <>
      <PageHeader title="השירותים שלנו" subtitle="פתרונות מקצועיים לניהול פרויקטי בנייה" />

      <section className="section">
        <div className="container">
          <div className="services-grid">
            {services.map((s: { _id: string; name: string; slug: string; description?: string; icon?: string }) => (
              <Link key={s._id} href={`/services/${s.slug}`} className="service-card animate-on-scroll">
                {s.icon && (
                  <div className="service-card-icon">
                    <i className={s.icon} />
                  </div>
                )}
                <h3>{s.name}</h3>
                {s.description && <p>{s.description}</p>}
                <span className="service-card-link">
                  קרא עוד <i className="fas fa-arrow-left" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <div className="container">
          <h2>צריכים שירות מקצועי?</h2>
          <p>נשמח לשמוע על הפרויקט שלכם ולהציע את הפתרון המתאים</p>
          <Link href="/contact" className="btn btn-primary">צור קשר</Link>
        </div>
      </section>
    </>
  );
}
