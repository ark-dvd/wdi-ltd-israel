/**
 * GET /api/admin/upload-token — Return Sanity credentials to authenticated admins
 * Protected by withAuth — only verified admin sessions receive the token.
 * The token is NEVER in the client JS bundle; it's returned at runtime only.
 */
import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/auth/guard';
import { successResponse, serverError } from '@/lib/api/response';

export const GET = withAuth(async (_request: NextRequest) => {
  try {
    const token = process.env.SANITY_API_TOKEN;
    if (!token) return serverError('Sanity token not configured');

    return successResponse({
      token,
      projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? '',
      dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? 'production',
    });
  } catch (err) {
    console.error('[api/upload-token]', err);
    return serverError();
  }
});
