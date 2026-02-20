/**
 * POST /api/admin/engagements/:id/transition — Engagement status transition
 * DOC-040 §2.6, §5.3
 */
import { NextRequest } from 'next/server';
import { withAuth, type AuthContext } from '@/lib/auth/guard';
import { sanityClient, sanityWriteClient } from '@/lib/sanity/client';
import { successResponse, validationError, notFoundError, serverError, transitionForbidden } from '@/lib/api/response';
import { checkConcurrency } from '@/lib/api/concurrency';
import { engagementTransitionSchema } from '@/lib/validation/input-schemas';
import { ENGAGEMENT_TRANSITIONS, isTransitionAllowed } from '@/lib/api/transitions';
import { addActivityToTransaction } from '@/lib/api/activity';

export const POST = withAuth(async (request: NextRequest, { params, session }: AuthContext<{ id: string }>) => {
  try {
    const { id } = params;
    const body = await request.json();
    const parsed = engagementTransitionSchema.safeParse(body);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      parsed.error.issues.forEach((i) => { fieldErrors[i.path.join('.')] = i.message; });
      return validationError('נתוני קלט לא תקינים', fieldErrors);
    }

    const existing = await sanityClient.fetch(`*[_type == "engagement" && _id == $id][0]`, { id });
    if (!existing) return notFoundError();

    const conflict = checkConcurrency(parsed.data.updatedAt, existing.updatedAt);
    if (conflict) return conflict;

    if (!isTransitionAllowed(ENGAGEMENT_TRANSITIONS, existing.status, parsed.data.status)) {
      return transitionForbidden(existing.status, parsed.data.status);
    }

    const now = new Date().toISOString();
    const tx = sanityWriteClient.transaction();

    const patchFields: Record<string, unknown> = { status: parsed.data.status, updatedAt: now };
    // Auto-set actualEndDate when completing
    if (parsed.data.status === 'completed' && !existing.actualEndDate) {
      patchFields.actualEndDate = now.split('T')[0];
    }

    tx.patch(id, (p) => p.set(patchFields));

    const activity = addActivityToTransaction(tx, {
      entityType: 'engagement',
      entityId: id,
      type: 'status_change',
      description: `סטטוס התקשרות "${existing.title}" שונה מ-${existing.status} ל-${parsed.data.status}`,
      performedBy: session.user.email,
      metadata: { previousStatus: existing.status, newStatus: parsed.data.status },
    });

    await tx.commit();

    const updated = await sanityClient.fetch(`*[_type == "engagement" && _id == $id][0]`, { id });
    return successResponse(updated, activity);
  } catch (err) {
    console.error('[api]', err);
    return serverError();
  }
});
