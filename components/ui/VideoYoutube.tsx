'use client'

import { useState } from 'react'

/** Extrae el ID de vídeo de una URL de YouTube (watch, youtu.be, embed, shorts) o de un ID suelto. */
export function youtubeId(url: string): string {
  if (!url) return ''
  const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/|live\/))([\w-]{11})/)
  if (m) return m[1]
  return /^[\w-]{11}$/.test(url.trim()) ? url.trim() : ''
}

/**
 * Sección con un vídeo de YouTube. Carga ligera: muestra la miniatura y solo
 * inserta el reproductor (youtube-nocookie) al pulsar play. Si la URL no es
 * válida, no muestra nada.
 *
 *   <VideoYoutube url="https://youtu.be/XXXXXXXXXXX" titulo="Vídeo" />
 */
export function VideoYoutube({ url, titulo = 'Vídeo', subtitulo, fondo = 'bg-white' }: {
  url: string
  titulo?: string
  subtitulo?: string
  fondo?: string
}) {
  const id = youtubeId(url)
  const vertical = /\/shorts\//.test(url)   // los Shorts son verticales (9:16)
  const [play, setPlay] = useState(false)
  if (!id) return null

  return (
    <section className={`${fondo} py-14`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-black text-pm-navy">{titulo}</h2>
          {subtitulo && <p className="text-gray-500 text-sm mt-2">{subtitulo}</p>}
        </div>

        <div className={`relative ${vertical ? 'aspect-[9/16] max-w-[360px] mx-auto' : 'aspect-video'} rounded-2xl overflow-hidden shadow-lg bg-black`}>
          {play ? (
            <iframe
              className="absolute inset-0 w-full h-full"
              src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`}
              title={titulo}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          ) : (
            <button onClick={() => setPlay(true)} className="group absolute inset-0 w-full h-full" aria-label="Reproducir vídeo">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`} alt={titulo} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/25 group-hover:bg-black/35 transition-colors flex items-center justify-center">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-pm-red rounded-full flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                  <svg className="w-7 h-7 sm:w-9 sm:h-9 text-white ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                </div>
              </div>
            </button>
          )}
        </div>
      </div>
    </section>
  )
}
