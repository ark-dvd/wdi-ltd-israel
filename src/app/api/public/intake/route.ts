/**
 * POST /api/public/intake — Public intake submission
 * CANONICAL-AMENDMENT-001: Unified intake for general, job, and supplier forms.
 * Rate limited 5/min, honeypot protected, no auth required.
 */
import { NextRequest, NextResponse } from 'next/server';
import { sanityWriteClient } from '@/lib/sanity/client';
import { successResponse, validationError, serverError } from '@/lib/api/response';
import { intakePublicSchema } from '@/lib/validation/input-schemas';
import { publicLeadRateLimit, getIdentifier } from '@/lib/rate-limit';

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Rate limiting
    const identifier = getIdentifier(request);
    const { success: withinLimit } = await publicLeadRateLimit.limit(identifier);
    if (!withinLimit) {
      return NextResponse.json(
        { category: 'validation', code: 'RATE_LIMITED', message: 'יותר מדי בקשות. נסה שוב בעוד דקה.', retryable: false },
        { status: 429 },
      );
    }

    const body = await request.json();
    const parsed = intakePublicSchema.safeParse(body);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      parsed.error.issues.forEach((i) => { fieldErrors[i.path.join('.')] = i.message; });
      return validationError('נתוני קלט לא תקינים', fieldErrors);
    }

    // Honeypot check — bots fill hidden fields, humans don't
    if (parsed.data._honeypot) {
      // Silently discard bot submission (return success so bot doesn't retry)
      return successResponse({ received: true });
    }

    const { _honeypot: _, ...data } = parsed.data;
    const now = new Date().toISOString();
    const _id = `intake-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

    await sanityWriteClient.create({
      _id,
      _type: 'intakeSubmission',
      submissionType: data.submissionType,
      source: 'website_form',
      contactName: data.contactName,
      contactEmail: data.contactEmail.toLowerCase().trim(),
      contactPhone: data.contactPhone || undefined,
      organization: data.organization || undefined,
      subject: data.subject || undefined,
      message: data.message || undefined,
      cvFileUrl: data.cvFileUrl || undefined,
      positionAppliedFor: data.positionAppliedFor || undefined,
      supplierCategory: data.supplierCategory || undefined,
      supplierExperience: data.supplierExperience || undefined,
      contactStatus: 'not_contacted',
      relevance: 'not_assessed',
      outcome: 'pending',
      submittedAt: now,
      auditTrail: [],
    });

    return successResponse({ _id }, undefined, 201);
  } catch (err) {
    console.error('[api/public/intake]', err);
    return serverError();
  }
}
