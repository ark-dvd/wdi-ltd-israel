/**
 * Supplier registration — DOC-070 §3.15
 * PageHeader, two-column: supplier form + info sidebar.
 * INV-P01: ALL text from CMS — no hardcoded Hebrew.
 */
import type { Metadata } from 'next';
import { getSupplierFormSettings } from '@/lib/data-fetchers';
import { PageHeader } from '@/components/public/PageHeader';
import { SupplierForm } from '@/components/public/SupplierForm';
import { PortableText } from '@/components/public/PortableText';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Supplier Registration',
  alternates: { canonical: '/join-us' },
};

export default async function JoinUsPage() {
  const supplierSettings = await getSupplierFormSettings();

  return (
    <>
      <PageHeader title={supplierSettings?.pageTitle ?? ''} subtitle={supplierSettings?.subtitle ?? ''} />

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

            {/* Info sidebar — from CMS */}
            <div className="animate-on-scroll">
              {supplierSettings?.sidebarTitle && (
                <h3 style={{ marginBottom: 24 }}>{supplierSettings.sidebarTitle}</h3>
              )}
              {supplierSettings?.sidebarItems && supplierSettings.sidebarItems.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {supplierSettings.sidebarItems.map((item: { _key?: string; icon?: string; text?: string }, i: number) => (
                    <div key={item._key ?? i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      {item.icon && (
                        <div className="value-icon" style={{ width: 40, height: 40, borderRadius: 10, fontSize: '0.9rem', flexShrink: 0 }}>
                          <i className={item.icon} />
                        </div>
                      )}
                      {item.text && <span style={{ color: 'var(--gray-700)' }}>{item.text}</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
