/**
 * GET /api/admin/activities — List activities for entity
 * POST /api/admin/activities — Create manual activity
 * DOC-040 §2.5
 */
import { NextRequest } from 'next/server';
import { withAuth, type AuthContext } from '@/lib/auth/guard';
import { sanityClient, sanityWriteClient } from '@/lib/sanity/client';
import { successResponse, validationError, notFoundError, serverError } from '@/lib/api/response';
import { manualActivityCreateSchema } from '@/lib/validation/input-schemas';

export const GET = withAuth(async (request: NextRequest) => {
  try {
    const url = new URL(request.url);
    const entityType = url.searchParams.get('entityType');
    const entityId = url.searchParams.get('entityId');

    if (!entityType || !entityId) {
      return validationError('entityType ו-entityId נדרשים');
    }

    const activities = await sanityClient.fetch(
      `*[_type == "activity" && entityType == $entityType && entityId == $entityId] | order(createdAt asc)`,
      { entityType, entityId },
    );

    return successResponse(activities);
  } catch {
    return serverError();
  }
});

export const POST = withAuth(async (request: NextRequest, { session }: AuthContext) => {
  try {
    const body = await request.json();
    const parsed = manualActivityCreateSchema.safeParse(body);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      parsed.error.issues.forEach((i) => { fieldErrors[i.path.join('.')] = i.message; });
      return validationError('נתוני קלט לא תקינים', fieldErrors);
    }

    // Verify entity exists
    const entityTypeMap: Record<string, string> = {
      lead: 'lead',
      client: 'clientCrm',
      engagement: 'engagement',
    };
    const sanityType = entityTypeMap[parsed.data.entityType];
    const entity = await sanityClient.fetch(
      `*[_type == $type && _id == $id][0]{ _id }`,
      { type: sanityType, id: parsed.data.entityId },
    );
    if (!entity) return notFoundError('הישות המשויכת לא נמצאה');

    // Validate type-specific fields
    if (parsed.data.callDuration !== undefined && parsed.data.type !== 'call_logged') {
      return validationError('callDuration מתקבל רק עבור call_logged');
    }
    const quoteTypes = ['quote_sent', 'quote_accepted', 'quote_rejected'];
    if (parsed.data.quoteAmount !== undefined && !quoteTypes.includes(parsed.data.type)) {
      return validationError('quoteAmount מתקבל רק עבור סוגי הצעת מחיר');
    }

    // Auto-generate Hebrew description
    const descriptionMap: Record<string, string> = {
      call_logged: `שיחה נרשמה${parsed.data.callDuration ? ` (${parsed.data.callDuration} דקות)` : ''}`,
      email_sent: 'אימייל נשלח',
      email_received: 'אימייל התקבל',
      site_visit_scheduled: 'ביקור באתר תוזמן',
      site_visit_completed: 'ביקור באתר הושלם',
      quote_sent: `הצעת מחיר נשלחה${parsed.data.quoteAmount ? ` (₪${parsed.data.quoteAmount})` : ''}`,
      quote_accepted: `הצעת מחיר אושרה${parsed.data.quoteAmount ? ` (₪${parsed.data.quoteAmount})` : ''}`,
      quote_rejected: 'הצעת מחיר נדחתה',
      custom: parsed.data.notes,
    };

    const metadata: Record<string, unknown> = { details: parsed.data.notes };
    if (parsed.data.callDuration !== undefined) metadata.callDuration = parsed.data.callDuration;
    if (parsed.data.quoteAmount !== undefined) metadata.quoteAmount = parsed.data.quoteAmount;

    const now = new Date().toISOString();
    const activity = await sanityWriteClient.create({
      _type: 'activity',
      entityType: parsed.data.entityType,
      entityId: parsed.data.entityId,
      type: parsed.data.type,
      description: descriptionMap[parsed.data.type] ?? parsed.data.notes,
      performedBy: session.user.email,
      metadata,
      createdAt: now,
    });

    return successResponse(activity, undefined, 201);
  } catch {
    return serverError();
  }
});
