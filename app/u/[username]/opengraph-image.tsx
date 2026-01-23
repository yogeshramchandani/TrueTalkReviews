import { ImageResponse } from 'next/og'

export const alt = 'Verified TruVouch Profile'
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
          // TruVouch Dark Theme (Slate 900 to Slate 800 Gradient)
          background: 'linear-gradient(to bottom right, #0f172a, #1e293b)',
          fontFamily: 'sans-serif',
          position: 'relative',
        }}
      >
        {/* Background Pattern (Subtle Glow) */}
        <div style={{
          position: 'absolute',
          top: -100,
          left: -100,
          width: 600,
          height: 600,
          background: 'radial-gradient(circle, rgba(20, 184, 166, 0.15) 0%, transparent 70%)',
          borderRadius: '50%',
        }} />

        {/* Floating "TruVouch" Logo/Brand at top */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: 60,
        }}>
           {/* Simple Geometric Logo Mark */}
           <div style={{
             width: 50,
             height: 50,
             backgroundColor: '#14b8a6', // Teal-500
             borderRadius: 12,
             marginRight: 20,
             display: 'flex',
             alignItems: 'center',
             justifyContent: 'center',
             color: 'white',
             fontSize: 30,
             fontWeight: 'bold'
           }}>T</div>
           <div style={{ fontSize: 40, fontWeight: 'bold', color: 'white', letterSpacing: '-1px' }}>
             TruVouch
           </div>
        </div>

        {/* Main Card Content */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          backgroundColor: 'rgba(255, 255, 255, 0.03)', // Glass effect
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: 30,
          padding: '60px 100px',
          boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
        }}>
          
          {/* Verified Badge */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: 'rgba(20, 184, 166, 0.2)', // Teal transparent
            border: '1px solid #14b8a6',
            padding: '12px 30px',
            borderRadius: 50,
            marginBottom: 30,
          }}>
            <div style={{ color: '#2dd4bf', fontSize: 24, marginRight: 10 }}>✓</div>
            <div style={{ color: '#2dd4bf', fontSize: 20, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Identity Verified
            </div>
          </div>

          {/* User Name */}
          <div style={{ 
            fontSize: 80, 
            fontWeight: 'bold', 
            color: 'white', 
            marginBottom: 20,
            textAlign: 'center',
            lineHeight: 1,
          }}>
            {username}
          </div>

          {/* Stars & Rating */}
          <div style={{ display: 'flex', alignItems: 'center', marginTop: 10 }}>
            <div style={{ display: 'flex', color: '#fbbf24', fontSize: 50, marginRight: 20 }}>
              ★★★★★
            </div>
            <div style={{ fontSize: 36, color: '#94a3b8' }}>
              <span style={{ color: 'white', fontWeight: 'bold' }}>5.0</span> (Verified Reviews)
            </div>
          </div>

        </div>

        {/* Footer Text */}
        <div style={{
          position: 'absolute',
          bottom: 40,
          color: '#64748b',
          fontSize: 20,
          fontWeight: 500
        }}>
          Get Verified Profiles at truvouch.app
        </div>

      </div>
    ),
    { ...size }
  )
}