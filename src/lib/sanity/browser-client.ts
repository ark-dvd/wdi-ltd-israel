import { createClient } from '@sanity/client';

/**
 * Browser-safe Sanity client for direct asset uploads.
 * Uses NEXT_PUBLIC_ env vars so it's available in client bundles.
 * Falls back to the same token as SANITY_API_TOKEN when available.
 */
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? '';
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? 'production';
const token = process.env.NEXT_PUBLIC_SANITY_WRITE_TOKEN ?? '';
const apiVersion = '2026-02-19';

export const sanityBrowserClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  token,
});
