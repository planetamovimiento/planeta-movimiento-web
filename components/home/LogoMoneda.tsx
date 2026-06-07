'use client'

import { useRef, useState } from 'react'

// Grosor de la extrusión del logo (px) y nº de capas que forman el canto
const T = 22
const CAPAS = 26
const PASO = T / (CAPAS - 1)

/**
 * Logo del hero EXTRUIDO en 3D: mantiene la silueta exacta del logo (no es un
 * círculo) y se le da grosor apilando copias del propio logo en profundidad.
 * Las capas intermedias van oscurecidas = el "canto"; las caras delantera y
 * trasera van a todo color. Se gira arrastrando con el ratón (o el dedo).
 */
export default function LogoMoneda() {
  const [rot, setRot] = useState({ x: -10, y: 22 })   // ángulo inicial para que se note el grosor
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

  return (
    <div className="relative mb-8 select-none flex justify-center" style={{ perspective: '1200px' }}>
      {/* Halo de luz */}
      <div className="absolute inset-0 -z-10 flex items-center justify-center">
        <div className="w-64 h-64 sm:w-80 sm:h-80 rounded-full bg-pm-red/30 blur-[80px] animate-glow-pulse" />
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
          filter: 'drop-shadow(0 20px 35px rgba(0,0,0,0.45))',
        }}
      >
        {Array.from({ length: CAPAS }, (_, i) => {
          const z = -T / 2 + i * PASO
          const cara = i === CAPAS - 1 || i === 0   // delantera y trasera a todo color
          // Capas intermedias: oscurecidas para simular el material del canto,
          // un poco más oscuras cuanto más al fondo, para dar volumen.
          const brillo = 0.22 + (i / CAPAS) * 0.18
          return (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={i}
              src="/logo.png"
              alt={i === CAPAS - 1 ? 'Planeta Movimiento' : ''}
              aria-hidden={i !== CAPAS - 1}
              draggable={false}
              className="absolute inset-0 w-full h-full object-contain pointer-events-none"
              style={{
                transform: `translateZ(${z}px)`,
                filter: cara ? 'none' : `brightness(${brillo}) saturate(0.6)`,
              }}
            />
          )
        })}
      </div>
    </div>
  )
}
