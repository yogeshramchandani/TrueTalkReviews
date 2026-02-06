import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

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
    const { data: review } = await supabase
      .from("reviews")
      .select("proof_url, provider_id")
      .eq("id", review_id)
      .single()

    if (!review?.proof_url) {
      return new Response("No proof found", { status: 200 })
    }

    const flags: string[] = []

    // =========================
    // 2️⃣ NSFW CHECK (OpenAI / Vision)
    // =========================
    const nsfw = await fakeNsfwCheck(review.proof_url)
    if (nsfw) flags.push("nsfw")

    // =========================
    // 3️⃣ FAKE / AI IMAGE CHECK
    // =========================
    const aiGenerated = await fakeAiImageCheck(review.proof_url)
    if (aiGenerated) flags.push("ai_generated")

    // =========================
    // 4️⃣ Final decision
    // =========================
    const approved = flags.length === 0

    await supabase
      .from("reviews")
      .update({
        proof_status: approved ? "approved" : "rejected",
        proof_ai_flags: flags,
        proof_checked_at: new Date().toISOString(),
      })
      .eq("id", review_id)

    // 5️⃣ Recalculate provider score
    await supabase.rpc("recalculate_provider_score", {
      p_provider_id: review.provider_id,
    })

    return new Response(
      JSON.stringify({
        success: true,
        approved,
        flags,
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    )
  } catch (e) {
    console.error("AI PROOF ERROR:", e)
    return new Response(
      JSON.stringify({ error: String(e) }),
      { status: 500, headers: corsHeaders }
    )
  }
})

/* -------------------------------------------------
   MOCK FUNCTIONS (replace later with real AI)
-------------------------------------------------- */

async function fakeNsfwCheck(_url: string): Promise<boolean> {
  // Later: OpenAI Vision / Google Vision
  return false
}

async function fakeAiImageCheck(_url: string): Promise<boolean> {
  // Later: Hive / Sensity / OpenAI heuristics
  return false
}
