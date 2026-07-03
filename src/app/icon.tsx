import { ImageResponse } from 'next/og'

export const size = { width: 32, height: 32 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 22,
          background: '#14110F',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#F7F4EC',
          fontFamily: 'Georgia, serif',
          fontStyle: 'italic',
        }}
      >
        S
      </div>
    ),
    { ...size }
  )
}
