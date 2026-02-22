import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // 1. Capture IP securely
  const ip = req.headers.get('x-forwarded-for') || 'unknown'
  
  // 2. Capture User-Agent (Metadata Fingerprint)
  const userAgent = req.headers.get('user-agent') || 'unknown'

  const salt = process.env.IP_HASH_SALT

  if (!salt) {
  throw new Error("CRITICAL SECURITY ERROR: HASH_SALT is missing from environment variables.")
}
  
  // 3. Create Hashes
  // IP Hash for direct matching
  const ipHash = crypto.createHash('sha256').update(ip + salt).digest('hex')
  
  // Metadata Hash (Fingerprint) - Unique combination of IP + Browser info
  const metadataHash = crypto.createHash('sha256')
    .update(ip + userAgent + salt)
    .digest('hex')

  // 4. Update Profile
  // We store both so you can check if they are on the same WiFi (IP) 
  // AND the same device (Metadata)
  const { error } = await supabase
    .from('profiles')
    .update({ 
      last_login_ip_hash: ipHash,
      last_device_hash: metadataHash // Ensure this column exists in your profiles table
    })
    .eq('id', user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}