/**
 * Projects listing — ORIGINAL_DESIGN_SPEC §8, DOC-070 §3.7
 * PageHeader, filter buttons by sector, project cards grid.
 * INV-P01: ALL text from CMS — no hardcoded Hebrew.
 * Sector labels come from projectsPage singleton.
 */
import type { Metadata } from 'next';
import Link from 'next/link';
import { getActiveProjects, getSiteSettings, getProjectsPage } from '@/lib/data-fetchers';
import { PageHeader } from '@/components/public/PageHeader';
import { sanityImageUrl } from '@/lib/sanity/image';
import { ProjectsFilter } from './ProjectsFilter';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Projects',
  alternates: { canonical: '/projects' },
};

export default async function ProjectsPage() {
  const [projects, settings, page] = await Promise.all([
    getActiveProjects(),
    getSiteSettings(),
    getProjectsPage(),
  ]);

  // Build sector labels from page singleton
  const sectorLabels: Record<string, string> = {};
  if (page?.sectorLabels) {
    for (const item of page.sectorLabels) {
      if (item.value && item.label) sectorLabels[item.value] = item.label;
    }
  }

  const projectCards = projects.map((p: {
    _id: string; title: string; slug: string; client?: string;
    sector?: string; featuredImage?: { asset?: { _ref?: string } };
  }) => {
    const imgUrl = p.featuredImage ? sanityImageUrl(p.featuredImage) : '';
    const sectorLabel = p.sector ? sectorLabels[p.sector] ?? '' : '';
    return {
      _id: p._id,
      title: p.title,
      slug: p.slug,
      client: p.client,
      sector: p.sector ?? '',
      sectorLabel,
      imgUrl,
    };
  });

  return (
    <>
      <PageHeader title={page?.pageTitle ?? ''} subtitle={page?.subtitle ?? ''} />

      <section className="section">
        <div className="container">
          <ProjectsFilter projects={projectCards} sectorLabels={sectorLabels} />
        </div>
      </section>

      {/* CTA */}
      {(page?.ctaTitle || page?.ctaButtonText || settings?.defaultCtaTitle) && (
        <section className="cta-section">
          <div className="container">
            <h2>{page?.ctaTitle ?? settings?.defaultCtaTitle ?? ''}</h2>
            {(page?.ctaSubtitle || settings?.defaultCtaSubtitle) && <p>{page?.ctaSubtitle ?? settings?.defaultCtaSubtitle}</p>}
            <Link href={page?.ctaButtonLink ?? settings?.defaultCtaButtonLink ?? '/contact'} className="btn btn-primary">
              {page?.ctaButtonText ?? settings?.defaultCtaButtonText ?? ''}
            </Link>
          </div>
        </section>
      )}
    </>
  );
}
