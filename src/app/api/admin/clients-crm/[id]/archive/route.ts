/**
 * POST /api/admin/clients-crm/:id/archive — Archive client
 * DOC-040 §2.3
 */
import { NextRequest } from 'next/server';
import { withAuth, type AuthContext } from '@/lib/auth/guard';
import { sanityClient, sanityWriteClient } from '@/lib/sanity/client';
import { successResponse, validationError, notFoundError, serverError } from '@/lib/api/response';
import { checkConcurrency } from '@/lib/api/concurrency';
import { archiveSchema } from '@/lib/validation/input-schemas';
import { addActivityToTransaction } from '@/lib/api/activity';

export const POST = withAuth(async (request: NextRequest, { params, session }: AuthContext<{ id: string }>) => {
  try {
    const { id } = params;
    const body = await request.json();
    const parsed = archiveSchema.safeParse(body);
    if (!parsed.success) return validationError('updatedAt נדרש');

    const existing = await sanityClient.fetch(`*[_type == "clientCrm" && _id == $id][0]`, { id });
    if (!existing) return notFoundError();

    const conflict = checkConcurrency(parsed.data.updatedAt, existing.updatedAt);
    if (conflict) return conflict;

    if (existing.status === 'archived') {
      return validationError('הלקוח כבר בארכיון');
    }

    const now = new Date().toISOString();
    const tx = sanityWriteClient.transaction();

    tx.patch(id, (p) => p.set({ status: 'archived', archivedAt: now, updatedAt: now }));

    const activity = addActivityToTransaction(tx, {
      entityType: 'client',
      entityId: id,
      type: 'client_archived',
      description: `לקוח ${existing.name} הועבר לארכיון`,
      performedBy: session.user.email,
      metadata: { previousStatus: existing.status },
    });

    await tx.commit();

    const updated = await sanityClient.fetch(`*[_type == "clientCrm" && _id == $id][0]`, { id });
    return successResponse(updated, activity);
  } catch {
    return serverError();
  }
});
