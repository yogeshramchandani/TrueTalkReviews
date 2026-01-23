import { ImageResponse } from 'next/og'

// 1. Use Edge Runtime (Critical for speed and preventing 500 errors)
export const runtime = 'edge'

export const alt = 'TruVouch Profile'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image({ params }: { params: { username: string } }) {
  // 2. Safe params handling
  const resolvedParams = await Promise.resolve(params)
  const username = resolvedParams.username || 'Professional'

  // 3. FETCH FONT (Critical for Edge Runtime)
  // We use jsDelivr (fast CDN) instead of GitHub Raw to prevent timeouts.
  const fontData = await fetch(
    'https://cdn.jsdelivr.net/npm/@fontsource/inter@5.0.15/files/inter-latin-700-normal.woff'
  ).then((res) => res.arrayBuffer())

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
          // Solid colors + Simple Gradient (Performance Optimized)
          backgroundImage: 'linear-gradient(to bottom right, #0f172a, #1e293b)',
          color: 'white',
          fontFamily: '"Inter", sans-serif',
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
             fontWeight: 700,
           }}>T</div>
           <div style={{ fontSize: 50, fontWeight: 700 }}>TruVouch</div>
        </div>

        {/* Main Card */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          backgroundColor: '#1e293b', 
          padding: '50px 90px',
          borderRadius: 30,
          border: '1px solid #334155',
          boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
        }}>
          {/* Badge */}
          <div style={{
            backgroundColor: 'rgba(20, 184, 166, 0.1)',
            color: '#2dd4bf',
            padding: '10px 30px',
            borderRadius: 50,
            fontSize: 22,
            marginBottom: 25,
            border: '1px solid rgba(20, 184, 166, 0.2)',
          }}>
            ✓ Identity Verified
          </div>

          {/* Name */}
          <div style={{ 
            fontSize: 70, 
            fontWeight: 700, 
            marginBottom: 15,
            textAlign: 'center',
            lineHeight: 1.1,
            color: 'white',
          }}>
            {username}
          </div>

          {/* Rating */}
          <div style={{ display: 'flex', alignItems: 'center', marginTop: 10 }}>
            <div style={{ display: 'flex', color: '#fbbf24', fontSize: 40, marginRight: 15 }}>
              ★★★★★
            </div>
            <div style={{ fontSize: 30, color: '#e2e8f0' }}>
              <span style={{ fontWeight: 700, color: 'white' }}>5.0</span> Rating
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div style={{ position: 'absolute', bottom: 40, color: '#64748b', fontSize: 22, fontWeight: 700 }}>
          truvouch.app
        </div>
      </div>
    ),
    {
      ...size,
      // 4. Load the fetched font
      fonts: [
        {
          name: 'Inter',
          data: fontData,
          style: 'normal',
          weight: 700,
        },
      ],
    }
  )
}