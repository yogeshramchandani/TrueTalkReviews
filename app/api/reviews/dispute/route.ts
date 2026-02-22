import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { reviewId, professionalId } = await req.json() // Removed unused replyContent
  const supabase = await createClient()

  // 1. Auth Check
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.id !== professionalId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // 2. Update Review Status
  const { error } = await supabase
    .from('reviews')
    .update({
      status: 'disputed',
      professional_vouch: 'disputed'
    })
    .eq('id', reviewId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // 3. (Optional) TODO: Integrate Email Service here
  // await sendEmailToAdmin("Dispute Raised", reviewId)

  return NextResponse.json({ success: true, message: 'Dispute raised. Admin will review.' })
}