/**
 * Contact page — ORIGINAL_DESIGN_SPEC §11, DOC-070 §3.13
 * PageHeader, two-column: contact form + info sidebar with map.
 * INV-P01: ALL text from CMS — no hardcoded Hebrew.
 */
import type { Metadata } from 'next';
import { getSiteSettings, getContactPage } from '@/lib/data-fetchers';
import { PageHeader } from '@/components/public/PageHeader';
import { ContactForm } from '@/components/public/ContactForm';
import { LocalBusinessJsonLd } from '@/components/public/JsonLd';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Contact',
  alternates: { canonical: '/contact' },
};

export default async function ContactPage() {
  const [settings, page] = await Promise.all([
    getSiteSettings(),
    getContactPage(),
  ]);

  return (
    <>
      <LocalBusinessJsonLd settings={settings} />
      <PageHeader title={page?.pageTitle ?? ''} subtitle={page?.subtitle ?? ''} />

      <section className="section">
        <div className="container">
          <div className="contact-grid">
            {/* Contact Form — subject dropdown from CMS */}
            <div className="contact-form-card animate-on-scroll">
              <ContactForm subjects={settings?.contactFormSubjects} labels={settings?.formLabels} />
            </div>

            {/* Contact Info */}
            <div className="animate-on-scroll">
              {page?.infoTitle && <h3 style={{ marginBottom: 24 }}>{page.infoTitle}</h3>}
              {settings?.phone && (
                <p style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                  <i className="fas fa-phone" style={{ color: 'var(--secondary)', width: 20, textAlign: 'center' }} />
                  <a href={`tel:${settings.phone}`} dir="ltr" style={{ color: 'var(--gray-700)' }}>{settings.phone}</a>
                </p>
              )}
              {settings?.email && (
                <p style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                  <i className="fas fa-envelope" style={{ color: 'var(--secondary)', width: 20, textAlign: 'center' }} />
                  <a href={`mailto:${settings.email}`} dir="ltr" style={{ color: 'var(--gray-700)' }}>{settings.email}</a>
                </p>
              )}
              {settings?.address && (
                <p style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                  <i className="fas fa-map-marker-alt" style={{ color: 'var(--secondary)', width: 20, textAlign: 'center' }} />
                  <span>{settings.address}</span>
                </p>
              )}

              {/* Google Maps embed */}
              {settings?.googleMapsEmbed && (
                <div
                  style={{ marginTop: 24, borderRadius: 12, overflow: 'hidden', height: 300 }}
                  dangerouslySetInnerHTML={{ __html: settings.googleMapsEmbed }}
                />
              )}

              {/* Social links */}
              <div className="social-links" style={{ marginTop: 24 }}>
                {settings?.socialLinks?.linkedin && (
                  <a href={settings.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" style={{ background: 'var(--primary)', color: 'white' }}>
                    <i className="fab fa-linkedin-in" />
                  </a>
                )}
                {settings?.socialLinks?.facebook && (
                  <a href={settings.socialLinks.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook" style={{ background: 'var(--primary)', color: 'white' }}>
                    <i className="fab fa-facebook-f" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
