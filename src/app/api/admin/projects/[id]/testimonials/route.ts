/**
 * GET /api/admin/projects/:projectId/testimonials — List testimonials for project
 * POST /api/admin/projects/:projectId/testimonials — Create testimonial
 * DOC-040 §2.9.5, INV-037
 */
import { NextRequest } from 'next/server';
import { withAuth, type AuthContext } from '@/lib/auth/guard';
import { sanityClient, sanityWriteClient } from '@/lib/sanity/client';
import { successResponse, validationError, notFoundError, serverError } from '@/lib/api/response';
import { testimonialCreateSchema } from '@/lib/validation/input-schemas';

export const GET = withAuth(async (_request: NextRequest, { params }: AuthContext<{ id: string }>) => {
  try {
    const projectId = params.id;
    const project = await sanityClient.fetch(`*[_type == "project" && _id == $id][0]{ _id }`, { id: projectId });
    if (!project) return notFoundError('הפרויקט לא נמצא');

    const testimonials = await sanityClient.fetch(
      `*[_type == "testimonial" && projectRef._ref == $projectId] | order(order asc){
        _id, clientName, quote, companyName, role, isFeatured, isActive, order, updatedAt
      }`,
      { projectId },
    );

    return successResponse(testimonials);
  } catch (err) {
    console.error('[api]', err);
    return serverError();
  }
});

export const POST = withAuth(async (request: NextRequest, { params }: AuthContext<{ id: string }>) => {
  try {
    const projectId = params.id;
    const project = await sanityClient.fetch(`*[_type == "project" && _id == $id][0]{ _id }`, { id: projectId });
    if (!project) return notFoundError('הפרויקט לא נמצא');

    const body = await request.json();
    const parsed = testimonialCreateSchema.safeParse(body);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      parsed.error.issues.forEach((i) => { fieldErrors[i.path.join('.')] = i.message; });
      return validationError('נתוני קלט לא תקינים', fieldErrors);
    }

    const now = new Date().toISOString();
    const doc = await sanityWriteClient.create({
      _type: 'testimonial',
      ...parsed.data,
      projectRef: { _type: 'reference', _ref: projectId },
      createdAt: now,
      updatedAt: now,
    });

    return successResponse(doc, undefined, 201);
  } catch (err) {
    console.error('[api]', err);
    return serverError();
  }
});
