// ─────────────────────────────────────────────────────────────────────────────
// «Colabora con el reto» de la portada: dos vías, una al lado de la otra.
//
//   · Con la lucha  → los códigos QR (donación a la causa).
//   · Con la ruta   → Bizum para la gasolina que hace posible el trayecto.
//
// Los QR se adaptan al número de códigos activos; las imágenes las sube el
// admin, aquí no se genera ninguno. Si falta una de las dos vías, la otra ocupa
// todo el ancho y el panel sigue teniendo sentido.
// ─────────────────────────────────────────────────────────────────────────────

import type { ConfigReto, QrDonacion } from '@/lib/reto50/tipos'
import BloqueBizum from './BloqueBizum'

export default function PanelQr({
  qrs,
  titulo,
  texto,
  config,
}: {
  qrs: QrDonacion[]
  titulo?: string
  texto?: string
  config: ConfigReto
}) {
  const hayBizum = config.bizum_activo !== 'no'
  if (qrs.length === 0 && !hayBizum) return null

  // Con las dos vías el QR se muestra compacto; si va solo, a lo grande.
  const dosColumnas = qrs.length > 0 && hayBizum
  const uno = qrs.length === 1 && !dosColumnas

  return (
    <div className="bg-white/5 border border-white/10 rounded-3xl p-5 sm:p-6 backdrop-blur-sm">
      <div className="text-center mb-5">
        <h2 className="text-white font-black text-lg">{titulo || 'Colabora con el reto'}</h2>
        <p className="text-white/50 text-xs mt-1 leading-relaxed">
          {texto || 'Dos formas de sumarte: con la causa y con la ruta.'}
        </p>
      </div>

      <div className={dosColumnas ? 'grid sm:grid-cols-2 gap-3 items-stretch' : ''}>
        <div className={`space-y-3 ${dosColumnas ? 'flex flex-col' : ''}`}>
        {qrs.map(qr => {
          const contenido = (
            <>
              {/* Título arriba, igual que el bloque del Bizum */}
              <h3 className="text-white font-black text-sm">{qr.titulo}</h3>
              {qr.descripcion && (
                <p className="text-white/50 text-xs mt-1 leading-relaxed">{qr.descripcion}</p>
              )}

              {/* El QR sobre blanco: hace falta contraste para que se escanee bien */}
              <div
                className={`bg-white rounded-xl p-2 shrink-0 mx-auto mt-3 ${
                  uno ? 'w-40 h-40 sm:w-44 sm:h-44' : dosColumnas ? 'w-32 h-32' : 'w-28 h-28 sm:w-32 sm:h-32'
                }`}
              >
                {qr.imagenUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={qr.imagenUrl} alt={`Código QR · ${qr.titulo}`} loading="lazy" className="w-full h-full object-contain" />
                ) : (
                  <div className="w-full h-full rounded-lg bg-pm-bg flex items-center justify-center">
                    <span className="text-[10px] font-black text-gray-300 text-center leading-tight px-2">Código pendiente</span>
                  </div>
                )}
              </div>

              {qr.enlaceUrl && (
                <span className="inline-flex items-center justify-center gap-1 text-pm-red group-hover:text-white font-bold text-xs mt-auto pt-3 transition-colors">
                  Abrir enlace
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              )}
            </>
          )

          // Misma estructura que el Bizum: título arriba y contenido centrado.
          const clases = `group bg-white/5 border border-white/10 rounded-2xl p-4 transition-colors flex flex-col text-center ${
            qr.enlaceUrl ? 'hover:bg-white/10 hover:border-white/25' : ''
          } ${dosColumnas ? 'h-full' : ''}`

          return qr.enlaceUrl ? (
            <a key={qr.id} href={qr.enlaceUrl} target="_blank" rel="noopener noreferrer" className={clases}>
              {contenido}
            </a>
          ) : (
            <div key={qr.id} className={clases}>
              {contenido}
            </div>
          )
        })}
        </div>

        {/* Colabora con la ruta: el Bizum de la gasolina */}
        {hayBizum && <BloqueBizum config={config} />}
      </div>
    </div>
  )
}
