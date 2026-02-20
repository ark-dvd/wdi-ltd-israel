/**
 * POST /api/public/leads — Public lead intake (contact form)
 * DOC-040 §2.2, INV-021
 * Turnstile abuse prevention (if configured), honeypot fallback, duplicate detection, rate limited 5/min
 */
import { NextRequest, NextResponse } from 'next/server';
import { sanityClient, sanityWriteClient } from '@/lib/sanity/client';
import { successResponse, validationError, serverError } from '@/lib/api/response';
import { leadIntakeSchema } from '@/lib/validation/schemas';
import { publicLeadRateLimit, getIdentifier } from '@/lib/rate-limit';
import { addActivityToTransaction } from '@/lib/api/activity';

const TURNSTILE_CONFIGURED = !!process.env.TURNSTILE_SECRET_KEY;

async function verifyTurnstile(token: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return false;

  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ secret, response: token }),
  });
  const data = await res.json();
  return data.success === true;
}

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
    const parsed = leadIntakeSchema.safeParse(body);
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

    // Turnstile verification (only if configured)
    if (TURNSTILE_CONFIGURED) {
      if (!parsed.data.turnstileToken) {
        return validationError('אימות אנושי נדרש.');
      }
      const valid = await verifyTurnstile(parsed.data.turnstileToken);
      if (!valid) {
        return validationError('אימות אנושי נכשל. נסה שוב.');
      }
    }

    const { turnstileToken: _, _honeypot: __, ...leadData } = parsed.data;
    const email = leadData.email.toLowerCase().trim();
    const message = leadData.message.trim();
    const now = new Date().toISOString();
    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();

    // Check for existing active lead with same email
    const existingLead = await sanityClient.fetch(
      `*[_type == "lead" && email == $email && status != "archived"][0]{ _id, notes, updatedAt }`,
      { email },
    );

    if (existingLead) {
      // Check for idempotent retry (same email + same message within 5 min)
      const recentDuplicate = await sanityClient.fetch(
        `count(*[_type == "activity" && entityId == $entityId && type == "duplicate_submission" && createdAt > $since && metadata.duplicateMessage == $message]) > 0`,
        { entityId: existingLead._id, since: fiveMinAgo, message },
      );

      if (recentDuplicate) {
        // Idempotent retry — return success without new activity
        return successResponse({ received: true });
      }

      // Duplicate Lead Policy: append note + activity
      const tx = sanityWriteClient.transaction();
      const appendedNotes = existingLead.notes
        ? `${existingLead.notes}\n\n--- פנייה נוספת (${now}) ---\n${message}`
        : `--- פנייה נוספת (${now}) ---\n${message}`;

      tx.patch(existingLead._id, (p) =>
        p.set({ notes: appendedNotes, updatedAt: now }),
      );

      addActivityToTransaction(tx, {
        entityType: 'lead',
        entityId: existingLead._id,
        type: 'duplicate_submission',
        description: `פנייה כפולה מ-${leadData.name}`,
        performedBy: 'system',
        metadata: { duplicateMessage: message, duplicateTimestamp: now },
      });

      await tx.commit();
      return successResponse({ received: true });
    }

    // Create new lead
    const tx = sanityWriteClient.transaction();
    const leadId = `lead-${Date.now()}`;

    tx.create({
      _id: leadId,
      _type: 'lead',
      name: leadData.name,
      email,
      message,
      company: leadData.company,
      phone: leadData.phone,
      servicesInterested: leadData.servicesInterested,
      source: 'טופס אתר',
      status: 'new',
      createdAt: now,
      updatedAt: now,
    });

    addActivityToTransaction(tx, {
      entityType: 'lead',
      entityId: leadId,
      type: 'lead_created',
      description: `ליד חדש נוצר מטופס האתר: ${leadData.name}`,
      performedBy: 'system',
      metadata: { source: 'טופס אתר' },
    });

    await tx.commit();
    return successResponse({ received: true }, undefined, 201);
  } catch {
    return serverError();
  }
}
