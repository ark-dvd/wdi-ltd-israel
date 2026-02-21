/**
 * Project detail — ORIGINAL_DESIGN_SPEC §8, DOC-070 §3.8
 * PageHeader, project info bar, description, image gallery, linked testimonials.
 */
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { getProject, getActiveProjects } from '@/lib/data-fetchers';
import { PageHeader } from '@/components/public/PageHeader';
import { PortableText } from '@/components/public/PortableText';
import { sanityImageUrl } from '@/lib/sanity/image';

export const dynamic = 'force-dynamic';

const SECTOR_LABELS: Record<string, string> = {
  security: 'בטחוני',
  commercial: 'מסחרי',
  industrial: 'תעשייה',
  infrastructure: 'תשתיות',
  residential: 'מגורים',
  public: 'ציבורי',
};

export async function generateStaticParams() {
  const projects = await getActiveProjects();
  return projects.map((p: { slug: string }) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProject(slug);
  return {
    title: project?.title ?? 'פרויקט',
    description: project?.client ? `${project.title} — ${project.client}` : project?.title ?? '',
    alternates: { canonical: `/projects/${slug}` },
  };
}

export default async function ProjectDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) notFound();

  const sectorLabel = project.sector ? SECTOR_LABELS[project.sector] : null;
  const featImg = project.featuredImage ? sanityImageUrl(project.featuredImage) : '';

  return (
    <>
      <PageHeader title={project.title} subtitle={project.client} breadcrumb={project.title} />

      <section className="section">
        <div className="container">
          {/* Info bar */}
          <div className="animate-on-scroll" style={{ display: 'flex', flexWrap: 'wrap', gap: 24, marginBottom: 40, padding: '20px 24px', background: 'var(--gray-50)', borderRadius: 12 }}>
            {project.client && (
              <div><strong style={{ color: 'var(--primary)', fontSize: '0.85rem' }}>לקוח:</strong> <span style={{ fontSize: '0.95rem' }}>{project.client}</span></div>
            )}
            {sectorLabel && (
              <div><strong style={{ color: 'var(--primary)', fontSize: '0.85rem' }}>ענף:</strong> <span className="project-card-category" style={{ fontSize: '0.75rem' }}>{sectorLabel}</span></div>
            )}
            {project.location && (
              <div><strong style={{ color: 'var(--primary)', fontSize: '0.85rem' }}>מיקום:</strong> <span style={{ fontSize: '0.95rem' }}>{project.location}</span></div>
            )}
            {(project.year || project.completedAt) && (
              <div><strong style={{ color: 'var(--primary)', fontSize: '0.85rem' }}>שנה:</strong> <span style={{ fontSize: '0.95rem' }}>{project.year ?? new Date(project.completedAt).getFullYear()}</span></div>
            )}
            {project.scope && project.scope.length > 0 && (
              <div><strong style={{ color: 'var(--primary)', fontSize: '0.85rem' }}>שירותים:</strong> <span style={{ fontSize: '0.95rem' }}>{Array.isArray(project.scope) ? project.scope.join(', ') : project.scope}</span></div>
            )}
          </div>

          {/* Featured image */}
          {featImg && (
            <div className="animate-on-scroll" style={{ marginBottom: 40 }}>
              <Image src={featImg} alt={project.title} width={1200} height={600} style={{ width: '100%', height: 'auto', borderRadius: 16 }} />
            </div>
          )}

          {/* Description */}
          {project.description && (
            <div className="animate-on-scroll" style={{ maxWidth: 900, marginBottom: 40 }}>
              {typeof project.description === 'string' ? (
                <p style={{ color: 'var(--gray-600)', fontSize: '1.05rem', lineHeight: 1.8 }}>{project.description}</p>
              ) : (
                <PortableText value={project.description} />
              )}
            </div>
          )}

          {/* Image gallery */}
          {project.images && project.images.length > 0 && (
            <div style={{ marginBottom: 40 }}>
              <h3 style={{ marginBottom: 20 }}>גלריה</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
                {project.images.map((img: { _key?: string; asset?: { _ref?: string } }, i: number) => {
                  const url = sanityImageUrl(img);
                  if (!url) return null;
                  return (
                    <div key={img._key ?? i} className="animate-on-scroll" style={{ borderRadius: 12, overflow: 'hidden' }}>
                      <Image src={url} alt={`${project.title} - ${i + 1}`} width={600} height={400} style={{ width: '100%', height: 'auto' }} />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Linked Testimonials — DOC-070 §3.8, §3.12 */}
          {project.linkedTestimonials && project.linkedTestimonials.length > 0 && (
            <div style={{ marginTop: 60 }}>
              <div className="section-header">
                <h2>המלצות</h2>
              </div>
              <div className="testimonials-grid">
                {project.linkedTestimonials.map((t: { _id: string; clientName: string; quote: string; companyName?: string; role?: string }) => (
                  <div key={t._id} className="testimonial-card animate-on-scroll">
                    <p className="testimonial-text">{t.quote}</p>
                    <p className="testimonial-author">{t.clientName}</p>
                    {(t.role || t.companyName) && (
                      <p className="testimonial-role">{[t.role, t.companyName].filter(Boolean).join(' | ')}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <div className="container">
          <h2>יש לכם פרויקט מאתגר?</h2>
          <p>נשמח לשמוע ולהציע פתרון</p>
          <Link href="/contact" className="btn btn-primary">צור קשר</Link>
        </div>
      </section>
    </>
  );
}
