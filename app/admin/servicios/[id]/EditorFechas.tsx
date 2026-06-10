'use client'

import { useState } from 'react'

// Editor visual de listas de fechas. Por debajo sigue guardando el MISMO
// formato de texto que lee la web (una fecha por línea), pero el usuario
// trabaja con un selector de fecha + etiqueta opcional, sin escribir a mano.

type Row = { fecha: string; etiqueta: string }

function parse(value: string, conEtiqueta: boolean): Row[] {
  return value.split('\n').map(l => l.trim()).filter(Boolean).map(l => {
    const m = l.match(/(\d{4}-\d{2}-\d{2})\s*[=|·-]?\s*(.*)/)
    if (m) return { fecha: m[1], etiqueta: conEtiqueta ? (m[2] || '').trim() : '' }
    return { fecha: '', etiqueta: '' }
  }).filter(r => r.fecha)
}

function serialize(rows: Row[], conEtiqueta: boolean): string {
  return rows
    .filter(r => r.fecha)
    .map(r => (conEtiqueta && r.etiqueta.trim() ? `${r.fecha} = ${r.etiqueta.trim()}` : r.fecha))
    .join('\n')
}

export default function EditorFechas(
  { value, onChange, conEtiqueta = false, disabled = false }:
  { value: string; onChange: (v: string) => void; conEtiqueta?: boolean; disabled?: boolean },
) {
  const [rows, setRows] = useState<Row[]>(() => parse(value, conEtiqueta))

  const update = (next: Row[]) => { setRows(next); onChange(serialize(next, conEtiqueta)) }
  const setRow = (i: number, patch: Partial<Row>) => update(rows.map((r, idx) => (idx === i ? { ...r, ...patch } : r)))
  const add = () => update([...rows, { fecha: '', etiqueta: '' }])
  const del = (i: number) => update(rows.filter((_, idx) => idx !== i))

  const campo = 'border border-gray-200 rounded-lg px-2.5 py-2 text-sm bg-white focus:outline-none focus:border-pm-red'

  return (
    <div className="space-y-2">
      {rows.length === 0 && <p className="text-xs text-gray-400 italic">Todavía no hay fechas. Añade la primera abajo.</p>}

      {rows.map((r, i) => (
        <div key={i} className={`grid items-center gap-2 bg-pm-bg rounded-xl p-2 ${conEtiqueta ? 'grid-cols-[11rem_1fr_auto]' : 'grid-cols-[1fr_auto]'}`}>
          <input type="date" value={r.fecha} disabled={disabled} onChange={e => setRow(i, { fecha: e.target.value })} className={campo} />
          {conEtiqueta && (
            <input type="text" value={r.etiqueta} disabled={disabled} placeholder="Etiqueta (ej. Puente Constitución)" onChange={e => setRow(i, { etiqueta: e.target.value })} className={campo} />
          )}
          {!disabled && (
            <button type="button" onClick={() => del(i)} className="text-gray-300 hover:text-red-500 px-1.5 text-lg leading-none" title="Quitar fecha">✕</button>
          )}
        </div>
      ))}

      {!disabled && (
        <button type="button" onClick={add} className="w-full border-2 border-dashed border-gray-300 rounded-xl py-2.5 text-sm font-bold text-pm-red hover:border-pm-red transition-colors">
          + Añadir fecha
        </button>
      )}
    </div>
  )
}
