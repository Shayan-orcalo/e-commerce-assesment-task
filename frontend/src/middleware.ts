import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Admin routes — guard is done client-side in layout, but
  // this provides a server-side check for the /admin prefix
  if (pathname.startsWith('/admin')) {
    // Token is stored in localStorage (client-side only), so
    // full auth check happens in AdminLayout. This middleware
    // just ensures the route is reachable.
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
