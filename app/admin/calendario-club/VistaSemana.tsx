'use client'

import { iso, paleta, colorOcurrencia, type Ocurrencia, type TipoEvento } from '@/lib/calendario-club/tipos'

type Props = {
  ocurrencias: Ocurrencia[]; tipos: TipoEvento[]; cursor: Date; puedeEditar: boolean
  onCrear: (fecha?: string) => void; onAbrir: (o: Ocurrencia) => void
}

const NOMBRES = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
const pad = (n: number) => String(n).padStart(2, '0')
const HOY = (() => { const d = new Date(); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` })()

export default function VistaSemana({ ocurrencias, tipos, cursor, puedeEditar, onCrear, onAbrir }: Props) {
  const dow = (cursor.getDay() + 6) % 7
  const lunes = new Date(cursor.getFullYear(), cursor.getMonth(), cursor.getDate() - dow)
  const dias = Array.from({ length: 7 }, (_, i) => { const d = new Date(lunes); d.setDate(lunes.getDate() + i); return d })

  const porDia = new Map<string, Ocurrencia[]>()
  for (const o of ocurrencias) { const a = porDia.get(o.fecha) || []; a.push(o); porDia.set(o.fecha, a) }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-x-auto">
      <div className="grid grid-cols-7 min-w-[720px]">
        {dias.map((d, i) => {
          const fecha = iso(d.getFullYear(), d.getMonth(), d.getDate())
          const evs = porDia.get(fecha) || []
          const hoy = fecha === HOY
          return (
            <div key={fecha} className="border-r border-gray-50 last:border-r-0 min-h-[380px] flex flex-col">
              <div className={`text-center py-2 border-b border-gray-100 ${hoy ? 'bg-pm-red-light' : ''}`}>
                <div className="text-xs font-black text-gray-500 uppercase">{NOMBRES[i]}</div>
                <div className={`text-sm font-bold ${hoy ? 'text-pm-red' : 'text-pm-navy'}`}>{d.getDate()}</div>
              </div>
              <div className="p-1.5 space-y-1 flex-1 group">
                {evs.map((o, idx) => {
                  const p = paleta(colorOcurrencia(o, tipos))
                  return (
                    <button key={idx} onClick={() => onAbrir(o)} className={`w-full text-left text-[11px] leading-tight px-1.5 py-1 rounded ${p.chip} ${o.cancelado ? 'line-through opacity-50' : ''}`}>
                      <div className="font-bold">{o.hora_inicio || 'Todo el día'}</div>
                      <div className="truncate">{o.titulo}</div>
                    </button>
                  )
                })}
                {puedeEditar && <button onClick={() => onCrear(fecha)} className="opacity-0 group-hover:opacity-100 w-full text-center text-gray-300 hover:text-pm-red text-xs py-1">+ añadir</button>}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
