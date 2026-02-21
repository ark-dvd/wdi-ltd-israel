/**
 * Jobs / Careers — DOC-070 §3.14
 * PageHeader, job listings with tags, descriptions, apply buttons.
 * INV-P01: ALL text from CMS — no hardcoded Hebrew.
 * Job type labels from jobsPage singleton.
 */
import type { Metadata } from 'next';
import Link from 'next/link';
import { getActiveJobs, getSiteSettings, getJobsPage } from '@/lib/data-fetchers';
import { PageHeader } from '@/components/public/PageHeader';
import { PortableText } from '@/components/public/PortableText';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Jobs',
  alternates: { canonical: '/jobs' },
};

export default async function JobsPage() {
  const [jobs, settings, page] = await Promise.all([
    getActiveJobs(),
    getSiteSettings(),
    getJobsPage(),
  ]);

  // Build type labels from page singleton
  const typeLabels: Record<string, string> = {};
  if (page?.typeLabels) {
    for (const item of page.typeLabels) {
      if (item.value && item.label) typeLabels[item.value] = item.label;
    }
  }

  return (
    <>
      <PageHeader title={page?.pageTitle ?? ''} subtitle={page?.subtitle ?? ''} />

      <section className="section">
        <div className="container" style={{ maxWidth: 800 }}>
          {jobs.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              {jobs.map((job: {
                _id: string; title: string; description?: any; requirements?: any;
                location?: string; type?: string; department?: string; contactEmail?: string;
              }) => (
                <article key={job._id} className="animate-on-scroll" style={{
                  background: 'white', borderRadius: 16, padding: 32,
                  border: '1px solid var(--gray-200)', transition: 'all 0.3s ease',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
                    <h3 style={{ margin: 0, fontSize: '1.25rem' }}>{job.title}</h3>
                    {job.type && (
                      <span style={{
                        background: 'var(--secondary)', color: 'var(--primary-dark)',
                        fontSize: '0.75rem', fontWeight: 600, padding: '4px 12px', borderRadius: 20,
                      }}>
                        {typeLabels[job.type] ?? job.type}
                      </span>
                    )}
                  </div>

                  {/* Tags */}
                  <div style={{ display: 'flex', gap: 16, marginBottom: 16, flexWrap: 'wrap', fontSize: '0.85rem', color: 'var(--gray-500)' }}>
                    {job.department && (
                      <span><i className="fas fa-building" style={{ marginLeft: 6 }} />{job.department}</span>
                    )}
                    {job.location && (
                      <span><i className="fas fa-map-marker-alt" style={{ marginLeft: 6 }} />{job.location}</span>
                    )}
                  </div>

                  {/* Description */}
                  {job.description && (
                    <div style={{ marginBottom: 16, color: 'var(--gray-600)', lineHeight: 1.7 }}>
                      {typeof job.description === 'string' ? (
                        <p>{job.description}</p>
                      ) : (
                        <PortableText value={job.description} />
                      )}
                    </div>
                  )}

                  {/* Requirements */}
                  {job.requirements && (
                    <div style={{ marginBottom: 20 }}>
                      <div style={{ color: 'var(--gray-600)', fontSize: '0.9rem', lineHeight: 1.7 }}>
                        {typeof job.requirements === 'string' ? (
                          <p>{job.requirements}</p>
                        ) : (
                          <PortableText value={job.requirements} />
                        )}
                      </div>
                    </div>
                  )}

                  {/* Apply + Share */}
                  <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                    {page?.applyButtonText && (
                      <Link href="/job-application" className="btn btn-primary" style={{ fontSize: '0.9rem', padding: '10px 24px' }}>
                        {page.applyButtonText}
                      </Link>
                    )}
                    {job.contactEmail && page?.sendCvText && (
                      <a href={`mailto:${job.contactEmail}?subject=${job.title}`} className="btn btn-secondary" style={{ fontSize: '0.9rem', padding: '10px 24px' }}>
                        <i className="fas fa-envelope" /> {page.sendCvText}
                      </a>
                    )}
                    {/* Share buttons */}
                    <div className="share-buttons" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <a className="share-btn whatsapp" href={`https://wa.me/?text=${encodeURIComponent(job.title)}`} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" style={{ width: 36, height: 36, fontSize: '0.85rem' }}>
                        <i className="fab fa-whatsapp" />
                      </a>
                      <a className="share-btn email" href={`mailto:?subject=${encodeURIComponent(job.title)}`} aria-label="Email" style={{ width: 36, height: 36, fontSize: '0.85rem' }}>
                        <i className="fas fa-envelope" />
                      </a>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <i className="fas fa-briefcase" style={{ fontSize: '3rem', color: 'var(--gray-300)', marginBottom: 16, display: 'block' }} />
              {page?.noJobsTitle && <h3 style={{ color: 'var(--gray-500)', fontWeight: 500 }}>{page.noJobsTitle}</h3>}
              {page?.noJobsSubtitle && <p style={{ color: 'var(--gray-400)' }}>{page.noJobsSubtitle}</p>}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      {(page?.ctaTitle || page?.ctaButtonText || settings?.defaultCtaTitle) && (
        <section className="cta-section">
          <div className="container">
            <h2>{page?.ctaTitle ?? settings?.defaultCtaTitle ?? ''}</h2>
            {(page?.ctaSubtitle || settings?.defaultCtaSubtitle) && <p>{page?.ctaSubtitle ?? settings?.defaultCtaSubtitle}</p>}
            <Link href="/contact" className="btn btn-primary">
              {page?.ctaButtonText ?? settings?.defaultCtaButtonText ?? ''}
            </Link>
          </div>
        </section>
      )}
    </>
  );
}
