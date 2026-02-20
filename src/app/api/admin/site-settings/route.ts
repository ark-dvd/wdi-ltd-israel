/**
 * GET /api/admin/site-settings — Load site settings singleton
 * PUT /api/admin/site-settings — Save site settings singleton
 * DOC-040 §2.9.10, INV-025
 */
import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/auth/guard';
import { sanityClient, sanityWriteClient } from '@/lib/sanity/client';
import { successResponse, validationError, notFoundError, serverError } from '@/lib/api/response';
import { checkConcurrency } from '@/lib/api/concurrency';
import { siteSettingsUpdateSchema } from '@/lib/validation/input-schemas';

const SINGLETON_ID = 'siteSettings';

export const GET = withAuth(async () => {
  try {
    const doc = await sanityClient.fetch(`*[_type == "siteSettings" && _id == $id][0]`, { id: SINGLETON_ID });
    if (!doc) return notFoundError('הגדרות אתר לא נמצאו');
    return successResponse(doc);
  } catch (err) {
    console.error('[api]', err);
    return serverError();
  }
});

export const PUT = withAuth(async (request: NextRequest) => {
  try {
    const body = await request.json();
    const parsed = siteSettingsUpdateSchema.safeParse(body);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      parsed.error.issues.forEach((i) => { fieldErrors[i.path.join('.')] = i.message; });
      return validationError('נתוני קלט לא תקינים', fieldErrors);
    }

    const existing = await sanityClient.fetch(`*[_type == "siteSettings" && _id == $id][0]`, { id: SINGLETON_ID });
    if (!existing) return notFoundError('הגדרות אתר לא נמצאו');

    const conflict = checkConcurrency(parsed.data.updatedAt, existing.updatedAt);
    if (conflict) return conflict;

    const { updatedAt: _, ...fields } = parsed.data;
    const doc = await sanityWriteClient.patch(SINGLETON_ID).set({ ...fields, updatedAt: new Date().toISOString() }).commit();

    return successResponse(doc);
  } catch (err) {
    console.error('[api]', err);
    return serverError();
  }
});
