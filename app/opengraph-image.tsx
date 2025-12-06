import { ImageResponse } from 'next/og'

export const alt = 'PropSafe Hub | Verified Real Estate Investments'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          padding: '40px',
        }}
      >
        <div
          style={{
            fontSize: 64,
            fontWeight: 'bold',
            marginBottom: 20,
            textAlign: 'center',
          }}
        >
          PropSafe Hub
        </div>
        <div
          style={{
            fontSize: 32,
            textAlign: 'center',
            maxWidth: 800,
            marginBottom: 40,
          }}
        >
          Your Secured Pathway to Verified Real Estate Investments
        </div>
        <div
          style={{
            fontSize: 24,
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            padding: '20px 40px',
            borderRadius: 10,
            textAlign: 'center',
          }}
        >
          100% Verified Properties • Zero Hidden Risks • Expert Advisory
        </div>
      </div>
    ),
    size
  )
}
