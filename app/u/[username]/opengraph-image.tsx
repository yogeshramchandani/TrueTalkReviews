import { ImageResponse } from 'next/og'

// 1. Remove "edge" runtime for now (easier to debug)
// export const runtime = 'edge' 

export const alt = 'Profile Preview'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image({ params }: { params: { username: string } }) {
  // Use static data to test if image generation works at all
  const username = params.username || 'User'

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
          backgroundColor: '#0f172a', // Dark blue background
          color: 'white',
        }}
      >
        {/* Simple Text Test */}
        <div style={{ fontSize: 60, fontWeight: 'bold', marginBottom: 20 }}>
          TruVouch Profile
        </div>
        <div style={{ fontSize: 40, color: '#94a3b8' }}>
          Check out {username}'s verified reviews
        </div>
        
        {/* visual element to prove it rendered */}
        <div style={{ 
          marginTop: 40, 
          padding: '20px 40px', 
          backgroundColor: '#0d9488', 
          borderRadius: 20,
          fontSize: 30
        }}>
          Verified Professional
        </div>
      </div>
    ),
    { ...size }
  )
}