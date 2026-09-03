'use client'

import { useMemo, useState } from 'react'
import { iso, paleta, colorOcurrencia, type Ocurrencia, type TipoEvento } from '@/lib/calendario-club/tipos'

// ─────────────────────────────────────────────────────────────────────────────
// Calendario del Club para el Portal de Familias: vista mensual navegable con
// las clases, festivos y eventos PÚBLICOS. Solo lectura. Los datos (ocurrencias
// ya expandidas) llegan del servidor; aquí solo se navega por meses.
// ─────────────────────────────────────────────────────────────────────────────

const DIAS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

/** Lista de meses {y, m} entre dos fechas ISO (inclusive). */
function mesesEntre(desde: string, hasta: string): { y: number; m: number }[] {
  const out: { y: number; m: number }[] = []
  const a = new Date(desde + 'T12:00:00'), b = new Date(hasta + 'T12:00:00')
  let y = a.getFullYear(), m = a.getMonth()
  while (y < b.getFullYear() || (y === b.getFullYear() && m <= b.getMonth())) {
    out.push({ y, m }); m++; if (m > 11) { m = 0; y++ }
    if (out.length > 24) break
  }
  return out
}

export function CalendarioClub({ ocurrencias, tipos, desde, hasta }: {
  ocurrencias: Ocurrencia[]; tipos: TipoEvento[]; desde: string; hasta: string
}) {
  const meses = useMemo(() => mesesEntre(desde, hasta), [desde, hasta])
  const porDia = useMemo(() => {
    const m = new Map<string, Ocurrencia[]>()
    for (const o of ocurrencias) { const a = m.get(o.fecha) || []; a.push(o); m.set(o.fecha, a) }
    return m
  }, [ocurrencias])

  const hoyISO = new Date().toISOString().slice(0, 10)
  // Arranca en el mes actual si está dentro del rango; si no, en el primero.
  const idxInicial = Math.max(0, meses.findIndex(x => x.y === new Date().getFullYear() && x.m === new Date().getMonth()))
  const [idx, setIdx] = useState(idxInicial)
  const actual = meses[idx] ?? meses[0]
  if (!actual) return null

  const tiposPresentes = tipos
    .filter(t => ocurrencias.some(o => colorOcurrencia(o, tipos) && o.tipo === t.id))
    .sort((a, b) => a.orden - b.orden)

  const primer = (new Date(actual.y, actual.m, 1).getDay() + 6) % 7
  const dias = new Date(actual.y, actual.m + 1, 0).getDate()
  const celdas: (number | null)[] = [...Array(primer).fill(null), ...Array.from({ length: dias }, (_, i) => i + 1)]
  const nombreMes = new Date(actual.y, actual.m, 1).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-4 sm:px-5 py-4 flex items-center justify-between gap-2 border-b border-gray-100">
        <div>
          <h2 className="font-black text-pm-navy">Calendario del Club</h2>
          <p className="text-xs text-gray-400 capitalize">{nombreMes}</p>
        </div>
        <div className="flex items-center gap-1.5">
          <button onClick={() => setIdx(i => Math.max(0, i - 1))} disabled={idx === 0}
            className="w-8 h-8 rounded-lg border border-gray-200 text-pm-navy disabled:opacity-30 hover:border-pm-red flex items-center justify-center" aria-label="Mes anterior">‹</button>
          <button onClick={() => setIdx(i => Math.min(meses.length - 1, i + 1))} disabled={idx >= meses.length - 1}
            className="w-8 h-8 rounded-lg border border-gray-200 text-pm-navy disabled:opacity-30 hover:border-pm-red flex items-center justify-center" aria-label="Mes siguiente">›</button>
        </div>
      </div>

      <div className="p-3 sm:p-4">
        <div className="overflow-x-auto">
          <div className="min-w-[560px]">
            <div className="grid grid-cols-7 text-[10px] font-black text-gray-400 uppercase mb-1">
              {DIAS.map(d => <div key={d} className="px-1 py-1 text-center">{d}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {celdas.map((dia, i) => {
                if (dia === null) return <div key={`b${i}`} className="min-h-[68px] rounded-lg bg-gray-50/60" />
                const fecha = iso(actual.y, actual.m, dia)
                const evs = porDia.get(fecha) || []
                const esHoy = fecha === hoyISO
                return (
                  <div key={fecha} className={`min-h-[68px] rounded-lg border p-1 ${esHoy ? 'border-pm-red bg-pm-red-light/40' : 'border-gray-100'}`}>
                    <div className={`text-[11px] font-bold ${esHoy ? 'text-pm-red' : 'text-gray-500'}`}>{dia}</div>
                    <div className="space-y-0.5 mt-0.5">
                      {evs.slice(0, 4).map((o, k) => {
                        const p = paleta(colorOcurrencia(o, tipos))
                        return (
                          <div key={k} className={`text-[9px] leading-tight px-1 py-0.5 rounded truncate ${p.chip}`} title={`${o.hora_inicio ? o.hora_inicio + ' ' : ''}${o.titulo}`}>
                            {o.hora_inicio ? `${o.hora_inicio} ` : ''}{o.titulo}
                          </div>
                        )
                      })}
                      {evs.length > 4 && <div className="text-[9px] text-gray-400 px-1">+{evs.length - 4} más</div>}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {tiposPresentes.length > 0 && (
          <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-gray-500 mt-3">
            {tiposPresentes.map(t => (
              <span key={t.id} className="flex items-center gap-1.5"><span className={`w-2.5 h-2.5 rounded-full ${paleta(t.color).dot}`} /> {t.label}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
