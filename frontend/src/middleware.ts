import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Admin route protection
  if (pathname.startsWith('/admin')) {
    // Allow access to login and authenticate pages
    if (pathname === '/admin/login' || pathname === '/admin/authenticate') {
      return NextResponse.next()
    }

    // Check for admin token
    const adminToken = request.cookies.get('admin_token')?.value ||
                      request.headers.get('authorization')?.replace('Bearer ', '')

    if (!adminToken) {
      // No admin token, redirect to admin login
      const loginUrl = new URL('/admin/login', request.url)
      return NextResponse.redirect(loginUrl)
    }

    // Validate the token with the backend
    try {
      const response = await fetch(`${request.nextUrl.origin}/api/admin/me`, {
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Cookie': request.headers.get('cookie') || '',
        },
      })

      if (!response.ok) {
        // Invalid token, redirect to admin login
        const loginUrl = new URL('/admin/login', request.url)
        return NextResponse.redirect(loginUrl)
      }

      return NextResponse.next()
    } catch (error) {
      // Error validating token, redirect to admin login
      const loginUrl = new URL('/admin/login', request.url)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}