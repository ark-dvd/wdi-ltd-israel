/**
 * GET /api/admin/clients-crm/:id — Single client with activities
 * PATCH /api/admin/clients-crm/:id — Update client fields
 * DOC-040 §2.3
 */
import { NextRequest } from 'next/server';
import { withAuth, type AuthContext } from '@/lib/auth/guard';
import { sanityClient, sanityWriteClient } from '@/lib/sanity/client';
import { successResponse, validationError, notFoundError, serverError } from '@/lib/api/response';
import { checkConcurrency } from '@/lib/api/concurrency';
import { clientCrmUpdateSchema } from '@/lib/validation/input-schemas';
import { addActivityToTransaction } from '@/lib/api/activity';

export const GET = withAuth(async (_request: NextRequest, { params }: AuthContext<{ id: string }>) => {
  try {
    const { id } = params;
    const client = await sanityClient.fetch(
      `*[_type == "clientCrm" && _id == $id][0]{
        ...,
        "sourceLead": sourceLead->{ _id, name, status },
        "engagementCount": count(*[_type == "engagement" && client._ref == ^._id]),
        "totalEngagementValue": math::sum(*[_type == "engagement" && client._ref == ^._id].value),
        "activities": *[_type == "activity" && entityType == "client" && entityId == ^._id] | order(createdAt asc)
      }`,
      { id },
    );
    if (!client) return notFoundError();
    return successResponse(client);
  } catch {
    return serverError();
  }
});

export const PATCH = withAuth(async (request: NextRequest, { params, session }: AuthContext<{ id: string }>) => {
  try {
    const { id } = params;
    const body = await request.json();
    const parsed = clientCrmUpdateSchema.safeParse(body);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      parsed.error.issues.forEach((i) => { fieldErrors[i.path.join('.')] = i.message; });
      return validationError('נתוני קלט לא תקינים', fieldErrors);
    }

    const existing = await sanityClient.fetch(`*[_type == "clientCrm" && _id == $id][0]`, { id });
    if (!existing) return notFoundError();

    const conflict = checkConcurrency(parsed.data.updatedAt, existing.updatedAt);
    if (conflict) return conflict;

    // INV-008: email uniqueness if changing
    if (parsed.data.email && parsed.data.email !== existing.email) {
      const emailExists = await sanityClient.fetch(
        `count(*[_type == "clientCrm" && email == $email && _id != $id]) > 0`,
        { email: parsed.data.email.toLowerCase().trim(), id },
      );
      if (emailExists) {
        return validationError('כתובת אימייל כבר בשימוש', { email: 'כתובת אימייל כבר בשימוש' });
      }
    }

    const { updatedAt: _, notes, ...fields } = parsed.data;
    const now = new Date().toISOString();
    const tx = sanityWriteClient.transaction();

    const patchFields: Record<string, unknown> = { ...fields, updatedAt: now };

    if (notes) {
      const appendedNotes = existing.notes
        ? `${existing.notes}\n\n--- הערה חדשה (${now}) ---\n${notes}`
        : notes;
      patchFields.notes = appendedNotes;

      addActivityToTransaction(tx, {
        entityType: 'client',
        entityId: id,
        type: 'note_added',
        description: `הערה חדשה נוספה ללקוח ${existing.name}`,
        performedBy: session.user.email,
        metadata: { noteText: notes },
      });
    }

    const changedFields = Object.keys(fields).filter(
      (k) => fields[k as keyof typeof fields] !== undefined,
    );

    tx.patch(id, (p) => p.set(patchFields));

    let activity: Record<string, unknown> | undefined;
    if (changedFields.length > 0) {
      activity = addActivityToTransaction(tx, {
        entityType: 'client',
        entityId: id,
        type: 'record_updated',
        description: `פרטי לקוח ${existing.name} עודכנו`,
        performedBy: session.user.email,
        metadata: { changedFields },
      });
    }

    await tx.commit();

    const updated = await sanityClient.fetch(`*[_type == "clientCrm" && _id == $id][0]`, { id });
    return successResponse(updated, activity);
  } catch {
    return serverError();
  }
});
