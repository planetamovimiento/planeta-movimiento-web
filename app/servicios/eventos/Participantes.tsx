'use client'

import { useEffect } from 'react'

// ─────────────────────────────────────────────────────────────────────────────
// Datos de los participantes de un evento del centro: nombre, apellidos y edad
// de cada niño (o de cada persona, en Práctica Libre). Quien rellena el
// formulario es el responsable que paga; aquí van los que de verdad asisten.
//
// La lista y el contador de plazas van siempre a la par: añadir un participante
// sube el número (y el precio) y quitarlo lo baja.
// ─────────────────────────────────────────────────────────────────────────────

export type Participante = { nombre: string; apellidos: string; edad: string }

export const unParticipante = (): Participante => ({ nombre: '', apellidos: '', edad: '' })

/** Deja la lista con exactamente `n` participantes, conservando lo escrito. */
export function ajustarLista(lista: Participante[], n: number): Participante[] {
  const total = Math.max(1, n)
  if (lista.length === total) return lista
  if (lista.length > total) return lista.slice(0, total)
  return [...lista, ...Array.from({ length: total - lista.length }, unParticipante)]
}

/** 'Ana Gómez (7 años) · Luis Gómez (5 años)' para el CRM y los correos. */
export function textoParticipantes(lista: Participante[]): string {
  return lista
    .map(p => `${p.nombre.trim()} ${p.apellidos.trim()}`.trim() + (p.edad.trim() ? ` (${p.edad.trim()} años)` : ''))
    .filter(t => t.trim())
    .join(' · ')
}

/** '7, 5' — se sigue mandando aparte porque el CRM ya mostraba las edades. */
export function textoEdades(lista: Participante[]): string {
  return lista.map(p => p.edad.trim()).filter(Boolean).join(', ')
}

/** ¿Están rellenos el nombre y los apellidos de todos? (la edad es opcional) */
export function participantesCompletos(lista: Participante[]): boolean {
  return lista.length > 0 && lista.every(p => p.nombre.trim() && p.apellidos.trim())
}

type Tema = 'claro' | 'oscuro'

export function CamposParticipantes({
  valor, onChange, n, onCambiarN, max = 20, tema = 'claro', etiqueta = 'Datos de los participantes',
  ayuda = 'Dinos quién viene. Si vienen hermanos, añade uno por cada niño.',
  singular = 'Participante',
}: {
  valor: Participante[]
  onChange: (lista: Participante[]) => void
  /** Nº de plazas elegido en el contador del formulario. */
  n: number
  /** Cambia ese número (y con él el precio) al añadir o quitar participantes. */
  onCambiarN: (n: number) => void
  max?: number
  tema?: Tema
  etiqueta?: string
  ayuda?: string
  singular?: string
}) {
  // La lista sigue siempre al contador de plazas.
  useEffect(() => {
    const ajustada = ajustarLista(valor, n)
    if (ajustada !== valor) onChange(ajustada)
  }, [n]) // eslint-disable-line react-hooks/exhaustive-deps

  const oscuro = tema === 'oscuro'
  const campo = oscuro
    ? 'w-full border border-orange-500/30 bg-orange-950/20 rounded-xl px-3 py-2.5 text-sm text-white placeholder-orange-300/50 focus:outline-none focus:border-orange-400'
    : 'w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-pm-red'
  const titulo = oscuro ? 'text-orange-200' : 'text-pm-navy'
  const sutil = oscuro ? 'text-orange-300/60' : 'text-gray-400'
  const caja = oscuro ? 'border-orange-500/20 bg-orange-950/10' : 'border-gray-100 bg-gray-50/60'

  const cambiar = (i: number, campoP: keyof Participante, v: string) => {
    onChange(valor.map((p, k) => (k === i ? { ...p, [campoP]: v } : p)))
  }

  const quitar = (i: number) => {
    if (valor.length <= 1) return
    onChange(valor.filter((_, k) => k !== i))
    onCambiarN(Math.max(1, n - 1))
  }

  const anadir = () => {
    if (valor.length >= max) return
    onChange([...valor, unParticipante()])
    onCambiarN(Math.min(max, n + 1))
  }

  return (
    <div>
      <label className={`block text-xs font-bold mb-1 ${titulo}`}>{etiqueta} *</label>
      <p className={`text-xs mb-2 ${sutil}`}>{ayuda}</p>

      <div className="space-y-2">
        {valor.map((p, i) => (
          <div key={i} className={`border rounded-xl p-3 space-y-2 ${caja}`}>
            <div className="flex items-center justify-between">
              <span className={`text-[11px] font-black uppercase tracking-wider ${sutil}`}>{singular} {i + 1}</span>
              {valor.length > 1 && (
                <button type="button" onClick={() => quitar(i)}
                  className={`text-[11px] font-bold ${oscuro ? 'text-orange-300 hover:text-orange-200' : 'text-pm-red hover:underline'}`}>
                  Quitar
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input required type="text" placeholder="Nombre *" value={p.nombre}
                onChange={e => cambiar(i, 'nombre', e.target.value)} className={campo} />
              <input required type="text" placeholder="Apellidos *" value={p.apellidos}
                onChange={e => cambiar(i, 'apellidos', e.target.value)} className={campo} />
            </div>
            <input type="number" min={0} max={110} placeholder="Edad" value={p.edad}
              onChange={e => cambiar(i, 'edad', e.target.value)} className={`${campo} max-w-[120px]`} />
          </div>
        ))}
      </div>

      {valor.length < max && (
        <button type="button" onClick={anadir}
          className={`mt-2 w-full border-2 border-dashed rounded-xl py-2.5 text-xs font-bold transition-colors ${
            oscuro
              ? 'border-orange-500/40 text-orange-200 hover:border-orange-400'
              : 'border-gray-200 text-pm-navy hover:border-pm-red hover:text-pm-red'
          }`}>
          + Añadir {singular.toLowerCase().endsWith('a') ? 'otra' : 'otro'} {singular.toLowerCase()}
        </button>
      )}
    </div>
  )
}
