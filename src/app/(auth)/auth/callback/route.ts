import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  
  // "next" is the redirect parameter from Supabase OAuth or Email links
  const next = searchParams.get('next') ?? '/dashboard'

  // Validate internal redirect to prevent open redirect vulnerabilities
  const safeNext = next.startsWith('/') ? next : '/dashboard'

  if (code) {
    console.log(`[Auth Callback] Exchanging code for session. Dest: ${safeNext}`)
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      console.log(`[Auth Callback] Exchange success! Redirecting to ${origin}${safeNext}`)
      return NextResponse.redirect(`${origin}${safeNext}`)
    } else {
      console.error(`[Auth Callback] Exchange error:`, error.message)
      return NextResponse.redirect(`${origin}/auth/login?error=Authentication failed: ${encodeURIComponent(error.message)}`)
    }
  } else {
    console.warn(`[Auth Callback] No code provided. Redirecting to login.`)
    return NextResponse.redirect(`${origin}/auth/login?error=No authentication code provided`)
  }
}
