'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import StepServicio from '@/components/reserva/StepServicio'
import StepFecha from '@/components/reserva/StepFecha'
import StepDatos, { type DatosForm } from '@/components/reserva/StepDatos'
import { generateReservaNumero } from '@/lib/utils'
import { SERVICIOS_MOCK } from '@/components/reserva/StepServicio'

const PASOS = ['Servicio', 'Fecha y hora', 'Datos']

export default function ReservarPage() {
  const router = useRouter()
  const [paso, setPaso] = useState(1)
  const [servicioId, setServicioId] = useState<string | null>(null)
  const [fecha, setFecha] = useState<string | null>(null)
  const [hora, setHora] = useState<string>('')
  const [datos, setDatos] = useState<DatosForm>({
    nombre: '', apellidos: '', email: '', telefono: '',
    nombreCumpleanero: '', edadCumpleanero: '', notas: '', acepta: false,
  })

  function handleSubmit() {
    const servicio = SERVICIOS_MOCK.find(s => s.id === servicioId)
    const numero = generateReservaNumero()
    const params = new URLSearchParams({
      numero,
      servicio: servicio?.nombre ?? '',
      fecha: fecha ?? '',
      hora,
      nombre: datos.nombre,
      email: datos.email,
    })
    router.push(`/reservar/confirmacion?${params.toString()}`)
  }

  const progress = ((paso - 1) / (PASOS.length - 1)) * 100

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
            <div
              className="h-full bg-pm-red rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Contenido */}
        <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8">
          {paso === 1 && (
            <StepServicio
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
              servicioId={servicioId}
              fecha={fecha}
              hora={hora}
            />
          )}
        </div>
      </div>
    </main>
  )
}
