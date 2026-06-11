'use client'

import { montoReserva, eurosFmt, type ServicioReserva } from '@/lib/reservas/monto'

type Props = {
  servicios: ServicioReserva[]
  servicioId: string | null
  onSelect: (id: string) => void
  onNext: () => void
}

export default function StepServicio({ servicios, servicioId, onSelect, onNext }: Props) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-pm-navy mb-6">Elige tu actividad</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        {servicios.map((s) => {
          const selected = servicioId === s.id
          const monto = montoReserva(s)
          return (
            <button
              key={s.id}
              onClick={() => onSelect(s.id)}
              className={`relative text-left p-5 rounded-xl border-2 transition-all ${
                selected
                  ? 'border-pm-red bg-pm-red-light'
                  : 'border-gray-200 bg-white hover:border-pm-red hover:bg-pm-red-light'
              }`}
            >
              {selected && (
                <span className="absolute top-3 right-3 w-6 h-6 bg-pm-red rounded-full flex items-center justify-center text-white text-xs font-bold">✓</span>
              )}
              <div className="text-3xl mb-2">{s.icon}</div>
              <div className="font-bold text-pm-navy text-lg">{s.nombre}</div>
              <div className="text-gray-600 text-sm mt-1 mb-3">{s.descripcionCorta}</div>
              <div className="flex items-center gap-3 text-sm flex-wrap">
                {monto.cents > 0 ? (
                  <span className="font-semibold text-pm-red">
                    {monto.esSenal ? `Señal ${eurosFmt(monto.euros)}` : eurosFmt(monto.euros)}
                  </span>
                ) : (
                  <span className="font-semibold text-pm-red">Reserva online</span>
                )}
                {s.edad && (
                  <>
                    <span className="text-gray-400">·</span>
                    <span className="text-gray-500">{s.edad}</span>
                  </>
                )}
              </div>
            </button>
          )
        })}
      </div>
      <div className="flex justify-end">
        <button
          onClick={onNext}
          disabled={!servicioId}
          className="px-8 py-3 bg-pm-red text-white font-bold rounded-xl disabled:opacity-40 disabled:cursor-not-allowed hover:bg-pm-red-dark transition-colors"
        >
          Siguiente →
        </button>
      </div>
    </div>
  )
}
