/**
 * GET /api/admin/leads — List leads with filtering/sorting
 * POST /api/admin/leads — Create lead manually
 * DOC-040 §2.2
 */
import { NextRequest } from 'next/server';
import { withAuth, type AuthContext } from '@/lib/auth/guard';
import { sanityClient, sanityWriteClient } from '@/lib/sanity/client';
import { listResponse, successResponse, validationError, serverError, parsePagination } from '@/lib/api/response';
import { leadAdminCreateSchema } from '@/lib/validation/input-schemas';
import { addActivityToTransaction } from '@/lib/api/activity';

export const GET = withAuth(async (request: NextRequest) => {
  try {
    const url = new URL(request.url);
    const { page, limit, offset } = parsePagination(url);
    const status = url.searchParams.get('status');
    const sort = url.searchParams.get('sort') ?? 'updatedAt';
    const order = url.searchParams.get('order') === 'asc' ? 'asc' : 'desc';

    let filter = `_type == "lead"`;
    if (status) filter += ` && status == "${status}"`;

    const [data, total] = await Promise.all([
      sanityClient.fetch(
        `*[${filter}] | order(${sort} ${order}) [${offset}...${offset + limit}]{ _id, name, email, status, source, priority, updatedAt }`,
      ),
      sanityClient.fetch(`count(*[${filter}])`),
    ]);

    return listResponse(data, total, page, limit);
  } catch {
    return serverError();
  }
});

export const POST = withAuth(async (request: NextRequest, { session }: AuthContext) => {
  try {
    const body = await request.json();
    const parsed = leadAdminCreateSchema.safeParse(body);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      parsed.error.issues.forEach((i) => { fieldErrors[i.path.join('.')] = i.message; });
      return validationError('נתוני קלט לא תקינים', fieldErrors);
    }

    const email = parsed.data.email.toLowerCase().trim();

    // INV-021: Active lead per email uniqueness
    const existingActive = await sanityClient.fetch(
      `count(*[_type == "lead" && email == $email && status != "archived"]) > 0`,
      { email },
    );
    if (existingActive) {
      return validationError('ליד פעיל עם כתובת אימייל זו כבר קיים', { email: 'כתובת אימייל כבר בשימוש' });
    }

    const now = new Date().toISOString();
    const leadId = `lead-${Date.now()}`;

    const tx = sanityWriteClient.transaction();
    tx.create({
      _id: leadId,
      _type: 'lead',
      ...parsed.data,
      email,
      source: 'manual_entry',
      status: parsed.data.status ?? 'new',
      createdAt: now,
      updatedAt: now,
    });

    const activity = addActivityToTransaction(tx, {
      entityType: 'lead',
      entityId: leadId,
      type: 'lead_created',
      description: `ליד חדש נוצר ידנית: ${parsed.data.name}`,
      performedBy: session.user.email,
      metadata: { source: 'manual_entry' },
    });

    await tx.commit();

    const created = await sanityClient.fetch(`*[_type == "lead" && _id == $id][0]`, { id: leadId });
    return successResponse(created, activity, 201);
  } catch {
    return serverError();
  }
});
