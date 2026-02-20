/**
 * Clients page — ORIGINAL_DESIGN_SPEC §10, DOC-070 §3.4
 * PageHeader, client logo grid (grayscale→color on hover),
 * featured testimonials (isFeatured=true) below.
 */
import type { Metadata } from 'next';
import Image from 'next/image';
import { getActiveClientsContent, getFeaturedTestimonials } from '@/lib/data-fetchers';
import { PageHeader } from '@/components/public/PageHeader';
import { sanityImageUrl } from '@/lib/sanity/image';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'לקוחות',
  description: 'הלקוחות שסומכים על WDI בניהול הפרויקטים שלהם',
  alternates: { canonical: '/clients' },
};

export default async function ClientsPage() {
  const [clients, testimonials] = await Promise.all([
    getActiveClientsContent(),
    getFeaturedTestimonials(),
  ]);

  return (
    <>
      <PageHeader title="הלקוחות שלנו" subtitle="גאים לעבוד עם הארגונים המובילים בישראל" />

      {/* Client Logos Grid — §10.2 */}
      <section className="section">
        <div className="container">
          <div className="clients-grid">
            {clients.map((client: { _id: string; name: string; logo?: { asset?: { _ref?: string } }; websiteUrl?: string }) => {
              const logoUrl = client.logo ? sanityImageUrl(client.logo) : '';
              const inner = logoUrl ? (
                <Image src={logoUrl} alt={client.name} width={120} height={60} style={{ maxHeight: 60, maxWidth: 120, objectFit: 'contain' }} />
              ) : (
                <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--gray-500)' }}>{client.name}</span>
              );
              return (
                <div key={client._id} className="client-logo animate-on-scroll">
                  {client.websiteUrl ? (
                    <a href={client.websiteUrl} target="_blank" rel="noopener noreferrer" aria-label={client.name}>{inner}</a>
                  ) : inner}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Testimonials — DOC-070 §3.4, INV-P04 */}
      {testimonials.length > 0 && (
        <section className="section bg-light">
          <div className="container">
            <div className="section-header">
              <h2>מה הלקוחות אומרים</h2>
            </div>
            <div className="testimonials-grid">
              {testimonials.map((t: { _id: string; clientName: string; quote: string; companyName?: string; role?: string; projectTitle?: string }) => (
                <div key={t._id} className="testimonial-card animate-on-scroll">
                  <p className="testimonial-text">{t.quote}</p>
                  <p className="testimonial-author">{t.clientName}</p>
                  {(t.role || t.companyName) && (
                    <p className="testimonial-role">{[t.role, t.companyName].filter(Boolean).join(' | ')}</p>
                  )}
                  {t.projectTitle && (
                    <p style={{ fontSize: '0.8rem', color: 'var(--secondary)', marginTop: 4 }}>{t.projectTitle}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
