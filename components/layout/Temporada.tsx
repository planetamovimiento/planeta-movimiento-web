'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import { temporadaDe, type Temporada } from '@/lib/temporada'

// ─────────────────────────────────────────────────────────────────────────────
// Decoración de temporada de toda la web pública: unos pocos murciélagos en
// Halloween y nieve con guirnalda de luces en Navidad. Los colores los cambia
// el CSS (html[data-temporada]); aquí solo van los adornos.
//
// Ligero a propósito: ~20 elementos, solo transform/opacity, sin JavaScript
// por fotograma, sin capturar clics y apagado con «reducir movimiento».
// ─────────────────────────────────────────────────────────────────────────────

function temporadaInicial(): Temporada {
  const q = new URLSearchParams(window.location.search).get('temporada')
  if (q === 'halloween' || q === 'navidad') return q
  if (q === 'ninguna') return ''
  const partes = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Madrid', month: 'numeric', day: 'numeric' })
    .formatToParts(new Date())
  const num = (tipo: string) => Number(partes.find(p => p.type === tipo)?.value ?? 0)
  return temporadaDe(num('month'), num('day'))
}

function Murcielago() {
  return (
    <svg viewBox="0 0 64 28" className="pm-aleteo w-full h-full" aria-hidden="true">
      <path fill="currentColor" d="M32 10c-2.2 0-3.6 1.4-4.2 3.2C25 9.6 19.6 5 12 4.4c2.6 2.4 3.4 5 2.8 7.4C11.2 9.6 5.6 9.8 0 13.2c5 .4 8.6 2.8 10.4 6.6 2-2.4 5.4-3 8.4-1.6 1.6-2 4.2-2.8 6.6-2.2.8 2.8 3.4 4.8 6.6 4.8s5.8-2 6.6-4.8c2.4-.6 5 .2 6.6 2.2 3-1.4 6.4-.8 8.4 1.6C55.4 16 59 13.6 64 13.2c-5.6-3.4-11.2-3.6-14.8-1.4-.6-2.4.2-5 2.8-7.4-7.6.6-13 5.2-15.8 8.8C35.6 11.4 34.2 10 32 10z" />
      <circle cx="29.6" cy="13.4" r=".9" fill="#fde68a" />
      <circle cx="34.4" cy="13.4" r=".9" fill="#fde68a" />
    </svg>
  )
}

const MURCIELAGOS = [
  { top: '14%', w: 46, dur: 26, delay: 0 },
  { top: '32%', w: 30, dur: 34, delay: 9 },
  { top: '58%', w: 38, dur: 30, delay: 17 },
  { top: '76%', w: 26, dur: 38, delay: 4 },
  { top: '44%', w: 22, dur: 42, delay: 23 },
]

function Halloween() {
  return (
    <div aria-hidden="true" className="pm-temporada fixed inset-0 z-40 pointer-events-none overflow-hidden">
      {MURCIELAGOS.map((m, i) => (
        <div key={i} className="pm-murcielago text-[#1c1028]"
          style={{ top: m.top, width: m.w, height: m.w * 0.44, '--dur': `${m.dur}s`, '--delay': `${m.delay}s` } as React.CSSProperties}>
          <Murcielago />
        </div>
      ))}
    </div>
  )
}

function Navidad() {
  const copos = Array.from({ length: 22 }, (_, i) => ({
    left: `${(i * 41) % 100}%`,
    width: `${2 + ((i * 7) % 4)}px`,
    height: `${2 + ((i * 7) % 4)}px`,
    '--dur': `${14 + ((i * 5) % 12)}s`,
    '--delay': `${(i * 1.3) % 14}s`,
    '--dx': `${((i % 5) - 2) * 30}px`,
    '--caida': '105vh',
  }) as React.CSSProperties)
  const colores = ['#facc15', '#ef4444', '#22c55e', '#38bdf8']
  return (
    <div aria-hidden="true" className="pm-temporada fixed inset-0 z-40 pointer-events-none overflow-hidden">
      {/* Guirnalda de luces justo debajo del menú */}
      <div className="absolute left-0 right-0 top-16 flex justify-around px-2">
        {Array.from({ length: 16 }, (_, i) => (
          <span key={i} className="pm-bombilla"
            style={{ background: colores[i % colores.length], '--delay': `${(i % 4) * 0.6}s` } as React.CSSProperties} />
        ))}
      </div>
      {copos.map((s, i) => <span key={i} className="pm-copo" style={s} />)}
    </div>
  )
}

export default function DecoracionTemporada() {
  const pathname = usePathname()
  const base = useRef<Temporada | null>(null)
  const [actual, setActual] = useState<Temporada>('')

  useEffect(() => {
    if (base.current === null) base.current = temporadaInicial()
    const html = document.documentElement
    // El panel de administración siempre neutro, aunque se llegue navegando.
    const t: Temporada = pathname?.startsWith('/admin') ? '' : base.current
    if (t) html.setAttribute('data-temporada', t)
    else html.removeAttribute('data-temporada')
    setActual(t)
  }, [pathname])

  if (actual === 'halloween') return <Halloween />
  if (actual === 'navidad') return <Navidad />
  return null
}
