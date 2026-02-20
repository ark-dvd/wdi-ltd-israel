/**
 * GET /api/admin/supplier-form-settings — Load supplier form settings singleton
 * PUT /api/admin/supplier-form-settings — Save supplier form settings singleton
 */
import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/auth/guard';
import { sanityClient, sanityWriteClient } from '@/lib/sanity/client';
import { successResponse, validationError, notFoundError, serverError } from '@/lib/api/response';
import { checkConcurrency } from '@/lib/api/concurrency';
import { supplierFormSettingsUpdateSchema } from '@/lib/validation/input-schemas';

export const GET = withAuth(async () => {
  try {
    const doc = await sanityClient.fetch(`*[_type == "supplierFormSettings"][0]`);
    if (!doc) return notFoundError('הגדרות טופס ספקים לא נמצאו');
    return successResponse(doc);
  } catch (err) {
    console.error('[api]', err);
    return serverError();
  }
});

export const PUT = withAuth(async (request: NextRequest) => {
  try {
    const body = await request.json();
    const parsed = supplierFormSettingsUpdateSchema.safeParse(body);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      parsed.error.issues.forEach((i) => { fieldErrors[i.path.join('.')] = i.message; });
      return validationError('נתוני קלט לא תקינים', fieldErrors);
    }

    const existing = await sanityClient.fetch(`*[_type == "supplierFormSettings"][0]`);
    if (!existing) return notFoundError('הגדרות טופס ספקים לא נמצאו');

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
