import { ImageResponse } from 'next/og'

// 1. Force Node.js runtime (more stable for free tier)
export const runtime = 'nodejs' 

export const alt = 'TruVouch Profile'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image({ params }: { params: { username: string } }) {
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
          backgroundColor: '#0f172a', // Solid dark blue (no gradients to save memory)
          color: 'white',
        }}
      >
        {/* Logo Mark */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: 40,
        }}>
           <div style={{
             fontSize: 40,
             fontWeight: 900,
             color: '#14b8a6', // Teal
             marginRight: 15,
           }}>T</div>
           <div style={{ fontSize: 40, fontWeight: 700 }}>TruVouch</div>
        </div>

        {/* Main Card */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          backgroundColor: '#1e293b', // Slate 800
          padding: '40px 80px',
          borderRadius: 20,
          border: '1px solid #334155',
        }}
        >
          {/* Badge */}
          <div style={{
            backgroundColor: 'rgba(20, 184, 166, 0.2)',
            color: '#2dd4bf',
            padding: '10px 24px',
            borderRadius: 50,
            fontSize: 20,
            marginBottom: 20,
          }}>
            ✓ Identity Verified
          </div>

          {/* Name */}
          <div style={{ 
            fontSize: 70, 
            fontWeight: 900, 
            marginBottom: 10,
            textAlign: 'center',
            lineHeight: 1.1,
          }}>
            {username}
          </div>

          {/* Stars (Text based to avoid icon fetch issues) */}
          <div style={{ fontSize: 30, color: '#94a3b8', marginTop: 10 }}>
            <span style={{ color: '#fbbf24', fontSize: 36 }}>★★★★★</span> 5.0 Rating
          </div>
        </div>

        <div style={{ position: 'absolute', bottom: 40, color: '#64748b', fontSize: 24 }}>
          truvouch.app
        </div>
      </div>
    ),
    {
      ...size,
      // 2. Disable font loading to prevent timeouts
      fonts: undefined, 
    }
  )
}