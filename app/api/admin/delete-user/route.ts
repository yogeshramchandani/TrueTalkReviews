import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function DELETE(request: Request) {
  try {
    const { userId } = await request.json()
    console.log("SERVER: Deleting user:", userId)

    // 1. Create Super-Admin Client
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!, 
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // 2. Try to delete the Auth Account (Login)
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId)
    
    // IF ERROR: Check if it's just "User not found" (which is fine, means they are already gone)
    if (authError) {
      console.log("Auth deletion warning:", authError.message)
      // If it's a real error (not just missing user), stop here
      if (!authError.message.includes("User not found") && !authError.message.includes("404")) {
         return NextResponse.json({ error: authError.message }, { status: 400 })
      }
    }

    // 3. FORCE DELETE the Profile Row (The Cleanup)
    // We do this regardless of whether step 2 succeeded or failed
    const { error: dbError } = await supabaseAdmin
      .from('profiles')
      .delete()
      .eq('id', userId)

    if (dbError) {
      console.error("Profile delete failed:", dbError.message)
      return NextResponse.json({ error: dbError.message }, { status: 500 })
    }

    return NextResponse.json({ message: "User wiped successfully" })

  } catch (error: any) {
    console.error("Server Error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}