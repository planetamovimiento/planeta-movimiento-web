'use client'

import { useState } from 'react'
import StepServicio from '@/components/reserva/StepServicio'
import StepFecha from '@/components/reserva/StepFecha'
import StepDatos, { type DatosForm } from '@/components/reserva/StepDatos'
import { iniciarReserva, iniciarPagoReserva, reservarEnInstalacion, type PagoReservaPayload } from './actions'
import { redirigirARedsys } from '@/components/reserva/redirigirARedsys'
import { ReservaDiasSinCole, ReservaDomingos, ReservaMananaMagica } from '@/app/servicios/eventos/EventosInstalaciones'
import CalculadoraEventos from '@/app/servicios/eventos/CalculadoraEventos'
import CampamentosReservaWizard from './CampamentosReservaWizard'
import type { ServicioReserva } from '@/lib/reservas/monto'
import type { SlotSemanal } from '@/lib/reservas/slots'
import type { EventoCentroCfg } from '@/lib/eventos/centro'
import type { MananaMagica } from '@/lib/eventos/manana-magica'
import type { CampamentosConfig } from '@/lib/campamentos/editable'

type Reservados = Record<string, Record<string, Record<string, number>>>
type OcupacionCampamentos = { verano: Record<string, number>; navidad: Record<string, number>; ssanta: Record<string, number> }

// Servicios cuyo paso 2 usa su propio formulario de reserva (fecha + datos), y un
// paso 3 de pago. (Cumpleaños usa el calendario de franjas + StepDatos.)
const DEDICADOS = new Set(['dias-sin-cole', 'domingos', 'manana-magica', 'campamentos', 'eventos'])

const euros = (n: number) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(n)

