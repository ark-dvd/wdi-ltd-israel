/**
 * JSON-LD structured data components — DOC-060 §6.2, §6.3
 * Rich Schema.org markup for SEO + GEO optimization.
 * INV-P01: org name + description from CMS siteSettings.
 */

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://wdi-israel.co.il';

function JsonLdScript({ data }: { data: Record<string, any> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

/** Organization — all pages (global) */
export function OrganizationJsonLd({ settings }: { settings?: { companyName?: string; companyNameEn?: string; companyDescription?: string; socialLinks?: { linkedin?: string; facebook?: string; instagram?: string } } }) {
  const sameAs = [
    settings?.socialLinks?.linkedin,
    settings?.socialLinks?.facebook,
    settings?.socialLinks?.instagram,
  ].filter(Boolean);

  return (
    <JsonLdScript
      data={{
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: settings?.companyNameEn ?? settings?.companyName ?? '',
        url: SITE_URL,
        logo: `${SITE_URL}/logo.png`,
        description: settings?.companyDescription ?? '',
        areaServed: { '@type': 'Country', name: 'Israel' },
        ...(sameAs.length > 0 ? { sameAs } : {}),
        contactPoint: {
          '@type': 'ContactPoint',
          contactType: 'customer service',
          availableLanguage: ['Hebrew', 'English'],
        },
      }}
    />
  );
}

/** LocalBusiness — homepage + contact page */
export function LocalBusinessJsonLd({ settings }: { settings?: { companyName?: string; companyNameEn?: string; phone?: string; email?: string; address?: string } }) {
  return (
    <JsonLdScript
      data={{
        '@context': 'https://schema.org',
        '@type': 'LocalBusiness',
        '@id': `${SITE_URL}/#localbusiness`,
        name: settings?.companyNameEn ?? settings?.companyName ?? '',
        url: SITE_URL,
        telephone: settings?.phone,
        email: settings?.email,
        address: settings?.address
          ? { '@type': 'PostalAddress', streetAddress: settings.address, addressCountry: 'IL' }
          : undefined,
        areaServed: { '@type': 'Country', name: 'Israel' },
        priceRange: '$$$$',
      }}
    />
  );
}

/** Service — /services/[slug] */
export function ServiceJsonLd({ service, companyName }: { service: any; companyName?: string }) {
  return (
    <JsonLdScript
      data={{
        '@context': 'https://schema.org',
        '@type': 'Service',
        name: service.name,
        description: service.tagline || service.description,
        provider: {
          '@type': 'Organization',
          name: companyName ?? '',
          url: SITE_URL,
        },
        areaServed: { '@type': 'Country', name: 'Israel' },
        serviceType: service.name,
        url: `${SITE_URL}/services/${service.slug?.current ?? service.slug}`,
      }}
    />
  );
}

/** Project — /projects/[slug] */
export function ProjectJsonLd({ project, companyName }: { project: any; companyName?: string }) {
  return (
    <JsonLdScript
      data={{
        '@context': 'https://schema.org',
        '@type': 'CreativeWork',
        name: project.title,
        description: project.scope || project.description,
        creator: {
          '@type': 'Organization',
          name: companyName ?? '',
          url: SITE_URL,
        },
        locationCreated: project.location
          ? { '@type': 'Place', name: project.location }
          : undefined,
        url: `${SITE_URL}/projects/${project.slug?.current ?? project.slug}`,
        genre: project.sector,
        dateCreated: project.startDate,
        datePublished: project.completedAt,
      }}
    />
  );
}

/** Person — /team */
export function PersonJsonLd({ person, companyName }: { person: any; companyName?: string }) {
  return (
    <JsonLdScript
      data={{
        '@context': 'https://schema.org',
        '@type': 'Person',
        name: person.name,
        jobTitle: person.role,
        worksFor: {
          '@type': 'Organization',
          name: companyName ?? '',
          url: SITE_URL,
        },
        ...(person.linkedin ? { sameAs: [person.linkedin] } : {}),
      }}
    />
  );
}

/** JobPosting — /jobs */
export function JobPostingJsonLd({ job, companyName }: { job: any; companyName?: string }) {
  return (
    <JsonLdScript
      data={{
        '@context': 'https://schema.org',
        '@type': 'JobPosting',
        title: job.title,
        hiringOrganization: {
          '@type': 'Organization',
          name: companyName ?? '',
          url: SITE_URL,
        },
        jobLocation: job.location
          ? { '@type': 'Place', address: { '@type': 'PostalAddress', addressLocality: job.location, addressCountry: 'IL' } }
          : undefined,
        datePosted: new Date().toISOString().split('T')[0],
      }}
    />
  );
}

/** FAQPage — /services/[slug] */
export function FAQPageJsonLd({ questions }: { questions: { question: string; answer: string }[] }) {
  if (questions.length === 0) return null;
  return (
    <JsonLdScript
      data={{
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: questions.map((q) => ({
          '@type': 'Question',
          name: q.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: q.answer,
          },
        })),
      }}
    />
  );
}

/** Review — testimonials */
export function ReviewJsonLd({ testimonial, itemReviewed }: { testimonial: any; itemReviewed?: string }) {
  return (
    <JsonLdScript
      data={{
        '@context': 'https://schema.org',
        '@type': 'Review',
        author: {
          '@type': 'Person',
          name: testimonial.clientName,
          ...(testimonial.companyName ? { worksFor: { '@type': 'Organization', name: testimonial.companyName } } : {}),
        },
        reviewBody: testimonial.quote,
        itemReviewed: {
          '@type': 'Organization',
          name: itemReviewed ?? '',
        },
      }}
    />
  );
}
