"use server"

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'

export async function login(prevState: any, formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const redirectPath = formData.get('redirect') as string || '/dashboard'

  if (!email || !password) {
    return { error: 'Email and password are required' }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    console.error('[Auth] Login failure:', error.message)
    return { error: error.message }
  }

  console.log('[Auth] Login success')
  revalidatePath('/', 'layout')
  redirect(redirectPath)
}

export async function signup(prevState: any, formData: FormData) {
  return { error: 'El registro público no está disponible. Contacta al administrador para recibir una invitación.' }
}

export async function logout() {
  const supabase = await createClient()
  const { error } = await supabase.auth.signOut()
  
  if (error) {
    console.error('[Auth] Logout failure:', error.message)
  } else {
    console.log('[Auth] Logout success')
  }
  
  revalidatePath('/', 'layout')
  redirect('/auth/login')
}

export async function signInWithGoogle(redirectPath: string) {
  const supabase = await createClient()
  const headersList = await headers()
  const origin = headersList.get('origin') || 'http://localhost:3000'
  
  const callbackUrl = new URL(`${origin}/auth/callback`)
  if (redirectPath) {
    callbackUrl.searchParams.set('next', redirectPath)
  }

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: callbackUrl.toString(),
    },
  })

  if (error) {
    console.error('[Auth] Google OAuth failure:', error.message)
    redirect(`/auth/login?error=Could not authenticate with Google`)
  }

  if (data.url) {
    redirect(data.url)
  }
}
