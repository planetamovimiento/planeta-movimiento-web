'use client'

import { useRef, useState } from 'react'

// ── Geometría de la moneda (px) ────────────────────────────────────────────────
const D = 224          // diámetro
const T = 30           // grosor (canto)
const CAPAS = 26       // nº de discos que forman el cuerpo (canto)
const PASO = T / (CAPAS - 1)

/**
 * Logo del hero como MONEDA 3D real, con grosor visible.
 * El cuerpo se extruye apilando discos entre la cara frontal y la trasera,
 * así el canto se ve desde cualquier ángulo. Se gira arrastrando con el ratón
 * (o el dedo) en todos los ejes, de forma suave.
 */
export default function LogoMoneda() {
  const [rot, setRot] = useState({ x: -8, y: 18 })   // ligero ángulo inicial para que se note el 3D
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
    <div className="relative mb-8 select-none flex justify-center">
      {/* Halo de luz */}
      <div className="absolute inset-0 -z-10 flex items-center justify-center">
        <div className="w-64 h-64 sm:w-80 sm:h-80 rounded-full bg-pm-red/30 blur-[80px] animate-glow-pulse" />
      </div>

      <div className="scale-[0.78] sm:scale-100" style={{ perspective: '1200px' }}>
        <div
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          title="Pincha y arrastra para girar la moneda 🪙"
          className={`relative mx-auto ${arrastrando ? 'cursor-grabbing' : 'cursor-grab'} touch-none`}
          style={{
            width: D, height: D,
            transformStyle: 'preserve-3d',
            transform: `rotateX(${rot.x}deg) rotateY(${rot.y}deg)`,
            transition: arrastrando ? 'transform 0.25s ease-out' : 'transform 1s cubic-bezier(0.22, 1, 0.36, 1)',
            willChange: 'transform',
            filter: 'drop-shadow(0 25px 45px rgba(0,0,0,0.5))',
          }}
        >
          {/* CUERPO / CANTO — discos apilados que dan grosor */}
          {Array.from({ length: CAPAS }, (_, i) => {
            const z = -T / 2 + i * PASO
            return (
              <div key={i} className="absolute inset-0 rounded-full"
                style={{
                  transform: `translateZ(${z}px)`,
                  background: 'linear-gradient(180deg, #33457e 0%, #16224a 55%, #0a1230 100%)',
                  boxShadow: 'inset 0 0 0 6px rgba(212,43,43,0.55)',
                }} />
            )
          })}

          {/* CARA FRONTAL */}
          <Cara z={T / 2} />
          {/* CARA TRASERA */}
          <Cara z={-T / 2} trasera />
        </div>
      </div>
    </div>
  )
}

function Cara({ z, trasera = false }: { z: number; trasera?: boolean }) {
  return (
    <div
      className="absolute inset-0 rounded-full flex items-center justify-center overflow-hidden"
      style={{
        transform: `${trasera ? 'rotateY(180deg) ' : ''}translateZ(${trasera ? T / 2 : z}px)`,
        backfaceVisibility: 'hidden',
        WebkitBackfaceVisibility: 'hidden',
        background: 'radial-gradient(circle at 35% 30%, #243667 0%, #14204a 55%, #0a1230 100%)',
        boxShadow: 'inset 0 0 0 5px rgba(212,43,43,0.7), inset 0 6px 18px rgba(255,255,255,0.12), inset 0 -10px 24px rgba(0,0,0,0.45)',
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/logo.png" alt="Planeta Movimiento" draggable={false}
        className="w-[74%] h-[74%] object-contain pointer-events-none"
        style={{ filter: 'drop-shadow(0 6px 10px rgba(0,0,0,0.4))' }} />
    </div>
  )
}
