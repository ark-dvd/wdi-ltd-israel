/**
 * Supplier registration — DOC-070 §3.15
 * PageHeader, two-column: supplier form + info sidebar.
 */
import type { Metadata } from 'next';
import { getSupplierFormSettings } from '@/lib/data-fetchers';
import { PageHeader } from '@/components/public/PageHeader';
import { SupplierForm } from '@/components/public/SupplierForm';
import { PortableText } from '@/components/public/PortableText';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'הצטרפות למאגר הספקים',
  description: 'הצטרפו למאגר הספקים והקבלנים של WDI',
  alternates: { canonical: '/join-us' },
};

export default async function JoinUsPage() {
  const supplierSettings = await getSupplierFormSettings();

  return (
    <>
      <PageHeader title={supplierSettings?.pageTitle ?? 'הצטרפות למאגר הספקים'} subtitle="ספקים, קבלנים ויועצים" />

      <section className="section">
        <div className="container">
          {/* Intro text from CMS */}
          {supplierSettings?.content && (
            <div className="company-story animate-on-scroll" style={{ marginBottom: 40 }}>
              <PortableText value={supplierSettings.content} />
            </div>
          )}

          <div className="contact-grid">
            {/* Supplier Form */}
            <div className="contact-form-card animate-on-scroll">
              <SupplierForm />
            </div>

            {/* Info sidebar */}
            <div className="animate-on-scroll">
              <h3 style={{ marginBottom: 24 }}>למה להצטרף למאגר שלנו?</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {[
                  { icon: 'fas fa-handshake', text: 'שיתופי פעולה ארוכי טווח' },
                  { icon: 'fas fa-project-diagram', text: 'גישה לפרויקטים מגוונים' },
                  { icon: 'fas fa-shield-alt', text: 'עבודה עם חברה מובילה' },
                  { icon: 'fas fa-chart-line', text: 'צמיחה מקצועית' },
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div className="value-icon" style={{ width: 40, height: 40, borderRadius: 10, fontSize: '0.9rem', flexShrink: 0 }}>
                      <i className={item.icon} />
                    </div>
                    <span style={{ color: 'var(--gray-700)' }}>{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
