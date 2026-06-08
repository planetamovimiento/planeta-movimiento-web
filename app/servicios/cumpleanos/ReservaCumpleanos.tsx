'use client'

import { useState, useMemo } from 'react'
import { submitBooking } from '@/lib/forms/actions'

// ─── Constantes de negocio ────────────────────────────────────────────────────
const MIN_PARTICIPANTES = 13
const PRECIO_LUNES_JUEVES = 11   // €
const PRECIO_FIN_SEMANA   = 13   // €
const EXTRA_MONITOR       = 20   // € si >25 participantes
const FIANZA              = 50   // €

const MERIENDAS = [
  { id: 'sandwich-mixto', label: 'Sándwich mixto', desc: 'Jamón york y queso' },
  { id: 'sandwich-nocilla', label: 'Sándwich de Nocilla', desc: 'La favorita de los peques' },
  { id: 'nuggets', label: 'Nuggets', desc: 'Crujientes y deliciosos' },
  { id: 'salchipapas', label: 'Salchipapas', desc: 'Salchichas con patatas fritas' },
]

const BEBIDAS = ['Agua', 'Aquarius limón', 'Aquarius naranja', 'Zumo de melocotón', 'Zumo de piña']

// ─── Helpers ─────────────────────────────────────────────────────────────────
function esFindeSemanaOFestivo(date: Date) {
  const d = date.getDay()
  return d === 0 || d === 5 || d === 6 // Dom, Vie, Sáb
}

function getSlotsDelDia(date: Date): string[] {
  const d = date.getDay()
  const esSabDom = d === 0 || d === 6
  if (esSabDom) return ['16:45 – 18:45', '18:15 – 20:15']
  return ['18:15 – 20:15']
}

function calcularPrecio(date: Date, participantes: number): {
  pricePerPerson: number
  billable: number
  base: number
  extraMonitor: boolean
  total: number
  etiquetaDia: string
} {
  const esFS = esFindeSemanaOFestivo(date)
  const pricePerPerson = esFS ? PRECIO_FIN_SEMANA : PRECIO_LUNES_JUEVES
  const billable = Math.max(participantes, MIN_PARTICIPANTES)
  const base = billable * pricePerPerson
  const extraMonitor = participantes > 25
  const total = base + (extraMonitor ? EXTRA_MONITOR : 0)
  const etiquetaDia = esFS ? 'Viernes · Sábado · Domingo / Festivo' : 'Lunes a Jueves'
  return { pricePerPerson, billable, base, extraMonitor, total, etiquetaDia }
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(date)
}

