import { ImageResponse } from 'next/og'

// 1. We removed "export const runtime = 'edge'" to use the safer Node.js runtime
export const alt = 'Profile Preview'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image({ params }: { params: { username: string } }) {
  // 2. No Supabase for now - just static text to test if it renders
  const username = params.username || 'Professional'

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
          backgroundColor: '#0f172a', // Dark Slate Blue
          color: 'white',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Verification Badge */}
        <div style={{
          padding: '10px 30px',
          backgroundColor: '#0d9488', // Teal
          borderRadius: 50,
          fontSize: 24,
          marginBottom: 40,
          color: 'white',
        }}>
          ✓ Verified Professional
        </div>

        {/* Name */}
        <div style={{ fontSize: 70, fontWeight: 'bold', marginBottom: 20 }}>
          {username}
        </div>

        {/* Subtitle */}
        <div style={{ fontSize: 40, color: '#94a3b8' }}>
          See verified reviews on TruVouch
        </div>
      </div>
    ),
    { ...size }
  )
}