'use client'

import { useState, useTransition } from 'react'
import { guardarHorariosReserva } from './actions'
import { DIAS_LABEL, type SlotSemanal } from '@/lib/reservas/slots'

type Servicio = { id: string; nombre: string; icon: string }

export default function HorariosReservaClient({
  servicios, horarios, puedeEditar,
}: {
  servicios: Servicio[]
  horarios: Record<string, SlotSemanal[]>
  puedeEditar: boolean
}) {
  const [mapa, setMapa] = useState<Record<string, SlotSemanal[]>>(() => {
    const m: Record<string, SlotSemanal[]> = {}
    for (const s of servicios) m[s.id] = (horarios[s.id] ?? []).map(x => ({ ...x, dias: [...x.dias] }))
    return m
  })

  if (servicios.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center text-gray-400 text-sm">
        No hay servicios con reserva online. Activa la acción «Reservar» en algún servicio desde el editor de Servicios.
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-gray-500">
        Define las franjas horarias reservables de cada servicio y cuántas <strong>plazas</strong> admite cada una.
        En el asistente de reserva, una franja se bloquea automáticamente cuando se llena.
      </p>
      {servicios.map(s => (
        <TarjetaServicio
          key={s.id}
          servicio={s}
          slots={mapa[s.id] ?? []}
          puedeEditar={puedeEditar}
          onChange={slots => setMapa(m => ({ ...m, [s.id]: slots }))}
        />
      ))}
    </div>
  )
}

function TarjetaServicio({ servicio, slots, puedeEditar, onChange }: {
  servicio: Servicio
  slots: SlotSemanal[]
  puedeEditar: boolean
  onChange: (slots: SlotSemanal[]) => void
}) {
  const [pending, start] = useTransition()
  const [msg, setMsg] = useState<{ tipo: 'ok' | 'error'; texto: string } | null>(null)

  function setSlot(i: number, patch: Partial<SlotSemanal>) {
    onChange(slots.map((s, idx) => (idx === i ? { ...s, ...patch } : s)))
  }
  function toggleDia(i: number, dia: number) {
    const s = slots[i]
    const dias = s.dias.includes(dia) ? s.dias.filter(d => d !== dia) : [...s.dias, dia].sort((a, b) => a - b)
    setSlot(i, { dias })
  }
  function addSlot() {
    onChange([...slots, { dias: [], horaInicio: '', horaFin: '', plazas: 1 }])
  }
  function delSlot(i: number) {
    onChange(slots.filter((_, idx) => idx !== i))
  }
  function guardar() {
    setMsg(null)
    start(async () => {
      const r = await guardarHorariosReserva(servicio.id, slots)
      setMsg(r.ok ? { tipo: 'ok', texto: 'Guardado' } : { tipo: 'error', texto: r.error || 'Error al guardar' })
    })
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
        <span className="text-2xl">{servicio.icon}</span>
        <div className="font-black text-pm-navy">{servicio.nombre}</div>
        <span className="ml-auto text-xs text-gray-400">{slots.length} franja(s)</span>
      </div>

      <div className="p-5 space-y-4">
        {slots.length === 0 && (
          <p className="text-sm text-gray-400 italic">Sin franjas. Añade una para permitir la reserva online de este servicio.</p>
        )}

        {slots.map((s, i) => (
          <div key={i} className="rounded-xl border border-gray-200 p-4 space-y-3">
            {/* Días */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mr-1">Días</span>
              {DIAS_LABEL.map(d => {
                const on = s.dias.includes(d.n)
                return (
                  <button key={d.n} type="button" disabled={!puedeEditar} onClick={() => toggleDia(i, d.n)}
                    className={`w-8 h-8 rounded-lg text-xs font-bold transition-colors ${
                      on ? 'bg-pm-red text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    } disabled:opacity-50`}>
                    {d.label}
                  </button>
                )
              })}
            </div>

            {/* Horas + plazas + borrar */}
            <div className="flex flex-wrap items-end gap-3">
              <label className="text-sm">
                <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Inicio</span>
                <input type="time" disabled={!puedeEditar} value={s.horaInicio}
                  onChange={e => setSlot(i, { horaInicio: e.target.value })}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-pm-red disabled:opacity-50" />
              </label>
              <label className="text-sm">
                <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Fin</span>
                <input type="time" disabled={!puedeEditar} value={s.horaFin}
                  onChange={e => setSlot(i, { horaFin: e.target.value })}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-pm-red disabled:opacity-50" />
              </label>
              <label className="text-sm">
                <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Plazas</span>
                <input type="number" min={1} disabled={!puedeEditar} value={s.plazas}
                  onChange={e => setSlot(i, { plazas: Math.max(1, Number(e.target.value) || 1) })}
                  className="w-24 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-pm-red disabled:opacity-50" />
              </label>
              {puedeEditar && (
                <button type="button" onClick={() => delSlot(i)}
                  className="ml-auto text-xs font-bold text-gray-400 hover:text-pm-red transition-colors py-2">
                  Quitar franja
                </button>
              )}
            </div>
          </div>
        ))}

        {puedeEditar && (
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button type="button" onClick={addSlot}
              className="text-sm font-bold text-pm-red hover:underline">+ Añadir franja</button>
            <button type="button" onClick={guardar} disabled={pending}
              className="ml-auto bg-pm-red hover:bg-pm-red-dark text-white font-bold px-5 py-2 rounded-xl text-sm transition-colors disabled:opacity-60">
              {pending ? 'Guardando…' : 'Guardar'}
            </button>
            {msg && (
              <span className={`text-xs font-semibold ${msg.tipo === 'ok' ? 'text-green-600' : 'text-pm-red'}`}>{msg.texto}</span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
