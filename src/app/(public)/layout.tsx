/**
 * Public site layout — ORIGINAL_DESIGN_SPEC, DOC-070
 * Wraps all public pages with header, footer, skip-to-content, scroll animations, and global JSON-LD.
 */
import { Header } from '@/components/public/Header';
import { Footer } from '@/components/public/Footer';
import { ScrollAnimations } from '@/components/public/ScrollAnimations';
import { OrganizationJsonLd } from '@/components/public/JsonLd';
import { getSiteSettings } from '@/lib/data-fetchers';

/** Force Next.js to NEVER cache any fetch() in the public route tree */
export const fetchCache = 'force-no-store';

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSiteSettings();

  return (
    <>
      <OrganizationJsonLd settings={settings} />
      <ScrollAnimations />
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:right-2 focus:z-50 focus:bg-wdi-primary focus:text-white focus:px-4 focus:py-2 focus:rounded-lg"
      >
        דלג לתוכן הראשי
      </a>
      <Header />
      <main id="main-content">
        {children}
      </main>
      <Footer />
    </>
  );
}
