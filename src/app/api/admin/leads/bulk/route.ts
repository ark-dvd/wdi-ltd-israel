/**
 * POST /api/admin/leads/bulk — Bulk lead operations
 * DOC-040 §2.4, INV-027
 */
import { NextRequest } from 'next/server';
import { withAuth, type AuthContext } from '@/lib/auth/guard';
import { sanityClient, sanityWriteClient } from '@/lib/sanity/client';
import { successResponse, validationError, serverError, errorResponse } from '@/lib/api/response';
import { bulkOperationSchema } from '@/lib/validation/input-schemas';
import { LEAD_TRANSITIONS, isTransitionAllowed } from '@/lib/api/transitions';
import { addActivityToTransaction } from '@/lib/api/activity';

export const POST = withAuth(async (request: NextRequest, { session }: AuthContext) => {
  try {
    const body = await request.json();
    const parsed = bulkOperationSchema.safeParse(body);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      parsed.error.issues.forEach((i) => { fieldErrors[i.path.join('.')] = i.message; });
      return validationError('נתוני קלט לא תקינים', fieldErrors);
    }

    const { action, ids, concurrencyTokens, targetStatus } = parsed.data;

    if (action === 'status_change' && !targetStatus) {
      return validationError('targetStatus נדרש עבור שינוי סטטוס');
    }

    // Fetch all leads
    const leads = await sanityClient.fetch(
      `*[_type == "lead" && _id in $ids]{ _id, name, status, updatedAt }`,
      { ids },
    );

    // Validate all exist and tokens match
    const recordErrors: { id: string; code: string; message: string }[] = [];
    const leadMap = new Map(leads.map((l: { _id: string }) => [l._id, l]));

    for (const id of ids) {
      const lead = leadMap.get(id) as { _id: string; status: string; updatedAt: string } | undefined;
      if (!lead) {
        recordErrors.push({ id, code: 'NOT_FOUND', message: 'רשומה לא נמצאה' });
        continue;
      }
      if (concurrencyTokens[id] !== lead.updatedAt) {
        recordErrors.push({ id, code: 'CONFLICT_DETECTED', message: 'הנתון עודכן' });
        continue;
      }
      if (action === 'status_change' && !isTransitionAllowed(LEAD_TRANSITIONS, lead.status, targetStatus!)) {
        recordErrors.push({ id, code: 'TRANSITION_FORBIDDEN', message: `מעבר מ-${lead.status} ל-${targetStatus} אסור` });
      }
      if (action === 'archive' && lead.status === 'archived') {
        recordErrors.push({ id, code: 'VALIDATION_FAILED', message: 'כבר בארכיון' });
      }
    }

    if (recordErrors.length > 0) {
      return errorResponse('validation', 'VALIDATION_FAILED', 'חלק מהרשומות לא עברו בדיקה', { recordErrors });
    }

    const now = new Date().toISOString();
    const tx = sanityWriteClient.transaction();

    for (const id of ids) {
      if (action === 'status_change') {
        tx.patch(id, (p) => p.set({ status: targetStatus!, updatedAt: now }));
      } else {
        const lead = leadMap.get(id) as { status: string };
        tx.patch(id, (p) => p.set({ status: 'archived', archivedAt: now, updatedAt: now }));
        // Individual archive activities for each lead
        addActivityToTransaction(tx, {
          entityType: 'lead',
          entityId: id,
          type: 'lead_archived',
          description: `ליד הועבר לארכיון (פעולה מרוכזת)`,
          performedBy: session.user.email,
          metadata: { previousStatus: lead.status },
        });
      }
    }

    // Bulk operation activity
    const activity = addActivityToTransaction(tx, {
      entityType: 'lead',
      entityId: ids[0]!,
      type: 'bulk_operation',
      description: `פעולה מרוכזת: ${action} על ${ids.length} לידים`,
      performedBy: session.user.email,
      metadata: { action, recordCount: ids.length, affectedIds: ids },
    });

    await tx.commit();

    return successResponse({ affected: ids.length }, activity);
  } catch (err) {
    console.error('[api]', err);
    return serverError();
  }
});
