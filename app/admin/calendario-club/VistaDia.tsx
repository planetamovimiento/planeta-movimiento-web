'use client'

import { iso, paleta, colorOcurrencia, type Ocurrencia, type TipoEvento } from '@/lib/calendario-club/tipos'

type Props = {
  ocurrencias: Ocurrencia[]; tipos: TipoEvento[]; cursor: Date; puedeEditar: boolean
  onCrear: (fecha?: string) => void; onAbrir: (o: Ocurrencia) => void
}

export default function VistaDia({ ocurrencias, tipos, cursor, puedeEditar, onCrear, onAbrir }: Props) {
  const fecha = iso(cursor.getFullYear(), cursor.getMonth(), cursor.getDate())
  const evs = ocurrencias.filter(o => o.fecha === fecha)

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-2 max-w-2xl">
      <div className="flex items-center justify-between">
        <div className="font-black text-pm-navy capitalize">{cursor.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}</div>
        {puedeEditar && <button onClick={() => onCrear(fecha)} className="text-sm font-bold text-pm-red">+ Evento</button>}
      </div>
      {evs.length === 0 ? (
        <p className="text-gray-400 text-sm py-6 text-center">No hay nada programado este día.</p>
      ) : (
        <div className="space-y-2">
          {evs.map((o, idx) => {
            const p = paleta(colorOcurrencia(o, tipos))
            return (
              <button key={idx} onClick={() => onAbrir(o)} className={`w-full text-left flex items-start gap-3 rounded-xl px-4 py-3 ${p.chip} ${o.cancelado ? 'line-through opacity-50' : ''}`}>
                <span className="text-sm font-black w-28 shrink-0">{o.hora_inicio ? `${o.hora_inicio}${o.hora_fin ? `–${o.hora_fin}` : ''}` : 'Todo el día'}</span>
                <span className="flex-1 min-w-0">
                  <span className="block text-sm font-bold">{o.titulo}</span>
                  <span className="block text-xs opacity-70 truncate">{[o.actividad, o.grupo, o.monitor, o.ubicacion].filter(Boolean).join(' · ')}</span>
                </span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
