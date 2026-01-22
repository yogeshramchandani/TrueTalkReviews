import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createClient } from '@supabase/supabase-js'

const resend = new Resend(process.env.RESEND_API_KEY)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
  try {
    const { reviewId, replyText, providerName } = await request.json()

    // 1. Get Review Details
    const { data: reviewData, error: reviewError } = await supabaseAdmin
      .from('reviews')
      .select('reviewer_id, content')
      .eq('id', reviewId)
      .single()

    if (reviewError || !reviewData) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 })
    }

    // 2. Get User Email
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(
      reviewData.reviewer_id
    )

    if (userError || !userData.user?.email) {
      return NextResponse.json({ error: 'User email not found' }, { status: 404 })
    }

    // 3. Construct Link (Teaser Link)
    const baseUrl = 'https://truvouch.app' 
    // This links to the professional's public profile so the user can see their review + the reply
    const profileLink = `${baseUrl}/u/${providerName ? encodeURIComponent(providerName) : ''}` 

    // 4. Send "Teaser" Email
    const { data, error } = await resend.emails.send({
      from: 'TruVouch Notifications <noreply@truvouch.app>',
      to: [userData.user.email],
      subject: `👋 ${providerName || 'A Professional'} replied to your review`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f7f6; color: #333;">
          
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 40px 20px; border-radius: 8px; margin-top: 20px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
            
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #0f766e; margin: 0; font-size: 24px;">TruVouch</h1>
            </div>

            <div style="text-align: center; margin-bottom: 20px;">
              <span style="background-color: #ecfdf5; color: #047857; padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; text-transform: uppercase;">New Activity</span>
            </div>

            <h2 style="font-size: 22px; font-weight: 700; text-align: center; margin-bottom: 15px; color: #111;">
              ${providerName || 'The Service Provider'} has replied to you.
            </h2>
            
            <p style="font-size: 16px; line-height: 1.6; color: #666; text-align: center; margin-bottom: 30px; padding: 0 20px;">
              You recently left a review for <strong>${providerName}</strong>. They have just posted a public response to your feedback.
            </p>

            <div style="margin: 0 auto 30px auto; max-width: 90%;">
              <p style="font-size: 11px; font-weight: bold; color: #999; text-transform: uppercase; margin-bottom: 8px; text-align: center;">Re: Your Review</p>
              <div style="background-color: #f9fafb; border: 1px dashed #d1d5db; border-radius: 6px; padding: 15px; font-style: italic; color: #6b7280; font-size: 14px; text-align: center;">
                "${reviewData.content.length > 80 ? reviewData.content.substring(0, 80) + '...' : reviewData.content}"
              </div>
            </div>

            <div style="text-align: center; margin-bottom: 30px;">
              <a href="${profileLink}" style="background-color: #0f766e; color: #ffffff; padding: 16px 32px; border-radius: 50px; text-decoration: none; font-weight: bold; font-size: 16px; display: inline-block; box-shadow: 0 4px 10px rgba(15, 118, 110, 0.3); transition: background-color 0.2s;">
                Read the Reply
              </a>
            </div>

            <p style="text-align: center; font-size: 14px; color: #888;">
              Click the button above to view the full conversation on TruVouch.
            </p>

            <div style="border-top: 1px solid #eee; margin-top: 40px; padding-top: 20px; text-align: center; font-size: 12px; color: #aaa;">
              <p style="margin: 0;">TruVouch Inc. • Trusted Reviews for Professionals.</p>
            </div>

          </div>
        </body>
        </html>
      `,
    })

    if (error) {
      console.error("Resend Error:", error)
      return NextResponse.json({ error }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("Server Error:", error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}