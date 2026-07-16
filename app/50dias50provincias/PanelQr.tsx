// ─────────────────────────────────────────────────────────────────────────────
// Panel de donación por QR en la portada del reto.
//
// Se adapta solo al número de QR activos: con uno se ve grande y con varios se
// apilan. Las imágenes las sube el admin; aquí no se genera ningún código.
// ─────────────────────────────────────────────────────────────────────────────

import type { QrDonacion } from '@/lib/reto50/tipos'

export default function PanelQr({ qrs, titulo, texto }: { qrs: QrDonacion[]; titulo?: string; texto?: string }) {
  if (qrs.length === 0) return null

  const uno = qrs.length === 1

  return (
    <div className="bg-white/5 border border-white/10 rounded-3xl p-5 sm:p-6 backdrop-blur-sm">
      <div className="text-center mb-5">
        <h2 className="text-white font-black text-lg">{titulo || 'Colabora con el reto'}</h2>
        <p className="text-white/50 text-xs mt-1 leading-relaxed">
          {texto || 'Escanea el código con la cámara de tu móvil y aporta lo que quieras.'}
        </p>
      </div>

      <div className="space-y-3">
        {qrs.map(qr => {
          const contenido = (
            <>
              {/* El QR sobre blanco: hace falta contraste para que se escanee bien */}
              <div
                className={`bg-white rounded-xl p-2 shrink-0 ${
                  uno ? 'w-40 h-40 sm:w-44 sm:h-44 mx-auto' : 'w-28 h-28 sm:w-32 sm:h-32'
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

              <div className={`min-w-0 ${uno ? 'text-center mt-4' : ''}`}>
                <h3 className="text-white font-black text-sm">{qr.titulo}</h3>
                {qr.descripcion && (
                  <p className="text-white/50 text-xs mt-1 leading-relaxed">{qr.descripcion}</p>
                )}
                {qr.enlaceUrl && (
                  <span className="inline-flex items-center gap-1 text-pm-red group-hover:text-white font-bold text-xs mt-2 transition-colors">
                    Abrir enlace
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                )}
              </div>
            </>
          )

          const clases = `group block bg-white/5 border border-white/10 rounded-2xl p-4 transition-colors ${
            qr.enlaceUrl ? 'hover:bg-white/10 hover:border-white/25' : ''
          } ${uno ? '' : 'flex items-center gap-4'}`

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
    </div>
  )
}
