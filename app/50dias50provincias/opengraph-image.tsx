import { ImageResponse } from 'next/og'

// Imagen que se ve al compartir el reto (WhatsApp, Facebook, X…). Se genera por
// código, así que siempre va coherente con la marca y sin subir nada a mano.

export const runtime = 'edge'
export const alt = '50 días, 50 provincias — El reto solidario de Brosjaca'
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
          background: 'linear-gradient(135deg, #0F1A3D 0%, #1c2c63 55%, #3a1733 100%)',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Columna principal */}
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '80px', flex: 1 }}>
          <div style={{ color: '#e11d2a', fontSize: 30, letterSpacing: 8, fontWeight: 800 }}>
            BROSJACA · RETO 2026
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', marginTop: 24 }}>
            <div style={{ color: '#ffffff', fontSize: 104, fontWeight: 800, lineHeight: 1 }}>
              50 días
            </div>
            <div style={{ color: '#ffffff', fontSize: 104, fontWeight: 800, lineHeight: 1.05 }}>
              50 provincias
            </div>
          </div>

          <div style={{ width: 96, height: 9, background: '#e11d2a', borderRadius: 5, marginTop: 30, marginBottom: 26 }} />

          <div style={{ color: 'rgba(255,255,255,0.88)', fontSize: 34, fontWeight: 600 }}>
            Un reto deportivo y solidario
          </div>
          <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 30, fontWeight: 500, marginTop: 8 }}>
            A beneficio de la Asociación Española Contra el Cáncer
          </div>

          <div style={{ display: 'flex', color: 'rgba(255,255,255,0.45)', fontSize: 26, marginTop: 44 }}>
            planetamovimiento.com/50dias50provincias
          </div>
        </div>

        {/* Columna del dato: el 50 grande */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: 340,
            borderLeft: '1px solid rgba(255,255,255,0.12)',
            background: 'rgba(255,255,255,0.03)',
          }}
        >
          <div style={{ color: '#ffffff', fontSize: 190, fontWeight: 800, lineHeight: 1 }}>50</div>
          <div style={{ color: '#e11d2a', fontSize: 34, fontWeight: 800, letterSpacing: 2, marginTop: 6 }}>
            PROVINCIAS
          </div>
          <div style={{ width: 120, height: 1, background: 'rgba(255,255,255,0.15)', marginTop: 34, marginBottom: 34 }} />
          <div style={{ color: '#ffffff', fontSize: 190, fontWeight: 800, lineHeight: 1 }}>50</div>
          <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 34, fontWeight: 800, letterSpacing: 2, marginTop: 6 }}>
            DÍAS
          </div>
        </div>
      </div>
    ),
    { ...size },
  )
}
