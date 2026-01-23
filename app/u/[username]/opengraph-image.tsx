import { ImageResponse } from 'next/og'

// 1. Use Node.js runtime (Reliable because it has built-in fonts)
export const runtime = 'nodejs'

export const alt = 'TruVouch Profile'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image({ params }: { params: { username: string } }) {
  // 2. Resolve params
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
          // 3. FLAT COLOR (No Gradient = No Crash)
          backgroundColor: '#0f172a', // Slate 900
          color: 'white',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Top Branding */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 50 }}>
           {/* Simple Square Logo */}
           <div style={{
             display: 'flex',
             alignItems: 'center',
             justifyContent: 'center',
             width: 60,
             height: 60,
             backgroundColor: '#14b8a6', // Teal
             borderRadius: 10,
             marginRight: 20,
             color: 'white',
             fontSize: 40,
             fontWeight: 900,
           }}>T</div>
           <div style={{ fontSize: 50, fontWeight: 700 }}>TruVouch</div>
        </div>

        {/* Main Info Box */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          // Simple border instead of shadows
          border: '2px solid #334155', 
          borderRadius: 30,
          padding: '40px 80px',
          backgroundColor: '#1e293b', // Slate 800
        }}>
          
          {/* Badge */}
          <div style={{
            backgroundColor: '#115e59', // Darker Teal
            color: '#5eead4', // Light Teal
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

          {/* Rating (Text Only) */}
          <div style={{ fontSize: 32, color: '#cbd5e1', marginTop: 10 }}>
            <span style={{ color: '#fbbf24', fontSize: 40, marginRight: 15 }}>★★★★★</span>
            <span style={{ fontWeight: 700, color: 'white' }}>5.0</span> Rating
          </div>
        </div>

        {/* Footer */}
        <div style={{ position: 'absolute', bottom: 40, color: '#64748b', fontSize: 24, fontWeight: 600 }}>
          truvouch.app
        </div>
      </div>
    ),
    {
      ...size,
      // No 'fonts' array needed for Node.js
    }
  )
}