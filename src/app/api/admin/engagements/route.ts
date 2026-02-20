/**
 * GET /api/admin/engagements — List engagements
 * POST /api/admin/engagements — Create engagement
 * DOC-040 §2.6
 */
import { NextRequest } from 'next/server';
import { withAuth, type AuthContext } from '@/lib/auth/guard';
import { sanityClient, sanityWriteClient } from '@/lib/sanity/client';
import { listResponse, successResponse, validationError, notFoundError, serverError, parsePagination } from '@/lib/api/response';
import { engagementCreateSchema } from '@/lib/validation/input-schemas';
import { addActivityToTransaction } from '@/lib/api/activity';

export const GET = withAuth(async (request: NextRequest) => {
  try {
    const url = new URL(request.url);
    const { page, limit, offset } = parsePagination(url);
    const status = url.searchParams.get('status');
    const clientId = url.searchParams.get('clientId');
    const sort = url.searchParams.get('sort') ?? 'createdAt';
    const order = url.searchParams.get('order') === 'asc' ? 'asc' : 'desc';

    let filter = `_type == "engagement"`;
    if (status) filter += ` && status == "${status}"`;
    if (clientId) filter += ` && client._ref == "${clientId}"`;

    const [data, total] = await Promise.all([
      sanityClient.fetch(
        `*[${filter}] | order(${sort} ${order}) [${offset}...${offset + limit}]{
          _id, title, status, engagementType, value, createdAt, updatedAt,
          "client": client->{ _id, name, email }
        }`,
      ),
      sanityClient.fetch(`count(*[${filter}])`),
    ]);

    return listResponse(data, total, page, limit);
  } catch (err) {
    console.error('[api]', err);
    return serverError();
  }
});

export const POST = withAuth(async (request: NextRequest, { session }: AuthContext) => {
  try {
    const body = await request.json();
    const parsed = engagementCreateSchema.safeParse(body);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      parsed.error.issues.forEach((i) => { fieldErrors[i.path.join('.')] = i.message; });
      return validationError('נתוני קלט לא תקינים', fieldErrors);
    }

    // INV-034: Client must exist
    const clientExists = await sanityClient.fetch(
      `count(*[_type == "clientCrm" && _id == $id]) > 0`,
      { id: parsed.data.client },
    );
    if (!clientExists) return notFoundError('הלקוח המשויך לא נמצא');

    const now = new Date().toISOString();
    const engagementId = `engagement-${Date.now()}`;
    const { client, ...rest } = parsed.data;

    const tx = sanityWriteClient.transaction();
    tx.create({
      _id: engagementId,
      _type: 'engagement',
      ...rest,
      client: { _type: 'reference', _ref: client },
      status: rest.status ?? 'new',
      createdAt: now,
      updatedAt: now,
    });

    const activity = addActivityToTransaction(tx, {
      entityType: 'engagement',
      entityId: engagementId,
      type: 'engagement_created',
      description: `התקשרות "${parsed.data.title}" נוצרה`,
      performedBy: session.user.email,
      metadata: { source: 'manual_entry', clientId: client },
    });

    await tx.commit();

    const created = await sanityClient.fetch(`*[_type == "engagement" && _id == $id][0]`, { id: engagementId });
    return successResponse(created, activity, 201);
  } catch (err) {
    console.error('[api]', err);
    return serverError();
  }
});
