/**
 * Homepage — DOC-060 §6.1
 * Public homepage with hero, services overview, featured projects,
 * client logos, testimonials, and CTA sections.
 * Server component — all data fetched on the server.
 */
import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import {
  getHeroSettings,
  getActiveServices,
  getActiveProjects,
  getActiveClientsContent,
  getFeaturedTestimonials,
  getSiteSettings,
} from '@/lib/data-fetchers';
import { sanityImageUrl } from '@/lib/sanity/image';
import { LocalBusinessJsonLd, ReviewJsonLd } from '@/components/public/JsonLd';

export const revalidate = 3600; // ISR: refresh from Sanity every hour

// ─── SEO Metadata ──────────────────────────────────────────

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return {
    title: settings?.seoTitle ?? 'WDI | מאתגר להצלחה',
    description:
      settings?.seoDescription ??
      'WDI - חברת בוטיק לניהול פרויקטים, פיקוח וייעוץ הנדסי',
    alternates: { canonical: '/' },
  };
}

// ─── Sector label map ──────────────────────────────────────

const SECTOR_LABELS: Record<string, string> = {
  security: 'בטחוני',
  commercial: 'מסחרי',
  industrial: 'תעשייה',
  infrastructure: 'תשתיות',
  residential: 'מגורים',
  public: 'ציבורי',
};

// ─── Slug helper ───────────────────────────────────────────

function resolveSlug(
  slug: string | { current: string } | undefined | null,
): string {
  if (!slug) return '';
  return typeof slug === 'string' ? slug : slug.current;
}

// ─── Page Component ────────────────────────────────────────

