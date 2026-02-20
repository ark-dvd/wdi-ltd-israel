/**
 * Jobs / Careers — DOC-070 §3.14
 * PageHeader, job listings with tags, descriptions, apply buttons.
 */
import type { Metadata } from 'next';
import Link from 'next/link';
import { getActiveJobs } from '@/lib/data-fetchers';
import { PageHeader } from '@/components/public/PageHeader';
import { PortableText } from '@/components/public/PortableText';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'משרות',
  description: 'משרות פתוחות ב-WDI — הצטרפו לצוות',
  alternates: { canonical: '/jobs' },
};

const TYPE_LABELS: Record<string, string> = {
  'full-time': 'משרה מלאה',
  'part-time': 'חלקית',
  freelance: 'פרילנס',
  contract: 'חוזה',
};

export default async function JobsPage() {
  const jobs = await getActiveJobs();

  return (
    <>
      <PageHeader title="משרות פתוחות" subtitle="הצטרפו לצוות WDI" />

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
                        {TYPE_LABELS[job.type] ?? job.type}
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
                      <h4 style={{ fontSize: '1rem', marginBottom: 8 }}>דרישות</h4>
                      <div style={{ color: 'var(--gray-600)', fontSize: '0.9rem', lineHeight: 1.7 }}>
                        {typeof job.requirements === 'string' ? (
                          <p>{job.requirements}</p>
                        ) : (
                          <PortableText value={job.requirements} />
                        )}
                      </div>
                    </div>
                  )}

                  {/* Apply */}
                  <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                    <Link href="/job-application" className="btn btn-primary" style={{ fontSize: '0.9rem', padding: '10px 24px' }}>
                      הגשת מועמדות
                    </Link>
                    {job.contactEmail && (
                      <a href={`mailto:${job.contactEmail}?subject=מועמדות: ${job.title}`} className="btn btn-secondary" style={{ fontSize: '0.9rem', padding: '10px 24px' }}>
                        <i className="fas fa-envelope" /> שלח CV
                      </a>
                    )}
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <i className="fas fa-briefcase" style={{ fontSize: '3rem', color: 'var(--gray-300)', marginBottom: 16, display: 'block' }} />
              <h3 style={{ color: 'var(--gray-500)', fontWeight: 500 }}>אין משרות פתוחות כרגע</h3>
              <p style={{ color: 'var(--gray-400)' }}>אנחנו תמיד שמחים לקבל קורות חיים</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <div className="container">
          <h2>לא מצאתם משרה מתאימה?</h2>
          <p>שלחו לנו קורות חיים ונחזור אליכם</p>
          <Link href="/contact" className="btn btn-primary">צור קשר</Link>
        </div>
      </section>
    </>
  );
}
