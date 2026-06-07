'use client'

import { useRef, useState } from 'react'

// Grosor de la extrusión (px) y nº de capas del cuerpo
const T = 90
const CAPAS = 80
const PASO = T / (CAPAS - 1)
const LOGO = 'url(/logo.png)'

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v))

/** Azul de la marca interpolado por profundidad (t: 0 fondo oscuro → 1 frente claro). */
function azul(t: number): string {
  const a = [23, 42, 110], b = [96, 165, 250] // #172a6e → #60a5fa
  const m = (i: number) => Math.round(a[i] + (b[i] - a[i]) * t)
  return `rgb(${m(0)}, ${m(1)}, ${m(2)})`
}

/**
 * Logo del hero EXTRUIDO en 3D con la silueta EXACTA del logo (no círculo).
 * El cuerpo/canto es la silueta del logo rellena en AZUL sólido (vía máscara),
 * apilada en profundidad → grosor real y opaco. Las caras delantera y trasera
 * muestran el logo a todo color. Se gira arrastrando; el giro se limita para
 * que el grosor siempre se vea (nunca se pone totalmente de perfil/plano).
 */
export default function LogoMoneda() {
  const [rot, setRot] = useState({ x: -8, y: 30 })
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
    setRot({
      y: clamp(inicio.current.ry + dx * 0.45, -68, 68),
      x: clamp(inicio.current.rx - dy * 0.45, -48, 48),
    })
  }
  function onPointerUp() { setArrastrando(false); inicio.current = null }

  const maskStyle = {
    WebkitMaskImage: LOGO, maskImage: LOGO,
    WebkitMaskSize: 'contain', maskSize: 'contain',
    WebkitMaskRepeat: 'no-repeat', maskRepeat: 'no-repeat',
    WebkitMaskPosition: 'center', maskPosition: 'center',
  } as const

  return (
    <div className="relative mb-8 select-none flex justify-center" style={{ perspective: '1200px' }}>
      {/* Halo de luz */}
      <div className="absolute inset-0 -z-10 flex items-center justify-center">
        <div className="w-64 h-64 sm:w-80 sm:h-80 rounded-full bg-blue-500/30 blur-[80px] animate-glow-pulse" />
      </div>

      <div
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        title="Pincha y arrastra para girar el logo 🪙"
        className={`relative w-44 h-44 sm:w-56 sm:h-56 ${arrastrando ? 'cursor-grabbing' : 'cursor-grab'} touch-none`}
        style={{
          transformStyle: 'preserve-3d',
          transform: `rotateX(${rot.x}deg) rotateY(${rot.y}deg)`,
          transition: arrastrando ? 'transform 0.25s ease-out' : 'transform 1s cubic-bezier(0.22, 1, 0.36, 1)',
          willChange: 'transform',
          filter: 'drop-shadow(0 20px 35px rgba(0,0,0,0.5))',
        }}
      >
        {/* CUERPO / CANTO — silueta del logo en azul sólido, apilada en profundidad */}
        {Array.from({ length: CAPAS }, (_, i) => {
          const z = -T / 2 + i * PASO
          return (
            <div key={i} className="absolute inset-0"
              style={{ ...maskStyle, transform: `translateZ(${z}px)`, background: azul(i / (CAPAS - 1)) }} />
          )
        })}

        {/* CARA FRONTAL (logo a color) */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="Planeta Movimiento" draggable={false}
          className="absolute inset-0 w-full h-full object-contain pointer-events-none"
          style={{ transform: `translateZ(${T / 2 + 0.5}px)` }} />
        {/* CARA TRASERA (logo a color) */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="" aria-hidden draggable={false}
          className="absolute inset-0 w-full h-full object-contain pointer-events-none"
          style={{ transform: `rotateY(180deg) translateZ(${T / 2 + 0.5}px)` }} />
      </div>
    </div>
  )
}
