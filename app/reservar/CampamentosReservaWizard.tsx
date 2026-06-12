'use client'

import { useState } from 'react'
import ReservaVerano from '@/app/servicios/campamentos/ReservaVerano'
import ReservaBloque from '@/app/servicios/campamentos/ReservaBloque'
import { parseFechasLista, type CampamentosConfig } from '@/lib/campamentos/editable'
import type { PagoReservaPayload } from '@/app/reservar/actions'

type Ocupacion = { verano: Record<string, number>; navidad: Record<string, number>; ssanta: Record<string, number> }
type Sub = 'verano' | 'navidad' | 'ssanta'

/**
 * Selector compacto de campamento (Verano / Navidad / Semana Santa) + el picker
 * real de cada uno. Reutiliza los mismos formularios de la página de servicio.
 */
export default function CampamentosReservaWizard({ cfg, ocupacion, onReservar }: { cfg: CampamentosConfig; ocupacion: Ocupacion; onReservar?: (p: PagoReservaPayload) => void }) {
  const navDias = parseFechasLista(cfg.navidadFechas)
  const ssDias = parseFechasLista(cfg.ssantaFechas)

  const opciones: { id: Sub; label: string; emoji: string; activo: boolean }[] = [
    { id: 'verano', label: 'Verano', emoji: '☀️', activo: cfg.veranoSemanas.length > 0 && cfg.veranoEstado !== 'proximo' },
    { id: 'navidad', label: 'Navidad', emoji: '⛄', activo: navDias.length > 0 && cfg.navidadEstado !== 'proximo' },
    { id: 'ssanta', label: 'Semana Santa', emoji: '🌸', activo: ssDias.length > 0 && cfg.ssantaEstado !== 'proximo' },
  ]
  const disponibles = opciones.filter(o => o.activo)
  const [sub, setSub] = useState<Sub>(disponibles[0]?.id ?? 'verano')

  if (disponibles.length === 0) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 text-sm text-amber-800">
        Las reservas de campamentos abrirán próximamente. Escríbenos a{' '}
        <a href="mailto:info@planetamovimiento.com" className="font-semibold underline">info@planetamovimiento.com</a> y te avisamos.
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div>
        <label className="block text-xs font-bold text-pm-navy uppercase tracking-wider mb-2">Elige el campamento</label>
        <div className="flex flex-wrap gap-2">
          {disponibles.map(o => (
            <button key={o.id} type="button" onClick={() => setSub(o.id)}
              className={`px-4 py-2 rounded-xl border-2 text-sm font-bold transition-colors ${
                sub === o.id ? 'border-pm-red bg-pm-red-light text-pm-red' : 'border-gray-200 text-pm-navy hover:border-pm-red/40'
              }`}>
              {o.emoji} {o.label}
            </button>
          ))}
        </div>
      </div>

      {sub === 'verano' && <ReservaVerano cfg={cfg} ocupacionDia={ocupacion.verano} onReservar={onReservar} />}
      {sub === 'navidad' && <ReservaBloque cfg={cfg} servicio="Campamento de Navidad" fechas={navDias} horario={cfg.navidadHorario} color="blue" nombreCorto="Navidad" ocupacionDia={ocupacion.navidad} onReservar={onReservar} />}
      {sub === 'ssanta' && <ReservaBloque cfg={cfg} servicio="Campamento de Semana Santa" fechas={ssDias} horario={cfg.ssantaHorario} color="violet" nombreCorto="Semana Santa" ocupacionDia={ocupacion.ssanta} onReservar={onReservar} />}
    </div>
  )
}
