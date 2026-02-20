/**
 * GET /api/admin/intake — List intake submissions with filtering
 * CANONICAL-AMENDMENT-001
 */
import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/auth/guard';
import { sanityClient } from '@/lib/sanity/client';
import { listResponse, serverError, parsePagination } from '@/lib/api/response';

export const GET = withAuth(async (request: NextRequest) => {
  try {
    const url = new URL(request.url);
    const { page, limit, offset } = parsePagination(url);

    const type = url.searchParams.get('type');
    const contactStatus = url.searchParams.get('contactStatus');
    const relevance = url.searchParams.get('relevance');
    const outcome = url.searchParams.get('outcome');

    let filter = `_type == "intakeSubmission"`;
    if (type) filter += ` && submissionType == "${type}"`;
    if (contactStatus) filter += ` && contactStatus == "${contactStatus}"`;
    if (relevance) filter += ` && relevance == "${relevance}"`;
    if (outcome) filter += ` && outcome == "${outcome}"`;

    const [data, total] = await Promise.all([
      sanityClient.fetch(
        `*[${filter}] | order(submittedAt desc) [${offset}...${offset + limit}]{
          _id, submissionType, contactName, contactEmail, contactPhone,
          organization, subject, submittedAt, contactStatus, relevance, outcome, source
        }`,
      ),
      sanityClient.fetch(`count(*[${filter}])`),
    ]);

    return listResponse(data, total, page, limit);
  } catch (err) {
    console.error('[api/admin/intake]', err);
    return serverError();
  }
});
