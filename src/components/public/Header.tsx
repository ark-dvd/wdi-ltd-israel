/**
 * Public site header — ORIGINAL_DESIGN_SPEC §3, DOC-070 §2.1
 * Server component: fetches services for dynamic dropdown + footer.
 */
import { getActiveServices } from '@/lib/data-fetchers';
import { HeaderClient } from './HeaderClient';

export async function Header() {
  const services = await getActiveServices();

  const serviceLinks = services.map((s: { name: string; slug: string | { current: string } }) => ({
    name: s.name,
    slug: typeof s.slug === 'string' ? s.slug : s.slug?.current ?? '',
  }));

  return <HeaderClient serviceLinks={serviceLinks} />;
}
