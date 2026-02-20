/**
 * GET /api/admin/leads/:id — Single lead with activities
 * PATCH /api/admin/leads/:id — Update lead fields
 * DOC-040 §2.2
 */
import { NextRequest } from 'next/server';
import { withAuth, type AuthContext } from '@/lib/auth/guard';
import { sanityClient, sanityWriteClient } from '@/lib/sanity/client';
import { successResponse, validationError, notFoundError, serverError } from '@/lib/api/response';
import { checkConcurrency } from '@/lib/api/concurrency';
import { leadUpdateSchema } from '@/lib/validation/input-schemas';
import { addActivityToTransaction } from '@/lib/api/activity';

export const GET = withAuth(async (_request: NextRequest, { params }: AuthContext<{ id: string }>) => {
  try {
    const { id } = params;
    const lead = await sanityClient.fetch(
      `*[_type == "lead" && _id == $id][0]{
        ...,
        "activities": *[_type == "activity" && entityType == "lead" && entityId == ^._id] | order(createdAt asc)
      }`,
      { id },
    );
    if (!lead) return notFoundError();
    return successResponse(lead);
  } catch {
    return serverError();
  }
});

export const PATCH = withAuth(async (request: NextRequest, { params, session }: AuthContext<{ id: string }>) => {
  try {
    const { id } = params;
    const body = await request.json();
    const parsed = leadUpdateSchema.safeParse(body);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      parsed.error.issues.forEach((i) => { fieldErrors[i.path.join('.')] = i.message; });
      return validationError('נתוני קלט לא תקינים', fieldErrors);
    }

    const existing = await sanityClient.fetch(`*[_type == "lead" && _id == $id][0]`, { id });
    if (!existing) return notFoundError();

    const conflict = checkConcurrency(parsed.data.updatedAt, existing.updatedAt);
    if (conflict) return conflict;

    const { updatedAt: _, notes, ...fields } = parsed.data;
    const now = new Date().toISOString();
    const tx = sanityWriteClient.transaction();

    const patchFields: Record<string, unknown> = { ...fields, updatedAt: now };

    // Notes: append-only
    if (notes) {
      const appendedNotes = existing.notes
        ? `${existing.notes}\n\n--- הערה חדשה (${now}) ---\n${notes}`
        : notes;
      patchFields.notes = appendedNotes;

      addActivityToTransaction(tx, {
        entityType: 'lead',
        entityId: id,
        type: 'note_added',
        description: `הערה חדשה נוספה לליד ${existing.name}`,
        performedBy: session.user.email,
        metadata: { noteText: notes },
      });
    }

    // Track changed fields for activity
    const changedFields = Object.keys(fields).filter(
      (k) => fields[k as keyof typeof fields] !== undefined,
    );

    tx.patch(id, (p) => p.set(patchFields));

    let activity: Record<string, unknown> | undefined;
    if (changedFields.length > 0) {
      activity = addActivityToTransaction(tx, {
        entityType: 'lead',
        entityId: id,
        type: 'record_updated',
        description: `פרטי ליד ${existing.name} עודכנו`,
        performedBy: session.user.email,
        metadata: { changedFields },
      });
    }

    await tx.commit();

    const updated = await sanityClient.fetch(`*[_type == "lead" && _id == $id][0]`, { id });
    return successResponse(updated, activity);
  } catch {
    return serverError();
  }
});
