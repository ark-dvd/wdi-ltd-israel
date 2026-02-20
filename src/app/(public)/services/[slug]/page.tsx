/**
 * Service detail page — /services/[slug]
 * Server component with SSG via generateStaticParams.
 * Includes rich-text body, highlights, FAQ section, and JSON-LD.
 */
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getActiveServices, getService } from '@/lib/data-fetchers';
import { sanityImageUrl } from '@/lib/sanity/image';
import { PortableText } from '@/components/public/PortableText';
import { ServiceJsonLd, FAQPageJsonLd } from '@/components/public/JsonLd';

/* ── SSG ─────────────────────────────────────────────────────── */

export async function generateStaticParams() {
  const services = await getActiveServices();
  return services
    .map((s: { slug: string | { current: string } }) => ({
      slug: typeof s.slug === 'string' ? s.slug : s.slug?.current ?? '',
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
  const service = await getService(slug);
  if (!service) {
    return { title: 'שירות לא נמצא | WDI' };
  }
  return {
    title: `${service.name} | שירותים | WDI`,
    description:
      service.tagline || service.description || `שירות ${service.name} מבית WDI`,
  };
}

/* ── Page ────────────────────────────────────────────────────── */

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = await getService(slug);
  if (!service) notFound();

  const imageUrl = sanityImageUrl(service.image);

  /* FAQ generation per DOC-060 §6.3 */
  const faqItems: { question: string; answer: string }[] = [
    {
      question: `מה כולל שירות ${service.name}?`,
      answer:
        service.tagline ||
        service.description ||
        `שירות ${service.name} כולל ליווי מקצועי מקיף מצוות WDI.`,
    },
    {
      question: `למי מיועד שירות ${service.name}?`,
      answer: `שירות ${service.name} מיועד ליזמים, חברות בנייה, גופים ציבוריים וארגונים המחפשים ליווי הנדסי מקצועי.`,
    },
    {
      question: `מה היתרונות של ${service.name} עם WDI?`,
      answer: `WDI מציעה ניסיון עשיר, צוות מקצועי מהשורה הראשונה, ושיטות עבודה מוכחות המבטיחות תוצאות מיטביות בכל פרויקט.`,
    },
  ];

  return (
    <article className="py-16 lg:py-24" dir="rtl">
      {/* JSON-LD */}
      <ServiceJsonLd service={service} />
      <FAQPageJsonLd questions={faqItems} />

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
              <Link href="/services" className="hover:text-wdi-primary transition">
                שירותים
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li className="text-wdi-primary font-medium">{service.name}</li>
          </ol>
        </nav>

        {/* Hero section */}
        <header className="mb-12">
          {imageUrl && (
            <div className="relative h-64 lg:h-96 w-full rounded-2xl overflow-hidden mb-8">
              <Image
                src={imageUrl}
                alt={service.name}
                fill
                className="object-cover"
                sizes="(max-width: 1200px) 100vw, 1200px"
                priority
              />
            </div>
          )}

          <h1 className="text-3xl lg:text-5xl font-bold text-wdi-primary mb-4">
            {service.name}
          </h1>

          {service.tagline && (
            <p className="text-xl text-wdi-secondary font-medium">
              {service.tagline}
            </p>
          )}
        </header>

        {/* Body content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main content */}
          <section className="lg:col-span-2">
            {service.detailContent && (
              <div className="prose prose-lg max-w-none">
                <PortableText value={service.detailContent} />
              </div>
            )}

            {!service.detailContent && service.description && (
              <p className="text-gray-700 leading-relaxed text-lg">
                {service.description}
              </p>
            )}
          </section>

          {/* Sidebar: highlights */}
          {service.highlights && service.highlights.length > 0 && (
            <aside className="lg:col-span-1">
              <div className="bg-gray-50 rounded-2xl p-6 lg:p-8 sticky top-24">
                <h2 className="text-xl font-bold text-wdi-primary mb-6">
                  דגשים עיקריים
                </h2>
                <ul className="space-y-4">
                  {service.highlights.map(
                    (highlight: string, index: number) => (
                      <li key={index} className="flex items-start gap-3">
                        <span className="mt-1 flex-shrink-0 w-6 h-6 bg-wdi-secondary text-white rounded-full flex items-center justify-center text-xs font-bold">
                          {index + 1}
                        </span>
                        <span className="text-gray-700 leading-relaxed">
                          {highlight}
                        </span>
                      </li>
                    ),
                  )}
                </ul>
              </div>
            </aside>
          )}
        </div>

        {/* ── FAQ Section — DOC-060 §6.3 ─────────────────────────── */}
        <section className="mt-16 lg:mt-24 border-t border-gray-200 pt-12">
          <h2 className="text-2xl lg:text-3xl font-bold text-wdi-primary mb-8">
            שאלות נפוצות
          </h2>

          <dl className="space-y-6">
            {faqItems.map((faq, index) => (
              <div
                key={index}
                className="bg-gray-50 rounded-xl p-6"
              >
                <dt>
                  <h2 className="text-lg font-semibold text-gray-900 mb-2">
                    {faq.question}
                  </h2>
                </dt>
                <dd className="text-gray-600 leading-relaxed">
                  {faq.answer}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        {/* CTA */}
        <section className="mt-16 text-center bg-wdi-primary rounded-2xl p-8 lg:p-12">
          <h2 className="text-2xl lg:text-3xl font-bold text-white mb-4">
            מעוניינים בשירות {service.name}?
          </h2>
          <p className="text-white/80 mb-6 max-w-xl mx-auto">
            צוות WDI ישמח לשמוע על הפרויקט שלכם ולהציע פתרון מותאם אישית.
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
