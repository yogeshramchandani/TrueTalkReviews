import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const alt = 'TruVouch Profile'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image({ params }: { params: { username: string } }) {
  const resolvedParams = await Promise.resolve(params)
  const username = resolvedParams.username || 'Verified Professional'

  // Assets
  const fontUrl = new URL('./font.ttf', import.meta.url)
  const logoUrl = new URL('./logo.png', import.meta.url)

  let fontData: ArrayBuffer | null = null
  let logoData: ArrayBuffer | null = null

  try {
    const [fontRes, logoRes] = await Promise.all([
      fetch(fontUrl),
      fetch(logoUrl),
    ])

    if (fontRes.ok) fontData = await fontRes.arrayBuffer()
    if (logoRes.ok) logoData = await logoRes.arrayBuffer()
  } catch {}

  const options = {
    width: size.width,
    height: size.height,
    fonts: fontData
      ? [
          {
            name: 'CustomFont',
            data: fontData,
            weight: 700 as const,
            style: 'normal' as const,
          },
        ]
      : undefined,
  }

  const fontFamily = fontData ? '"CustomFont"' : 'sans-serif'

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily,
          color: '#fff',
          background:
            'linear-gradient(120deg, #020617 0%, #020617 40%, #0f766e 100%)',
        }}
      >
        {/* Background Mesh */}
        <div
          style={{
            display: 'flex',
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(circle at 15% 20%, rgba(20,184,166,0.25), transparent 40%), radial-gradient(circle at 85% 80%, rgba(99,102,241,0.25), transparent 40%)',
          }}
        />

        {/* Main Card */}
        <div
          style={{
            position: 'relative',
            width: 980,
            height: 420,
            display: 'flex',
            padding: 50,
            borderRadius: 36,
            background: 'rgba(15, 23, 42, 0.75)',
            border: '1px solid rgba(255,255,255,0.08)',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 40px 80px rgba(0,0,0,0.45)',
          }}
        >
          {/* Left Side Content */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              flex: 1,
              justifyContent: 'center', // Centered vertically
            }}
          >
            {/* Logo */}
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 10 }}>
              {logoData ? (
                // @ts-ignore
                <img src={logoData} width={50} height={70} style={{ display: 'block' }} />
              ) : (
                <div
                  style={{
                    width: 50,
                    height: 50,
                    borderRadius: 12,
                    background: '#14b8a6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 30,
                    fontWeight: 900,
                  }}
                >
                  T
                </div>
              )}
              <span style={{ marginLeft: 14, fontSize: 28, fontWeight: 800, color: '#cbd5e1' }}>
                TruVouch
              </span>
            </div>

            {/* Username */}
            <div
              style={{
                display: 'flex',
                fontSize: 60,
                fontWeight: 900,
                lineHeight: 1.1,
                marginBottom: 10,
                letterSpacing: '-0.02em',
                color: 'white',
              }}
            >
              u/{username}
            </div>

            {/* NEW: "Write a Review" Call to Action */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5,
             }}>
              <div style={{ fontSize: 28, color: '#94a3b8', fontWeight: 500, display:'flex', marginBottom: 10,
              }}>
                worked with them?
              </div>
              
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: '#0f766e', // Teal-700
                  padding: '16px 32px',
                  borderRadius: 20,
                  alignSelf: 'flex-start',
                  border: '1px solid #14b8a6', // Teal-500 border
                  boxShadow: '0 4px 20px rgba(20, 184, 166, 0.3)',
                }}
              >
                {/* Pen Icon (SVG) */}
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ marginRight: 16 }}
                >
                  <path d="M12 20h9" />
                  <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                </svg>
                
                <span style={{ fontSize: 32, fontWeight: 700, color: 'white' }}>
                  Write a Review
                </span>
              </div>
            </div>
          </div>

          {/* Right Side Avatar (Kept same) */}
          <div
            style={{
              width: 280,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                width: 220,
                height: 220,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #14b8a6, #6366f1)',
                opacity: 0.9,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 80,
                fontWeight: 900,
                boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
                border: '4px solid rgba(255,255,255,0.1)',
              }}
            >
              {username.charAt(0).toUpperCase()}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            display: 'flex',
            position: 'absolute',
            bottom: 32,
            fontSize: 22,
            color: '#64748b',
            fontWeight: 600,
          }}
        >
          truvouch.app
        </div>
      </div>
    ),
    options
  )
}