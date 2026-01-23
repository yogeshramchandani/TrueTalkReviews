import { ImageResponse } from 'next/og'

// 1. Force Edge Runtime
export const runtime = 'edge'

export const alt = 'TruVouch Profile'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image({ params }: { params: { username: string } }) {
  // 2. Fix for Next.js 15: Await the params object
  const resolvedParams = await params
  const username = resolvedParams.username || 'Professional'

  // 3. NUCLEAR FIX: Manually fetch a font to prevent default font crashes
  // We fetch a standard font from a reliable CDN
  const fontData = await fetch(
    new URL('https://github.com/google/fonts/raw/main/apache/roboto/Roboto-Bold.ttf', import.meta.url)
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
          background: 'linear-gradient(to bottom right, #0f172a, #334155)', // Nice gradient
          color: 'white',
          fontFamily: '"Roboto"',
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

        {/* Main Name Card */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          backgroundColor: 'rgba(255,255,255,0.05)',
          padding: '40px 80px',
          borderRadius: 30,
          border: '1px solid rgba(255,255,255,0.1)',
        }}>
          <div style={{
            backgroundColor: 'rgba(20, 184, 166, 0.2)',
            color: '#2dd4bf',
            padding: '10px 30px',
            borderRadius: 50,
            fontSize: 24,
            marginBottom: 30,
          }}>
            ✓ Identity Verified
          </div>

          <div style={{ 
            fontSize: 80, 
            marginBottom: 10,
            textAlign: 'center',
            lineHeight: 1.1,
            textShadow: '0 4px 8px rgba(0,0,0,0.3)'
          }}>
            {username}
          </div>

          <div style={{ fontSize: 32, color: '#e2e8f0', marginTop: 10 }}>
            ★★★★★ 5.0 Verified Rating
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      // 4. Load the font explicitly
      fonts: [
        {
          name: 'Roboto',
          data: fontData,
          style: 'normal',
          weight: 700,
        },
      ],
    }
  )
}