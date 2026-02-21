/**
 * Service detail — ORIGINAL_DESIGN_SPEC §7, DOC-070 §3.6
 * PageHeader with service name, detail content, highlights, sidebar with other services.
 * Share buttons (WhatsApp, Facebook, email).
 * INV-P01: ALL text from CMS — no hardcoded Hebrew.
 */
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { getService, getActiveServices, getSiteSettings } from '@/lib/data-fetchers';
import { PageHeader } from '@/components/public/PageHeader';
import { PortableText } from '@/components/public/PortableText';
import { sanityImageUrl } from '@/lib/sanity/image';

export const dynamic = 'force-dynamic';

export async function generateStaticParams() {
  const services = await getActiveServices();
  return services.map((s: { slug: string }) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const service = await getService(slug);
  return {
    title: service?.name ?? '',
    description: service?.tagline ?? service?.description ?? '',
    alternates: { canonical: `/services/${slug}` },
  };
}

export default async function ServiceDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [service, allServices, settings] = await Promise.all([
    getService(slug),
    getActiveServices(),
    getSiteSettings(),
  ]);

  if (!service) notFound();

  const otherServices = allServices.filter((s: { slug: string }) => s.slug !== slug);
  const imgUrl = service.image ? sanityImageUrl(service.image) : '';

  return (
    <>
      <PageHeader
        title={service.name}
        subtitle={service.tagline}
        breadcrumb={service.name}
      />

      <section className="section">
        <div className="container">
          {/* Share buttons */}
          <div className="share-buttons" style={{ marginBottom: 32 }}>
            <a className="share-btn whatsapp" href={`https://wa.me/?text=${encodeURIComponent(service.name + ' - ' + (settings?.companyName ?? 'WDI'))}`} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
              <i className="fab fa-whatsapp" />
            </a>
            <a className="share-btn facebook" href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`/services/${slug}`)}`} target="_blank" rel="noopener noreferrer" aria-label="Facebook">
              <i className="fab fa-facebook-f" />
            </a>
            <a className="share-btn email" href={`mailto:?subject=${encodeURIComponent(service.name)}&body=${encodeURIComponent((settings?.companyName ?? 'WDI') + ' - ' + service.name)}`} aria-label="Email">
              <i className="fas fa-envelope" />
            </a>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 40, alignItems: 'start' }}>
            {/* Main content */}
            <div>
              {imgUrl && (
                <Image src={imgUrl} alt={service.name} width={800} height={400} style={{ width: '100%', height: 'auto', borderRadius: 16, marginBottom: 32 }} />
              )}

              {/* Detail content (rich text) */}
              {service.detailContent && (
                <div className="animate-on-scroll">
                  <PortableText value={service.detailContent} />
                </div>
              )}

              {/* Highlights */}
              {service.highlights && service.highlights.length > 0 && (
                <div style={{ marginTop: 40 }}>
                  {service.highlights.map((h: { _key?: string; title?: string; description?: string }, i: number) => (
                    <div key={h._key ?? i} className="animate-on-scroll" style={{ marginBottom: 16, paddingRight: 16, borderRight: '3px solid var(--secondary)' }}>
                      {h.title && <h4 style={{ marginBottom: 4 }}>{h.title}</h4>}
                      {h.description && <p style={{ color: 'var(--gray-600)', fontSize: '0.95rem', lineHeight: 1.7 }}>{h.description}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Sidebar — other services */}
            <aside style={{ position: 'sticky', top: 100 }}>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {otherServices.map((s: { _id: string; name: string; slug: string }) => (
                  <li key={s._id} style={{ marginBottom: 8 }}>
                    <Link href={`/services/${s.slug}`} style={{ color: 'var(--gray-600)', fontSize: '0.9rem', display: 'block', padding: '8px 12px', borderRadius: 8, transition: 'background 0.2s' }}>
                      {s.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </aside>
          </div>
        </div>
      </section>

      {/* CTA */}
      {(service.ctaText || settings?.defaultCtaButtonText) && (
        <section className="cta-section">
          <div className="container">
            {settings?.defaultCtaTitle && <h2>{settings.defaultCtaTitle}</h2>}
            {settings?.defaultCtaSubtitle && <p>{settings.defaultCtaSubtitle}</p>}
            <Link href={settings?.defaultCtaButtonLink ?? '/contact'} className="btn btn-primary">
              {service.ctaText ?? settings?.defaultCtaButtonText ?? ''}
            </Link>
          </div>
        </section>
      )}
    </>
  );
}
