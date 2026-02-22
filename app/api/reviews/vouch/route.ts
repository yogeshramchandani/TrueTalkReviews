import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// --- HELPER: ASYMPTOTIC MULTIPLIERS ---
const getDifficultyMultiplier = (score: number) => {
  if (score < 60) return 0.135; 
  if (score < 85) return 0.04; 
  return 0.01; 
};

export async function POST(req: NextRequest) {
  try {
    const { reviewId, professionalId, replyContent } = await req.json()
    const supabase = await createClient()

    // 1. AUTH & DATA FETCHING
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || user.id !== professionalId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const [reviewRes, profileRes] = await Promise.all([
      supabase.from('reviews').select('*').eq('id', reviewId).single(),
      supabase.from('profiles').select('*').eq('id', professionalId).single()
    ])

    const review = reviewRes.data
    const profile = profileRes.data

    if (!review || !profile) return NextResponse.json({ error: 'Data not found' }, { status: 404 })
    if (profile.account_status === 'suspended') {
      return NextResponse.json({ error: 'Account suspended' }, { status: 403 })
    }

    

    if (review.risk_flag && review.risk_flag !== 'safe') {
      const newStrikes = (profile.fraud_strikes || 0) + 1
      const penalty = newStrikes === 1 ? 10 : newStrikes === 2 ? 25 : 50
      
      const newPenaltyTotal = (profile.penalty_score || 0) + penalty
      const isNowSuspended = newPenaltyTotal >= 100

      await supabase.from('profiles').update({ 
        honesty_score: Math.max(0, (profile.honesty_score || 50) - penalty), 
        penalty_score: newPenaltyTotal,
        fraud_strikes: newStrikes,
        account_status: isNowSuspended ? 'suspended' : profile.account_status
      }).eq('id', professionalId)

      // Strike the Reviewer as well
      if (review.reviewer_id) {
        const { data: r } = await supabase.from('profiles').select('fraud_strikes').eq('id', review.reviewer_id).single()
        const rs = (r?.fraud_strikes || 0) + 1
        await supabase.from('profiles').update({ fraud_strikes: rs, account_status: rs >= 3 ? 'banned' : 'active' }).eq('id', review.reviewer_id)
      }

      // Move the review to removed
      await supabase.from('reviews').update({ status: 'removed', is_visible: false }).eq('id', reviewId)
      
      // 🟢 CHANGED: Added action tag and clear error message for the frontend UI
      return NextResponse.json(
        { 
          success: false, 
          error: 'Fraudulent activity detected. A penalty has been applied to your account.',
          action: 'moved_to_removed' 
        }, 
        { status: 403 }
      )
    }

    // =========================================================================
    // 🏆 GENUINE VOUCH (ASYMPTOTIC GROWTH)
    // =========================================================================
    const MAX = 100
    const { honesty_score: h, responsiveness_score: r, activity_score: a } = profile

    // A. REDEMPTION (Healing Penalties)
    const newPenalty = Math.max(0, (profile.penalty_score || 0) - 5)
    const newStrikes = newPenalty === 0 ? 0 : profile.fraud_strikes

    // B. HONESTY (Full weight on vouch)
    const hMult = getDifficultyMultiplier(h)
    const hQuality = review.rating <= 3 ? 1.5 : 1.0
    const newH = h + ((MAX - h) * hMult * hQuality)

    // C. RESPONSIVENESS (50% Vouch Reward + 50% Potential Reply Reward)
    const rMult = getDifficultyMultiplier(r)
    const rGap = MAX - r
    
    // 50% for the act of vouching
    let rInc = rGap * rMult * 0.5 

    // 50% for the reply (if provided during vouch)
    const sec = (review.submit_duration_ms || 0) / 1000
    const days = (Date.now() - new Date(review.created_at).getTime()) / (1000 * 3600 * 24)
    
    if (replyContent?.trim() && sec > 10 && days <= 7) {
      const tQuality = days <= 2 ? 1.0 : Math.max(0, 1 - ((days - 2) / 5))
      rInc += (rGap * rMult * 0.5 * tQuality)
    }
    const newR = r + rInc

    // D. ACTIVITY & MASTER SCORE
    const newA = a + ((MAX - a) * getDifficultyMultiplier(a))
    const newVouchScore = (newH * 0.5) + (newR * 0.3) + (newA * 0.2) // 50/30/20

    // E. DB UPDATES
    await Promise.all([
      supabase.from('profiles').update({ 
        honesty_score: newH, responsiveness_score: newR, activity_score: newA, 
        vouch_score: newVouchScore, penalty_score: newPenalty, fraud_strikes: newStrikes 
      }).eq('id', professionalId),
      supabase.from('reviews').update({
        status: 'vetted', professional_vouch: 'vouched', 
        provider_reply: replyContent || review.provider_reply || null, vouch_at: new Date().toISOString()
      }).eq('id', reviewId)
    ])

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}