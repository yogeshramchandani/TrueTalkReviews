import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()

    // 1. CHECK FOR BAN
    if (session?.user) {
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('account_status')
        .eq('id', session.user.id)
        .single()
      
      if (userProfile?.account_status === 'banned') {
        return NextResponse.json(
          { error: "Your account has been suspended due to repeated policy violations." }, 
          { status: 403 }
        )
      }
    }

    // 2. GATHER FINGERPRINTS (Matches your Login API exactly)
    const rawIp = req.headers.get('x-forwarded-for') || 'unknown'
    const userAgent = body.user_agent || req.headers.get('user-agent') || 'unknown'
    const salt = process.env.IP_HASH_SALT


    const ipHash = crypto.createHash('sha256').update(rawIp + salt).digest('hex')
    const deviceHash = crypto.createHash('sha256').update(rawIp + userAgent + salt).digest('hex')

    // 3. SILENT RISK DETECTION
    let detectedFlags: string[] = []
    const durationMs = (Number(body.submission_seconds) || 0) * 1000

    // A. Timer Check (e.g., under 12 seconds is highly suspicious)
    if (durationMs > 0 && durationMs < 12000) {
      detectedFlags.push('Suspiciously Fast')
    }

    // B. Direct Self-Review Attempt (Logged in as the professional)
    if (session?.user?.id === body.provider_id) {
      detectedFlags.push('Self-Review Attempt')
    }

    // C. Device / IP Match Check
    // Fetch the professional's profile using YOUR exact column names
    const { data: providerProfile } = await supabase
      .from('profiles')
      .select('last_device_hash, last_login_ip_hash') // 🟢 Matched to your login API
      .eq('id', body.provider_id)
      .single()

    if (providerProfile) {
      // Check for exact device match first (strongest indicator)
      if (providerProfile.last_device_hash === deviceHash) {
        detectedFlags.push('Device Fingerprint Match')
      } 
      // Then check for IP match (could just be same WiFi, but still a risk flag)
      else if (providerProfile.last_login_ip_hash === ipHash) {
        detectedFlags.push('IP Address Match')
      }
    }

    // Compile flags or mark as safe
    const finalRiskFlag = detectedFlags.length > 0 ? detectedFlags.join(', ') : 'safe'

    // 4. SAVE REVIEW
    const reviewData: any = {
      provider_id: body.provider_id,
      reviewer_id: session?.user?.id || null,
      reviewer_name: body.reviewer_name,
      reviewer_email: body.reviewer_email,
      rating: body.rating,
      content: body.content,
      status: 'unverified',
      ip_hash: ipHash,
      user_agent: userAgent,
      device_hash: deviceHash,
      submit_duration_ms: durationMs, 
      is_visible: true,
      risk_flag: finalRiskFlag // 🟢 Silently flags if rules are broken
    }

    const { data, error } = await supabase
      .from("reviews")
      .upsert({
        ...(body.existing_id && { id: body.existing_id }), 
        ...reviewData
      })
      .select('id, created_at, status, reviewer_name, rating, content, is_visible').single()

    if (error) throw error
    return NextResponse.json({ success: true, data })

  } catch (err: any) {
    console.error("SUBMIT API ERROR:", err.message)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}