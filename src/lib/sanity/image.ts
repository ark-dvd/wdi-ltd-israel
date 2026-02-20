/**
 * Sanity image URL builder — generates optimized CDN URLs for next/image
 */

const PROJECT_ID = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? '';
const DATASET = process.env.NEXT_PUBLIC_SANITY_DATASET ?? 'production';

interface SanityImageRef {
  _type?: string;
  asset?: { _ref?: string; _type?: string };
}

/**
 * Extracts a CDN URL from a Sanity image reference.
 * Returns empty string if the reference is invalid.
 */
export function sanityImageUrl(image: SanityImageRef | undefined | null): string {
  if (!image?.asset?._ref) return '';
  const ref = image.asset._ref;
  // Format: image-{id}-{width}x{height}-{format}
  const parts = ref.replace('image-', '').split('-');
  if (parts.length < 3) return '';
  const id = parts[0];
  const dimensions = parts[1];
  const format = parts[2];
  return `https://cdn.sanity.io/images/${PROJECT_ID}/${DATASET}/${id}-${dimensions}.${format}`;
}
