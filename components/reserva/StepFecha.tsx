'use client'

import { useState } from 'react'
import { slotsDelDia, etiquetaSlot, type SlotSemanal } from '@/lib/reservas/slots'

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]
const DIAS_SEMANA = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do']

type Props = {
  slots: SlotSemanal[]
  reservados: Record<string, Record<string, number>>  // 'YYYY-MM-DD' -> { 'HH:MM': nReservados }
  fecha: string | null
  hora: string | null
  onFecha: (f: string) => void
  onHora: (h: string) => void
  onNext: () => void
  onBack: () => void
}

export default function StepFecha({ slots, reservados, fecha, hora, onFecha, onHora, onNext, onBack }: Props) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const [viewYear, setViewYear] = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth())

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1) }
    else setViewMonth(m => m - 1)
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1) }
    else setViewMonth(m => m + 1)
  }

  const firstDay = new Date(viewYear, viewMonth, 1)
  const lastDay = new Date(viewYear, viewMonth + 1, 0)
  const startOffset = (firstDay.getDay() + 6) % 7
  const cells: (number | null)[] = []
  for (let i = 0; i < startOffset; i++) cells.push(null)
  for (let d = 1; d <= lastDay.getDate(); d++) cells.push(d)

  const toISO = (day: number) => `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`

  const libresDe = (iso: string, s: SlotSemanal) => s.plazas - (reservados[iso]?.[s.horaInicio] ?? 0)

  function estadoDia(day: number): { past: boolean; sinSlots: boolean; completo: boolean } {
    const d = new Date(viewYear, viewMonth, day)
    const past = d < today
    const aplic = slotsDelDia(slots, d)
    const sinSlots = aplic.length === 0
    const iso = toISO(day)
    const completo = !sinSlots && aplic.every(s => libresDe(iso, s) <= 0)
    return { past, sinSlots, completo }
  }

  const fechaLabel = fecha
    ? new Intl.DateTimeFormat('es-ES', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date(fecha + 'T00:00:00'))
    : null

  // Franjas de la fecha seleccionada
  const slotsSeleccion: SlotSemanal[] = fecha ? slotsDelDia(slots, new Date(fecha + 'T00:00:00')) : []

  if (slots.length === 0) {
    return (
      <div>
        <h2 className="text-2xl font-bold text-pm-navy mb-6">Elige fecha y hora</h2>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 text-sm text-amber-800">
          Este servicio aún no tiene horarios de reserva configurados. Escríbenos a{' '}
          <a href="mailto:info@planetamovimiento.com" className="font-semibold underline">info@planetamovimiento.com</a> y lo organizamos.
        </div>
        <div className="flex justify-between mt-8">
          <button onClick={onBack} className="px-6 py-3 border-2 border-gray-200 text-gray-600 font-bold rounded-xl hover:border-gray-300 transition-colors">← Volver</button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-pm-navy mb-6">Elige fecha y hora</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* Calendario */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <button onClick={prevMonth} className="p-1 hover:text-pm-red transition-colors text-gray-500">‹</button>
            <span className="font-bold text-pm-navy">{MESES[viewMonth]} {viewYear}</span>
            <button onClick={nextMonth} className="p-1 hover:text-pm-red transition-colors text-gray-500">›</button>
          </div>
          <div className="grid grid-cols-7 gap-1 mb-2">
            {DIAS_SEMANA.map(d => (
              <div key={d} className="text-center text-xs text-gray-400 font-semibold py-1">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {cells.map((day, i) => {
              if (!day) return <div key={`empty-${i}`} />
              const iso = toISO(day)
              const { past, sinSlots, completo } = estadoDia(day)
              const bloqueado = past || sinSlots || completo
              const selected = fecha === iso
              return (
                <button
                  key={iso}
                  disabled={bloqueado}
                  title={completo ? 'Sin huecos disponibles' : sinSlots ? 'Sin horario ese día' : undefined}
                  onClick={() => { if (!bloqueado) { onFecha(iso); onHora('') } }}
                  className={`w-full aspect-square rounded-full text-sm font-medium transition-colors flex items-center justify-center
                    ${past || sinSlots ? 'text-gray-300 cursor-not-allowed' : ''}
                    ${completo ? 'text-gray-300 line-through bg-gray-50 cursor-not-allowed' : ''}
                    ${selected ? 'bg-pm-red text-white' : !bloqueado ? 'hover:bg-pm-red-light hover:text-pm-red text-gray-700' : ''}
                  `}
                >
                  {day}
                </button>
              )
            })}
          </div>
          <div className="flex flex-wrap gap-4 mt-3 text-xs text-gray-500">
            <span className="flex items-center gap-1"><span className="w-3 h-3 bg-pm-red rounded-full inline-block" />Elegido</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 bg-gray-50 border border-gray-200 rounded inline-block" /><span className="line-through">Completo</span></span>
          </div>
        </div>

        {/* Slots */}
        <div>
          <h3 className="font-bold text-pm-navy mb-3">
            {fechaLabel ? `Horarios para ${fechaLabel}` : 'Selecciona primero una fecha'}
          </h3>
          {fecha && (
            <div className="flex flex-col gap-2">
              {slotsSeleccion.map(s => {
                const label = etiquetaSlot(s)
                const libres = libresDe(fecha, s)
                const lleno = libres <= 0
                const sel = hora === label
                const info = s.plazas > 1
                  ? (lleno ? 'Completo' : `${libres} ${libres === 1 ? 'plaza libre' : 'plazas libres'}`)
                  : (lleno ? 'Completo' : 'Disponible')
                return (
                  <button
                    key={label}
                    type="button"
                    disabled={lleno}
                    onClick={() => !lleno && onHora(label)}
                    className={`flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-colors text-sm font-semibold ${
                      lleno
                        ? 'border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed'
                        : sel
                          ? 'border-pm-red bg-pm-red-light text-pm-red'
                          : 'border-gray-200 bg-white hover:border-pm-red hover:text-pm-red text-pm-navy'
                    }`}
                  >
                    <span>🕐 {label}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      lleno ? 'bg-gray-200 text-gray-500' : sel ? 'bg-pm-red text-white' : 'bg-green-100 text-green-700'
                    }`}>{info}</span>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-between">
        <button onClick={onBack} className="px-6 py-3 border-2 border-gray-200 text-gray-600 font-bold rounded-xl hover:border-gray-300 transition-colors">
          ← Volver
        </button>
        <button
          onClick={onNext}
          disabled={!fecha || !hora}
          className="px-8 py-3 bg-pm-red text-white font-bold rounded-xl disabled:opacity-40 disabled:cursor-not-allowed hover:bg-pm-red-dark transition-colors"
        >
          Siguiente →
        </button>
      </div>
    </div>
  )
}
