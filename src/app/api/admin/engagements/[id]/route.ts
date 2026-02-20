/**
 * GET /api/admin/engagements/:id — Single engagement with client + activities
 * PUT /api/admin/engagements/:id — Update engagement
 * DELETE /api/admin/engagements/:id — Delete engagement
 * DOC-040 §2.6
 */
import { NextRequest } from 'next/server';
import { withAuth, type AuthContext } from '@/lib/auth/guard';
import { sanityClient, sanityWriteClient } from '@/lib/sanity/client';
import { successResponse, validationError, notFoundError, serverError } from '@/lib/api/response';
import { checkConcurrency } from '@/lib/api/concurrency';
import { engagementUpdateSchema, engagementDeleteSchema } from '@/lib/validation/input-schemas';
import { addActivityToTransaction } from '@/lib/api/activity';

export const GET = withAuth(async (_request: NextRequest, { params }: AuthContext<{ id: string }>) => {
  try {
    const { id } = params;
    const engagement = await sanityClient.fetch(
      `*[_type == "engagement" && _id == $id][0]{
        ...,
        "client": client->{ _id, name, email, phone },
        "activities": *[_type == "activity" && entityType == "engagement" && entityId == ^._id] | order(createdAt asc)
      }`,
      { id },
    );
    if (!engagement) return notFoundError();
    return successResponse(engagement);
  } catch (err) {
    console.error('[api]', err);
    return serverError();
  }
});

export const PUT = withAuth(async (request: NextRequest, { params, session }: AuthContext<{ id: string }>) => {
  try {
    const { id } = params;
    const body = await request.json();
    const parsed = engagementUpdateSchema.safeParse(body);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      parsed.error.issues.forEach((i) => { fieldErrors[i.path.join('.')] = i.message; });
      return validationError('נתוני קלט לא תקינים', fieldErrors);
    }

    const existing = await sanityClient.fetch(`*[_type == "engagement" && _id == $id][0]`, { id });
    if (!existing) return notFoundError();

    const conflict = checkConcurrency(parsed.data.updatedAt, existing.updatedAt);
    if (conflict) return conflict;

    const { updatedAt: _, ...fields } = parsed.data;
    const now = new Date().toISOString();
    const tx = sanityWriteClient.transaction();

    tx.patch(id, (p) => p.set({ ...fields, updatedAt: now }));

    const changedFields = Object.keys(fields).filter(
      (k) => fields[k as keyof typeof fields] !== undefined,
    );

    let activity: Record<string, unknown> | undefined;
    if (changedFields.length > 0) {
      activity = addActivityToTransaction(tx, {
        entityType: 'engagement',
        entityId: id,
        type: 'record_updated',
        description: `פרטי התקשרות "${existing.title}" עודכנו`,
        performedBy: session.user.email,
        metadata: { changedFields },
      });
    }

    await tx.commit();

    const updated = await sanityClient.fetch(`*[_type == "engagement" && _id == $id][0]`, { id });
    return successResponse(updated, activity);
  } catch (err) {
    console.error('[api]', err);
    return serverError();
  }
});

export const DELETE = withAuth(async (request: NextRequest, { params }: AuthContext<{ id: string }>) => {
  try {
    const { id } = params;
    const body = await request.json();
    const parsed = engagementDeleteSchema.safeParse(body);
    if (!parsed.success) return validationError('updatedAt נדרש');

    const existing = await sanityClient.fetch(`*[_type == "engagement" && _id == $id][0]`, { id });
    if (!existing) return notFoundError();

    const conflict = checkConcurrency(parsed.data.updatedAt, existing.updatedAt);
    if (conflict) return conflict;

    await sanityWriteClient.delete(id);
    return successResponse({ deleted: true });
  } catch (err) {
    console.error('[api]', err);
    return serverError();
  }
});
