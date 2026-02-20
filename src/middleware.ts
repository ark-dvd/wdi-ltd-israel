/**
 * Layer 1: Edge middleware — DOC-010 §2.2
 * Protects /admin/* and /api/admin/* routes.
 * Fail-closed: no token = denied.
 */
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token) {
    const { pathname } = request.nextUrl;

    // API routes return 401 JSON
    if (pathname.startsWith('/api/admin')) {
      return NextResponse.json(
        { error: 'אימות נדרש', code: 'UNAUTHORIZED' },
        { status: 401 },
      );
    }

    // Admin pages redirect to login
    const loginUrl = new URL('/admin/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};
