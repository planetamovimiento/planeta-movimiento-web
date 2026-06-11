'use client'

import { useState } from 'react'
import StepServicio from '@/components/reserva/StepServicio'
import StepFecha from '@/components/reserva/StepFecha'
import StepDatos, { type DatosForm } from '@/components/reserva/StepDatos'
import { iniciarReserva, type IniciarResult } from './actions'
import type { ServicioReserva } from '@/lib/reservas/monto'

const PASOS = ['Servicio', 'Fecha y hora', 'Datos']

/** Envía (auto-POST) los campos firmados al TPV de Redsys. */
function redirigirARedsys(c: Extract<IniciarResult, { ok: true }>) {
  const form = document.createElement('form')
  form.method = 'POST'
  form.action = c.url
  const add = (name: string, value: string) => {
    const input = document.createElement('input')
    input.type = 'hidden'
    input.name = name
    input.value = value
    form.appendChild(input)
  }
  add('Ds_SignatureVersion', c.Ds_SignatureVersion)
  add('Ds_MerchantParameters', c.Ds_MerchantParameters)
  add('Ds_Signature', c.Ds_Signature)
  document.body.appendChild(form)
  form.submit()
}

export default function ReservaWizard({ servicios }: { servicios: ServicioReserva[] }) {
  const [paso, setPaso] = useState(1)
  const [servicioId, setServicioId] = useState<string | null>(null)
  const [fecha, setFecha] = useState<string | null>(null)
  const [hora, setHora] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [datos, setDatos] = useState<DatosForm>({
    nombre: '', apellidos: '', email: '', telefono: '',
    nombreCumpleanero: '', edadCumpleanero: '', notas: '', acepta: false,
  })

  const servicio = servicios.find(s => s.id === servicioId) ?? null

  async function handleSubmit() {
    if (!servicioId) return
    setError('')
    setLoading(true)
    const r = await iniciarReserva({ servicioId, fecha, hora, datos })
    if (r.ok) {
      redirigirARedsys(r)
      // El navegador navega a Redsys; mantenemos loading hasta que ocurra.
    } else {
      setError(r.error)
      setLoading(false)
    }
  }

  const progress = ((paso - 1) / (PASOS.length - 1)) * 100

  if (servicios.length === 0) {
    return (
      <main className="min-h-screen bg-pm-bg py-10">
        <div className="max-w-lg mx-auto px-4 text-center bg-white rounded-2xl shadow-sm p-8">
          <div className="text-4xl mb-3">🛠️</div>
          <h1 className="text-xl font-black text-pm-navy mb-2">Reservas online no disponibles</h1>
          <p className="text-gray-500 text-sm">
            En este momento no hay actividades con reserva online. Escríbenos a{' '}
            <a href="mailto:info@planetamovimiento.com" className="text-pm-red font-medium hover:underline">info@planetamovimiento.com</a>.
          </p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-pm-bg py-10">
      <div className="max-w-3xl mx-auto px-4">
        {/* Header wizard */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-4">
            {PASOS.map((label, i) => {
              const num = i + 1
              const done = paso > num
              const active = paso === num
              return (
                <div key={label} className="flex items-center gap-2 flex-1">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                    done ? 'bg-green-500 text-white' : active ? 'bg-pm-red text-white' : 'bg-gray-200 text-gray-500'
                  }`}>
                    {done ? '✓' : num}
                  </div>
                  <span className={`text-sm font-medium ${active ? 'text-pm-red' : done ? 'text-green-600' : 'text-gray-400'}`}>
                    {label}
                  </span>
                  {i < PASOS.length - 1 && <div className="flex-1 h-px bg-gray-200 mx-2" />}
                </div>
              )
            })}
          </div>
          <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-pm-red rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
        </div>

        {/* Contenido */}
        <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8">
          {paso === 1 && (
            <StepServicio
              servicios={servicios}
              servicioId={servicioId}
              onSelect={setServicioId}
              onNext={() => setPaso(2)}
            />
          )}
          {paso === 2 && (
            <StepFecha
              fecha={fecha}
              hora={hora}
              onFecha={setFecha}
              onHora={setHora}
              onNext={() => setPaso(3)}
              onBack={() => setPaso(1)}
            />
          )}
          {paso === 3 && (
            <StepDatos
              datos={datos}
              onDatos={setDatos}
              onSubmit={handleSubmit}
              onBack={() => setPaso(2)}
              servicio={servicio}
              fecha={fecha}
              hora={hora}
              loading={loading}
              error={error}
            />
          )}
        </div>
      </div>
    </main>
  )
}
