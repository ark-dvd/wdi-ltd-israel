/**
 * Layer 3: API route guard utility — DOC-010 §2.2, DOC-040 §7.1
 * Wraps API handlers with server-side session verification.
 * Usage: export const POST = withAuth(handler);
 */
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from './config';
import { unauthorizedError } from '../api/response';

export interface AuthContext<P = Record<string, string>> {
  session: { user: { email: string } };
  params: P;
}

type RouteHandler<P> = (
  request: NextRequest,
  context: AuthContext<P>,
) => Promise<NextResponse> | NextResponse;

export function withAuth<P = Record<string, string>>(handler: RouteHandler<P>) {
  return async function authedHandler(
    request: NextRequest,
    routeContext?: { params: Promise<Record<string, string>> },
  ): Promise<NextResponse> {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return unauthorizedError();
    }

    const params = (routeContext?.params ? await routeContext.params : {}) as P;

    return handler(request, {
      session: { user: { email: session.user.email } },
      params,
    });
  };
}
