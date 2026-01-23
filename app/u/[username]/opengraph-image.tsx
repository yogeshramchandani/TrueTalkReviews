import { ImageResponse } from 'next/og'

// 1. Node.js runtime (Has fonts built-in, no white screen)
export const runtime = 'nodejs'

export const alt = 'TruVouch Profile'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image({ params }: { params: { username: string } }) {
  // 2. Safe params handling
  const resolvedParams = await Promise.resolve(params)
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
          // 3. ULTRA-SAFE CSS: No Gradients, No Shadows. Just Solid Colors.
          backgroundColor: '#0f172a', // Slate 900
          color: 'white',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Logo Section */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 40 }}>
           <div style={{
             display: 'flex',
             alignItems: 'center',
             justifyContent: 'center',
             width: 60,
             height: 60,
             backgroundColor: '#14b8a6', // Teal
             borderRadius: 12,
             marginRight: 20,
             color: 'white',
             fontSize: 40,
             fontWeight: 900,
           }}>T</div>
           <div style={{ fontSize: 50, fontWeight: 700 }}>TruVouch</div>
        </div>

        {/* Main Card - Simplified */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          backgroundColor: '#1e293b', // Slate 800
          padding: '40px 80px',
          borderRadius: 20,
          border: '2px solid #334155', // Simple solid border
        }}>
          {/* Badge */}
          <div style={{
            backgroundColor: '#115e59',
            color: '#5eead4',
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
            marginBottom: 10,
            textAlign: 'center',
            color: 'white',
          }}>
            {username}
          </div>

          {/* Rating */}
          <div style={{ fontSize: 32, color: '#94a3b8', marginTop: 10 }}>
            <span style={{ color: '#fbbf24', fontSize: 40, marginRight: 15 }}>★★★★★</span>
            <span style={{ fontWeight: 700, color: 'white' }}>5.0</span> Rating
          </div>
        </div>
        
        {/* Footer */}
        <div style={{ position: 'absolute', bottom: 40, color: '#64748b', fontSize: 24 }}>
          truvouch.app
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}