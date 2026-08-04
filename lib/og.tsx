import { ImageResponse } from 'next/og'

// ─────────────────────────────────────────────────────────────────────────────
// Generador único de la imagen que se muestra al compartir un enlace (WhatsApp,
// Facebook, X…). Cada página pasa su propio título → cada URL tiene su card, sin
// imágenes manuales y siempre a 1200×630. Reutilizado por app/opengraph-image.tsx
// (portada) y por los opengraph-image.tsx de cada servicio.
// ─────────────────────────────────────────────────────────────────────────────

export const OG_SIZE = { width: 1200, height: 630 }
export const OG_CONTENT_TYPE = 'image/png'

// Título más largo → letra más pequeña para que quepa sin recortarse.
function tamTitulo(t: string): number {
  const n = t.length
  if (n <= 13) return 96
  if (n <= 20) return 80
  if (n <= 30) return 64
  return 52
}

export function ogImage({ titulo, subtitulo, kicker = 'PLANETA MOVIMIENTO · CUENCA' }: {
  titulo: string
  subtitulo?: string
  kicker?: string
}) {
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
          <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 32, letterSpacing: 8, fontWeight: 700 }}>
            {kicker}
          </div>
          <div style={{ width: 96, height: 9, background: '#e11d2a', borderRadius: 5, marginTop: 20, marginBottom: 26 }} />
          <div style={{ color: '#ffffff', fontSize: tamTitulo(titulo), fontWeight: 800, lineHeight: 1.05 }}>
            {titulo}
          </div>
          {subtitulo && (
            <div style={{ color: 'rgba(255,255,255,0.88)', fontSize: 42, fontWeight: 600, marginTop: 26 }}>
              {subtitulo}
            </div>
          )}
        </div>
        <div style={{ display: 'flex', color: 'rgba(255,255,255,0.55)', fontSize: 30, marginTop: 56 }}>
          planetamovimiento.com
        </div>
      </div>
    ),
    { ...OG_SIZE },
  )
}
