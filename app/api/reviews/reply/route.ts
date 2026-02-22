import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { reviewId, professionalId, replyContent } = await req.json()
    const supabase = await createClient()

    const [profileRes, reviewRes] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', professionalId).single(),
      supabase.from('reviews').select('*').eq('id', reviewId).single()
    ])

    const profile = profileRes.data
    const review = reviewRes.data

    if (!profile || !review) return NextResponse.json({ error: 'Data not found' }, { status: 404 })

    // --- 🎯 THE FIX: PREVENTION OF POINT FARMING ---
    // Check if the professional has ALREADY replied to this review.
    const isFirstReply = !review.provider_reply || review.provider_reply.trim() === "";

    let newResponse = profile.responsiveness_score ?? 0;
    let newVouchScore = profile.vouch_score ?? 25;

    // Only calculate and add points if this is the VERY FIRST reply.
    if (isFirstReply) {
        const MAX_SCORE = 100
        const currentResponse = profile.responsiveness_score ?? 0
        const responseGap = MAX_SCORE - currentResponse
        
        const getMultiplier = (s: number) => (s < 60 ? 0.135 : s < 85 ? 0.04 : 0.01)
        const multiplier = getMultiplier(currentResponse)

        const daysDiff = (Date.now() - new Date(review.created_at).getTime()) / (1000 * 3600 * 24)

        let replyBoost = 0
        if (daysDiff <= 7) {
            let timeQuality = daysDiff <= 2 ? 1.0 : Math.max(0, 1 - ((daysDiff - 2) / 5))
            replyBoost = responseGap * multiplier * 0.5 * timeQuality
        }

        newResponse = currentResponse + replyBoost
        newVouchScore = (profile.honesty_score * 0.5) + (newResponse * 0.3) + (profile.activity_score * 0.2)
    }

    // 3. Update Database
    // Note: We always update the review text, but we only update the profile scores if it's the first time.
    const updates = [
      supabase.from('reviews').update({
        provider_reply: replyContent,
        provider_reply_at: new Date().toISOString()
      }).eq('id', reviewId)
    ];

    if (isFirstReply) {
      updates.push(
        supabase.from('profiles').update({
          responsiveness_score: newResponse,
          vouch_score: newVouchScore
        }).eq('id', professionalId)
      );
    }

    await Promise.all(updates);

    return NextResponse.json({ 
      success: true, 
      pointsAwarded: isFirstReply // Frontend can use this to show/hide the animation
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}