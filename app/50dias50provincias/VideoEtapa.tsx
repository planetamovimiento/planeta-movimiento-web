'use client'

// ─────────────────────────────────────────────────────────────────────────────
// Vídeo resumen de una etapa.
//
// Rendimiento: no se incrusta el reproductor de YouTube hasta que se pulsa el
// play. Hasta entonces solo hay una carátula, así que abrir la página no carga
// ningún vídeo por muchas etapas que haya. Además, el padre monta este
// componente con key={etapa.dia}: al cambiar de punto en el mapa, el
// reproductor se reinicia solo y nunca se queda el vídeo del anterior.
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from 'react'
import { fechaCorta, youtubeEmbed, youtubeId, youtubeMiniatura, youtubeWatch } from '@/lib/reto50/constants'
import { SITE_URL } from '@/lib/seo'
import type { EtapaPublica } from '@/lib/reto50/tipos'
import { BotonCompartir } from './Compartir'

const IconoPlay = ({ className = 'w-6 h-6' }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M8 5v14l11-7z" />
  </svg>
)

const IconoYoutube = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
)

export default function VideoEtapa({ etapa, onReproducir }: {
  etapa: EtapaPublica
  /** Avisa al padre de que hay un vídeo en marcha (para no cambiarlo por hover). */
  onReproducir?: () => void
}) {
  const [reproduciendo, setReproduciendo] = useState(false)
  const id = youtubeId(etapa.videoUrl)

  const titulo = etapa.videoTitulo || `Día ${etapa.dia} · ${etapa.provincia}`

  // Sin vídeo (o con un enlace que no sabemos reproducir): hueco discreto,
  // nunca un reproductor vacío ni un error.
  if (!id) {
    return (
      <div className="bg-pm-bg border border-gray-100 rounded-2xl p-5 text-center">
        <div className="w-9 h-9 rounded-full bg-white border border-gray-100 grid place-items-center mx-auto text-gray-300">
          <IconoPlay className="w-4 h-4" />
        </div>
        <p className="text-sm font-bold text-gray-400 mt-2.5">Vídeo resumen próximamente</p>
        <p className="text-xs text-gray-300 mt-1 leading-relaxed">
          El resumen del día {etapa.dia} en {etapa.provincia} se publicará aquí.
        </p>
      </div>
    )
  }

  const miniatura = etapa.videoMiniatura || youtubeMiniatura(id)

  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
      <div className="px-4 pt-4 pb-3">
        <p className="text-xs font-black text-pm-red uppercase tracking-widest">Vídeo resumen</p>
        <h4 className="font-black text-pm-navy text-sm mt-1 leading-tight break-words">{titulo}</h4>
      </div>

      {/* 16:9 siempre, se adapte como se adapte el ancho */}
      <div className="relative aspect-video bg-pm-navy">
        {reproduciendo ? (
          <iframe
            src={`${youtubeEmbed(id)}?autoplay=1&rel=0&modestbranding=1`}
            title={titulo}
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="absolute inset-0 w-full h-full"
          />
        ) : (
          <button
            type="button"
            onClick={() => { setReproduciendo(true); onReproducir?.() }}
            className="group absolute inset-0 w-full h-full cursor-pointer"
            aria-label={`Reproducir el vídeo resumen: ${titulo}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={miniatura}
              alt=""
              loading="lazy"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            />
            <span className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
            <span className="absolute inset-0 grid place-items-center">
              <span className="w-14 h-14 rounded-full bg-pm-red text-white grid place-items-center shadow-lg transition-transform duration-200 group-hover:scale-110">
                <IconoPlay className="w-7 h-7 translate-x-0.5" />
              </span>
            </span>
          </button>
        )}
      </div>

      <div className="px-4 py-3 space-y-2.5">
        {etapa.videoDescripcion && (
          <p className="text-xs text-gray-500 leading-relaxed whitespace-pre-line">{etapa.videoDescripcion}</p>
        )}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-4">
            <a
              href={youtubeWatch(id)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-400 hover:text-pm-red transition-colors"
            >
              <IconoYoutube />
              Ver en YouTube
            </a>
            <BotonCompartir
              texto={`Día ${etapa.dia} del reto de Brosjaca: ${etapa.provincia}. ${titulo}`}
              url={`${SITE_URL}/50dias50provincias`}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-400 hover:text-pm-red transition-colors"
              avisoClassName="text-gray-400"
            />
          </div>
          {etapa.videoFecha && (
            <span className="text-xs text-gray-300 shrink-0">{fechaCorta(etapa.videoFecha)}</span>
          )}
        </div>
      </div>
    </div>
  )
}
