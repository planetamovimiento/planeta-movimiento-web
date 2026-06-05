'use client'

import { formatPrice } from '@/lib/utils'

export type ServicioMock = {
  id: string
  nombre: string
  slug: string
  precio_base: number
  duracion_min: number
  descripcion: string
  icon: string
}

export const SERVICIOS_MOCK: ServicioMock[] = [
  { id: '1', nombre: 'Cumpleaños', slug: 'cumpleanos', precio_base: 15000, duracion_min: 90, descripcion: 'Celebra el día más especial con circo y acrobacia.', icon: '🎂' },
  { id: '2', nombre: 'Campamento', slug: 'campamentos', precio_base: 20000, duracion_min: 480, descripcion: 'Campamentos de verano llenos de movimiento.', icon: '⛺' },
  { id: '3', nombre: 'Acrobacia', slug: 'acrobacia', precio_base: 1200, duracion_min: 60, descripcion: 'Clase de acrobacia de suelo con monitores.', icon: '🤸' },
  { id: '4', nombre: 'Circo', slug: 'circo', precio_base: 1200, duracion_min: 60, descripcion: 'Malabares, trapecio y habilidades circenses.', icon: '🎪' },
  { id: '5', nombre: 'Club Movimiento', slug: 'club', precio_base: 800, duracion_min: 60, descripcion: 'Clases semanales para socios del club.', icon: '🎡' },
  { id: '6', nombre: 'Empresa', slug: 'empresas', precio_base: 30000, duracion_min: 120, descripcion: 'Team building y actividades corporativas.', icon: '🏢' },
]

type Props = {
  servicioId: string | null
  onSelect: (id: string) => void
  onNext: () => void
}

export default function StepServicio({ servicioId, onSelect, onNext }: Props) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-pm-navy mb-6">Elige tu actividad</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        {SERVICIOS_MOCK.map((s) => {
          const selected = servicioId === s.id
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
              <div className="text-gray-600 text-sm mt-1 mb-3">{s.descripcion}</div>
              <div className="flex items-center gap-3 text-sm">
                <span className="font-semibold text-pm-red">Desde {formatPrice(s.precio_base)}</span>
                <span className="text-gray-400">·</span>
                <span className="text-gray-500">{s.duracion_min} min</span>
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