export default async function HomePage() {
  const [heroSettings, services, projects, clients, testimonials, settings] =
    await Promise.all([
      getHeroSettings(),
      getActiveServices(),
      getActiveProjects(),
      getActiveClientsContent(),
      getFeaturedTestimonials(),
      getSiteSettings(),
    ]);

  const featuredProjects = projects.filter(
    (p: { isFeatured?: boolean }) => p.isFeatured === true,
  );

  return (
    <>
      <LocalBusinessJsonLd settings={settings} />

      {/* ── Hero ──────────────────────────────────────────── */}
      <section
        aria-label="מסך פתיחה"
        className="relative min-h-[70vh] flex items-center justify-center bg-gradient-to-bl from-wdi-primary via-wdi-primary-dark to-wdi-primary overflow-hidden"
      >
        {/* Decorative gradient overlay */}
        <div
          className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/10 pointer-events-none"
          aria-hidden="true"
        />
        {/* Subtle pattern accent */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
            backgroundSize: '40px 40px',
          }}
          aria-hidden="true"
        />

        <div className="relative z-10 max-w-container mx-auto px-4 lg:px-8 text-center py-20">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
            {heroSettings?.headline ?? 'מאתגר להצלחה'}
          </h1>
          {heroSettings?.subheadline && (
            <p className="text-lg md:text-xl lg:text-2xl text-white/80 max-w-3xl mx-auto mb-10 leading-relaxed">
              {heroSettings.subheadline}
            </p>
          )}
          <Link
            href={heroSettings?.ctaLink ?? '/contact'}
            className="inline-block bg-wdi-secondary hover:bg-wdi-secondary-light text-white font-semibold text-lg px-8 py-4 rounded-lg transition-colors shadow-wdi-lg"
          >
            {heroSettings?.ctaText ?? 'צור קשר'}
          </Link>
        </div>
      </section>

      {/* ── Services Overview ─────────────────────────────── */}
      {services.length > 0 && (
        <section aria-label="שירותים" className="py-16 lg:py-24 bg-gray-50">
          <div className="max-w-container mx-auto px-4 lg:px-8">
            <h2 className="text-3xl lg:text-4xl font-bold text-wdi-primary text-center mb-12">
              השירותים שלנו
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {services.map(
                (service: {
                  _id: string;
                  name: string;
                  slug: string | { current: string };
                  tagline?: string;
                  icon?: string;
                }) => (
                  <article key={service._id}>
                    <Link
                      href={`/services/${resolveSlug(service.slug)}`}
                      className="block bg-white rounded-xl p-6 lg:p-8 shadow-wdi-sm hover:shadow-wdi-lg transition-shadow h-full group"
                    >
                      {service.icon && (
                        <span
                          className="text-3xl mb-4 block"
                          aria-hidden="true"
                        >
                          {service.icon}
                        </span>
                      )}
                      <h3 className="text-xl font-bold text-wdi-primary mb-2 group-hover:text-wdi-primary-light transition-colors">
                        {service.name}
                      </h3>
                      {service.tagline && (
                        <p className="text-gray-600 text-sm leading-relaxed">
                          {service.tagline}
                        </p>
                      )}
                    </Link>
                  </article>
                ),
              )}
            </div>
          </div>
        </section>
      )}

      {/* ── Featured Projects ─────────────────────────────── */}
      {featuredProjects.length > 0 && (
        <section aria-label="פרויקטים נבחרים" className="py-16 lg:py-24">
          <div className="max-w-container mx-auto px-4 lg:px-8">
            <h2 className="text-3xl lg:text-4xl font-bold text-wdi-primary text-center mb-12">
              פרויקטים נבחרים
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {featuredProjects.map(
                (project: {
                  _id: string;
                  title: string;
                  slug: string | { current: string };
                  client?: string;
                  sector?: string;
                  featuredImage?: {
                    asset?: { _ref?: string };
                  };
                }) => {
                  const imageUrl = project.featuredImage
                    ? sanityImageUrl(project.featuredImage)
                    : '';
                  const sectorLabel = project.sector
                    ? SECTOR_LABELS[project.sector]
                    : null;

                  return (
                    <article key={project._id}>
                      <Link
                        href={`/projects/${resolveSlug(project.slug)}`}
                        className="block bg-white rounded-xl overflow-hidden shadow-wdi-sm hover:shadow-wdi-lg transition-shadow group h-full"
                      >
                        {/* Project image */}
                        <div className="relative h-48 bg-gray-200 overflow-hidden">
                          {imageUrl ? (
                            <Image
                              src={imageUrl}
                              alt={project.title}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-500"
                              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center bg-wdi-primary/10">
                              <span className="text-wdi-primary/30 text-4xl font-bold">
                                WDI
                              </span>
                            </div>
                          )}
                          {/* Sector badge */}
                          {sectorLabel && (
                            <span className="absolute top-3 start-3 bg-wdi-secondary text-white text-xs font-semibold px-3 py-1 rounded-full">
                              {sectorLabel}
                            </span>
                          )}
                        </div>
                        {/* Project info */}
                        <div className="p-5">
                          <h3 className="text-lg font-bold text-wdi-primary mb-1 group-hover:text-wdi-primary-light transition-colors">
                            {project.title}
                          </h3>
                          {project.client && (
                            <p className="text-gray-500 text-sm">
                              {project.client}
                            </p>
                          )}
                        </div>
                      </Link>
                    </article>
                  );
                },
              )}
            </div>
            <div className="text-center mt-10">
              <Link
                href="/projects"
                className="inline-block text-wdi-primary font-semibold hover:text-wdi-primary-light transition-colors border-b-2 border-wdi-secondary pb-1"
              >
                לכל הפרויקטים
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── Client Logos ──────────────────────────────────── */}
      {clients.length > 0 && (
        <section
          aria-label="לקוחות"
          className="py-16 lg:py-24 bg-gray-50"
        >
          <div className="max-w-container mx-auto px-4 lg:px-8">
            <h2 className="text-3xl lg:text-4xl font-bold text-wdi-primary text-center mb-12">
              הלקוחות שלנו
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 items-center justify-items-center">
              {clients.map(
                (client: {
                  _id: string;
                  name: string;
                  logo?: { asset?: { _ref?: string } };
                  websiteUrl?: string;
                }) => {
                  const logoUrl = client.logo
                    ? sanityImageUrl(client.logo)
                    : '';

                  const content = logoUrl ? (
                    <Image
                      src={logoUrl}
                      alt={client.name}
                      width={120}
                      height={60}
                      className="object-contain max-h-14 w-auto grayscale hover:grayscale-0 transition-all opacity-70 hover:opacity-100"
                    />
                  ) : (
                    <span className="text-sm font-semibold text-gray-500 hover:text-wdi-primary transition-colors">
                      {client.name}
                    </span>
                  );

                  return (
                    <div
                      key={client._id}
                      className="flex items-center justify-center h-20"
                    >
                      {client.websiteUrl ? (
                        <a
                          href={client.websiteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={client.name}
                        >
                          {content}
                        </a>
                      ) : (
                        content
                      )}
                    </div>
                  );
                },
              )}
            </div>
          </div>
        </section>
      )}

      {/* ── Featured Testimonials ─────────────────────────── */}
      {testimonials.length > 0 && (
        <section
          aria-label="המלצות"
          className="py-16 lg:py-24"
        >
          <div className="max-w-container mx-auto px-4 lg:px-8">
            <h2 className="text-3xl lg:text-4xl font-bold text-wdi-primary text-center mb-12">
              מה הלקוחות אומרים
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {testimonials.map(
                (testimonial: {
                  _id: string;
                  clientName: string;
                  quote: string;
                  companyName?: string;
                  role?: string;
                  projectTitle?: string;
                }) => (
                  <article
                    key={testimonial._id}
                    className="bg-white rounded-xl p-6 lg:p-8 shadow-wdi-sm border border-gray-100"
                  >
                    <ReviewJsonLd testimonial={testimonial} />
                    {/* Quote mark */}
                    <span
                      className="text-5xl text-wdi-secondary/30 leading-none block mb-3"
                      aria-hidden="true"
                    >
                      &ldquo;
                    </span>
                    <blockquote className="text-gray-700 leading-relaxed mb-6">
                      {testimonial.quote}
                    </blockquote>
                    <footer className="border-t border-gray-100 pt-4">
                      <p className="font-bold text-wdi-primary">
                        {testimonial.clientName}
                      </p>
                      {(testimonial.role || testimonial.companyName) && (
                        <p className="text-sm text-gray-500">
                          {[testimonial.role, testimonial.companyName]
                            .filter(Boolean)
                            .join(' | ')}
                        </p>
                      )}
                      {testimonial.projectTitle && (
                        <p className="text-xs text-wdi-secondary mt-1">
                          {testimonial.projectTitle}
                        </p>
                      )}
                    </footer>
                  </article>
                ),
              )}
            </div>
          </div>
        </section>
      )}

      {/* ── CTA ───────────────────────────────────────────── */}
      <section
        aria-label="יצירת קשר"
        className="py-16 lg:py-24 bg-wdi-primary text-white"
      >
        <div className="max-w-container mx-auto px-4 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-6">
            בואו נדבר על הפרויקט הבא שלכם
          </h2>
          <p className="text-white/70 text-lg max-w-2xl mx-auto mb-10">
            צוות WDI מוכן ללוות אתכם מהרעיון ועד למסירה. נשמח לשמוע על האתגר
            הבא שלכם.
          </p>
          <Link
            href="/contact"
            className="inline-block bg-wdi-secondary hover:bg-wdi-secondary-light text-white font-semibold text-lg px-8 py-4 rounded-lg transition-colors shadow-wdi-lg"
          >
            צור קשר
          </Link>
        </div>
      </section>
    </>
  );
}
