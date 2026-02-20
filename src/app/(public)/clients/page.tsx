/**
 * Clients page — logo grid + testimonials. Server Component. DOC-060 §6.5
 */
import type { Metadata } from 'next';
import Image from 'next/image';
import { getActiveClientsContent, getActiveTestimonials } from '@/lib/data-fetchers';
import { sanityImageUrl } from '@/lib/sanity/image';
import { ReviewJsonLd } from '@/components/public/JsonLd';

export const metadata: Metadata = {
  title: 'לקוחות',
  description:
    'הלקוחות שסומכים על WDI — חברות מובילות במשק הישראלי. קראו המלצות ועדויות מלקוחות מרוצים על ניהול פרויקטים ופיקוח הנדסי.',
  alternates: { canonical: '/clients' },
};

export default async function ClientsPage() {
  const [clients, testimonials] = await Promise.all([
    getActiveClientsContent(),
    getActiveTestimonials(),
  ]);

  return (
    <>
      {/* JSON-LD for each testimonial */}
      {testimonials.map((t: any) => (
        <ReviewJsonLd key={t._id} testimonial={t} />
      ))}

      {/* Hero */}
      <section className="bg-wdi-primary text-white py-16 lg:py-24">
        <div className="max-w-container mx-auto px-4 lg:px-8 text-center">
          <h1 className="text-4xl lg:text-5xl font-bold mb-4">הלקוחות שלנו</h1>
          <p className="text-lg lg:text-xl text-white/80 max-w-2xl mx-auto">
            גאים לעבוד עם הארגונים המובילים במשק הישראלי
          </p>
        </div>
      </section>

      {/* Client Logo Grid */}
      <section className="py-16 lg:py-24" aria-labelledby="clients-heading">
        <div className="max-w-container mx-auto px-4 lg:px-8">
          <h2
            id="clients-heading"
            className="text-2xl lg:text-3xl font-bold text-wdi-primary mb-10 text-center"
          >
            לקוחות בוחרים ב-WDI
          </h2>

          {clients.length > 0 ? (
            <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {clients.map((client: any) => {
                const logoSrc = sanityImageUrl(client.logo);

                return (
                  <li key={client._id}>
                    <a
                      href={client.websiteUrl ?? '#'}
                      target={client.websiteUrl ? '_blank' : undefined}
                      rel={client.websiteUrl ? 'noopener noreferrer' : undefined}
                      className="flex items-center justify-center bg-white border border-gray-200 rounded-xl p-6 h-32 hover:shadow-wdi-md transition-shadow"
                      aria-label={client.name}
                    >
                      {logoSrc ? (
                        <Image
                          src={logoSrc}
                          alt={client.name}
                          width={160}
                          height={80}
                          className="object-contain max-h-16"
                        />
                      ) : (
                        <span className="text-base font-bold text-wdi-primary text-center leading-tight">
                          {client.name}
                        </span>
                      )}
                    </a>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="text-center text-gray-500 text-lg py-8">
              רשימת הלקוחות תעודכן בקרוב.
            </p>
          )}
        </div>
      </section>

      {/* Testimonials */}
      {testimonials.length > 0 && (
        <section
          className="py-16 lg:py-24 bg-gray-50"
          aria-labelledby="testimonials-heading"
        >
          <div className="max-w-container mx-auto px-4 lg:px-8">
            <h2
              id="testimonials-heading"
              className="text-2xl lg:text-3xl font-bold text-wdi-primary mb-10 text-center"
            >
              מה הלקוחות אומרים עלינו
            </h2>

            <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {testimonials.map((testimonial: any) => (
                <li
                  key={testimonial._id}
                  className="bg-white rounded-xl shadow-wdi-md p-6 lg:p-8 flex flex-col"
                >
                  {/* Quote icon */}
                  <svg
                    className="w-10 h-10 text-wdi-secondary/40 mb-4 shrink-0"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M14.017 21v-7.391C14.017 10.049 16.56 7.018 20 6l.957 2.586c-1.94.567-3.273 2.112-3.273 3.805V21h-3.667zm-10 0v-7.391C4.017 10.049 6.56 7.018 10 6l.957 2.586C9.017 9.153 7.684 10.698 7.684 12.391V21H4.017z" />
                  </svg>

                  {/* Quote body */}
                  <blockquote className="text-gray-700 leading-relaxed flex-1 mb-6">
                    {testimonial.quote}
                  </blockquote>

                  {/* Attribution */}
                  <footer className="border-t border-gray-100 pt-4">
                    <p className="font-bold text-wdi-primary">
                      {testimonial.clientName}
                    </p>
                    {(testimonial.role || testimonial.companyName) && (
                      <p className="text-sm text-gray-500 mt-1">
                        {testimonial.role}
                        {testimonial.role && testimonial.companyName && ' | '}
                        {testimonial.companyName}
                      </p>
                    )}
                    {testimonial.projectTitle && (
                      <p className="text-xs text-wdi-secondary mt-1">
                        פרויקט: {testimonial.projectTitle}
                      </p>
                    )}
                  </footer>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </>
  );
}
