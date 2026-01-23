import { ImageResponse } from 'next/og'

// 1. Use Edge runtime (Standard for OG images)
export const runtime = 'edge'

export const alt = 'TruVouch Profile'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

// 2. Define props to handle both Next.js 14 (object) and 15 (Promise)
type Props = {
  params: Promise<{ username: string }> | { username: string }
}

export default async function Image({ params }: Props) {
  // 3. AWAIT params to fix the Next.js 15 crash
  const resolvedParams = await params
  const username = resolvedParams.username || 'Professional'

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0f172a', // Slate 900
          color: 'white',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Logo Mark */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 40 }}>
           <div style={{
             display: 'flex',
             alignItems: 'center',
             justifyContent: 'center',
             width: 60,
             height: 60,
             backgroundColor: '#14b8a6', // Teal 500
             borderRadius: 12,
             marginRight: 20,
             color: 'white',
             fontSize: 40,
             fontWeight: 900,
           }}>T</div>
           <div style={{ fontSize: 50, fontWeight: 700 }}>TruVouch</div>
        </div>

        {/* Main Card */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          backgroundColor: '#1e293b', // Slate 800
          padding: '40px 80px',
          borderRadius: 30,
          border: '2px solid #334155',
          boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
        }}>
          {/* Badge */}
          <div style={{
            backgroundColor: 'rgba(20, 184, 166, 0.2)',
            color: '#2dd4bf', // Teal 400
            padding: '10px 30px',
            borderRadius: 50,
            fontSize: 24,
            marginBottom: 30,
            fontWeight: 600,
          }}>
            ✓ Identity Verified
          </div>

          {/* Name */}
          <div style={{ 
            fontSize: 70, 
            fontWeight: 900, 
            color: 'white', 
            marginBottom: 10,
            textAlign: 'center',
            lineHeight: 1.1,
          }}>
            {username}
          </div>

          {/* Stars */}
          <div style={{ fontSize: 32, color: '#94a3b8', marginTop: 10 }}>
            <span style={{ color: '#fbbf24', fontSize: 40, marginRight: 10 }}>★★★★★</span>
            <span style={{ color: 'white', fontWeight: 'bold' }}>5.0</span> Verified
          </div>
        </div>

        {/* Footer */}
        <div style={{ position: 'absolute', bottom: 50, color: '#64748b', fontSize: 24 }}>
          Hire with confidence at truvouch.app
        </div>
      </div>
    ),
    { ...size }
  )
}