function fechaLarga(iso: string | null | undefined): string | null {
  if (!iso) return null
  try {
    return new Intl.DateTimeFormat('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(iso + 'T00:00:00'))
  } catch { return iso }
}

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
  const [pagoPayload, setPagoPayload] = useState<PagoReservaPayload | null>(null)
  const [confirmadoInstalacion, setConfirmadoInstalacion] = useState<string | null>(null)
  const [datos, setDatos] = useState<DatosForm>({
    nombre: '', apellidos: '', email: '', telefono: '',
    nombreCumpleanero: '', edadCumpleanero: '', notas: '', acepta: false,
  })

  const servicio = servicios.find(s => s.id === servicioId) ?? null
  const esDedicado = servicioId ? DEDICADOS.has(servicioId) : false
  const PASOS = esDedicado ? ['Servicio', 'Reserva', 'Pago'] : ['Servicio', 'Fecha y hora', 'Datos']

  // Cumpleaños (franjas): inicia el pago directo desde StepDatos.
  async function handleSubmit() {
    if (!servicioId) return
    setError('')
    setLoading(true)
    const r = await iniciarReserva({ servicioId, fecha, hora, datos })
    if (r.ok) {
      redirigirARedsys(r)
    } else {
      setError(r.error)
      setLoading(false)
    }
  }

  // Servicios dedicados: el formulario entrega el payload → paso 3 (resumen).
  function handleReservar(p: PagoReservaPayload) {
    setError('')
    setPagoPayload(p)
    setPaso(3)
  }

  // Paso 3 de los dedicados: cobra (señal o total) y va a Redsys.
  async function handlePagoDedicado() {
    if (!pagoPayload) return
    setError('')
    setLoading(true)
    const r = await iniciarPagoReserva(pagoPayload)
    if (r.ok) {
      redirigirARedsys(r)
    } else {
      setError(r.error)
      setLoading(false)
    }
  }

  // Paso 3 (solo campamentos): registra la reserva con pago en la instalación.
  async function handleInstalacion() {
    if (!pagoPayload) return
    setError('')
    setLoading(true)
    const r = await reservarEnInstalacion(pagoPayload)
    setLoading(false)
    if (r.ok) setConfirmadoInstalacion(r.numero)
    else setError(r.error)
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

  // Datos para el resumen de pago (paso 3 de los dedicados).
  const fianza = Number(servicio?.fianza) || 0
  const esSenal = fianza > 0
  const aPagar = pagoPayload ? (esSenal ? fianza : pagoPayload.total) : 0
  const resto = pagoPayload ? Math.max(0, pagoPayload.total - aPagar) : 0
  const numDias = pagoPayload ? Number(pagoPayload.datos?.numDias) || 0 : 0

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
          {confirmadoInstalacion && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/>
                </svg>
              </div>
              <h2 className="text-2xl font-black text-pm-navy mb-2">¡Reserva registrada!</h2>
              <p className="text-gray-600 text-sm max-w-sm mx-auto mb-4">
                Hemos guardado tu plaza. <strong>El pago se realiza en la instalación.</strong> Te enviaremos la confirmación por email.
              </p>
              <div className="inline-block bg-pm-bg border border-gray-200 rounded-xl px-5 py-3 text-sm text-pm-navy">
                Nº de reserva: <strong>{confirmadoInstalacion}</strong>
              </div>
            </div>
          )}

          {!confirmadoInstalacion && (<>
          {paso === 1 && (
            <StepServicio
              servicios={servicios}
              servicioId={servicioId}
              onSelect={setServicioId}
              onNext={() => setPaso(2)}
            />
          )}

          {/* Paso 2 (dedicados) — formulario real del servicio. Se mantiene montado
              (oculto) en el paso 3 para no perder los datos al volver. */}
          {esDedicado && (paso === 2 || paso === 3) && (
            <div className={paso === 3 ? 'hidden' : ''}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-pm-navy">{servicio?.nombre ?? 'Completa tu reserva'}</h2>
                <button onClick={() => setPaso(1)} className="text-sm text-gray-500 hover:text-pm-red font-semibold transition-colors">← Cambiar actividad</button>
              </div>
              {servicioId === 'dias-sin-cole' && <ReservaDiasSinCole cfg={diasSinCole} ocupacion={ocupacionDSC} onReservar={handleReservar} />}
              {servicioId === 'domingos' && <ReservaDomingos cfg={domingos} ocupacion={ocupacionDomingos} onReservar={handleReservar} />}
              {servicioId === 'manana-magica' && <ReservaMananaMagica cfg={mananaMagica} ocupacion={ocupacionMM} onReservar={handleReservar} />}
              {servicioId === 'campamentos' && <CampamentosReservaWizard cfg={campamentos} ocupacion={ocupacionCampamentos} onReservar={handleReservar} />}
              {servicioId === 'eventos' && <CalculadoraEventos onReservar={handleReservar} />}
            </div>
          )}

          {/* Paso 3 (dedicados) — resumen y pago */}
          {paso === 3 && esDedicado && pagoPayload && (
            <div>
              <h2 className="text-2xl font-bold text-pm-navy mb-6">Confirma y paga</h2>
              <div className="rounded-xl border border-gray-200 divide-y divide-gray-100 mb-6">
                <Row label="Actividad" value={pagoPayload.servicioNombre || servicio?.nombre || ''} />
                {numDias > 1
                  ? <Row label="Días" value={`${numDias} días${fechaLarga(pagoPayload.fecha) ? ` · desde ${fechaLarga(pagoPayload.fecha)}` : ''}`} />
                  : fechaLarga(pagoPayload.fecha) && <Row label="Fecha" value={fechaLarga(pagoPayload.fecha)!} />}
                {!!pagoPayload.participantes && <Row label="Participantes" value={`${pagoPayload.participantes} niño${pagoPayload.participantes === 1 ? '' : 's'}`} />}
                {esSenal && <Row label="Precio total" value={euros(pagoPayload.total)} />}
              </div>

              <div className="bg-pm-red-light border border-pm-red/20 rounded-xl p-5 flex items-center justify-between mb-2">
                <div>
                  <div className="font-black text-pm-red text-lg">{esSenal ? 'Señal a pagar ahora' : 'Total a pagar'}</div>
                  <div className="text-xs text-gray-500">
                    {esSenal ? `Reservas la fecha. El resto (${euros(resto)}) se abona al confirmar.` : 'Pago único'}
                  </div>
                </div>
                <div className="text-3xl font-black text-pm-red">{euros(aPagar)}</div>
              </div>

              {error && <p className="text-sm text-red-600 font-semibold mt-3">{error}</p>}

              {servicioId === 'campamentos' ? (
                <div className="space-y-2 mt-6">
                  <button onClick={handlePagoDedicado} disabled={loading}
                    className="w-full px-8 py-3 bg-pm-red text-white font-black rounded-xl hover:bg-pm-red-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                    {loading ? 'Procesando…' : `💳 Pagar ${euros(aPagar)} con tarjeta →`}
                  </button>
                  <button onClick={handleInstalacion} disabled={loading}
                    className="w-full px-8 py-3 border-2 border-pm-navy text-pm-navy font-black rounded-xl hover:bg-pm-navy hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                    🏫 Pagar en la instalación
                  </button>
                  <button onClick={() => { setError(''); setPaso(2) }} disabled={loading}
                    className="w-full text-sm text-gray-500 hover:text-pm-red font-semibold py-2 transition-colors disabled:opacity-50">
                    ← Volver
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between mt-6">
                  <button onClick={() => { setError(''); setPaso(2) }} disabled={loading}
                    className="px-6 py-3 border-2 border-gray-200 text-gray-600 font-bold rounded-xl hover:border-gray-300 transition-colors disabled:opacity-50">
                    ← Volver
                  </button>
                  <button onClick={handlePagoDedicado} disabled={loading}
                    className="px-8 py-3 bg-pm-red text-white font-bold rounded-xl hover:bg-pm-red-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                    {loading ? 'Redirigiendo al pago…' : `Pagar ${euros(aPagar)} con tarjeta →`}
                  </button>
                </div>
              )}
              <p className="text-center text-xs text-gray-400 mt-4">
                {servicioId === 'campamentos' ? 'Con tarjeta pagas ahora; «en la instalación» reservas la plaza y pagas el día del campamento.' : 'Pago seguro con tarjeta · Redsys'}
              </p>
            </div>
          )}

          {/* Cumpleaños (y servicios con franjas): calendario + datos */}
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
          </>)}
        </div>
      </div>
    </main>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between px-4 py-3 text-sm">
      <span className="text-gray-500">{label}</span>
      <span className="font-semibold text-pm-navy text-right">{value}</span>
    </div>
  )
}
