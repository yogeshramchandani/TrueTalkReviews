import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  // 1. Create the Supabase Client using the modern getAll/setAll pattern
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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

  // 2. Refresh the Session
  // CRUCIAL FIX: Use getUser() instead of getSession() to securely validate and refresh the token
  const { data: { user } } = await supabase.auth.getUser()

  // 3. --- ADMIN PROTECTION LOGIC ---
  if (request.nextUrl.pathname.startsWith('/admin')) {
    
    // A. If user is NOT logged in -> Send to Login
    if (!user) {
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }

    // B. If user IS logged in -> Check if they are an Admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    // C. If role is NOT 'admin' -> Kick them to Home page
    if (profile?.role !== 'admin') {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  return supabaseResponse
}

export const config = {
  // CRUCIAL FIX: This matcher runs the middleware on ALL pages (except static files/images)
  // This ensures your refresh token is perfectly managed globally, completely eliminating the 400 error.
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}