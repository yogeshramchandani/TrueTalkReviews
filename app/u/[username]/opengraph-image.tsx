import { ImageResponse } from 'next/og'
import { createClient } from '@supabase/supabase-js'

// 1. Force Edge Runtime for speed
export const runtime = 'edge'

export const alt = 'Professional Profile'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

// Initialize Supabase Client (Standard REST fetch is better for Edge)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default async function Image({ params }: { params: { username: string } }) {
  const { username } = params

  // 2. Fetch User Data
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, profession, avatar_url, city, id')
    .eq('username', username)
    .single()

  // 3. Fetch Review Stats
  // (We fetch minimal data just to calculate stars)
  const { data: reviews } = await supabase
    .from('reviews')
    .select('rating')
    .eq('provider_id', profile?.id) // Assuming you can join or fetch ID. 
    // If you don't have ID here, you might need to fetch profile first (which we did).

  // Calculate Rating
  const reviewCount = reviews?.length || 0
  const ratingValue = reviewCount > 0
    ? (reviews!.reduce((acc, r) => acc + r.rating, 0) / reviewCount).toFixed(1)
    : "5.0" // Default for new users (encouraging)

  // Fallbacks
  const name = profile?.full_name || username
  const profession = profile?.profession || 'Verified Professional'
  const location = profile?.city || 'Remote'
  // Use a default avatar if they don't have one
  const avatar = profile?.avatar_url || 'https://truvouch.app/default-avatar.png' 

  return new ImageResponse(
    (
      // CSS-in-JS (Flexbox) to design the card
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#0f172a', // Slate-900
          padding: '60px',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Left Side: Text Info */}
        <div style={{ display: 'flex', flexDirection: 'column', color: 'white' }}>
          
          {/* Badge */}
          <div style={{
             display: 'flex',
             alignItems: 'center',
             backgroundColor: '#0d9488', // Teal-600
             padding: '8px 20px',
             borderRadius: '50px',
             width: 'fit-content',
             marginBottom: '20px'
          }}>
            <span style={{ color: 'white', fontWeight: 'bold', fontSize: 20 }}>
              ✓ Verified on TruVouch
            </span>
          </div>

          {/* Name & Role */}
          <div style={{ fontSize: 60, fontWeight: 'bold', marginBottom: '10px' }}>
            {name}
          </div>
          <div style={{ fontSize: 36, color: '#94a3b8', marginBottom: '40px' }}>
            {profession} • {location}
          </div>

          {/* Star Rating Box */}
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ display: 'flex', color: '#fbbf24', fontSize: 40, marginRight: '15px' }}>
              ★★★★★
            </div>
            <div style={{ fontSize: 30, color: 'white' }}>
              <span style={{ fontWeight: 'bold' }}>{ratingValue}</span> ({reviewCount} Reviews)
            </div>
          </div>
        </div>

        {/* Right Side: Avatar Image */}
        <div style={{ display: 'flex' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={avatar}
            alt={name}
            width="300"
            height="300"
            style={{
              borderRadius: '50%',
              border: '8px solid #0d9488', // Teal border
              objectFit: 'cover',
            }}
          />
        </div>

        {/* Branding Corner */}
        <div style={{
          position: 'absolute',
          bottom: 40,
          right: 60,
          fontSize: 24,
          color: '#475569',
          fontWeight: 600
        }}>
          truvouch.app
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}