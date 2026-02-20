/**
 * GET /api/admin/services — List services
 * POST /api/admin/services — Create service
 * DOC-040 §2.9.3
 */
import { NextRequest } from 'next/server';
import { withAuth, type AuthContext } from '@/lib/auth/guard';
import { sanityClient, sanityWriteClient } from '@/lib/sanity/client';
import { listResponse, successResponse, validationError, serverError, parsePagination } from '@/lib/api/response';
import { serviceCreateSchema } from '@/lib/validation/input-schemas';

export const GET = withAuth(async (request: NextRequest) => {
  try {
    const url = new URL(request.url);
    const { page, limit, offset } = parsePagination(url);
    const isActive = url.searchParams.get('isActive');

    let filter = `_type == "service"`;
    if (isActive !== null) filter += ` && isActive == ${isActive === 'true'}`;

    const [data, total] = await Promise.all([
      sanityClient.fetch(`*[${filter}] | order(order asc) [${offset}...${offset + limit}]{ _id, name, slug, tagline, isActive, order, updatedAt }`),
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
    const parsed = serviceCreateSchema.safeParse(body);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      parsed.error.issues.forEach((i) => { fieldErrors[i.path.join('.')] = i.message; });
      return validationError('נתוני קלט לא תקינים', fieldErrors);
    }

    // INV-016: slug uniqueness
    const slugExists = await sanityClient.fetch(
      `count(*[_type == "service" && slug.current == $slug]) > 0`,
      { slug: parsed.data.slug },
    );
    if (slugExists) return validationError('slug כבר קיים', { slug: 'ערך slug זה כבר בשימוש' });

    const now = new Date().toISOString();
    const { slug, ...rest } = parsed.data;
    const doc = await sanityWriteClient.create({
      _type: 'service',
      ...rest,
      slug: { _type: 'slug', current: slug },
      createdAt: now,
      updatedAt: now,
    });

    return successResponse(doc, undefined, 201);
  } catch (err) {
    console.error('[api]', err);
    return serverError();
  }
});
