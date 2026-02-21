/**
 * Services listing — ORIGINAL_DESIGN_SPEC §7, DOC-070 §3.5
 * PageHeader, grid of service cards (icon, name, description, "read more" link).
 * INV-P01: ALL text from CMS — no hardcoded Hebrew.
 */
import type { Metadata } from 'next';
import Link from 'next/link';
import { getActiveServices, getSiteSettings, getServicesPage } from '@/lib/data-fetchers';
import { PageHeader } from '@/components/public/PageHeader';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Services',
  alternates: { canonical: '/services' },
};

export default async function ServicesPage() {
  const [services, settings, page] = await Promise.all([
    getActiveServices(),
    getSiteSettings(),
    getServicesPage(),
  ]);

  return (
    <>
      <PageHeader title={page?.pageTitle ?? ''} subtitle={page?.subtitle ?? ''} />

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
                  {page?.readMoreText ?? ''} <i className="fas fa-arrow-left" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      {(page?.ctaTitle || page?.ctaButtonText || settings?.defaultCtaButtonText) && (
        <section className="cta-section">
          <div className="container">
            {(page?.ctaTitle || settings?.defaultCtaTitle) && <h2>{page?.ctaTitle ?? settings?.defaultCtaTitle}</h2>}
            {(page?.ctaSubtitle || settings?.defaultCtaSubtitle) && <p>{page?.ctaSubtitle ?? settings?.defaultCtaSubtitle}</p>}
            <Link href={page?.ctaButtonLink ?? settings?.defaultCtaButtonLink ?? '/contact'} className="btn btn-primary">
              {page?.ctaButtonText ?? settings?.defaultCtaButtonText ?? ''}
            </Link>
          </div>
        </section>
      )}
    </>
  );
}
