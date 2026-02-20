/**
 * Project detail page — /projects/[slug]
 * Server component with SSG via generateStaticParams.
 * Includes rich text, image gallery, testimonials, and JSON-LD.
 */
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getActiveProjects, getProject } from '@/lib/data-fetchers';
import { sanityImageUrl } from '@/lib/sanity/image';
import { PortableText } from '@/components/public/PortableText';
import { ProjectJsonLd, ReviewJsonLd } from '@/components/public/JsonLd';

const SECTOR_LABELS: Record<string, string> = {
  security: 'בטחוני',
  commercial: 'מסחרי',
  industrial: 'תעשייה',
  infrastructure: 'תשתיות',
  residential: 'מגורים',
  public: 'ציבורי',
};

/* ── SSG ─────────────────────────────────────────────────────── */

export async function generateStaticParams() {
  const projects = await getActiveProjects();
  return projects
    .map((p: { slug: string | { current: string } }) => ({
      slug: typeof p.slug === 'string' ? p.slug : p.slug?.current ?? '',
    }))
    .filter((p: { slug: string }) => p.slug.length > 0);
}

/* ── Metadata ────────────────────────────────────────────────── */

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) {
    return { title: 'פרויקט לא נמצא | WDI' };
  }
  return {
    title: `${project.title} | פרויקטים | WDI`,
    description:
      project.scope || project.description || `פרויקט ${project.title} מבית WDI`,
  };
}

