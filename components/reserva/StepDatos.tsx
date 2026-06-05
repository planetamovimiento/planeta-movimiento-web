'use client'

import { useState } from 'react'
import { formatPrice } from '@/lib/utils'
import { SERVICIOS_MOCK } from './StepServicio'

export type DatosForm = {
  nombre: string
  apellidos: string
  email: string
  telefono: string
  nombreCumpleanero: string
  edadCumpleanero: string
  notas: string
  acepta: boolean
}

type Props = {
  datos: DatosForm
  onDatos: (d: DatosForm) => void
  onSubmit: () => void
  onBack: () => void
  servicioId: string | null
  fecha: string | null
  hora: string | null
}

export default function StepDatos({ datos, onDatos, onSubmit, onBack, servicioId, fecha, hora }: Props) {
  const [errors, setErrors] = useState<Partial<Record<keyof DatosForm, string>>>({})

  const servicio = SERVICIOS_MOCK.find(s => s.id === servicioId)

  function set(key: keyof DatosForm, value: string | boolean) {
    onDatos({ ...datos, [key]: value })
  }

  function validate() {
    const e: Partial<Record<keyof DatosForm, string>> = {}
    if (!datos.nombre.trim()) e.nombre = 'Obligatorio'
    if (!datos.apellidos.trim()) e.apellidos = 'Obligatorio'
    if (!datos.email.trim()) e.email = 'Obligatorio'
    if (!datos.telefono.trim()) e.telefono = 'Obligatorio'
    if (!datos.acepta) e.acepta = 'Debes aceptar las condiciones'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function handleSubmit() {
    if (validate()) onSubmit()
  }

  const fechaLabel = fecha
    ? new Intl.DateTimeFormat('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(fecha + 'T00:00:00'))
    : ''

  const inputClass = (key: keyof DatosForm) =>
    `w-full px-4 py-2.5 rounded-xl border ${errors[key] ? 'border-red-400' : 'border-gray-200'} focus:outline-none focus:border-pm-red text-sm`

  return (
    <div>
      <h2 className="text-2xl font-bold text-pm-navy mb-6">Tus datos</h2>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Formulario */}
        <div className="lg:col-span-2 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Nombre *</label>
              <input value={datos.nombre} onChange={e => set('nombre', e.target.value)} className={inputClass('nombre')} placeholder="Tu nombre" />
              {errors.nombre && <p className="text-xs text-red-500 mt-1">{errors.nombre}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Apellidos *</label>
              <input value={datos.apellidos} onChange={e => set('apellidos', e.target.value)} className={inputClass('apellidos')} placeholder="Tus apellidos" />
              {errors.apellidos && <p className="text-xs text-red-500 mt-1">{errors.apellidos}</p>}
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Email *</label>
            <input type="email" value={datos.email} onChange={e => set('email', e.target.value)} className={inputClass('email')} placeholder="tu@email.com" />
            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Teléfono *</label>
            <input type="tel" value={datos.telefono} onChange={e => set('telefono', e.target.value)} className={inputClass('telefono')} placeholder="600 000 000" />
            {errors.telefono && <p className="text-xs text-red-500 mt-1">{errors.telefono}</p>}
          </div>

          <div className="pt-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-sm text-gray-500 whitespace-nowrap">Para cumpleaños (opcional)</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Nombre del cumpleañero</label>
                <input value={datos.nombreCumpleanero} onChange={e => set('nombreCumpleanero', e.target.value)} className={inputClass('nombreCumpleanero')} placeholder="Nombre" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Edad</label>
                <input type="number" value={datos.edadCumpleanero} onChange={e => set('edadCumpleanero', e.target.value)} className={inputClass('edadCumpleanero')} placeholder="8" min="1" max="99" />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Notas para el equipo</label>
            <textarea
              value={datos.notas}
              onChange={e => set('notas', e.target.value)}
              rows={4}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-pm-red text-sm resize-none"
              placeholder="Alergias, necesidades especiales, preferencias..."
            />
          </div>

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={datos.acepta}
              onChange={e => set('acepta', e.target.checked)}
              className="mt-0.5 accent-pm-red w-4 h-4"
            />
            <span className="text-sm text-gray-600">
              Acepto las <a href="/legal/condiciones" className="text-pm-red underline">condiciones de uso</a> y la <a href="/legal/privacidad" className="text-pm-red underline">política de privacidad</a> *
            </span>
          </label>
          {errors.acepta && <p className="text-xs text-red-500">{errors.acepta}</p>}
        </div>

        {/* Resumen */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-gray-200 p-5 sticky top-6">
            <h3 className="font-bold text-pm-navy mb-4">Resumen de tu reserva</h3>
            {servicio && (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{servicio.icon}</span>
                  <div>
                    <div className="font-semibold text-pm-navy">{servicio.nombre}</div>
                    <div className="text-sm text-gray-500">{servicio.duracion_min} min</div>
                  </div>
                </div>
                {fecha && (
                  <div className="text-sm text-gray-600">
                    <span className="font-medium text-gray-800">Fecha:</span> {fechaLabel}
                  </div>
                )}
                {hora && (
                  <div className="text-sm text-gray-600">
                    <span className="font-medium text-gray-800">Hora:</span> {hora}
                  </div>
                )}
                <div className="pt-3 border-t border-gray-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Precio estimado</span>
                    <span className="font-bold text-pm-navy text-lg">{formatPrice(servicio.precio_base)}</span>
                  </div>
                  <span className="inline-block bg-pm-red-light text-pm-red text-xs font-semibold px-2 py-1 rounded-full">Pago en el centro</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-between mt-8">
        <button onClick={onBack} className="px-6 py-3 border-2 border-gray-200 text-gray-600 font-bold rounded-xl hover:border-gray-300 transition-colors">
          ← Volver
        </button>
        <button
          onClick={handleSubmit}
          className="px-8 py-3 bg-pm-red text-white font-bold rounded-xl hover:bg-pm-red-dark transition-colors"
        >
          Confirmar reserva
        </button>
      </div>
    </div>
  )
}
