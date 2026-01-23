import { ImageResponse } from 'next/og'

// 1. Use Edge Runtime (Fast, No Memory Crash)
export const runtime = 'edge'

export const alt = 'TruVouch Profile'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image({ params }: { params: { username: string } }) {
  const resolvedParams = await Promise.resolve(params)
  const username = resolvedParams.username || 'Professional'

  // 2. LOAD LOCAL FONT (Guaranteed to work)
  // This looks for 'font.ttf' in the same folder as this file.
  const fontData = await fetch(
    new URL('./font.ttf', import.meta.url)
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
          backgroundColor: '#0f172a', // Slate 900
          color: 'white',
          fontFamily: '"CustomFont"', // Matches the font name below
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
           }}>T</div>
           <div style={{ fontSize: 50 }}>TruVouch</div>
        </div>

        {/* Main Card */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          backgroundColor: '#1e293b', // Slate 800
          padding: '40px 80px',
          borderRadius: 20,
          border: '2px solid #334155',
        }}>
          {/* Badge */}
          <div style={{
            backgroundColor: '#115e59',
            color: '#5eead4',
            padding: '10px 30px',
            borderRadius: 50,
            fontSize: 24,
            marginBottom: 30,
          }}>
            ✓ Identity Verified
          </div>

          {/* Name */}
          <div style={{ 
            fontSize: 70, 
            marginBottom: 10,
            textAlign: 'center',
            color: 'white',
          }}>
            {username}
          </div>

          {/* Rating */}
          <div style={{ fontSize: 32, color: '#94a3b8', marginTop: 10 }}>
            <span style={{ color: '#fbbf24', fontSize: 40, marginRight: 15 }}>★★★★★</span>
            <span style={{ color: 'white' }}>5.0</span> Rating
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
      // 3. Register the local font
      fonts: [
        {
          name: 'CustomFont',
          data: fontData,
          style: 'normal',
          weight: 700,
        },
      ],
    }
  )
}