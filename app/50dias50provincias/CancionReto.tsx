'use client'

// ─────────────────────────────────────────────────────────────────────────────
// La canción del reto, dentro del panel de Brosjaca de la portada.
//
// Hasta que se pulsa el play solo hay una fila con la carátula: el reproductor
// de YouTube no se incrusta, así que entrar en la página no carga nada. Al
// pulsar, la fila se convierte en el reproductor y la canción suena aquí mismo,
// sin salir de la web.
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from 'react'
import { CANCION, youtubeEmbed, youtubeId, youtubeMiniatura, youtubeWatch } from '@/lib/reto50/constants'
import type { ConfigReto } from '@/lib/reto50/tipos'

const IconoPlay = ({ className = 'w-5 h-5' }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M8 5v14l11-7z" />
  </svg>
)

const IconoNota = ({ className = 'w-3.5 h-3.5' }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12 3v10.55A4 4 0 1014 17V7h4V3h-6z" />
  </svg>
)

export default function CancionReto({ config }: { config: ConfigReto }) {
  const [sonando, setSonando] = useState(false)

  if (config.cancion_activa === 'no') return null

  const id = youtubeId(config.cancion_url || CANCION.url)
  // Si el enlace no es de YouTube o está mal, mejor no pintar nada que dejar un
  // reproductor roto en la portada.
  if (!id) return null

  const etiqueta = config.cancion_etiqueta || CANCION.etiqueta
  const titulo = config.cancion_titulo || CANCION.titulo

  return (
    <div className="mt-4 pt-4 border-t border-white/10">
      {sonando ? (
        <>
          <div className="flex items-center gap-1.5 mb-2">
            <IconoNota className="w-3.5 h-3.5 text-pm-red shrink-0" />
            <p className="text-[11px] font-black text-pm-red uppercase tracking-widest">{etiqueta}</p>
          </div>
          <div className="relative aspect-video rounded-xl overflow-hidden bg-black">
            <iframe
              src={`${youtubeEmbed(id)}?autoplay=1&rel=0&modestbranding=1`}
              title={`${etiqueta}: ${titulo}`}
              loading="lazy"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="absolute inset-0 w-full h-full"
            />
          </div>
          <a
            href={youtubeWatch(id)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block text-[11px] font-bold text-white/40 hover:text-white transition-colors mt-2"
          >
            Ver en YouTube
          </a>
        </>
      ) : (
        <button
          type="button"
          onClick={() => setSonando(true)}
          aria-label={`Reproducir ${etiqueta.toLowerCase()}: ${titulo}`}
          className="group w-full flex items-center gap-3 text-left rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/25 transition-colors p-2.5 cursor-pointer"
        >
          <span className="relative w-16 h-11 shrink-0 rounded-lg overflow-hidden bg-black">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={youtubeMiniatura(id)} alt="" loading="lazy" className="w-full h-full object-cover" />
            <span className="absolute inset-0 bg-black/35 grid place-items-center">
              <span className="w-7 h-7 rounded-full bg-pm-red text-white grid place-items-center shadow transition-transform duration-200 group-hover:scale-110">
                <IconoPlay className="w-4 h-4 translate-x-px" />
              </span>
            </span>
          </span>

          {/* flex-1: sin él el span se encoge y el título se parte en vertical */}
          <span className="flex-1 min-w-0">
            <span className="flex items-center gap-1.5">
              <IconoNota className="w-3.5 h-3.5 text-pm-red shrink-0" />
              <span className="text-[11px] font-black text-pm-red uppercase tracking-widest">{etiqueta}</span>
            </span>
            <span className="block text-white text-sm font-bold leading-tight mt-0.5 break-words">{titulo}</span>
          </span>
        </button>
      )}
    </div>
  )
}
