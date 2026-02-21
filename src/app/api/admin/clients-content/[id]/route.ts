/**
 * GET /api/admin/clients-content/:id — Fetch single client content
 * PUT /api/admin/clients-content/:id — Update client content
 * DELETE /api/admin/clients-content/:id — Delete client content
 * DOC-040 §2.9.4
 */
import { NextRequest } from 'next/server';
import { withAuth, type AuthContext } from '@/lib/auth/guard';
import { sanityClient, sanityWriteClient } from '@/lib/sanity/client';
import { successResponse, validationError, notFoundError, serverError } from '@/lib/api/response';
import { checkConcurrency } from '@/lib/api/concurrency';
import { clientContentUpdateSchema } from '@/lib/validation/input-schemas';

export const GET = withAuth(async (_request: NextRequest, { params }: AuthContext<{ id: string }>) => {
  try {
    const { id } = params;
    const doc = await sanityClient.fetch(`*[_type == "clientContent" && _id == $id][0]`, { id });
    if (!doc) return notFoundError();
    return successResponse(doc);
  } catch (err) {
    console.error('[api]', err);
    return serverError();
  }
});

export const PUT = withAuth(async (request: NextRequest, { params }: AuthContext<{ id: string }>) => {
  try {
    const { id } = params;
    const body = await request.json();
    const parsed = clientContentUpdateSchema.safeParse(body);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      parsed.error.issues.forEach((i) => { fieldErrors[i.path.join('.')] = i.message; });
      return validationError('נתוני קלט לא תקינים', fieldErrors);
    }

    const existing = await sanityClient.fetch(`*[_type == "clientContent" && _id == $id][0]`, { id });
    if (!existing) return notFoundError();

    const conflict = checkConcurrency(parsed.data.updatedAt, existing.updatedAt);
    if (conflict) return conflict;

    const { updatedAt: _, ...fields } = parsed.data;
    const doc = await sanityWriteClient.patch(id).set({ ...fields, updatedAt: new Date().toISOString() }).commit();

    return successResponse(doc);
  } catch (err) {
    console.error('[api]', err);
    return serverError();
  }
});

export const DELETE = withAuth(async (request: NextRequest, { params }: AuthContext<{ id: string }>) => {
  try {
    const { id } = params;
    const body = await request.json();
    const { updatedAt } = body;

    const existing = await sanityClient.fetch(`*[_type == "clientContent" && _id == $id][0]`, { id });
    if (!existing) return notFoundError();

    if (existing.updatedAt) {
      if (!updatedAt) return validationError('updatedAt נדרש');
      const conflict = checkConcurrency(updatedAt, existing.updatedAt);
      if (conflict) return conflict;
    }

    if (existing.isActive) {
      return validationError('לא ניתן למחוק רשומה פעילה. יש לבטל את ההפעלה תחילה.');
    }

    await sanityWriteClient.delete(id);
    return successResponse({ deleted: true });
  } catch (err) {
    console.error('[api]', err);
    return serverError();
  }
});
