import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export const config = {
  matcher: [
    /*
     * Match all request paths inside:
     * - /dashboard (and its subpaths)
     * - /auth (and its subpaths)
     */
    '/dashboard/:path*',
    '/auth/:path*'
  ],
}

export default async function proxy(request: NextRequest) {
  const isDev = process.env.NODE_ENV === 'development'
  const isDashboardRoute = request.nextUrl.pathname.startsWith('/dashboard')
  const isAuthRoute = request.nextUrl.pathname.startsWith('/auth')

  let supabaseResponse = NextResponse.next({
    request,
  })

  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
            supabaseResponse = NextResponse.next({
              request,
            })
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            )
          },
        },
      }
    )

    // IMPORTANT: Use getUser(), not getSession() for security
    const { data: { user }, error } = await supabase.auth.getUser()

    if (isDev) {
      console.log(`[Proxy] Analyzing route: ${request.nextUrl.pathname}`)
      if (error) console.log(`[Proxy] getUser error (or none):`, error.message)
      if (user) console.log(`[Proxy] Authenticated user ID:`, user.id)
    }

    // 1. Unauthenticated user trying to access a protected route
    if (!user && isDashboardRoute) {
      if (isDev) console.log(`[Proxy] ⛔ Blocked unauthenticated access to dashboard. Redirecting to login.`)
      
      const url = request.nextUrl.clone()
      url.pathname = '/auth/login'
      // Preserve the intended destination so they can be redirected back after login
      url.searchParams.set('redirect', request.nextUrl.pathname)
      
      return NextResponse.redirect(url)
    }

    // 2. Authenticated user trying to access auth pages (login/signup)
    // Allow /auth/signup so invitees can set their password
    if (user && isAuthRoute && !request.nextUrl.pathname.startsWith('/auth/signup')) {
      if (isDev) console.log(`[Proxy] 🔄 Authenticated user visited auth route. Redirecting to dashboard.`)
      
      const url = request.nextUrl.clone()
      url.pathname = '/dashboard'
      url.searchParams.delete('redirect')
      
      return NextResponse.redirect(url)
    }

    // Allow request to proceed
    if (isDev) console.log(`[Proxy] ✅ Request allowed`)
    return supabaseResponse

  } catch (error) {
    // Fail OPEN vs CLOSED pattern
    if (isDev) {
      console.error(`[Proxy] ⚠️ CRITICAL ERROR IN DEV: Failing OPEN to preserve local fallback workflows`, error)
      return supabaseResponse
    } else {
      console.error(`[Proxy] 🚨 CRITICAL ERROR IN PROD: Failing CLOSED to prevent unauthorized access`, error)
      const url = request.nextUrl.clone()
      url.pathname = '/auth/login'
      return NextResponse.redirect(url)
    }
  }
}
