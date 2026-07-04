import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const type = searchParams.get('type')

  // "next" is the redirect parameter from Supabase OAuth or Email links
  const next = searchParams.get('next') ?? '/dashboard'

  // Validate internal redirect to prevent open redirect vulnerabilities
  const safeNext = next.startsWith('/') ? next : '/dashboard'

  if (code) {
    console.log(`[Auth Callback] Exchanging code for session. Type: ${type}, Dest: ${safeNext}`)
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error(`[Auth Callback] Exchange error:`, error.message)
      return NextResponse.redirect(`${origin}/auth/login?error=Authentication failed: ${encodeURIComponent(error.message)}`)
    }

    if (!data?.session) {
      console.error(`[Auth Callback] No session after exchange.`)
      return NextResponse.redirect(`${origin}/auth/login?error=No session returned`)
    }

    // If invite, redirect to signup page with tokens in hash so the
    // client-side Supabase client can detect the session and prompt
    // the user to set their password.
    if (type === 'invite') {
      const { access_token, refresh_token } = data.session
      const hash = `access_token=${access_token}&refresh_token=${refresh_token}&type=invite&token_type=bearer`
      console.log(`[Auth Callback] Invite flow detected. Redirecting to signup with hash.`)
      return NextResponse.redirect(`${origin}/auth/signup#${hash}`)
    }

    console.log(`[Auth Callback] Exchange success! Redirecting to ${origin}${safeNext}`)
    return NextResponse.redirect(`${origin}${safeNext}`)
  } else {
    console.warn(`[Auth Callback] No code provided. Redirecting to login.`)
    return NextResponse.redirect(`${origin}/auth/login?error=No authentication code provided`)
  }
}
