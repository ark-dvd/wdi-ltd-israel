/**
 * POST /api/admin/leads/:id/restore — Restore archived lead
 * DOC-040 §2.2
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

    const existing = await sanityClient.fetch(`*[_type == "lead" && _id == $id][0]`, { id });
    if (!existing) return notFoundError();

    const conflict = checkConcurrency(parsed.data.updatedAt, existing.updatedAt);
    if (conflict) return conflict;

    if (existing.status !== 'archived') {
      return validationError('ניתן לשחזר רק לידים שנמצאים בארכיון');
    }

    // Find pre-archival status from the most recent archive activity
    const archiveActivity = await sanityClient.fetch(
      `*[_type == "activity" && entityId == $id && type == "lead_archived"] | order(createdAt desc) [0]{ metadata }`,
      { id },
    );
    const restoredStatus = archiveActivity?.metadata?.previousStatus ?? 'new';

    const now = new Date().toISOString();
    const tx = sanityWriteClient.transaction();

    tx.patch(id, (p) => p.set({ status: restoredStatus, archivedAt: null, updatedAt: now }));

    const activity = addActivityToTransaction(tx, {
      entityType: 'lead',
      entityId: id,
      type: 'record_restored',
      description: `ליד ${existing.name} שוחזר מהארכיון לסטטוס ${restoredStatus}`,
      performedBy: session.user.email,
      metadata: { restoredToStatus: restoredStatus },
    });

    await tx.commit();

    const updated = await sanityClient.fetch(`*[_type == "lead" && _id == $id][0]`, { id });
    return successResponse(updated, activity);
  } catch (err) {
    console.error('[api]', err);
    return serverError();
  }
});
