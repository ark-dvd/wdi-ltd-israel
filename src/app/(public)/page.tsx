/**
 * Homepage — DOC-070 §3.1
 * ONLY Hero section + Footer (Footer is from layout).
 * Full-screen video background, headline, subheadline, two CTA buttons.
 * All content from heroSettings singleton in Sanity.
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
    title: settings?.seoTitle ?? 'WDI | מאתגר להצלחה',
    description:
      settings?.seoDescription ??
      'WDI - חברת בוטיק לניהול פרויקטים, פיקוח וייעוץ הנדסי',
    alternates: { canonical: '/' },
  };
}

export default async function HomePage() {
  const [hero, settings] = await Promise.all([
    getHeroSettings(),
    getSiteSettings(),
  ]);

  // Video URL: from Sanity file reference (resolved via GROQ), fallback to local static
  const videoUrl = hero?.videoFileUrl ?? '/videos/hero-video.mp4';

  return (
    <>
      <LocalBusinessJsonLd settings={settings} />

      {/* Hero — DOC-070 §3.1: full-screen video, headline, subheadline, 2 CTAs */}
      <section className="hero" id="hero" aria-label="מסך פתיחה">
        <HeroVideo videoUrl={videoUrl} />
        <div className="hero-overlay" aria-hidden="true" />
        <div className="hero-content">
          <h1>{hero?.headline ?? 'מאתגר להצלחה'}</h1>
          {hero?.subheadline && <p>{hero.subheadline}</p>}
          <div className="hero-buttons">
            <Link
              href={hero?.ctaLink ?? '/contact'}
              className="btn btn-primary"
            >
              {hero?.ctaText ?? 'צור קשר'}
            </Link>
            <Link
              href={hero?.cta2Link ?? '/services'}
              className="btn btn-outline-light"
            >
              {hero?.cta2Text ?? 'תחומי עיסוק'}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
