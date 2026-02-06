import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

Deno.serve(async (req) => {
  try {
    const { review_id } = await req.json()
    if (!review_id) {
      return new Response("Missing review_id", { status: 400 })
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    )

    // 1️⃣ Load review
    const { data: review, error } = await supabase
      .from("reviews")
      .select("*")
      .eq("id", review_id)
      .single()

    if (error || !review) {
      return new Response("Review not found", { status: 404 })
    }

    let riskScore = 0
    const flags: string[] = []

    // 2️⃣ Same IP usage
    if (review.ip_hash) {
      const { count } = await supabase
        .from("reviews")
        .select("id", { count: "exact", head: true })
        .eq("ip_hash", review.ip_hash)

      if (count && count > 1) {
        riskScore += 20
        flags.push("ip_reused")
      }

      if (count && count > 3) {
        riskScore += 40
        flags.push("ip_many_reviews")
      }

      await supabase
        .from("reviews")
        .update({ ip_seen_count: count || 1 })
        .eq("id", review_id)
    }

    // 3️⃣ Fast submission
    if (review.submit_duration_ms && review.submit_duration_ms < 15000) {
      riskScore += 15
      flags.push("fast_submission")
    }

    // 4️⃣ Proof logic
    if (review.proof_status === "approved") {
      riskScore -= 20
      flags.push("proof_verified")
    } else if (review.proof_status === "pending") {
      riskScore -= 5
      flags.push("proof_pending")
    }

    // 5️⃣ Cap score
    riskScore = Math.max(0, Math.min(100, riskScore))

    // 6️⃣ Save
    await supabase
      .from("reviews")
      .update({
        risk_score: riskScore,
        risk_flags: flags,
      })
      .eq("id", review_id)

    return new Response(
      JSON.stringify({ success: true, riskScore, flags }),
      { headers: { "Content-Type": "application/json" } }
    )
  } catch (e) {
    console.error("RISK FUNCTION ERROR:", e)
    return new Response(
      JSON.stringify({ error: String(e) }),
      { status: 500 }
    )
  }
})
