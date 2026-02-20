/**
 * Projects listing — ORIGINAL_DESIGN_SPEC §8, DOC-070 §3.7
 * PageHeader, filter buttons by sector, project cards grid.
 */
import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { getActiveProjects } from '@/lib/data-fetchers';
import { PageHeader } from '@/components/public/PageHeader';
import { sanityImageUrl } from '@/lib/sanity/image';
import { ProjectsFilter } from './ProjectsFilter';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'פרויקטים',
  description: 'פרויקטים נבחרים של WDI בתחומי הביטחון, המסחר, התשתיות ועוד',
  alternates: { canonical: '/projects' },
};

const SECTOR_LABELS: Record<string, string> = {
  security: 'בטחוני',
  commercial: 'מסחרי',
  industrial: 'תעשייה',
  infrastructure: 'תשתיות',
  residential: 'מגורים',
  public: 'ציבורי',
};

export default async function ProjectsPage() {
  const projects = await getActiveProjects();

  const projectCards = projects.map((p: {
    _id: string; title: string; slug: string; client?: string;
    sector?: string; featuredImage?: { asset?: { _ref?: string } };
  }) => {
    const imgUrl = p.featuredImage ? sanityImageUrl(p.featuredImage) : '';
    const sectorLabel = p.sector ? SECTOR_LABELS[p.sector] : null;
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
      <PageHeader title="הפרויקטים שלנו" subtitle="מבחר פרויקטים שניהלנו בהצלחה" />

      <section className="section">
        <div className="container">
          <ProjectsFilter projects={projectCards} sectorLabels={SECTOR_LABELS} />
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
