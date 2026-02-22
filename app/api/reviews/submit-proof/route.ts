import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  const { reviewId, proofUrl } = await req.json()

  const { error } = await supabaseAdmin
    .from('reviews')
    .update({ 
      dispute_proof_url: proofUrl,
      dispute_status: 'proof_submitted' 
    })
    .eq('id', reviewId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  
  // TODO: Trigger a notification to your Admin Email here
  return NextResponse.json({ success: true })
}