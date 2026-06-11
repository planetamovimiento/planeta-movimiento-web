'use client'

import { useState } from 'react'
import { montoReserva, eurosFmt, type ServicioReserva } from '@/lib/reservas/monto'

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
  servicio: ServicioReserva | null
  fecha: string | null
  hora: string | null
  loading?: boolean
  error?: string
}

export default function StepDatos({ datos, onDatos, onSubmit, onBack, servicio, fecha, hora, loading, error }: Props) {
  const [errors, setErrors] = useState<Partial<Record<keyof DatosForm, string>>>({})

  const monto = servicio ? montoReserva(servicio) : null

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
              Acepto las <a href="/terminos-y-condiciones" className="text-pm-red underline">condiciones de uso</a> y la <a href="/politica-privacidad" className="text-pm-red underline">política de privacidad</a> *
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
                    {servicio.edad && <div className="text-sm text-gray-500">{servicio.edad}</div>}
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
                {monto && monto.cents > 0 && (
                  <div className="pt-3 border-t border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">{monto.esSenal ? 'Señal de reserva' : 'A pagar ahora'}</span>
                      <span className="font-bold text-pm-navy text-lg">{eurosFmt(monto.euros)}</span>
                    </div>
                    {monto.esSenal && monto.totalReferencia != null && monto.totalReferencia > monto.euros && (
                      <p className="text-xs text-gray-500 mb-2">El resto se abona en el centro.</p>
                    )}
                    <span className="inline-block bg-pm-red-light text-pm-red text-xs font-semibold px-2 py-1 rounded-full">Pago seguro con tarjeta · Redsys</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="mt-6 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">{error}</div>
      )}

      <div className="flex justify-between mt-8">
        <button onClick={onBack} disabled={loading} className="px-6 py-3 border-2 border-gray-200 text-gray-600 font-bold rounded-xl hover:border-gray-300 transition-colors disabled:opacity-50">
          ← Volver
        </button>
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="px-8 py-3 bg-pm-red text-white font-bold rounded-xl hover:bg-pm-red-dark transition-colors disabled:opacity-60"
        >
          {loading
            ? 'Redirigiendo al pago…'
            : monto && monto.cents > 0
              ? `Pagar ${eurosFmt(monto.euros)} y reservar`
              : 'Confirmar reserva'}
        </button>
      </div>
    </div>
  )
}
