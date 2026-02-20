'use client';

/**
 * Client-side project filtering by sector — ORIGINAL_DESIGN_SPEC §8.4
 * Pill-shaped filter buttons + project cards grid.
 */
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface ProjectCard {
  _id: string;
  title: string;
  slug: string;
  client?: string;
  sector: string;
  sectorLabel: string | null;
  imgUrl: string;
}

interface ProjectsFilterProps {
  projects: ProjectCard[];
  sectorLabels: Record<string, string>;
}

export function ProjectsFilter({ projects, sectorLabels }: ProjectsFilterProps) {
  const [active, setActive] = useState('all');

  // Get unique sectors that have projects
  const sectors = Object.entries(sectorLabels).filter(
    ([key]) => projects.some((p) => p.sector === key)
  );

  const filtered = active === 'all' ? projects : projects.filter((p) => p.sector === active);

  return (
    <>
      {/* Filter Buttons */}
      <div className="filter-buttons">
        <button
          className={`filter-btn${active === 'all' ? ' active' : ''}`}
          onClick={() => setActive('all')}
          type="button"
        >
          הכל
        </button>
        {sectors.map(([key, label]) => (
          <button
            key={key}
            className={`filter-btn${active === key ? ' active' : ''}`}
            onClick={() => setActive(key)}
            type="button"
          >
            {label}
          </button>
        ))}
      </div>

      {/* Projects Grid */}
      <div className="projects-grid">
        {filtered.map((p) => (
          <Link key={p._id} href={`/projects/${p.slug}`} className="project-card animate-on-scroll">
            <div className="project-card-image">
              {p.imgUrl ? (
                <Image src={p.imgUrl} alt={p.title} width={600} height={450} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: '100%', height: '100%', background: 'var(--gray-200)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ color: 'var(--gray-400)', fontSize: '2rem', fontWeight: 700 }}>WDI</span>
                </div>
              )}
              <div className="project-card-overlay">
                {p.sectorLabel && <span className="project-card-category">{p.sectorLabel}</span>}
                <h3>{p.title}</h3>
                {p.client && <p>{p.client}</p>}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {filtered.length === 0 && (
        <p style={{ textAlign: 'center', color: 'var(--gray-500)', padding: '40px 0' }}>
          לא נמצאו פרויקטים בקטגוריה זו
        </p>
      )}
    </>
  );
}
