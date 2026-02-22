import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createClient } from '@supabase/supabase-js'

// 1. Initialize Clients
const resend = new Resend(process.env.RESEND_API_KEY)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Must use Service Role for admin updates
)

export async function POST(req: Request) {
  try {
    const { reviewId, reviewerEmail } = await req.json();

    if (!reviewId || !reviewerEmail) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 2. Update Database with the current timestamp and status
    const { error: dbError } = await supabaseAdmin
      .from('reviews')
      .update({ 
        dispute_notified_at: new Date().toISOString(),
        dispute_status: 'pending_proof' 
      })
      .eq('id', reviewId);

    if (dbError) {
      console.error("Database Update Error:", dbError);
      return NextResponse.json({ error: "Failed to update review status" }, { status: 500 });
    }

    // 3. Construct the secure upload link
    const proofLink = `https://truvouch.app/dispute-upload/${reviewId}`;

    // 4. Send the Email via Resend
    const { error: emailError } = await resend.emails.send({
      from: 'TruVouch Legal <legal@truvouch.app>',
      to: [reviewerEmail],
      subject: "🚨 Action Required: Provide proof for your review",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
          <h2 style="color: #0f766e;">Verify your service experience</h2>
          <p>Hello,</p>
          <p>A professional has disputed your review on TruVouch. To maintain the integrity of our platform and keep your review active, we require verification of your interaction.</p>
          <p><strong>Please upload proof of service (invoice, receipt, or chat history) within 48 hours.</strong></p>
          
          <div style="margin: 30px 0;">
            <a href="${proofLink}" style="padding: 14px 28px; background-color: #0f766e; color: white; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">
              Upload Evidence Now
            </a>
          </div>
          
          <p style="font-size: 14px; color: #666;">Note: Failure to provide proof within the timeframe will result in the permanent removal of your review and a strike against your account.</p>
          <hr style="border: 0; border-top: 1px solid #eee; margin-top: 20px;" />
          <p style="font-size: 12px; color: #aaa;">TruVouch Legal Team</p>
        </div>
      `
    });

    if (emailError) {
      console.error("Email Delivery Error:", emailError);
      return NextResponse.json({ error: "Failed to send notification email" }, { status: 500 });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Server Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}