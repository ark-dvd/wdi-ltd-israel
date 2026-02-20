/**
 * Public site header — DOC-030 §3, DOC-060 §6.1
 * Desktop nav with dynamic dropdowns for services + projects by sector.
 * Mobile hamburger menu.
 */
import Link from 'next/link';
import { getActiveServices, getActiveProjects } from '@/lib/data-fetchers';
import { HeaderClient } from './HeaderClient';

const SECTOR_LABELS: Record<string, string> = {
  security: 'בטחוני',
  commercial: 'מסחרי',
  industrial: 'תעשייה',
  infrastructure: 'תשתיות',
  residential: 'מגורים',
  public: 'ציבורי',
};

export async function Header() {
  const [services, projects] = await Promise.all([
    getActiveServices(),
    getActiveProjects(),
  ]);

  // Build sector map for projects dropdown
  const sectorMap: Record<string, { label: string; count: number }> = {};
  for (const p of projects) {
    const sector = p.sector as string;
    if (sector && SECTOR_LABELS[sector]) {
      if (!sectorMap[sector]) {
        sectorMap[sector] = { label: SECTOR_LABELS[sector]!, count: 0 };
      }
      sectorMap[sector]!.count++;
    }
  }
  const sectors = Object.entries(sectorMap).map(([key, val]) => ({
    key,
    label: val.label,
    count: val.count,
  }));

  const serviceLinks = services.map((s: { name: string; slug: { current: string } | string }) => ({
    name: s.name,
    slug: typeof s.slug === 'string' ? s.slug : s.slug?.current ?? '',
  }));

  return <HeaderClient serviceLinks={serviceLinks} sectors={sectors} />;
}
