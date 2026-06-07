'use client'

import { useRef, useState } from 'react'

/**
 * Logo del hero que gira en 3D como una moneda al mover el ratón sobre él,
 * y da una vuelta completa al hacer clic. El logo se ve por ambas caras.
 */
export default function LogoMoneda() {
  const ref = useRef<HTMLDivElement>(null)
  const [rot, setRot] = useState({ x: 0, y: 0 })
  const [spin, setSpin] = useState(0)        // vueltas extra acumuladas por clic
  const [suave, setSuave] = useState(true)   // transición suave (al salir/clicar) vs. seguir al ratón

  function onMove(e: React.MouseEvent) {
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const px = (e.clientX - r.left) / r.width   // 0 → 1 (izq → der)
    const py = (e.clientY - r.top) / r.height
    setSuave(false)
    setRot({ y: (px - 0.5) * 300, x: -(py - 0.5) * 45 })  // girar como moneda (eje Y) + leve inclinación
  }

  function onLeave() { setSuave(true); setRot({ x: 0, y: 0 }) }
  function onClick() { setSuave(true); setSpin(s => s + 360) }

  return (
    <div className="relative mb-8 select-none" style={{ perspective: '1000px' }}>
      {/* Halo de luz tras el logo */}
      <div className="absolute inset-0 -z-10 flex items-center justify-center">
        <div className="w-64 h-64 sm:w-80 sm:h-80 rounded-full bg-pm-red/30 blur-[80px] animate-glow-pulse" />
      </div>

      <div
        ref={ref}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        onClick={onClick}
        title="¡Gírame como una moneda! 🪙"
        className="relative w-44 h-44 sm:w-56 sm:h-56 mx-auto cursor-pointer"
        style={{
          transformStyle: 'preserve-3d',
          transform: `rotateX(${rot.x}deg) rotateY(${rot.y + spin}deg)`,
          transition: suave ? 'transform 0.9s cubic-bezier(0.22, 1, 0.36, 1)' : 'transform 0.05s linear',
        }}
      >
        {/* Cara frontal */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo.png" alt="Planeta Movimiento" draggable={false}
          className="absolute inset-0 w-full h-full object-contain"
          style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', filter: 'drop-shadow(0 20px 40px rgba(212,43,43,0.35))' }}
        />
        {/* Cara trasera (mismo logo, para que siempre se vea el logo al girar) */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo.png" alt="" aria-hidden draggable={false}
          className="absolute inset-0 w-full h-full object-contain"
          style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', transform: 'rotateY(180deg)', filter: 'drop-shadow(0 20px 40px rgba(212,43,43,0.35))' }}
        />
      </div>
    </div>
  )
}
