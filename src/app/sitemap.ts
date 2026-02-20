/**
 * Dynamic sitemap — sitemap.ts
 * Generates XML sitemap with all public routes, services, and projects.
 */
import type { MetadataRoute } from 'next';
import { getActiveServices, getActiveProjects } from '@/lib/data-fetchers';

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://wdi-israel.co.il';

function resolveSlug(
  slug: string | { current: string } | undefined | null,
): string {
  if (!slug) return '';
  return typeof slug === 'string' ? slug : slug.current;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [services, projects] = await Promise.all([
    getActiveServices(),
    getActiveProjects(),
  ]);

  const now = new Date();

  // ── Static pages ──────────────────────────────────────────
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/about`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/services`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/projects`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/team`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/clients`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/press`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/jobs`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/content-library`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/innovation`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/join-us`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/contact`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/terms`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/privacy`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/accessibility`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.3,
    },
  ];

  // ── Dynamic service pages ─────────────────────────────────
  const serviceRoutes: MetadataRoute.Sitemap = services.map(
    (service: { slug: string | { current: string } }) => ({
      url: `${BASE_URL}/services/${resolveSlug(service.slug)}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }),
  );

  // ── Dynamic project pages ────────────────────────────────
  const projectRoutes: MetadataRoute.Sitemap = projects.map(
    (project: { slug: string | { current: string } }) => ({
      url: `${BASE_URL}/projects/${resolveSlug(project.slug)}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }),
  );

  return [...staticRoutes, ...serviceRoutes, ...projectRoutes];
}