/** Fecha en formato YYYY-MM-DD en hora LOCAL (evita el desfase de toISOString/UTC). */
function ymdLocal(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

// ─── Mini calendario ──────────────────────────────────────────────────────────
const DIAS = ['L', 'M', 'X', 'J', 'V', 'S', 'D']
const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']

function Calendario({ selected, onSelect, estaCompleto }: { selected: Date | null; onSelect: (d: Date) => void; estaCompleto: (d: Date) => boolean }) {
  const hoy = new Date(); hoy.setHours(0, 0, 0, 0)
  const [viewYear, setViewYear]   = useState(hoy.getFullYear())
  const [viewMonth, setViewMonth] = useState(hoy.getMonth())

  const primerDia = new Date(viewYear, viewMonth, 1)
  // getDay(): 0=Dom → necesitamos 0=Lun
  const offsetLunes = (primerDia.getDay() + 6) % 7
  const diasEnMes   = new Date(viewYear, viewMonth + 1, 0).getDate()

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1) }
    else setViewMonth(m => m - 1)
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1) }
    else setViewMonth(m => m + 1)
  }

  // No permitir retroceder al mes anterior al actual
  const canPrev = viewYear > hoy.getFullYear() || viewMonth > hoy.getMonth()

  const celdas: (number | null)[] = [
    ...Array(offsetLunes).fill(null),
    ...Array.from({ length: diasEnMes }, (_, i) => i + 1),
  ]
  // Rellenar hasta múltiplo de 7
  while (celdas.length % 7 !== 0) celdas.push(null)

  return (
    <div className="select-none">
      {/* Cabecera */}
      <div className="flex items-center justify-between mb-3">
        <button onClick={prevMonth} disabled={!canPrev}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 disabled:opacity-20 transition-colors">
          ‹
        </button>
        <span className="font-bold text-pm-navy text-sm uppercase tracking-wider">
          {MESES[viewMonth]} {viewYear}
        </span>
        <button onClick={nextMonth}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors">
          ›
        </button>
      </div>

      {/* Días de la semana */}
      <div className="grid grid-cols-7 mb-1">
        {DIAS.map(d => (
          <div key={d} className="text-center text-xs font-semibold text-gray-400 py-1">{d}</div>
        ))}
      </div>

      {/* Días */}
      <div className="grid grid-cols-7 gap-0.5">
        {celdas.map((dia, i) => {
          if (!dia) return <div key={i} />
          const fecha = new Date(viewYear, viewMonth, dia)
          const pasado = fecha < hoy
          const completo = !pasado && estaCompleto(fecha)
          const bloqueado = pasado || completo
          const esHoy  = fecha.getTime() === hoy.getTime()
          const selec  = selected?.getTime() === fecha.getTime()
          const esFS   = esFindeSemanaOFestivo(fecha)

          return (
            <button key={i} disabled={bloqueado}
              onClick={() => !bloqueado && onSelect(fecha)}
              title={completo ? 'Sin huecos disponibles' : undefined}
              className={`
                h-9 w-full rounded-lg text-xs font-semibold transition-all
                ${pasado ? 'text-gray-200 cursor-not-allowed' : ''}
                ${completo ? 'text-gray-300 line-through bg-gray-50 cursor-not-allowed' : ''}
                ${!bloqueado ? 'cursor-pointer' : ''}
                ${selec  ? 'bg-pm-red text-white shadow-md' : ''}
                ${!selec && !bloqueado && esFS  ? 'bg-green-50 text-green-700 hover:bg-green-100' : ''}
                ${!selec && !bloqueado && !esFS ? 'bg-gray-50 text-gray-700 hover:bg-pm-red-light hover:text-pm-red' : ''}
                ${esHoy && !selec ? 'ring-2 ring-pm-red ring-offset-1' : ''}
              `}
            >
              {dia}
            </button>
          )
        })}
      </div>

      {/* Leyenda */}
      <div className="flex flex-wrap gap-4 mt-3 text-xs text-gray-500">
        <span className="flex items-center gap-1"><span className="w-3 h-3 bg-gray-100 rounded inline-block"/>Lun–Jue</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 bg-green-100 rounded inline-block"/>Vie–Dom/Fest.</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 bg-gray-50 border border-gray-200 rounded inline-block"/><span className="line-through">Completo</span></span>
      </div>
    </div>
  )
}

// ─── Resumen de precio ────────────────────────────────────────────────────────
function ResumenPrecio({ fecha, participantes }: { fecha: Date; participantes: number }) {
  const { pricePerPerson, billable, base, extraMonitor, total, etiquetaDia } = calcularPrecio(fecha, participantes)
  const mostrarAviso13 = participantes < MIN_PARTICIPANTES

  return (
    <div className="bg-pm-bg border border-gray-200 rounded-xl p-4 space-y-2 text-sm">
      <div className="text-xs font-black text-pm-navy uppercase tracking-wider mb-3">Resumen de precio</div>

      <div className="flex justify-between text-gray-600">
        <span>Tarifa ({etiquetaDia})</span>
        <span className="font-semibold">{pricePerPerson} € / persona</span>
      </div>

      {mostrarAviso13 && (
        <div className="flex justify-between text-amber-600 text-xs bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
          <span>⚠ Mínimo facturable: {MIN_PARTICIPANTES} participantes</span>
          <span className="font-bold">({billable} fact.)</span>
        </div>
      )}

      <div className="flex justify-between text-gray-600">
        <span>{billable} participantes × {pricePerPerson} €</span>
        <span className="font-semibold">{base} €</span>
      </div>

      {extraMonitor && (
        <div className="flex justify-between text-blue-600">
          <span>+ Monitor extra (+25 participantes)</span>
          <span className="font-semibold">{EXTRA_MONITOR} €</span>
        </div>
      )}

      <div className="border-t border-gray-200 pt-2 flex justify-between font-black text-pm-navy text-base">
        <span>Total estimado</span>
        <span>{total} €</span>
      </div>

      <div className="flex justify-between text-pm-red font-bold text-sm bg-pm-red-light rounded-lg px-3 py-2">
        <span>Fianza para reservar</span>
        <span>{FIANZA} €</span>
      </div>
      <p className="text-xs text-gray-400">El resto se abona el día del cumpleaños.</p>
    </div>
  )
}

