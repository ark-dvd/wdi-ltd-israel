/**
 * Homepage — DOC-070 §3.1
 * ONLY Hero section + Footer (Footer is from layout).
 * Full-screen video background, headline, subheadline, two CTA buttons.
 * All content from heroSettings singleton in Sanity.
 * INV-P01: NO hardcoded Hebrew. INV-P02: NO local media fallback.
 */
import type { Metadata } from 'next';
import Link from 'next/link';
import { getHeroSettings, getSiteSettings } from '@/lib/data-fetchers';
import { HeroVideo } from '@/components/public/HeroVideo';
import { LocalBusinessJsonLd } from '@/components/public/JsonLd';

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return {
    title: settings?.seoTitle ?? 'WDI',
    description: settings?.seoDescription ?? '',
    alternates: { canonical: '/' },
  };
}

export default async function HomePage() {
  const [hero, settings] = await Promise.all([
    getHeroSettings(),
    getSiteSettings(),
  ]);

  // Video URL: from Sanity file upload only — NO local fallback (INV-P02)
  const videoUrl = hero?.videoFileUrl ?? '';

  return (
    <>
      <LocalBusinessJsonLd settings={settings} />

      {/* Hero — DOC-070 §3.1: full-screen video, headline, subheadline, 2 CTAs */}
      <section className="hero" id="hero" aria-label="hero">
        {videoUrl && <HeroVideo videoUrl={videoUrl} />}
        <div className="hero-overlay" aria-hidden="true" />
        <div className="hero-content">
          <h1>{hero?.headline ?? ''}</h1>
          {hero?.subheadline && <p>{hero.subheadline}</p>}
          <div className="hero-buttons">
            {hero?.ctaText && (
              <Link
                href={hero.ctaLink ?? '/contact'}
                className="btn btn-primary"
              >
                {hero.ctaText}
              </Link>
            )}
            {hero?.cta2Text && (
              <Link
                href={hero.cta2Link ?? '/services'}
                className="btn btn-outline-light"
              >
                {hero.cta2Text}
              </Link>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
