'use client'

import { paleta, colorOcurrencia, type Ocurrencia, type TipoEvento } from '@/lib/calendario-club/tipos'

type Props = {
  ocurrencias: Ocurrencia[]; tipos: TipoEvento[]; cursor: Date; puedeEditar: boolean
  onCrear: (fecha?: string) => void; onAbrir: (o: Ocurrencia) => void
}

export default function VistaAgenda({ ocurrencias, tipos, onAbrir }: Props) {
  if (ocurrencias.length === 0) {
    return <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center text-gray-400 text-sm">No hay nada programado en este periodo.</div>
  }
  const grupos: { fecha: string; items: Ocurrencia[] }[] = []
  for (const o of ocurrencias) {
    const last = grupos[grupos.length - 1]
    if (last && last.fecha === o.fecha) last.items.push(o)
    else grupos.push({ fecha: o.fecha, items: [o] })
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-50">
      {grupos.map(g => {
        const d = new Date(g.fecha + 'T12:00:00')
        return (
          <div key={g.fecha} className="flex flex-col sm:flex-row gap-3 px-5 py-3">
            <div className="sm:w-44 shrink-0">
              <div className="font-black text-pm-navy capitalize">{d.toLocaleDateString('es-ES', { weekday: 'long' })}</div>
              <div className="text-xs text-gray-400">{d.toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}</div>
            </div>
            <div className="flex-1 space-y-1">
              {g.items.map((o, idx) => {
                const p = paleta(colorOcurrencia(o, tipos))
                return (
                  <button key={idx} onClick={() => onAbrir(o)} className={`w-full text-left flex items-center gap-3 rounded-lg px-3 py-2 ${p.chip} ${o.cancelado ? 'line-through opacity-50' : ''}`}>
                    <span className="text-xs font-bold w-28 shrink-0">{o.hora_inicio ? `${o.hora_inicio}${o.hora_fin ? `–${o.hora_fin}` : ''}` : 'Todo el día'}</span>
                    <span className="text-sm font-semibold truncate">{o.titulo}</span>
                    {o.grupo && <span className="text-xs opacity-70 truncate hidden sm:inline">· {o.grupo}</span>}
                  </button>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
