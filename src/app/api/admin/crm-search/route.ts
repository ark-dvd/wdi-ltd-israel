/**
 * GET /api/admin/crm-search — Cross-entity CRM search
 * DOC-040 §2.8
 */
import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/auth/guard';
import { sanityClient } from '@/lib/sanity/client';
import { successResponse, validationError, serverError } from '@/lib/api/response';

export const GET = withAuth(async (request: NextRequest) => {
  try {
    const url = new URL(request.url);
    const q = url.searchParams.get('q')?.trim();

    if (!q || q.length < 2) {
      return validationError('שאילתת חיפוש חייבת להכיל לפחות 2 תווים');
    }

    const searchPattern = `*${q}*`;

    const [leads, clients, engagements] = await Promise.all([
      sanityClient.fetch(
        `*[_type == "lead" && (name match $q || email match $q || company match $q)] | order(createdAt desc) [0...10]{ _id, name, email, status, company }`,
        { q: searchPattern },
      ),
      sanityClient.fetch(
        `*[_type == "clientCrm" && (name match $q || email match $q || company match $q)] | order(createdAt desc) [0...10]{ _id, name, email, status, company }`,
        { q: searchPattern },
      ),
      sanityClient.fetch(
        `*[_type == "engagement" && (title match $q)] | order(createdAt desc) [0...10]{
          _id, title, status, "client": client->{ _id, name }
        }`,
        { q: searchPattern },
      ),
    ]);

    return successResponse({ leads, clients, engagements });
  } catch (err) {
    console.error('[api]', err);
    return serverError();
  }
});