// ─── Componente principal ─────────────────────────────────────────────────────
export default function ReservaCumpleanos({ ocupados = {} }: { ocupados?: Record<string, string[]> }) {
  const [fechaSeleccionada, setFechaSeleccionada] = useState<Date | null>(null)
  const [slotSeleccionado, setSlotSeleccionado]   = useState<string | null>(null)
  const [participantes, setParticipantes]          = useState<number>(13)
  const [tieneTarta, setTieneTarta]                = useState<boolean | null>(null)
  const [paso, setPaso] = useState<1 | 2 | 3>(1) // 1=fecha, 2=detalles, 3=confirmado

  // Estado del formulario de datos personales
  const [form, setForm] = useState({ nombre: '', email: '', telefono: '', notas: '', cumpleanero: '', edad: '' })
  const [enviando, setEnviando] = useState(false)
  const [ocupadosLocal, setOcupadosLocal] = useState<Record<string, string[]>>({})

  // Huecos ya reservados (del servidor + los que acabas de reservar en esta sesión).
  // Se comparan por HORA DE INICIO (HH:MM) para casar formatos antiguos y nuevos.
  const horaInicio = (s: string) => s.match(/\d{1,2}:\d{2}/)?.[0] ?? s
  const inicioTomados = (date: Date): string[] => {
    const k = ymdLocal(date)
    return [...(ocupados[k] ?? []), ...(ocupadosLocal[k] ?? [])]
  }
  const slotTomado = (date: Date, slot: string) => inicioTomados(date).includes(horaInicio(slot))
  const diaCompleto = (date: Date) => { const t = getSlotsDelDia(date); return t.length > 0 && t.every(s => slotTomado(date, s)) }

  const slots = useMemo(() => fechaSeleccionada ? getSlotsDelDia(fechaSeleccionada) : [], [fechaSeleccionada])
  const precio = useMemo(() => fechaSeleccionada ? calcularPrecio(fechaSeleccionada, participantes) : null, [fechaSeleccionada, participantes])

  function handleFechaSelect(fecha: Date) {
    setFechaSeleccionada(fecha)
    setSlotSeleccionado(null)
  }

  function canGoToPaso2() {
    return fechaSeleccionada && slotSeleccionado
  }

  function canConfirmar() {
    return tieneTarta !== null && form.nombre && form.email && form.telefono && form.cumpleanero
  }

  async function handleReservar(e: React.FormEvent) {
    e.preventDefault()
    if (!fechaSeleccionada || !slotSeleccionado) return
    // Seguridad anti-duplicado: si el hueco se ocupó mientras rellenabas los datos, no continúes
    if (slotTomado(fechaSeleccionada, slotSeleccionado)) {
      alert('Vaya, ese horario acaba de ocuparse. Por favor, elige otra fecha u horario disponible.')
      setSlotSeleccionado(null); setPaso(1); return
    }
    setEnviando(true)
    const fechaStr = ymdLocal(fechaSeleccionada)
    await submitBooking({
      servicio: 'Cumpleaños',
      cliente_nombre: form.nombre,
      cliente_email: form.email,
      cliente_telefono: form.telefono,
      fecha: fechaStr,
      hora: slotSeleccionado,
      participantes,
      precio: precio?.total,
      observaciones: form.notas,
      datos: {
        cumpleanero: form.cumpleanero,
        edad: form.edad ? `Cumple ${form.edad}` : '',
        meriendas: 'Cada niño elige su opción el día del cumpleaños',
        traeTarta: tieneTarta ? 'Sí' : 'No (tarta decorativa + juego extra)',
      },
    })
    setOcupadosLocal(prev => ({ ...prev, [fechaStr]: [...(prev[fechaStr] ?? []), horaInicio(slotSeleccionado)] }))
    setEnviando(false)
    setPaso(3)
  }

  // ── Paso 3: Confirmado ──
  if (paso === 3) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center shadow-sm">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/>
          </svg>
        </div>
        <h3 className="text-xl font-black text-pm-navy mb-2">¡Solicitud de reserva recibida!</h3>
        <p className="text-gray-600 text-sm mb-4">
          Te contactaremos en las próximas horas para gestionar el pago de la fianza de <strong>50 €</strong> y confirmar la fecha.
        </p>
        <div className="bg-pm-bg rounded-xl p-4 text-sm text-left space-y-1 mb-6 max-w-xs mx-auto">
          <div><span className="text-gray-500">Fecha:</span> <strong>{fechaSeleccionada ? formatDate(fechaSeleccionada) : ''}</strong></div>
          <div><span className="text-gray-500">Horario:</span> <strong>{slotSeleccionado}</strong></div>
          <div><span className="text-gray-500">Participantes:</span> <strong>{participantes}</strong></div>
          <div><span className="text-gray-500">Total estimado:</span> <strong>{precio?.total} €</strong></div>
        </div>
        <button onClick={() => { setPaso(1); setFechaSeleccionada(null); setSlotSeleccionado(null); setTieneTarta(null); setForm({ nombre: '', email: '', telefono: '', notas: '', cumpleanero: '', edad: '' }) }}
          className="text-pm-red underline text-sm">
          Hacer otra reserva
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">

      {/* ── PASO 1: Fecha y hora ── */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="bg-pm-navy text-white px-5 py-3 flex items-center gap-2">
          <span className="w-6 h-6 bg-pm-red rounded-full flex items-center justify-center text-xs font-black">1</span>
          <span className="font-bold text-sm">Elige fecha y horario</span>
        </div>
        <div className="p-5">
          <Calendario selected={fechaSeleccionada} onSelect={handleFechaSelect} estaCompleto={diaCompleto} />

          {/* Slots */}
          {fechaSeleccionada && (
            <div className="mt-5">
              <div className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">
                Horarios disponibles — {formatDate(fechaSeleccionada)}
              </div>
              <div className="flex flex-col gap-2">
                {slots.map(slot => {
                  const tomado = fechaSeleccionada ? slotTomado(fechaSeleccionada, slot) : false
                  const activo = slotSeleccionado === slot
                  return (
                    <button key={slot} type="button" disabled={tomado} onClick={() => !tomado && setSlotSeleccionado(slot)}
                      className={`flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-all text-sm font-semibold ${
                        tomado
                          ? 'border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed'
                          : activo
                            ? 'border-pm-red bg-pm-red-light text-pm-red'
                            : 'border-gray-200 hover:border-pm-red/40 text-pm-navy'
                      }`}>
                      <span>🕐 {slot}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        tomado ? 'bg-gray-200 text-gray-500' : activo ? 'bg-pm-red text-white' : 'bg-green-100 text-green-700'
                      }`}>
                        {tomado ? 'Completo' : 'Disponible'}
                      </span>
                    </button>
                  )
                })}
              </div>
              <p className="text-xs text-gray-400 mt-2">
                Las horas se muestran en horario Europe/Madrid
              </p>
            </div>
          )}

          {!fechaSeleccionada && (
            <p className="text-sm text-gray-400 mt-4 text-center italic">Elige arriba una fecha para ver los horarios disponibles.</p>
          )}
        </div>
      </div>

      {/* ── Botón avanzar a paso 2 ── */}
      {canGoToPaso2() && paso === 1 && (
        <button onClick={() => setPaso(2)}
          className="w-full bg-pm-red hover:bg-pm-red-dark text-white font-black py-3.5 rounded-xl transition-colors">
          Continuar con los detalles →
        </button>
      )}

      {/* ── PASO 2: Detalles de la reserva ── */}
      {paso === 2 && (
        <form onSubmit={handleReservar} className="space-y-5">

          {/* Resumen fecha elegida */}
          <div className="bg-pm-navy text-white rounded-xl px-5 py-3 flex items-center justify-between text-sm">
            <div>
              <div className="font-black">{fechaSeleccionada ? formatDate(fechaSeleccionada) : ''}</div>
              <div className="text-white/60 text-xs">{slotSeleccionado}</div>
            </div>
            <button type="button" onClick={() => setPaso(1)} className="text-white/50 hover:text-white text-xs underline">
              Cambiar
            </button>
          </div>

          {/* Participantes */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
            <div className="bg-pm-navy text-white px-1 py-1 flex items-center gap-2 rounded-xl mb-4 px-3">
              <span className="w-6 h-6 bg-pm-red rounded-full flex items-center justify-center text-xs font-black shrink-0">2</span>
              <span className="font-bold text-sm">Número de participantes</span>
            </div>
            <div className="flex items-center gap-4">
              <button type="button"
                onClick={() => setParticipantes(p => Math.max(1, p - 1))}
                className="w-10 h-10 bg-pm-bg border border-gray-200 rounded-xl text-lg font-bold hover:border-pm-red transition-colors">−</button>
              <div className="flex-1 text-center">
                <div className="text-4xl font-black text-pm-navy">{participantes}</div>
                <div className="text-xs text-gray-400">participantes</div>
              </div>
              <button type="button"
                onClick={() => setParticipantes(p => p + 1)}
                className="w-10 h-10 bg-pm-bg border border-gray-200 rounded-xl text-lg font-bold hover:border-pm-red transition-colors">+</button>
            </div>
            {participantes < MIN_PARTICIPANTES && (
              <div className="mt-3 bg-amber-50 border border-amber-200 text-amber-700 text-xs rounded-lg px-3 py-2">
                ⚠ El mínimo facturable es de {MIN_PARTICIPANTES} participantes. Se calculará el precio para {MIN_PARTICIPANTES} aunque vengan menos.
              </div>
            )}
            {participantes > 25 && (
              <div className="mt-3 bg-blue-50 border border-blue-200 text-blue-700 text-xs rounded-lg px-3 py-2">
                ℹ Al superar los 25 participantes se añade un monitor extra (+{EXTRA_MONITOR} €).
              </div>
            )}
          </div>

          {/* Merienda (informativa) */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
            <div className="bg-pm-navy text-white px-3 py-1.5 flex items-center gap-2 rounded-xl mb-4">
              <span className="w-6 h-6 bg-pm-red rounded-full flex items-center justify-center text-xs font-black shrink-0">3</span>
              <span className="font-bold text-sm">La merienda</span>
            </div>
            <p className="text-xs text-gray-500 mb-3">
              Incluida en el precio. <strong className="text-pm-navy">Cada niño elige el día del cumpleaños</strong> la opción que prefiera entre estas:
            </p>
            <div className="grid grid-cols-2 gap-2">
              {MERIENDAS.map(m => (
                <div key={m.id} className="border border-gray-200 rounded-xl p-3 bg-pm-bg">
                  <div className="font-bold text-sm text-pm-navy">{m.label}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{m.desc}</div>
                </div>
              ))}
            </div>

            {/* Bebidas */}
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-xs font-semibold text-gray-500 mb-2">🥤 Bebidas incluidas</p>
              <div className="flex flex-wrap gap-1.5">
                {BEBIDAS.map(b => (
                  <span key={b} className="bg-pm-bg border border-gray-200 text-xs text-gray-600 px-2 py-1 rounded-full">{b}</span>
                ))}
              </div>
            </div>

            {/* Cubiertos */}
            <div className="mt-3 text-xs text-gray-500">
              ✓ Cubiertos · ✓ Vasos · ✓ Material de merienda incluidos
            </div>
          </div>

          {/* Tarta */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
            <div className="bg-pm-navy text-white px-3 py-1.5 flex items-center gap-2 rounded-xl mb-4">
              <span className="w-6 h-6 bg-pm-red rounded-full flex items-center justify-center text-xs font-black shrink-0">4</span>
              <span className="font-bold text-sm">¿Traéis tarta?</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button type="button" onClick={() => setTieneTarta(true)}
                className={`border-2 rounded-xl p-4 text-center transition-all ${
                  tieneTarta === true ? 'border-pm-red bg-pm-red-light' : 'border-gray-200 hover:border-pm-red/40'
                }`}>
                <div className="text-2xl mb-1">🎂</div>
                <div className={`font-bold text-sm ${tieneTarta === true ? 'text-pm-red' : 'text-pm-navy'}`}>Sí, traemos tarta</div>
                <div className="text-xs text-gray-500 mt-1">30 min de merienda</div>
              </button>
              <button type="button" onClick={() => setTieneTarta(false)}
                className={`border-2 rounded-xl p-4 text-center transition-all ${
                  tieneTarta === false ? 'border-pm-red bg-pm-red-light' : 'border-gray-200 hover:border-pm-red/40'
                }`}>
                <div className="text-2xl mb-1">🎈</div>
                <div className={`font-bold text-sm ${tieneTarta === false ? 'text-pm-red' : 'text-pm-navy'}`}>No traemos tarta</div>
                <div className="text-xs text-gray-500 mt-1">15 min merienda + 15 min juego extra</div>
              </button>
            </div>
            {tieneTarta === false && (
              <div className="mt-3 bg-blue-50 border border-blue-100 text-blue-700 text-xs rounded-lg p-3">
                🎈 Usaremos nuestra tarta decorativa para soplar las velas. Los niños tienen <strong>15 minutos extra de juego</strong> al no dedicar tiempo a comer la tarta.
              </div>
            )}
            {tieneTarta === true && (
              <div className="mt-3 bg-gray-50 border border-gray-100 text-gray-600 text-xs rounded-lg p-3">
                🎂 La tarta no está incluida en el precio. Podéis traerla al inicio del cumpleaños.
              </div>
            )}
          </div>

          {/* Resumen precio */}
          {fechaSeleccionada && <ResumenPrecio fecha={fechaSeleccionada} participantes={participantes} />}

          {/* Datos de contacto */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
            <div className="bg-pm-navy text-white px-3 py-1.5 flex items-center gap-2 rounded-xl mb-4">
              <span className="w-6 h-6 bg-pm-red rounded-full flex items-center justify-center text-xs font-black shrink-0">5</span>
              <span className="font-bold text-sm">Datos de contacto</span>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3">
                <input required type="text" placeholder="Nombre del cumpleañero/a *"
                  value={form.cumpleanero} onChange={e => setForm(f => ({ ...f, cumpleanero: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-pm-red"
                />
                <input type="number" min={1} placeholder="Edad que cumple"
                  value={form.edad} onChange={e => setForm(f => ({ ...f, edad: e.target.value }))}
                  className="w-full sm:w-40 border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-pm-red"
                />
              </div>
              <input required type="text" placeholder="Nombre completo del contacto *"
                value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-pm-red"
              />
              <input required type="email" placeholder="Email *"
                value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-pm-red"
              />
              <input required type="tel" placeholder="Teléfono *"
                value={form.telefono} onChange={e => setForm(f => ({ ...f, telefono: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-pm-red"
              />
              <textarea rows={2} placeholder="Notas adicionales (alergias, necesidades especiales...)"
                value={form.notas} onChange={e => setForm(f => ({ ...f, notas: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-pm-red resize-none"
              />
            </div>
          </div>

          {/* Aviso fianza */}
          <div className="bg-pm-navy text-white rounded-xl p-4 text-sm text-center">
            <div className="font-black text-base mb-1">Fianza de reserva: {FIANZA} €</div>
            <p className="text-white/70 text-xs">
              Tras enviar la solicitud nos pondremos en contacto contigo para gestionar el pago de la fianza y confirmar la fecha. El resto se abona el día del cumpleaños.
            </p>
          </div>

          {/* Botón final */}
          <button type="submit" disabled={!canConfirmar() || enviando}
            className="w-full bg-pm-red hover:bg-pm-red-dark disabled:opacity-50 disabled:cursor-not-allowed text-white font-black text-sm tracking-widest uppercase py-4 rounded-xl transition-colors shadow-lg">
            {enviando ? 'Enviando solicitud...' : `Solicitar reserva · ${precio?.total ?? 0} €`}
          </button>
          <p className="text-center text-xs text-gray-400">
            Al enviar aceptas las <a href="#" className="text-pm-red underline">condiciones de uso</a> y la <a href="#" className="text-pm-red underline">política de privacidad</a>
          </p>
        </form>
      )}
    </div>
  )
}
