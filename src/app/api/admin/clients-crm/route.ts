/**
 * GET /api/admin/clients-crm — List CRM clients
 * POST /api/admin/clients-crm — Create CRM client
 * DOC-040 §2.3
 */
import { NextRequest } from 'next/server';
import { withAuth, type AuthContext } from '@/lib/auth/guard';
import { sanityClient, sanityWriteClient } from '@/lib/sanity/client';
import { listResponse, successResponse, validationError, serverError, parsePagination } from '@/lib/api/response';
import { clientCrmCreateSchema } from '@/lib/validation/input-schemas';
import { addActivityToTransaction } from '@/lib/api/activity';

export const GET = withAuth(async (request: NextRequest) => {
  try {
    const url = new URL(request.url);
    const { page, limit, offset } = parsePagination(url);
    const status = url.searchParams.get('status');

    let filter = `_type == "clientCrm"`;
    if (status) filter += ` && status == "${status}"`;

    const [data, total] = await Promise.all([
      sanityClient.fetch(
        `*[${filter}] | order(updatedAt desc) [${offset}...${offset + limit}]{ _id, name, email, status, updatedAt }`,
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
    const parsed = clientCrmCreateSchema.safeParse(body);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      parsed.error.issues.forEach((i) => { fieldErrors[i.path.join('.')] = i.message; });
      return validationError('נתוני קלט לא תקינים', fieldErrors);
    }

    const email = parsed.data.email.toLowerCase().trim();

    // INV-008: Client email uniqueness
    const emailExists = await sanityClient.fetch(
      `count(*[_type == "clientCrm" && email == $email]) > 0`,
      { email },
    );
    if (emailExists) {
      return validationError('לקוח עם כתובת אימייל זו כבר קיים', { email: 'כתובת אימייל כבר בשימוש' });
    }

    const now = new Date().toISOString();
    const clientId = `client-${Date.now()}`;

    const tx = sanityWriteClient.transaction();
    tx.create({
      _id: clientId,
      _type: 'clientCrm',
      ...parsed.data,
      email,
      status: parsed.data.status ?? 'active',
      createdAt: now,
      updatedAt: now,
    });

    const activity = addActivityToTransaction(tx, {
      entityType: 'client',
      entityId: clientId,
      type: 'client_created',
      description: `לקוח חדש נוצר ידנית: ${parsed.data.name}`,
      performedBy: session.user.email,
      metadata: { source: 'manual_entry' },
    });

    await tx.commit();

    const created = await sanityClient.fetch(`*[_type == "clientCrm" && _id == $id][0]`, { id: clientId });
    return successResponse(created, activity, 201);
  } catch {
    return serverError();
  }
});
