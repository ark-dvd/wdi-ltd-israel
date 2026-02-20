/**
 * GET /api/admin/activities/recent — Recent activities feed
 * DOC-040 §2.5
 */
import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/auth/guard';
import { sanityClient } from '@/lib/sanity/client';
import { successResponse, serverError } from '@/lib/api/response';

export const GET = withAuth(async (request: NextRequest) => {
  try {
    const url = new URL(request.url);
    const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get('limit') ?? '20', 10) || 20));

    const activities = await sanityClient.fetch(
      `*[_type == "activity"] | order(createdAt desc) [0...$limit]{
        _id, entityType, entityId, type, description, performedBy, metadata, createdAt
      }`,
      { limit },
    );

    return successResponse(activities);
  } catch (err) {
    console.error('[api]', err);
    return serverError();
  }
});
