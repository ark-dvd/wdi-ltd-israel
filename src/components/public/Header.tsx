/**
 * Public site header — ORIGINAL_DESIGN_SPEC §3, DOC-070 §2.1
 * Server component: fetches services for dynamic dropdown + logos + nav labels from CMS.
 * INV-P01: nav labels from CMS. INV-P02: logos from CMS.
 */
import { getActiveServices, getSiteSettings } from '@/lib/data-fetchers';
import { HeaderClient } from './HeaderClient';

export async function Header() {
  const [services, settings] = await Promise.all([
    getActiveServices(),
    getSiteSettings(),
  ]);

  const serviceLinks = services.map((s: { name: string; slug: string | { current: string } }) => ({
    name: s.name,
    slug: typeof s.slug === 'string' ? s.slug : s.slug?.current ?? '',
  }));

  return (
    <HeaderClient
      serviceLinks={serviceLinks}
      logoWhiteUrl={settings?.logoWhiteUrl ?? ''}
      logoDarkUrl={settings?.logoDarkUrl ?? ''}
      companyName={settings?.companyName ?? ''}
      navLabels={settings?.navLabels ?? {}}
    />
  );
}
