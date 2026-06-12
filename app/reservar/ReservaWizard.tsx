'use client'

import { useState } from 'react'
import StepServicio from '@/components/reserva/StepServicio'
import StepFecha from '@/components/reserva/StepFecha'
import StepDatos, { type DatosForm } from '@/components/reserva/StepDatos'
import { iniciarReserva } from './actions'
import { redirigirARedsys } from '@/components/reserva/redirigirARedsys'
import { ReservaDiasSinCole, ReservaDomingos, ReservaMananaMagica } from '@/app/servicios/eventos/EventosInstalaciones'
import CampamentosReservaWizard from './CampamentosReservaWizard'
import type { ServicioReserva } from '@/lib/reservas/monto'
import type { SlotSemanal } from '@/lib/reservas/slots'
import type { EventoCentroCfg } from '@/lib/eventos/centro'
import type { MananaMagica } from '@/lib/eventos/manana-magica'
import type { CampamentosConfig } from '@/lib/campamentos/editable'

type Reservados = Record<string, Record<string, Record<string, number>>>
type OcupacionCampamentos = { verano: Record<string, number>; navidad: Record<string, number>; ssanta: Record<string, number> }

// Servicios cuyo paso 2 usa su propio formulario de reserva (fecha + datos + pago).
const DEDICADOS = new Set(['dias-sin-cole', 'domingos', 'manana-magica', 'campamentos'])

export default function ReservaWizard({
  servicios, horarios, reservados,
  diasSinCole, domingos, mananaMagica, campamentos,
  ocupacionDSC, ocupacionDomingos, ocupacionMM, ocupacionCampamentos,
}: {
  servicios: ServicioReserva[]
  horarios: Record<string, SlotSemanal[]>
  reservados: Reservados
  diasSinCole: EventoCentroCfg
  domingos: EventoCentroCfg
  mananaMagica: MananaMagica
  campamentos: CampamentosConfig
  ocupacionDSC: Record<string, number>
  ocupacionDomingos: Record<string, number>
  ocupacionMM: Record<string, number>
  ocupacionCampamentos: OcupacionCampamentos
}) {
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
  const esDedicado = servicioId ? DEDICADOS.has(servicioId) : false
  const PASOS = esDedicado ? ['Servicio', 'Reserva'] : ['Servicio', 'Fecha y hora', 'Datos']

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

          {/* Paso 2 — formulario real del servicio (dedicado) o calendario de franjas (cumpleaños) */}
          {paso === 2 && esDedicado && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-pm-navy">{servicio?.nombre ?? 'Completa tu reserva'}</h2>
                <button onClick={() => setPaso(1)} className="text-sm text-gray-500 hover:text-pm-red font-semibold transition-colors">← Cambiar actividad</button>
              </div>
              {servicioId === 'dias-sin-cole' && <ReservaDiasSinCole cfg={diasSinCole} ocupacion={ocupacionDSC} />}
              {servicioId === 'domingos' && <ReservaDomingos cfg={domingos} ocupacion={ocupacionDomingos} />}
              {servicioId === 'manana-magica' && <ReservaMananaMagica cfg={mananaMagica} ocupacion={ocupacionMM} />}
              {servicioId === 'campamentos' && <CampamentosReservaWizard cfg={campamentos} ocupacion={ocupacionCampamentos} />}
            </div>
          )}
          {paso === 2 && !esDedicado && (
            <StepFecha
              slots={servicioId ? (horarios[servicioId] ?? []) : []}
              reservados={servicioId ? (reservados[servicioId] ?? {}) : {}}
              fecha={fecha}
              hora={hora}
              onFecha={setFecha}
              onHora={setHora}
              onNext={() => setPaso(3)}
              onBack={() => setPaso(1)}
            />
          )}

          {paso === 3 && !esDedicado && (
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
