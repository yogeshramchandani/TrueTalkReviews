import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
}

Deno.serve(async (req) => {
  // ✅ Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    // ✅ Ensure request is authenticated
    const authHeader = req.headers.get("Authorization")
    if (!authHeader) {
      return new Response("Unauthorized", { status: 401 })
    }

    const { review_id } = await req.json()
    if (!review_id) {
      return new Response("Missing review_id", { status: 400 })
    }

    // ✅ Service role client (bypasses RLS safely)
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      {
        global: {
          headers: {
            Authorization: authHeader,
          },
        },
      }
    )

    // 🌐 Extract IP
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      req.headers.get("cf-connecting-ip") ??
      "unknown"

    // 🔐 Hash IP
    const data = new TextEncoder().encode(ip)
    const hashBuffer = await crypto.subtle.digest("SHA-256", data)
    const ipHash = Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("")

    // 🧠 Update review
    const { error } = await supabase
      .from("reviews")
      .update({ ip_hash: ipHash })
      .eq("id", review_id)

    if (error) {
      console.error("DB UPDATE ERROR:", error)
      return new Response("DB error", { status: 500 })
    }

    return new Response(
      JSON.stringify({ success: true }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    )
  } catch (e) {
    console.error("FUNCTION ERROR:", e)
    return new Response(
      JSON.stringify({ error: String(e) }),
      {
        status: 500,
        headers: corsHeaders,
      }
    )
  }
})
