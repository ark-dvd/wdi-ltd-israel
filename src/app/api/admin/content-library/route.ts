/**
 * GET /api/admin/content-library — List content library items
 * POST /api/admin/content-library — Create content library item
 * DOC-040 §2.9.8
 */
import { NextRequest } from 'next/server';
import { withAuth, type AuthContext } from '@/lib/auth/guard';
import { sanityClient, sanityWriteClient } from '@/lib/sanity/client';
import { listResponse, successResponse, validationError, serverError, parsePagination } from '@/lib/api/response';
import { contentLibraryCreateSchema } from '@/lib/validation/input-schemas';

export const GET = withAuth(async (request: NextRequest) => {
  try {
    const url = new URL(request.url);
    const { page, limit, offset } = parsePagination(url);
    const isActive = url.searchParams.get('isActive');

    let filter = `_type == "contentLibraryItem"`;
    if (isActive === 'true') filter += ` && isActive != false`;
    else if (isActive === 'false') filter += ` && isActive == false`;

    const [data, total] = await Promise.all([
      sanityClient.fetch(`*[${filter}] | order(order asc) [${offset}...${offset + limit}]{ _id, title, category, externalUrl, isActive, order, updatedAt }`),
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
    const parsed = contentLibraryCreateSchema.safeParse(body);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      parsed.error.issues.forEach((i) => { fieldErrors[i.path.join('.')] = i.message; });
      return validationError('נתוני קלט לא תקינים', fieldErrors);
    }

    const now = new Date().toISOString();
    const doc = await sanityWriteClient.create({
      _type: 'contentLibraryItem',
      ...parsed.data,
      createdAt: now,
      updatedAt: now,
    });

    return successResponse(doc, undefined, 201);
  } catch (err) {
    console.error('[api]', err);
    return serverError();
  }
});
