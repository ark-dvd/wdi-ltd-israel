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

/** Read-only client for SSR rendering and public reads — CDN enabled, published perspective only */
export const sanityClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  token,
  perspective: 'published',
});

/** Write client for admin mutations and reads needing fresh data — CDN disabled */
export const sanityWriteClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  token,
});
