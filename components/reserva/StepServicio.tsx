'use client'

import { montoReserva, eurosFmt, type ServicioReserva } from '@/lib/reservas/monto'
import { optImg } from '@/lib/img/opt'

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
              className={`group relative overflow-hidden text-left rounded-2xl min-h-[210px] flex flex-col justify-end bg-pm-navy transition-all ${
                selected ? 'ring-4 ring-pm-red ring-offset-2' : 'hover:-translate-y-0.5 hover:shadow-xl'
              }`}
            >
              {/* La foto o el cartel de la actividad, de fondo */}
              {s.imagen && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={optImg(s.imagen, 750)} alt="" loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
              )}
              {/* Velo para que el texto se lea sobre cualquier imagen */}
              <span className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-black/10" />

              {selected && (
                <span className="absolute top-3 right-3 z-10 w-7 h-7 bg-pm-red rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg">✓</span>
              )}
              <div className="relative p-5">
                <div className="text-2xl mb-1 drop-shadow">{s.icon}</div>
                <div className="font-black text-white text-lg leading-tight drop-shadow">{s.nombre}</div>
                <div className="text-white/80 text-sm mt-1 mb-3 line-clamp-2">{s.descripcionCorta}</div>
                <div className="flex items-center gap-2 text-sm flex-wrap">
                  <span className="font-black text-white bg-pm-red px-2.5 py-1 rounded-lg">
                    {s.precioTexto
                      ? s.precioTexto
                      : monto.cents > 0
                        ? (monto.esSenal ? `Señal ${eurosFmt(monto.euros)}` : eurosFmt(monto.euros))
                        : 'Reserva online'}
                  </span>
                  {s.edad && <span className="text-white/80 font-semibold">{s.edad}</span>}
                </div>
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
