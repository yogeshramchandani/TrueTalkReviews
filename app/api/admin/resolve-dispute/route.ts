import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// Initialize Admin Client
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  try {
    const { reviewId, isValid, reviewerId, providerId } = await req.json()

    if (isValid) {
      /**
       * CASE A: PROOF IS VALID (Reviewer Wins)
       * 1. Mark review as 'vetted' (permanent verified status).
       * 2. Increase Professional's penalty score.
       */
      
      // 1. Update Review
      const { error: reviewError } = await supabaseAdmin
        .from('reviews')
        .update({ 
          status: 'vetted', 
          professional_vouch: 'vouched',
          dispute_status: 'resolved_valid' 
        })
        .eq('id', reviewId)

      if (reviewError) throw reviewError

      // 2. Penalize Professional (Increase penalty_score by 20%)
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('penalty_score')
        .eq('id', providerId)
        .single()

      const newPenalty = (profile?.penalty_score || 0) + 20

      await supabaseAdmin
        .from('profiles')
        .update({ penalty_score: newPenalty })
        .eq('id', providerId)

    } else {
      /**
       * CASE B: PROOF IS INVALID/EXPIRED (Professional Wins)
       * 1. Disable the review forever.
       * 2. Add 1 strike to the Reviewer's account.
       */

      // 1. Disable Review
      const { error: reviewError } = await supabaseAdmin
        .from('reviews')
        .update({ 
          status: 'disabled', 
          is_visible: false,
          dispute_status: 'resolved_invalid' 
        })
        .eq('id', reviewId)

      if (reviewError) throw reviewError

      // 2. Add Strike to Reviewer
      const { data: reviewer } = await supabaseAdmin
        .from('profiles')
        .select('strikes')
        .eq('id', reviewerId)
        .single()

      const newStrikes = (reviewer?.strikes || 0) + 1

      await supabaseAdmin
        .from('profiles')
        .update({ strikes: newStrikes })
        .eq('id', reviewerId)
    }

    return NextResponse.json({ success: true })

  } catch (error: any) {
    console.error("Resolution Error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}