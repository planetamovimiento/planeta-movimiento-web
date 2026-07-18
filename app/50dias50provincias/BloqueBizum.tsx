'use client'

// ─────────────────────────────────────────────────────────────────────────────
// Colabora con la ruta: Bizum para la gasolina.
//
// Bizum se hace desde la app del banco, así que aquí no hay pasarela: se
// muestran el número y el concepto con un botón para copiarlos de un toque
// (que es como se usa de verdad, desde el móvil). Se pide nombre y apellidos
// en el concepto para poder llevar el registro de quién ha colaborado.
// ─────────────────────────────────────────────────────────────────────────────

import { useRef, useState } from 'react'
import { BIZUM } from '@/lib/reto50/constants'

const IconoCopiar = ({ className = 'w-3.5 h-3.5' }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
  </svg>
)

const IconoOk = ({ className = 'w-3.5 h-3.5' }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
  </svg>
)

/**
 * Dato con botón de copiar. Si el navegador bloquea el portapapeles (pasa en
 * algunos móviles), se selecciona el texto para poder copiarlo a mano: nunca se
 * queda sin respuesta al pulsar.
 */
function Copiable({ etiqueta, valor, aCopiar }: { etiqueta: string; valor: string; aCopiar: string }) {
  const [estado, setEstado] = useState<'listo' | 'copiado' | 'manual'>('listo')
  const valorRef = useRef<HTMLSpanElement>(null)

  function seleccionar() {
    const nodo = valorRef.current
    if (!nodo) return
    const rango = document.createRange()
    rango.selectNodeContents(nodo)
    const sel = window.getSelection()
    sel?.removeAllRanges()
    sel?.addRange(rango)
  }

  async function copiar() {
    try {
      await navigator.clipboard.writeText(aCopiar)
      setEstado('copiado')
    } catch {
      // Sin permiso de portapapeles: se deja seleccionado para copiar a mano.
      seleccionar()
      setEstado('manual')
    }
    setTimeout(() => setEstado('listo'), 2500)
  }

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl px-3 py-2.5">
      <div className="text-[10px] font-black uppercase tracking-widest text-white/40">{etiqueta}</div>
      <div className="flex items-center justify-between gap-2 mt-0.5">
        <span ref={valorRef} className="text-white font-black text-sm break-all select-all">{valor}</span>
        <button
          type="button"
          onClick={copiar}
          aria-label={`Copiar ${etiqueta.toLowerCase()}`}
          className={`shrink-0 inline-flex items-center gap-1 text-[11px] font-bold rounded-lg px-2 py-1 transition-colors ${
            estado === 'copiado'
              ? 'bg-emerald-500/20 text-emerald-300'
              : estado === 'manual'
                ? 'bg-amber-500/20 text-amber-200'
                : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'
          }`}
        >
          {estado === 'copiado' ? (
            <><IconoOk className="w-3 h-3" /> Copiado</>
          ) : estado === 'manual' ? (
            'Cópialo tú'
          ) : (
            <><IconoCopiar className="w-3 h-3" /> Copiar</>
          )}
        </button>
      </div>
      <span aria-live="polite" className="sr-only">
        {estado === 'copiado' ? `${etiqueta} copiado` : estado === 'manual' ? 'Texto seleccionado para copiar' : ''}
      </span>
    </div>
  )
}

export default function BloqueBizum({ config }: { config: Record<string, string> }) {
  const telefono = config.bizum_telefono || BIZUM.telefono
  const concepto = config.bizum_concepto || BIZUM.concepto
  const titulo = config.bizum_titulo || 'Colabora con la ruta'
  const texto = config.bizum_texto || 'Ayuda a llenar el depósito para que el reto llegue a las 50 provincias.'

  // Para copiar: el número sin espacios es lo que pide la app del banco.
  const telPlano = telefono.replace(/\s+/g, '')

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 h-full flex flex-col">
      <div className="text-center">
        <h3 className="text-white font-black text-sm">{titulo}</h3>
        <p className="text-white/50 text-xs mt-1 leading-relaxed">{texto}</p>
      </div>

      <div className="mt-3 space-y-2">
        <Copiable etiqueta="Bizum al" valor={telefono} aCopiar={telPlano} />
        <Copiable etiqueta="Concepto" valor={concepto} aCopiar={concepto} />
      </div>

      <p className="text-white/40 text-[11px] leading-relaxed mt-3">
        Añade tu <strong className="text-white/70">nombre y apellidos</strong> en el concepto: así sabemos quién ha
        colaborado y podemos darte las gracias en el ranking de la ruta.
      </p>

      <a
        href="#gasolina"
        className="mt-auto pt-3 inline-flex items-center gap-1.5 text-xs font-bold text-pm-red hover:text-white transition-colors"
      >
        Ver el objetivo de gasolina
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </a>
    </div>
  )
}
