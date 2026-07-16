'use client'

// ─────────────────────────────────────────────────────────────────────────────
// Piezas compartidas por las pestañas del panel del reto.
// Solo importa de lib/reto50/constants.ts (fichero puro): nunca de data.ts.
// ─────────────────────────────────────────────────────────────────────────────

import type { ReactNode } from 'react'

export type Resultado = { ok: boolean; error?: string | null }
export type Correr = (fn: () => Promise<Resultado>) => void

export const inputCls =
  'w-full border border-gray-200 rounded-lg px-2.5 py-2 text-sm focus:outline-none focus:border-pm-red disabled:bg-gray-50 disabled:text-gray-400'

/** Campo con etiqueta y ayuda opcional. */
export function Campo({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block min-w-0">
      <span className="block text-xs font-bold text-gray-500 mb-1">{label}</span>
      {children}
      {hint && <span className="block text-xs text-gray-400 mt-1 leading-relaxed">{hint}</span>}
    </label>
  )
}

/** Título de bloque dentro de una pestaña. */
export function Bloque({ titulo, desc, children }: { titulo: string; desc?: string; children: ReactNode }) {
  return (
    <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className="mb-4">
        <h2 className="font-black text-pm-navy">{titulo}</h2>
        {desc && <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{desc}</p>}
      </div>
      {children}
    </section>
  )
}

/** Aviso de que un dato aún no existe: nunca se inventa un 0. */
export function SinDato({ children = 'Aún sin datos' }: { children?: ReactNode }) {
  return <span className="text-xs text-gray-400 italic">{children}</span>
}

export function BotonGuardar({ onClick, pending, disabled, children = 'Guardar' }: {
  onClick: () => void; pending: boolean; disabled?: boolean; children?: ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending || disabled}
      className="bg-pm-red hover:bg-pm-red-dark disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold px-4 py-2 rounded-xl text-sm whitespace-nowrap"
    >
      {pending ? 'Guardando…' : children}
    </button>
  )
}

/** Botón pequeño y neutro (subir/bajar, cerrar…). */
export function BotonMini({ onClick, disabled, titulo, children }: {
  onClick: () => void; disabled?: boolean; titulo?: string; children: ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={titulo}
      className="text-xs font-bold text-pm-navy border border-gray-200 rounded-lg px-2.5 py-1.5 hover:border-pm-red disabled:opacity-30 disabled:cursor-not-allowed"
    >
      {children}
    </button>
  )
}
