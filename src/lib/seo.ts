/**
 * Centralized SEO metadata builder — matching kashoor/igaldavidi pattern.
 * Generates full openGraph, twitter, canonical, hreflang for every page.
 * Fetches siteSettings.ogImage as global fallback OG image.
 */
import type { Metadata } from 'next';
import { sanityFetch } from '@/lib/sanity/client';

export const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://wdi.co.il';

let cachedSettings: any = null;

async function getCachedSettings() {
  if (cachedSettings) return cachedSettings;
  cachedSettings = await sanityFetch(
    `*[_type == "siteSettings"][0]{
      companyName,
      companyNameEn,
      seoDescription,
      "ogImageUrl": ogImage.asset->url
    }`,
  );
  return cachedSettings;
}

interface BuildMetadataOptions {
  title: string;
  description?: string;
  path: string;
  ogImage?: string;
  type?: 'website' | 'article';
  noIndex?: boolean;
}

export async function buildMetadata(options: BuildMetadataOptions): Promise<Metadata> {
  const settings = await getCachedSettings();
  const {
    title,
    description,
    path,
    ogImage,
    type = 'website',
    noIndex,
  } = options;

  const pageDescription =
    description || settings?.seoDescription || 'WDI — חברת בוטיק לניהול פרויקטים, פיקוח וייעוץ הנדסי בישראל.';
  const canonicalUrl = `${BASE_URL}${path}`;
  const ogImageUrl = ogImage || settings?.ogImageUrl || `${BASE_URL}/images/wdi-logo.png`;
  const siteName = settings?.companyNameEn || settings?.companyName || 'WDI';

  return {
    title,
    description: pageDescription,
    alternates: {
      canonical: canonicalUrl,
      languages: { he: canonicalUrl },
    },
    openGraph: {
      title,
      description: pageDescription,
      url: canonicalUrl,
      siteName,
      locale: 'he_IL',
      type: type === 'article' ? 'article' : 'website',
      ...(ogImageUrl && {
        images: [{ url: ogImageUrl, width: 1200, height: 630, alt: title }],
      }),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: pageDescription,
      ...(ogImageUrl && { images: [ogImageUrl] }),
    },
    ...(noIndex && { robots: { index: false, follow: true } }),
  };
}
