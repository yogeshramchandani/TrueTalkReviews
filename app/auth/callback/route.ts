import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const origin = requestUrl.origin // This captures the tunnel URL dynamically
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') ?? '/service-provider-dashboard'
  const error = requestUrl.searchParams.get('error')
  const error_description = requestUrl.searchParams.get('error_description')

  // 1. Handle Auth Errors
  if (error) {
    console.error("Supabase Auth Error:", error, error_description)
    return NextResponse.redirect(`${origin}/auth/auth-code-error?message=${encodeURIComponent(error_description || error)}`)
  }

  if (code) {
    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) { return cookieStore.get(name)?.value },
          set(name: string, value: string, options: CookieOptions) { 
            // 🎯 PATCH: Ensure cookies work across the tunnel domain
            cookieStore.set({ name, value, ...options }) 
          },
          remove(name: string, options: CookieOptions) { 
            cookieStore.delete({ name, ...options }) 
          },
        },
      }
    )
    
    const { error: sessionError } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!sessionError) {
      // 🎯 THE FIX: Ensure we redirect back to the TUNNEL origin, not localhost
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}