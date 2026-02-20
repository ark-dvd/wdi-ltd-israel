/**
 * GET /api/admin/projects/:id — Single project with linkedTestimonials
 * PUT /api/admin/projects/:id — Update project
 * DELETE /api/admin/projects/:id — Delete project (only if never activated)
 * DOC-040 §2.9.2
 */
import { NextRequest } from 'next/server';
import { withAuth, type AuthContext } from '@/lib/auth/guard';
import { sanityClient, sanityWriteClient } from '@/lib/sanity/client';
import { successResponse, validationError, notFoundError, serverError } from '@/lib/api/response';
import { checkConcurrency } from '@/lib/api/concurrency';
import { projectUpdateSchema } from '@/lib/validation/input-schemas';

export const GET = withAuth(async (_request: NextRequest, { params }: AuthContext<{ id: string }>) => {
  try {
    const { id } = params;
    const project = await sanityClient.fetch(
      `*[_type == "project" && _id == $id][0]{
        ...,
        "linkedTestimonials": *[_type == "testimonial" && projectRef._ref == ^._id]{
          _id, clientName, quote, companyName, role, isFeatured, isActive, order, updatedAt
        }
      }`,
      { id },
    );
    if (!project) return notFoundError();
    return successResponse(project);
  } catch (err) {
    console.error('[api]', err);
    return serverError();
  }
});

export const PUT = withAuth(async (request: NextRequest, { params }: AuthContext<{ id: string }>) => {
  try {
    const { id } = params;
    const body = await request.json();
    const parsed = projectUpdateSchema.safeParse(body);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      parsed.error.issues.forEach((i) => { fieldErrors[i.path.join('.')] = i.message; });
      return validationError('נתוני קלט לא תקינים', fieldErrors);
    }

    const existing = await sanityClient.fetch(`*[_type == "project" && _id == $id][0]`, { id });
    if (!existing) return notFoundError();

    const conflict = checkConcurrency(parsed.data.updatedAt, existing.updatedAt);
    if (conflict) return conflict;

    // INV-030: slug uniqueness if changing
    if (parsed.data.slug && parsed.data.slug !== existing.slug?.current) {
      const slugExists = await sanityClient.fetch(
        `count(*[_type == "project" && slug.current == $slug && _id != $id]) > 0`,
        { slug: parsed.data.slug, id },
      );
      if (slugExists) return validationError('slug כבר קיים', { slug: 'ערך slug זה כבר בשימוש' });
    }

    const { updatedAt: _, slug, ...fields } = parsed.data;
    const patchFields: Record<string, unknown> = { ...fields, updatedAt: new Date().toISOString() };
    if (slug) patchFields.slug = { _type: 'slug', current: slug };

    const doc = await sanityWriteClient.patch(id).set(patchFields).commit();
    return successResponse(doc);
  } catch (err) {
    console.error('[api]', err);
    return serverError();
  }
});

export const DELETE = withAuth(async (request: NextRequest, { params }: AuthContext<{ id: string }>) => {
  try {
    const { id } = params;
    const body = await request.json();
    const { updatedAt } = body;
    if (!updatedAt) return validationError('updatedAt נדרש');

    const existing = await sanityClient.fetch(`*[_type == "project" && _id == $id][0]`, { id });
    if (!existing) return notFoundError();

    const conflict = checkConcurrency(updatedAt, existing.updatedAt);
    if (conflict) return conflict;

    if (existing.isActive) {
      return validationError('לא ניתן למחוק רשומה פעילה. יש לבטל את ההפעלה תחילה.');
    }

    await sanityWriteClient.delete(id);
    return successResponse({ deleted: true });
  } catch (err) {
    console.error('[api]', err);
    return serverError();
  }
});
