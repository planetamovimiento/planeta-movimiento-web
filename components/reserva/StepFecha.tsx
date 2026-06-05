'use client'

import { useState } from 'react'

const SLOTS = ['10:00', '11:30', '13:00', '16:00', '17:30', '19:00']

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
]

const DIAS_SEMANA = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do']

type Props = {
  fecha: string | null
  hora: string | null
  onFecha: (f: string) => void
  onHora: (h: string) => void
  onNext: () => void
  onBack: () => void
}

export default function StepFecha({ fecha, hora, onFecha, onHora, onNext, onBack }: Props) {
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

  // Build calendar days
  const firstDay = new Date(viewYear, viewMonth, 1)
  const lastDay = new Date(viewYear, viewMonth + 1, 0)
  // Monday-based: 0=Mon..6=Sun
  const startOffset = (firstDay.getDay() + 6) % 7
  const totalCells = startOffset + lastDay.getDate()
  const cells: (number | null)[] = []
  for (let i = 0; i < startOffset; i++) cells.push(null)
  for (let d = 1; d <= lastDay.getDate(); d++) cells.push(d)

  function toISO(day: number) {
    const mm = String(viewMonth + 1).padStart(2, '0')
    const dd = String(day).padStart(2, '0')
    return `${viewYear}-${mm}-${dd}`
  }

  function isPast(day: number) {
    const d = new Date(viewYear, viewMonth, day)
    return d < today
  }

  const fechaLabel = fecha
    ? new Intl.DateTimeFormat('es-ES', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date(fecha + 'T00:00:00'))
    : null

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
              const past = isPast(day)
              const selected = fecha === iso
              return (
                <button
                  key={iso}
                  disabled={past}
                  onClick={() => { onFecha(iso); onHora('') }}
                  className={`w-full aspect-square rounded-full text-sm font-medium transition-colors flex items-center justify-center
                    ${past ? 'text-gray-300 cursor-not-allowed' : ''}
                    ${selected ? 'bg-pm-red text-white' : !past ? 'hover:bg-pm-red-light hover:text-pm-red text-gray-700' : ''}
                  `}
                >
                  {day}
                </button>
              )
            })}
          </div>
        </div>

        {/* Slots */}
        <div>
          <h3 className="font-bold text-pm-navy mb-3">
            {fechaLabel ? `Horarios para ${fechaLabel}` : 'Selecciona primero una fecha'}
          </h3>
          {fecha && (
            <div className="grid grid-cols-2 gap-3">
              {SLOTS.map(slot => {
                const sel = hora === slot
                return (
                  <button
                    key={slot}
                    onClick={() => onHora(slot)}
                    className={`p-3 rounded-xl border-2 text-center transition-colors ${
                      sel ? 'bg-pm-red border-pm-red text-white' : 'border-gray-200 bg-white hover:border-pm-red hover:text-pm-red'
                    }`}
                  >
                    <div className="font-bold text-lg">{slot}</div>
                    <div className={`text-xs mt-0.5 ${sel ? 'text-red-100' : 'text-gray-400'}`}>90 min aprox</div>
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
