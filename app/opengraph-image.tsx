import { ImageResponse } from 'next/og'

// Imagen que se muestra al compartir el enlace (WhatsApp, Facebook, X, etc.).
// Se genera por código → siempre coherente con la marca, sin imágenes manuales.

export const runtime = 'edge'
export const alt = 'Planeta Movimiento — Educación, deporte y ocio en Cuenca'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0F1A3D 0%, #1c2c63 55%, #3a1733 100%)',
          padding: '92px',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: 36, letterSpacing: 10, fontWeight: 700 }}>
            CUENCA
          </div>
          <div style={{ width: 96, height: 9, background: '#e11d2a', borderRadius: 5, marginTop: 20, marginBottom: 26 }} />
          <div style={{ color: '#ffffff', fontSize: 96, fontWeight: 800, lineHeight: 1 }}>
            Planeta Movimiento
          </div>
          <div style={{ color: 'rgba(255,255,255,0.88)', fontSize: 46, fontWeight: 600, marginTop: 30 }}>
            Educación · Deporte · Ocio
          </div>
        </div>
        <div style={{ display: 'flex', color: 'rgba(255,255,255,0.55)', fontSize: 30, marginTop: 64 }}>
          planetamovimiento.com
        </div>
      </div>
    ),
    { ...size },
  )
}
