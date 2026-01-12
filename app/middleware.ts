import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // 1. Initialize the response
  // We need to create a response object first so we can attach cookies to it later
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // 2. Create the Supabase Client (Server-Side)
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          // This updates the cookie in the incoming request...
          request.cookies.set({
            name,
            value,
            ...options,
          })
          // ...and creates a new response with the cookie set
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          // This handles cookie removal (logout)
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  // 3. Refresh the Session
  // This is crucial: it updates the auth token if it's about to expire
  const { data: { session } } = await supabase.auth.getSession()

  // --- ADMIN PROTECTION LOGIC ---
  if (request.nextUrl.pathname.startsWith('/admin')) {
    
    // A. If user is NOT logged in -> Send to Login
    if (!session) {
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }

    // B. If user IS logged in -> Check if they are an Admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single()

    // If role is NOT 'admin' -> Kick them to Home page
    if (profile?.role !== 'admin') {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  return response
}

export const config = {
  // Apply this middleware to admin routes and auth callback routes
  matcher: ['/admin/:path*'],
}