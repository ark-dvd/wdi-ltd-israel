/**
 * GET /api/admin/clients-page — Load clients page singleton
 * PUT /api/admin/clients-page — Save clients page singleton
 */
import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/auth/guard';
import { sanityClient, sanityWriteClient } from '@/lib/sanity/client';
import { successResponse, validationError, notFoundError, serverError } from '@/lib/api/response';
import { checkConcurrency } from '@/lib/api/concurrency';
import { clientsPageUpdateSchema } from '@/lib/validation/input-schemas';

export const GET = withAuth(async () => {
  try {
    const doc = await sanityClient.fetch(`*[_type == "clientsPage"][0]`);
    if (!doc) return notFoundError('עמוד לקוחות לא נמצא');
    return successResponse(doc);
  } catch (err) {
    console.error('[api]', err);
    return serverError();
  }
});

export const PUT = withAuth(async (request: NextRequest) => {
  try {
    const body = await request.json();
    const parsed = clientsPageUpdateSchema.safeParse(body);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      parsed.error.issues.forEach((i) => { fieldErrors[i.path.join('.')] = i.message; });
      return validationError('נתוני קלט לא תקינים', fieldErrors);
    }

    const existing = await sanityClient.fetch(`*[_type == "clientsPage"][0]`);
    if (!existing) return notFoundError('עמוד לקוחות לא נמצא');

    const conflict = checkConcurrency(parsed.data.updatedAt, existing.updatedAt);
    if (conflict) return conflict;

    const { updatedAt: _, ...fields } = parsed.data;
    const doc = await sanityWriteClient.patch(existing._id).set({ ...fields, updatedAt: new Date().toISOString() }).commit();

    return successResponse(doc);
  } catch (err) {
    console.error('[api]', err);
    return serverError();
  }
});
