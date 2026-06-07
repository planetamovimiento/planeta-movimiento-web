'use client'

import { useRef, useState } from 'react'

/**
 * Logo del hero que se gira en 3D arrastrando con el ratón (clic mantenido).
 * Rota en todos los ángulos (eje X e Y), de forma suave, y se queda donde lo dejes.
 * Funciona también con el dedo en móvil (pointer events + captura).
 */
export default function LogoMoneda() {
  const [rot, setRot] = useState({ x: 0, y: 0 })
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
    // arrastre horizontal → eje Y (moneda) · vertical → eje X
    setRot({ y: inicio.current.ry + dx * 0.45, x: inicio.current.rx - dy * 0.45 })
  }

  function onPointerUp() { setArrastrando(false); inicio.current = null }

  return (
    <div className="relative mb-8 select-none" style={{ perspective: '1100px' }}>
      {/* Halo de luz tras el logo */}
      <div className="absolute inset-0 -z-10 flex items-center justify-center">
        <div className="w-64 h-64 sm:w-80 sm:h-80 rounded-full bg-pm-red/30 blur-[80px] animate-glow-pulse" />
      </div>

      <div
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        title="Pincha y arrastra para girar el logo 🪙"
        className={`relative w-44 h-44 sm:w-56 sm:h-56 mx-auto touch-none ${arrastrando ? 'cursor-grabbing' : 'cursor-grab'}`}
        style={{
          transformStyle: 'preserve-3d',
          transform: `rotateX(${rot.x}deg) rotateY(${rot.y}deg)`,
          // suave al arrastrar y un asentamiento elegante al soltar
          transition: arrastrando ? 'transform 0.25s ease-out' : 'transform 0.9s cubic-bezier(0.22, 1, 0.36, 1)',
          willChange: 'transform',
        }}
      >
        {/* Cara frontal */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo.png" alt="Planeta Movimiento" draggable={false}
          className="absolute inset-0 w-full h-full object-contain pointer-events-none"
          style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', filter: 'drop-shadow(0 20px 40px rgba(212,43,43,0.35))' }}
        />
        {/* Cara trasera (mismo logo, para que siempre se vea al girar) */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo.png" alt="" aria-hidden draggable={false}
          className="absolute inset-0 w-full h-full object-contain pointer-events-none"
          style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', transform: 'rotateY(180deg)', filter: 'drop-shadow(0 20px 40px rgba(212,43,43,0.35))' }}
        />
      </div>
    </div>
  )
}
