/**
 * Layer 3: API route guard utility — DOC-010 §2.2
 * Wraps API handlers with server-side session verification.
 * Usage: export const POST = withAuth(handler);
 */
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from './config';

type RouteHandler = (
  request: NextRequest,
  context: { session: { user: { email: string } } },
) => Promise<NextResponse> | NextResponse;

export function withAuth(handler: RouteHandler) {
  return async function authedHandler(request: NextRequest): Promise<NextResponse> {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'אימות נדרש', code: 'UNAUTHORIZED' },
        { status: 401 },
      );
    }

    return handler(request, {
      session: { user: { email: session.user.email } },
    });
  };
}
