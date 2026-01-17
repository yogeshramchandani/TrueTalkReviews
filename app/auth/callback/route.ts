import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  
  // 1. Check for errors sent back from Supabase
  const error = searchParams.get('error')
  const error_description = searchParams.get('error_description')
  
  // [NEW]: Capture the 'next' param (Where the user wanted to go)
  // If no 'next' is found, default to '/service-provider-dashboard'
  const next = searchParams.get('next') ?? '/service-provider-dashboard'

  if (error) {
    console.error("Supabase Auth Error:", error, error_description)
    // Redirect to error page but include the specific message so we know WHY
    return NextResponse.redirect(`${origin}/auth/auth-code-error?message=${encodeURIComponent(error_description || error)}`)
  }

  // 2. Check for the Code (PKCE Flow)
  const code = searchParams.get('code')
  if (code) {
    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) { return cookieStore.get(name)?.value },
          set(name: string, value: string, options: CookieOptions) { cookieStore.set({ name, value, ...options }) },
          remove(name: string, options: CookieOptions) { cookieStore.delete({ name, ...options }) },
        },
      }
    )
    
    // Exchange the code for a session
    const { error: sessionError } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!sessionError) {
      // SUCCESS: Redirect to the dynamic 'next' URL instead of hardcoded dashboard
      // If they came from a profile review button, this sends them back there.
      return NextResponse.redirect(`${origin}${next}`)
    } else {
      console.error("Session Exchange Error:", sessionError)
    }
  }

  // 3. Fallback Error
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}