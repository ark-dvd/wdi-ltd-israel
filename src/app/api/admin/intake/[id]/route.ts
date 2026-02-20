/**
 * GET  /api/admin/intake/:id — Single intake submission detail
 * PATCH /api/admin/intake/:id — Triage update with audit trail
 * CANONICAL-AMENDMENT-001, INV-IT-01
 */
import { NextRequest } from 'next/server';
import { withAuth, type AuthContext } from '@/lib/auth/guard';
import { sanityClient, sanityWriteClient } from '@/lib/sanity/client';
import { successResponse, validationError, notFoundError, serverError } from '@/lib/api/response';
import { intakeTriageSchema } from '@/lib/validation/input-schemas';
import { isValidOutcome } from '@/lib/sanity/schemas/intake-submission';

export const GET = withAuth(async (_request: NextRequest, { params }: AuthContext<{ id: string }>) => {
  try {
    const { id } = params;
    const doc = await sanityClient.fetch(
      `*[_type == "intakeSubmission" && _id == $id][0]`,
      { id },
    );
    if (!doc) return notFoundError();
    return successResponse(doc);
  } catch (err) {
    console.error('[api/admin/intake/id]', err);
    return serverError();
  }
});

export const PATCH = withAuth(async (request: NextRequest, { params, session }: AuthContext<{ id: string }>) => {
  try {
    const { id } = params;
    const body = await request.json();
    const parsed = intakeTriageSchema.safeParse(body);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      parsed.error.issues.forEach((i) => { fieldErrors[i.path.join('.')] = i.message; });
      return validationError('נתוני קלט לא תקינים', fieldErrors);
    }

    // Fetch existing document
    const existing = await sanityClient.fetch(
      `*[_type == "intakeSubmission" && _id == $id][0]`,
      { id },
    );
    if (!existing) return notFoundError();

    // INV-IT-01: Validate outcome is valid for this submission type
    if (parsed.data.outcome) {
      if (!isValidOutcome(existing.submissionType, parsed.data.outcome)) {
        return validationError(
          `תוצאה "${parsed.data.outcome}" אינה תקינה עבור סוג פנייה "${existing.submissionType}"`,
          { outcome: 'ערך לא תקין עבור סוג הפנייה' },
        );
      }
    }

    const now = new Date().toISOString();
    const operatorEmail = session.user.email;

    // Build audit trail entries for changed triage fields
    const triageFields = ['contactStatus', 'relevance', 'outcome', 'internalNotes'] as const;
    const newEntries: Array<{
      _key: string;
      timestamp: string;
      operatorEmail: string;
      field: string;
      previousValue: string;
      newValue: string;
    }> = [];
    const updates: Record<string, unknown> = {};

    for (const field of triageFields) {
      const newValue = parsed.data[field];
      if (newValue !== undefined && newValue !== existing[field]) {
        updates[field] = newValue;
        newEntries.push({
          _key: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          timestamp: now,
          operatorEmail,
          field,
          previousValue: String(existing[field] ?? ''),
          newValue: String(newValue),
        });
      }
    }

    if (Object.keys(updates).length === 0) {
      // Nothing changed — return existing doc
      return successResponse(existing);
    }

    // Apply patch with audit trail append
    let patch = sanityWriteClient.patch(id).set(updates);
    if (newEntries.length > 0) {
      patch = patch.append('auditTrail', newEntries);
    }
    await patch.commit();

    // Fetch updated document
    const updated = await sanityClient.fetch(
      `*[_type == "intakeSubmission" && _id == $id][0]`,
      { id },
    );
    return successResponse(updated);
  } catch (err) {
    console.error('[api/admin/intake/id PATCH]', err);
    return serverError();
  }
});