/* ── Page ────────────────────────────────────────────────────── */

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) notFound();

  const featuredImageUrl = sanityImageUrl(project.featuredImage);
  const sectorLabel = project.sector
    ? SECTOR_LABELS[project.sector]
    : null;

  const images: any[] = project.images ?? [];
  const testimonials: any[] = project.linkedTestimonials ?? [];

  return (
    <article className="py-16 lg:py-24" dir="rtl">
      {/* JSON-LD */}
      <ProjectJsonLd project={project} />
      {testimonials.map((t) => (
        <ReviewJsonLd
          key={t._id}
          testimonial={t}
          itemReviewed={project.title}
        />
      ))}

      <div className="max-w-container mx-auto px-4 lg:px-8">
        {/* Breadcrumb */}
        <nav aria-label="מיקום" className="mb-8 text-sm text-gray-500">
          <ol className="flex items-center gap-2">
            <li>
              <Link href="/" className="hover:text-wdi-primary transition">
                דף הבית
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <Link href="/projects" className="hover:text-wdi-primary transition">
                פרויקטים
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li className="text-wdi-primary font-medium">{project.title}</li>
          </ol>
        </nav>

        {/* Hero image */}
        {featuredImageUrl && (
          <div className="relative h-64 lg:h-[28rem] w-full rounded-2xl overflow-hidden mb-10">
            <Image
              src={featuredImageUrl}
              alt={project.title}
              fill
              className="object-cover"
              sizes="(max-width: 1200px) 100vw, 1200px"
              priority
            />
            {sectorLabel && (
              <span className="absolute top-4 start-4 bg-wdi-secondary text-white text-sm font-bold px-4 py-1.5 rounded-full">
                {sectorLabel}
              </span>
            )}
          </div>
        )}

        {/* Title + meta */}
        <header className="mb-10">
          <h1 className="text-3xl lg:text-5xl font-bold text-wdi-primary mb-4">
            {project.title}
          </h1>

          {/* Meta details */}
          <div className="flex flex-wrap gap-x-8 gap-y-3 text-gray-600">
            {project.client && (
              <div>
                <span className="font-semibold text-gray-800">לקוח: </span>
                {project.client}
              </div>
            )}
            {sectorLabel && !featuredImageUrl && (
              <div>
                <span className="font-semibold text-gray-800">מגזר: </span>
                <span className="inline-block bg-wdi-secondary/10 text-wdi-secondary text-sm font-medium px-3 py-0.5 rounded-full">
                  {sectorLabel}
                </span>
              </div>
            )}
            {project.location && (
              <div>
                <span className="font-semibold text-gray-800">מיקום: </span>
                {project.location}
              </div>
            )}
            {project.startDate && (
              <div>
                <span className="font-semibold text-gray-800">תאריך התחלה: </span>
                {project.startDate}
              </div>
            )}
            {project.completedAt && (
              <div>
                <span className="font-semibold text-gray-800">תאריך סיום: </span>
                {project.completedAt}
              </div>
            )}
          </div>
        </header>

        {/* Scope */}
        {project.scope && (
          <section className="mb-10 bg-gray-50 rounded-2xl p-6 lg:p-8">
            <h2 className="text-xl font-bold text-wdi-primary mb-3">
              היקף הפרויקט
            </h2>
            <p className="text-gray-700 leading-relaxed">{project.scope}</p>
          </section>
        )}

        {/* Description (rich text) */}
        {project.description && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-wdi-primary mb-6">
              תיאור הפרויקט
            </h2>
            <div className="prose prose-lg max-w-none">
              {typeof project.description === 'string' ? (
                <p className="text-gray-700 leading-relaxed">
                  {project.description}
                </p>
              ) : (
                <PortableText value={project.description} />
              )}
            </div>
          </section>
        )}

        {/* Image gallery */}
        {images.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-wdi-primary mb-6">
              גלריית תמונות
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {images.map(
                (
                  img: { asset?: { _ref?: string }; _key?: string },
                  index: number,
                ) => {
                  const url = sanityImageUrl(img);
                  if (!url) return null;
                  return (
                    <div
                      key={img._key ?? index}
                      className="relative h-56 rounded-xl overflow-hidden"
                    >
                      <Image
                        src={url}
                        alt={`${project.title} - תמונה ${index + 1}`}
                        fill
                        className="object-cover hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    </div>
                  );
                },
              )}
            </div>
          </section>
        )}

        {/* Testimonials */}
        {testimonials.length > 0 && (
          <section className="mb-12 border-t border-gray-200 pt-12">
            <h2 className="text-2xl font-bold text-wdi-primary mb-8">
              מה אומרים עלינו
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {testimonials.map(
                (testimonial: {
                  _id: string;
                  clientName: string;
                  quote: string;
                  companyName?: string;
                  role?: string;
                  image?: { asset?: { _ref?: string } };
                }) => {
                  const avatarUrl = sanityImageUrl(testimonial.image);
                  return (
                    <blockquote
                      key={testimonial._id}
                      className="bg-gray-50 rounded-2xl p-6 lg:p-8"
                    >
                      <p className="text-gray-700 leading-relaxed mb-4 italic">
                        &ldquo;{testimonial.quote}&rdquo;
                      </p>
                      <footer className="flex items-center gap-3">
                        {avatarUrl && (
                          <Image
                            src={avatarUrl}
                            alt={testimonial.clientName}
                            width={48}
                            height={48}
                            className="rounded-full object-cover"
                          />
                        )}
                        <div>
                          <cite className="not-italic font-semibold text-gray-900">
                            {testimonial.clientName}
                          </cite>
                          {(testimonial.role || testimonial.companyName) && (
                            <p className="text-sm text-gray-500">
                              {[testimonial.role, testimonial.companyName]
                                .filter(Boolean)
                                .join(' | ')}
                            </p>
                          )}
                        </div>
                      </footer>
                    </blockquote>
                  );
                },
              )}
            </div>
          </section>
        )}

        {/* CTA */}
        <section className="text-center bg-wdi-primary rounded-2xl p-8 lg:p-12">
          <h2 className="text-2xl lg:text-3xl font-bold text-white mb-4">
            יש לכם פרויקט דומה?
          </h2>
          <p className="text-white/80 mb-6 max-w-xl mx-auto">
            נשמח לשמוע על הצרכים שלכם ולספק פתרון מותאם.
          </p>
          <Link
            href="/contact"
            className="inline-block bg-wdi-secondary hover:bg-wdi-secondary-light text-white font-semibold px-8 py-3 rounded-lg transition"
          >
            צרו קשר
          </Link>
        </section>
      </div>
    </article>
  );
}
