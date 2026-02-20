/**
 * Services listing page — /services
 * Server component: grid of active service cards.
 */
import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { getActiveServices } from '@/lib/data-fetchers';
import { sanityImageUrl } from '@/lib/sanity/image';

export const metadata: Metadata = {
  title: 'שירותים | WDI',
  description:
    'מגוון שירותי ניהול פרויקטים, פיקוח וייעוץ הנדסי של WDI — חברת בוטיק מובילה בישראל.',
  alternates: { canonical: '/services' },
};

export default async function ServicesPage() {
  const services = await getActiveServices();

  return (
    <section className="py-16 lg:py-24" dir="rtl">
      <div className="max-w-container mx-auto px-4 lg:px-8">
        {/* Page heading */}
        <header className="mb-12 text-center">
          <h1 className="text-4xl lg:text-5xl font-bold text-wdi-primary mb-4">
            השירותים שלנו
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            WDI מציעה מגוון שירותי ניהול פרויקטים, פיקוח וייעוץ הנדסי ברמה
            הגבוהה ביותר — מהתכנון ועד המסירה.
          </p>
        </header>

        {/* Services grid */}
        {services.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map(
              (service: {
                _id: string;
                name: string;
                slug: string | { current: string };
                tagline?: string;
                description?: string;
                image?: { asset?: { _ref?: string } };
              }) => {
                const slug =
                  typeof service.slug === 'string'
                    ? service.slug
                    : service.slug?.current;
                const imageUrl = sanityImageUrl(service.image);

                return (
                  <article
                    key={service._id}
                    className="group rounded-2xl border border-gray-200 bg-white shadow-wdi-sm hover:shadow-wdi-lg transition-shadow duration-300 overflow-hidden"
                  >
                    {imageUrl && (
                      <div className="relative h-48 w-full overflow-hidden">
                        <Image
                          src={imageUrl}
                          alt={service.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        />
                      </div>
                    )}

                    <div className="p-6">
                      <h2 className="text-xl font-bold text-wdi-primary mb-2">
                        {service.name}
                      </h2>

                      {service.tagline && (
                        <p className="text-wdi-secondary font-medium text-sm mb-3">
                          {service.tagline}
                        </p>
                      )}

                      {service.description && (
                        <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-3">
                          {service.description}
                        </p>
                      )}

                      <Link
                        href={`/services/${slug}`}
                        className="inline-flex items-center gap-1 text-sm font-semibold text-wdi-primary hover:text-wdi-primary-light transition"
                      >
                        למידע נוסף
                        <span aria-hidden="true">&larr;</span>
                      </Link>
                    </div>
                  </article>
                );
              },
            )}
          </div>
        ) : (
          <p className="text-center text-gray-500 py-12">
            אין שירותים להצגה כרגע.
          </p>
        )}
      </div>
    </section>
  );
}
