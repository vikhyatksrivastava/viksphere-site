import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const match = pathname.match(/^\/([^/]+)\/admin(\/|$)/)
  if (!match) return NextResponse.next()

  const secret = match[1]

  // Never intercept Next.js internals or API routes
  if (secret === 'api' || secret.startsWith('_next')) return NextResponse.next()

  if (secret !== process.env.ADMIN_SECRET_KEY) {
    return new NextResponse(null, { status: 404 })
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/:secret/admin', '/:secret/admin/:path*'],
}
