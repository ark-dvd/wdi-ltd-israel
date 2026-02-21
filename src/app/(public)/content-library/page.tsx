/**
 * Content Library — DOC-070 §3.11
 * PageHeader, grid of resource cards (icon, title, description, external link).
 * INV-P01: ALL text from CMS — no hardcoded Hebrew.
 * INV-P02: file download from CMS file upload, not URL.
 */
import type { Metadata } from 'next';
import Image from 'next/image';
import { getActiveContentLibraryItems, getContentLibraryPage } from '@/lib/data-fetchers';
import { PageHeader } from '@/components/public/PageHeader';
import { sanityImageUrl } from '@/lib/sanity/image';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Content Library',
  alternates: { canonical: '/content-library' },
};

export default async function ContentLibraryPage() {
  const [items, page] = await Promise.all([
    getActiveContentLibraryItems(),
    getContentLibraryPage(),
  ]);

  return (
    <>
      <PageHeader title={page?.pageTitle ?? ''} subtitle={page?.subtitle ?? ''} />

      <section className="section">
        <div className="container">
          {items.length > 0 ? (
            <div className="content-library-grid">
              {items.map((item: {
                _id: string; title: string; description?: string; category?: string;
                icon?: string; externalUrl?: string; fileUrl?: string; fileDownloadUrl?: string;
                image?: { asset?: { _ref?: string } };
              }) => {
                const imgUrl = item.image ? sanityImageUrl(item.image) : '';
                // Prefer uploaded file, then legacy fileUrl, then external link
                const href = item.fileDownloadUrl || item.externalUrl || item.fileUrl || '#';
                return (
                  <a
                    key={item._id}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="service-card animate-on-scroll"
                    style={{ textDecoration: 'none' }}
                  >
                    {imgUrl && (
                      <Image src={imgUrl} alt={item.title} width={300} height={170} style={{ width: '100%', height: 'auto', borderRadius: 12, marginBottom: 16 }} />
                    )}
                    {item.icon && !imgUrl && (
                      <div className="service-card-icon">
                        <i className={item.icon} />
                      </div>
                    )}
                    {item.category && (
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--secondary)', textTransform: 'uppercase', marginBottom: 8, display: 'block' }}>
                        {item.category}
                      </span>
                    )}
                    <h3>{item.title}</h3>
                    {item.description && <p>{item.description}</p>}
                    <span className="service-card-link">
                      <i className="fas fa-external-link-alt" style={{ fontSize: '0.8rem' }} />
                    </span>
                  </a>
                );
              })}
            </div>
          ) : (
            page?.emptyText ? (
              <p style={{ textAlign: 'center', color: 'var(--gray-500)', padding: '40px 0' }}>
                {page.emptyText}
              </p>
            ) : null
          )}
        </div>
      </section>
    </>
  );
}
