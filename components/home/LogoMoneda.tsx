'use client'

import { useMemo, useRef, useState } from 'react'

// Grosor de la extrusión (px) y nº de capas del cuerpo (denso = canto sólido)
const T = 120
const CAPAS = 150
const PASO = T / (CAPAS - 1)

const MASK = {
  WebkitMaskImage: 'url(/logo.png)', maskImage: 'url(/logo.png)',
  WebkitMaskSize: 'contain', maskSize: 'contain',
  WebkitMaskRepeat: 'no-repeat', maskRepeat: 'no-repeat',
  WebkitMaskPosition: 'center', maskPosition: 'center',
} as const

/** Color del canto (grafito metálico) interpolado por profundidad (0 fondo → 1 frente). */
function canto(t: number): string {
  const a = [38, 42, 52], b = [120, 128, 140]   // #262a34 → #788090
  const m = (i: number) => Math.round(a[i] + (b[i] - a[i]) * t)
  return `rgb(${m(0)}, ${m(1)}, ${m(2)})`
}

/**
 * Logo del hero EXTRUIDO en 3D con la silueta EXACTA del logo.
 * El cuerpo es la silueta rellena en AZUL sólido (máscara del logo) apilada en
 * profundidad → grosor real y opaco. Caras delantera/trasera a todo color con
 * backface-visibility para que nunca se vea en espejo. Giro libre (sin límites).
 */
export default function LogoMoneda() {
  const [rot, setRot] = useState({ x: -6, y: 18 })
  const [arrastrando, setArrastrando] = useState(false)
  const inicio = useRef<{ px: number; py: number; rx: number; ry: number } | null>(null)

  function onPointerDown(e: React.PointerEvent) {
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
    inicio.current = { px: e.clientX, py: e.clientY, rx: rot.x, ry: rot.y }
    setArrastrando(true)
  }
  function onPointerMove(e: React.PointerEvent) {
    if (!arrastrando || !inicio.current) return
    const dx = e.clientX - inicio.current.px
    const dy = e.clientY - inicio.current.py
    setRot({ y: inicio.current.ry + dx * 0.45, x: inicio.current.rx - dy * 0.45 })
  }
  function onPointerUp() { setArrastrando(false); inicio.current = null }

  // El cuerpo no depende del giro → se memoiza para que arrastrar sea fluido
  const cuerpo = useMemo(() => Array.from({ length: CAPAS }, (_, i) => {
    const z = -T / 2 + i * PASO
    return <div key={i} className="absolute inset-0" style={{ ...MASK, transform: `translateZ(${z}px)`, background: canto(i / (CAPAS - 1)) }} />
  }), [])

  return (
    <div className="relative mb-8 select-none flex justify-center" style={{ perspective: '1400px' }}>
      {/* Halo de luz */}
      <div className="absolute inset-0 -z-10 flex items-center justify-center">
        <div className="w-64 h-64 sm:w-80 sm:h-80 rounded-full bg-pm-red/30 blur-[80px] animate-glow-pulse" />
      </div>

      <div
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onDoubleClick={() => { setArrastrando(false); setRot({ x: -6, y: 18 }) }}
        title="Pincha y arrastra para girar el logo · doble clic para centrar 🪙"
        className={`relative w-44 h-44 sm:w-56 sm:h-56 ${arrastrando ? 'cursor-grabbing' : 'cursor-grab'} touch-none`}
        style={{
          transformStyle: 'preserve-3d',
          transform: `rotateX(${rot.x}deg) rotateY(${rot.y}deg)`,
          transition: arrastrando ? 'transform 0.2s ease-out' : 'transform 1s cubic-bezier(0.22, 1, 0.36, 1)',
          willChange: 'transform',
          filter: 'drop-shadow(0 22px 38px rgba(0,0,0,0.5))',
        }}
      >
        {/* CUERPO / CANTO en azul sólido */}
        {cuerpo}

        {/* CARA FRONTAL (logo a color) */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="Planeta Movimiento" draggable={false}
          className="absolute inset-0 w-full h-full object-contain pointer-events-none"
          style={{ transform: `translateZ(${T / 2 + 0.5}px)`, backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }} />
        {/* CARA TRASERA (logo a color, no espejo gracias a backface-visibility) */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="" aria-hidden draggable={false}
          className="absolute inset-0 w-full h-full object-contain pointer-events-none"
          style={{ transform: `rotateY(180deg) translateZ(${T / 2 + 0.5}px)`, backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }} />
      </div>
    </div>
  )
}
