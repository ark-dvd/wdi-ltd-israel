/**
 * GET /api/admin/team — List team members
 * POST /api/admin/team — Create team member
 * DOC-040 §2.9.1
 */
import { NextRequest } from 'next/server';
import { withAuth, type AuthContext } from '@/lib/auth/guard';
import { sanityClient, sanityWriteClient } from '@/lib/sanity/client';
import { listResponse, successResponse, validationError, serverError } from '@/lib/api/response';
import { parsePagination } from '@/lib/api/response';
import { teamMemberCreateSchema } from '@/lib/validation/input-schemas';

export const GET = withAuth(async (request: NextRequest) => {
  try {
    const url = new URL(request.url);
    const { page, limit, offset } = parsePagination(url);
    const isActive = url.searchParams.get('isActive');

    let filter = `_type == "teamMember"`;
    if (isActive !== null) filter += ` && isActive == ${isActive === 'true'}`;

    const [data, total] = await Promise.all([
      sanityClient.fetch(
        `*[${filter}] | order(order asc) [${offset}...${offset + limit}]{ _id, name, role, category, isActive, order, updatedAt }`,
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
    const parsed = teamMemberCreateSchema.safeParse(body);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      parsed.error.issues.forEach((i) => { fieldErrors[i.path.join('.')] = i.message; });
      return validationError('נתוני קלט לא תקינים', fieldErrors);
    }

    const now = new Date().toISOString();
    const doc = await sanityWriteClient.create({
      _type: 'teamMember',
      ...parsed.data,
      createdAt: now,
      updatedAt: now,
    });

    return successResponse(doc, undefined, 201);
  } catch {
    return serverError();
  }
});
