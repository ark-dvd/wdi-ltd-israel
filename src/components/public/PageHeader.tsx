/**
 * Reusable page header for sub-pages — ORIGINAL_DESIGN_SPEC §6
 * Gradient background (primary→primary-dark), breadcrumb, h1, subtitle.
 * 160px top padding accounts for fixed header.
 */
import Link from 'next/link';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumb?: string;
}

export function PageHeader({ title, subtitle, breadcrumb }: PageHeaderProps) {
  return (
    <section className="page-header">
      <div className="container">
        <nav className="breadcrumb" aria-label="מיקום">
          <Link href="/">עמוד הבית</Link>
          <span className="breadcrumb-sep">‹</span>
          <span>{breadcrumb ?? title}</span>
        </nav>
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
    </section>
  );
}
