import { ImageResponse } from 'next/og'

// 1. Use Edge Runtime (It's faster for this)
export const runtime = 'edge'

export const alt = 'TruVouch Profile'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image({ params }: { params: { username: string } }) {
  // 2. Resolve params safely
  const resolvedParams = await Promise.resolve(params)
  const username = resolvedParams.username || 'Professional'

  // 3. RETURN IMAGE DIRECTLY (No fetching, no external calls)
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
          // Premium Gradient Background
          background: 'linear-gradient(to bottom right, #0f172a, #334155)', 
          color: 'white',
          fontFamily: 'sans-serif', // Use safe system font
        }}
      >
        {/* Background Pattern (Subtle Circles) */}
        <div style={{
          position: 'absolute',
          top: -100,
          left: -100,
          width: 500,
          height: 500,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(20, 184, 166, 0.15), transparent 70%)',
        }} />

        {/* Logo Section */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 40, zIndex: 10 }}>
           <div style={{
             display: 'flex',
             alignItems: 'center',
             justifyContent: 'center',
             width: 60,
             height: 60,
             backgroundColor: '#14b8a6', // Teal Brand Color
             borderRadius: 12,
             marginRight: 20,
             color: 'white',
             fontSize: 40,
             fontWeight: 'bold',
           }}>T</div>
           <div style={{ fontSize: 50, fontWeight: 'bold' }}>TruVouch</div>
        </div>

        {/* Main Card */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          backgroundColor: 'rgba(255,255,255,0.05)', // Glassmorphism
          padding: '50px 90px',
          borderRadius: 30,
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
          zIndex: 10,
        }}>
          {/* Badge */}
          <div style={{
            backgroundColor: 'rgba(20, 184, 166, 0.2)',
            color: '#2dd4bf',
            padding: '10px 30px',
            borderRadius: 50,
            fontSize: 22,
            marginBottom: 25,
            border: '1px solid rgba(20, 184, 166, 0.3)',
          }}>
            ✓ Identity Verified
          </div>

          {/* Name */}
          <div style={{ 
            fontSize: 70, 
            fontWeight: 'bold', 
            marginBottom: 15,
            textAlign: 'center',
            lineHeight: 1.1,
            color: '#f8fafc',
            textShadow: '0 4px 10px rgba(0,0,0,0.5)'
          }}>
            {username}
          </div>

          {/* Stars */}
          <div style={{ display: 'flex', alignItems: 'center', marginTop: 10 }}>
            <div style={{ display: 'flex', color: '#fbbf24', fontSize: 40, marginRight: 15 }}>
              ★★★★★
            </div>
            <div style={{ fontSize: 30, color: '#e2e8f0' }}>
              <span style={{ fontWeight: 'bold', color: 'white' }}>5.0</span> Rating
            </div>
          </div>
        </div>
        
        {/* Footer URL */}
        <div style={{ 
          position: 'absolute', 
          bottom: 40, 
          color: '#64748b', 
          fontSize: 22,
          fontWeight: 600
        }}>
          truvouch.app
        </div>
      </div>
    ),
    {
      ...size,
      // 4. IMPORTANT: Do not include 'fonts: []' array. 
      // Vercel will use the default system font which is 100% reliable.
    }
  )
}