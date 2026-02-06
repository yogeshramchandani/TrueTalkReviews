import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import crypto from 'crypto'

export async function POST(request: Request) {
  const { userId, rawIp } = await request.json()
  const cookieStore = cookies()

  // 1. Create the one-way hash for privacy compliance
  const ipHash = crypto
    .createHash('sha256')
    .update(rawIp + (process.env.IP_HASH_SALT || 'default_salt_change_this'))
    .digest('hex')

  // 2. Initialize the SSR client
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.set({ name, value: '', ...options })
        },
      },
    }
  )

  // 3. Update the profile
  const { error } = await supabase
    .from('profiles')
    .update({ last_login_ip_hash: ipHash })
    .eq('id', userId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  
  return NextResponse.json({ success: true })
}