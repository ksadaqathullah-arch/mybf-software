import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getPortalScope, SESSION_COOKIE_ADMIN } from '@/server/auth/portal-isolation';

function applySecurityHeaders(response: NextResponse) {
  response.headers.set('X-DNS-Prefetch-Control', 'on');
  response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'origin-when-cross-origin');
}

export function middleware(request: NextRequest) {
  const portalScope = getPortalScope(request.headers);
  const pathname = request.nextUrl.pathname;

  // Zero-Trust Block: Super Admin routes do not exist on Port 3000 (Hosted on dedicated Port 4000 / Subdomain)
  if (pathname.startsWith('/super-admin')) {
    const notFoundUrl = new URL('/not-found', request.url);
    const response = NextResponse.rewrite(notFoundUrl, { status: 404 });
    applySecurityHeaders(response);
    return response;
  }

  if (pathname.startsWith('/api/v1/super-admin')) {
    const response = new NextResponse(JSON.stringify({ success: false, error: 'Not Found' }), {
      status: 404,
      headers: { 'content-type': 'application/json' },
    });
    applySecurityHeaders(response);
    return response;
  }

  const response = NextResponse.next();
  applySecurityHeaders(response);
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, fonts, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};

