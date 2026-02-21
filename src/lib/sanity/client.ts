import { createClient } from '@sanity/client';

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? '';
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? 'production';
const token = process.env.SANITY_API_TOKEN;
const apiVersion = '2026-02-19';

if (!projectId) {
  console.error('[sanity/client] NEXT_PUBLIC_SANITY_PROJECT_ID is not set — all Sanity queries will fail.');
}
if (!token) {
  console.error('[sanity/client] SANITY_API_TOKEN is not set — mutations and private dataset reads will fail.');
}

/** Read-only client for SSR rendering and public reads */
const _readClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  token,
  perspective: 'published',
});

/**
 * Uncached Sanity fetch — always passes cache:'no-store' to bypass
 * Next.js Data Cache so public pages always show fresh content.
 */
export function sanityFetch<T = any>(query: string, params?: Record<string, unknown>): Promise<T> {
  return _readClient.fetch<T>(query, params ?? {}, { cache: 'no-store' as RequestCache });
}

/** Read client — use sanityFetch() for public reads to guarantee fresh data */
export const sanityClient = _readClient;

/** Write client for admin mutations and reads needing fresh data */
export const sanityWriteClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  token,
});
