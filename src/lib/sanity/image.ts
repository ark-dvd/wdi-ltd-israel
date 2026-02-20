/**
 * Sanity image & file URL builders — generates CDN URLs
 */

const PROJECT_ID = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? '';
const DATASET = process.env.NEXT_PUBLIC_SANITY_DATASET ?? 'production';

interface SanityImageRef {
  _type?: string;
  asset?: { _ref?: string; _type?: string };
}

interface SanityFileRef {
  _type?: string;
  asset?: { _ref?: string; _type?: string; url?: string };
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

/**
 * Extracts a CDN URL from a Sanity file reference.
 * File refs have format: file-{id}-{extension}
 * Returns empty string if the reference is invalid.
 */
export function sanityFileUrl(file: SanityFileRef | undefined | null): string {
  // If the asset already has a direct URL, use it
  if (file?.asset?.url) return file.asset.url;
  if (!file?.asset?._ref) return '';
  const ref = file.asset._ref;
  // Format: file-{id}-{extension}
  const parts = ref.replace('file-', '').split('-');
  if (parts.length < 2) return '';
  const id = parts[0];
  const ext = parts[1];
  return `https://cdn.sanity.io/files/${PROJECT_ID}/${DATASET}/${id}.${ext}`;
}
