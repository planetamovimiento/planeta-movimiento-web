'use client'

import type { SeccionEvento } from '@/lib/eventos/centro'

const TIPOS: { id: SeccionEvento['tipo']; label: string; ayuda: string }[] = [
  { id: 'programa', label: 'Programa / horario', ayuda: 'Una línea por fila: hora = qué pasa. Ej: «22:00 = Gymkana zombie».' },
  { id: 'lista', label: 'Lista con ✓', ayuda: 'Una línea por punto.' },
  { id: 'chips', label: 'Etiquetas redondas', ayuda: 'Una línea por etiqueta.' },
]

/**
 * Editor de los bloques de contenido de un evento (programa de la noche, lo que
 * incluye, el ambiente…). Todo lo que la familia ve en la web sale de aquí.
 */
export default function EditorSecciones({ value, onChange, disabled }: {
  value: SeccionEvento[]
  onChange: (v: SeccionEvento[]) => void
  disabled?: boolean
}) {
  const set = (i: number, patch: Partial<SeccionEvento>) =>
    onChange(value.map((s, j) => (j === i ? { ...s, ...patch } : s)))
  const mover = (i: number, d: -1 | 1) => {
    const otro = i + d
    if (otro < 0 || otro >= value.length) return
    const copia = [...value]
    ;[copia[i], copia[otro]] = [copia[otro], copia[i]]
    onChange(copia)
  }

  const input = 'w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-pm-red'

  return (
    <div className="space-y-3">
      {value.length === 0 && <p className="text-sm text-gray-400">Sin bloques. Añade uno para que aparezca en la web.</p>}

      {value.map((s, i) => (
        <div key={i} className="border border-gray-200 rounded-2xl p-4 space-y-2.5 bg-white">
          <div className="flex flex-wrap gap-2 items-center">
            <input value={s.titulo} disabled={disabled} onChange={e => set(i, { titulo: e.target.value })}
              placeholder="Título del bloque" className={`${input} flex-1 min-w-[180px] font-bold`} />
            <select value={s.tipo} disabled={disabled} onChange={e => set(i, { tipo: e.target.value as SeccionEvento['tipo'] })}
              className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white">
              {TIPOS.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
            </select>
            {!disabled && (
              <div className="flex gap-1">
                <button type="button" onClick={() => mover(i, -1)} className="text-gray-400 hover:text-pm-navy px-2 py-1" title="Subir">↑</button>
                <button type="button" onClick={() => mover(i, 1)} className="text-gray-400 hover:text-pm-navy px-2 py-1" title="Bajar">↓</button>
                <button type="button" onClick={() => onChange(value.filter((_, j) => j !== i))}
                  className="text-gray-400 hover:text-red-600 px-2 py-1" title="Eliminar bloque">🗑</button>
              </div>
            )}
          </div>
          <textarea rows={Math.min(12, Math.max(3, s.items.length + 1))} disabled={disabled}
            value={s.items.join('\n')}
            onChange={e => set(i, { items: e.target.value.split('\n') })}
            onBlur={e => set(i, { items: e.target.value.split('\n').map(l => l.trim()).filter(Boolean) })}
            className={`${input} resize-y font-mono text-[13px]`} />
          <p className="text-[11px] text-gray-400">{TIPOS.find(t => t.id === s.tipo)?.ayuda}</p>
        </div>
      ))}

      {!disabled && (
        <button type="button" onClick={() => onChange([...value, { titulo: 'Nuevo bloque', tipo: 'lista', items: [] }])}
          className="border-2 border-dashed border-gray-200 hover:border-pm-red text-sm font-bold text-gray-500 hover:text-pm-red w-full py-2.5 rounded-xl">
          + Añadir bloque
        </button>
      )}
    </div>
  )
}
