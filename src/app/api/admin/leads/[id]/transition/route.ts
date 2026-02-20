/**
 * POST /api/admin/leads/:id/transition — Lead status transition
 * DOC-040 §2.2, §5.1
 */
import { NextRequest } from 'next/server';
import { withAuth, type AuthContext } from '@/lib/auth/guard';
import { sanityClient, sanityWriteClient } from '@/lib/sanity/client';
import { successResponse, validationError, notFoundError, serverError, transitionForbidden } from '@/lib/api/response';
import { checkConcurrency } from '@/lib/api/concurrency';
import { transitionSchema } from '@/lib/validation/input-schemas';
import { LEAD_TRANSITIONS, isTransitionAllowed } from '@/lib/api/transitions';
import { addActivityToTransaction } from '@/lib/api/activity';

export const POST = withAuth(async (request: NextRequest, { params, session }: AuthContext<{ id: string }>) => {
  try {
    const { id } = params;
    const body = await request.json();
    const parsed = transitionSchema.safeParse(body);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      parsed.error.issues.forEach((i) => { fieldErrors[i.path.join('.')] = i.message; });
      return validationError('נתוני קלט לא תקינים', fieldErrors);
    }

    const existing = await sanityClient.fetch(`*[_type == "lead" && _id == $id][0]`, { id });
    if (!existing) return notFoundError();

    const conflict = checkConcurrency(parsed.data.updatedAt, existing.updatedAt);
    if (conflict) return conflict;

    if (!isTransitionAllowed(LEAD_TRANSITIONS, existing.status, parsed.data.targetStatus)) {
      return transitionForbidden(existing.status, parsed.data.targetStatus);
    }

    const now = new Date().toISOString();
    const tx = sanityWriteClient.transaction();

    tx.patch(id, (p) => p.set({ status: parsed.data.targetStatus, updatedAt: now }));

    const activity = addActivityToTransaction(tx, {
      entityType: 'lead',
      entityId: id,
      type: 'status_change',
      description: `סטטוס ליד ${existing.name} שונה מ-${existing.status} ל-${parsed.data.targetStatus}`,
      performedBy: session.user.email,
      metadata: { previousStatus: existing.status, newStatus: parsed.data.targetStatus },
    });

    await tx.commit();

    const updated = await sanityClient.fetch(`*[_type == "lead" && _id == $id][0]`, { id });
    return successResponse(updated, activity);
  } catch {
    return serverError();
  }
});
