'use client'

import { useState, useEffect, useCallback } from 'react'
import { fotosDe } from '@/lib/fotos'

/**
 * Galería de fotos de un servicio con visor a pantalla completa (lightbox).
 * Si el servicio no tiene fotos todavía, no muestra nada.
 *
 *   <Galeria slug="gimnasia-acrobatica" titulo="Galería" />
 */
export function Galeria({ slug, titulo = 'Galería', subtitulo, fondo = 'bg-white' }: {
  slug: string
  titulo?: string
  subtitulo?: string
  fondo?: string
}) {
  const fotos = fotosDe(slug)
  const [abierta, setAbierta] = useState<number | null>(null)

  const cerrar = useCallback(() => setAbierta(null), [])
  const ir = useCallback((delta: number) => {
    setAbierta(prev => (prev === null ? null : (prev + delta + fotos.length) % fotos.length))
  }, [fotos.length])

  useEffect(() => {
    if (abierta === null) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') cerrar()
      if (e.key === 'ArrowRight') ir(1)
      if (e.key === 'ArrowLeft') ir(-1)
    }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = '' }
  }, [abierta, cerrar, ir])

  if (fotos.length === 0) return null

  return (
    <section className={`${fondo} py-14`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-black text-pm-navy">{titulo}</h2>
          {subtitulo && <p className="text-gray-500 text-sm mt-2">{subtitulo}</p>}
        </div>

        {/* Rejilla tipo mosaico */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {fotos.map((src, i) => (
            <button key={src} onClick={() => setAbierta(i)}
              className={`group relative overflow-hidden rounded-2xl bg-pm-bg ${i % 5 === 0 ? 'col-span-2 row-span-2 aspect-square sm:aspect-auto' : 'aspect-square'}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt={`${titulo} ${i + 1}`} loading="lazy"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              <div className="absolute inset-0 bg-pm-navy/0 group-hover:bg-pm-navy/20 transition-colors flex items-center justify-center">
                <svg className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {abierta !== null && (
        <div className="fixed inset-0 z-[70] bg-black/90 flex items-center justify-center p-4" onClick={cerrar}>
          <button onClick={cerrar} className="absolute top-4 right-4 text-white/70 hover:text-white">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
          {fotos.length > 1 && (
            <>
              <button onClick={e => { e.stopPropagation(); ir(-1) }} className="absolute left-4 text-white/70 hover:text-white">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/></svg>
              </button>
              <button onClick={e => { e.stopPropagation(); ir(1) }} className="absolute right-4 text-white/70 hover:text-white">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg>
              </button>
            </>
          )}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={fotos[abierta]} alt={`${titulo} ${abierta + 1}`} onClick={e => e.stopPropagation()}
            className="max-h-[88vh] max-w-[92vw] object-contain rounded-xl shadow-2xl" />
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/60 text-sm">{abierta + 1} / {fotos.length}</div>
        </div>
      )}
    </section>
  )
}
