'use client'

import { iso, paleta, colorOcurrencia, type Ocurrencia, type TipoEvento } from '@/lib/calendario-club/tipos'

type Props = {
  ocurrencias: Ocurrencia[]; tipos: TipoEvento[]; cursor: Date; puedeEditar: boolean
  onCrear: (fecha?: string) => void; onAbrir: (o: Ocurrencia) => void
}

const DIAS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
const pad = (n: number) => String(n).padStart(2, '0')
const HOY = (() => { const d = new Date(); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` })()

export default function VistaMes({ ocurrencias, tipos, cursor, puedeEditar, onCrear, onAbrir }: Props) {
  const y = cursor.getFullYear(), m = cursor.getMonth()
  const primer = (new Date(y, m, 1).getDay() + 6) % 7
  const dias = new Date(y, m + 1, 0).getDate()
  const celdas: (number | null)[] = [...Array(primer).fill(null), ...Array.from({ length: dias }, (_, i) => i + 1)]

  const porDia = new Map<string, Ocurrencia[]>()
  for (const o of ocurrencias) { const a = porDia.get(o.fecha) || []; a.push(o); porDia.set(o.fecha, a) }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="grid grid-cols-7 bg-pm-bg text-xs font-black text-gray-500 uppercase">
        {DIAS.map(d => <div key={d} className="px-2 py-2 text-center">{d}</div>)}
      </div>
      <div className="grid grid-cols-7">
        {celdas.map((dia, i) => {
          if (dia === null) return <div key={`b${i}`} className="min-h-[104px] border-b border-r border-gray-50 bg-gray-50/40" />
          const fecha = iso(y, m, dia)
          const evs = porDia.get(fecha) || []
          const hoy = fecha === HOY
          return (
            <div key={fecha} className="min-h-[104px] border-b border-r border-gray-50 p-1.5 flex flex-col gap-1 group">
              <div className="flex items-center justify-between">
                <span className={`text-xs font-bold ${hoy ? 'bg-pm-red text-white w-6 h-6 rounded-full flex items-center justify-center' : 'text-gray-500'}`}>{dia}</span>
                {puedeEditar && <button onClick={() => onCrear(fecha)} className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-pm-red text-sm leading-none">+</button>}
              </div>
              <div className="space-y-0.5 overflow-hidden">
                {evs.slice(0, 4).map((o, idx) => {
                  const p = paleta(colorOcurrencia(o, tipos))
                  return (
                    <button key={idx} onClick={() => onAbrir(o)} title={o.titulo}
                      className={`w-full text-left text-[10px] leading-tight px-1.5 py-0.5 rounded truncate ${p.chip} ${o.cancelado ? 'line-through opacity-50' : ''}`}>
                      {o.hora_inicio ? `${o.hora_inicio} ` : ''}{o.titulo}
                    </button>
                  )
                })}
                {evs.length > 4 && <div className="text-[10px] text-gray-400 font-semibold px-1">+{evs.length - 4} más</div>}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
