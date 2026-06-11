'use client'

import { useState, useMemo } from 'react'
import { submitBooking } from '@/lib/forms/actions'
import { iniciarPagoReserva } from '@/app/reservar/actions'
import { redirigirARedsys } from '@/components/reserva/redirigirARedsys'
import type { MananaMagica } from '@/lib/eventos/manana-magica'
import { parseFechasDSC, type EventoCentroCfg } from '@/lib/eventos/centro'

// ─── Días Sin Cole ─────────────────────────────────────────────────────────
// Configurar aquí cada temporada
const DIAS_SIN_COLE: { fecha: string; label: string }[] = [
  { fecha: '2026-09-11', label: 'Fiesta Nacional (sept)' },
  { fecha: '2026-10-12', label: 'Día de la Hispanidad' },
  { fecha: '2026-11-02', label: 'Puente de Todos los Santos' },
  { fecha: '2026-12-07', label: 'Puente Constitución' },
  { fecha: '2026-12-26', label: 'Día siguiente Navidad' },
  { fecha: '2027-01-02', label: 'Inicio de año escolar' },
  { fecha: '2027-01-07', label: 'Post-Reyes' },
]

const IVA = 0.21

// ─── Modal genérico de reserva ─────────────────────────────────────────────
function ModalReserva({
  titulo, children, onClose,
}: { titulo: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}/>
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="bg-pm-navy text-white px-6 py-4 rounded-t-2xl flex items-center justify-between sticky top-0">
          <h3 className="font-black text-base">{titulo}</h3>
          <button onClick={onClose} className="text-white/60 hover:text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}

function Exito({ onClose }: { onClose: () => void }) {
  return (
    <div className="text-center py-6">
      <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/>
        </svg>
      </div>
      <p className="font-black text-pm-navy text-lg mb-2">¡Reserva recibida!</p>
      <p className="text-sm text-gray-500 mb-5">Nos pondremos en contacto contigo para confirmarlo todo.</p>
      <button onClick={onClose} className="bg-pm-red hover:bg-pm-red-dark text-white font-bold px-6 py-2.5 rounded-xl transition-colors">Cerrar</button>
    </div>
  )
}

// ──────────────────────────────────────────────────────────────────────────────
// DÍAS SIN COLE
// ──────────────────────────────────────────────────────────────────────────────
export function ReservaDiasSinCole({ cfg, onClose = () => {} }: { cfg?: EventoCentroCfg; onClose?: () => void }) {
  const [fecha, setFecha]      = useState('')
  const [ninos, setNinos]       = useState(1)
  const [form, setForm]         = useState({ nombre: '', email: '', telefono: '' })
  const [enviando, setEnviando] = useState(false)
  const [error, setError]       = useState('')

  const fechasDSC = cfg ? parseFechasDSC(cfg.fechas) : DIAS_SIN_COLE
  const precioBase = cfg ? cfg.precio : 30
  const precioConIva = (cfg && cfg.ivaIncluido)
    ? Math.round(precioBase * ninos * 100) / 100
    : Math.round(precioBase * (1 + IVA) * ninos * 100) / 100

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setEnviando(true); setError('')
    const r = await iniciarPagoReserva({
      servicioId: 'dias-sin-cole',
      cliente: { nombre: form.nombre, email: form.email, telefono: form.telefono },
      fecha, participantes: ninos, total: precioConIva,
      datos: { horario: '9:00 - 14:00', numNinos: ninos },
    })
    if (r.ok) { redirigirARedsys(r); return }
    setEnviando(false); setError(r.error)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Fecha */}
      <div>
        <label className="block text-xs font-bold text-pm-navy mb-2">Elige el día *</label>
        <div className="grid grid-cols-1 gap-2">
          {fechasDSC.map(d => {
            const pasado = new Date(d.fecha + 'T12:00:00') < new Date()
            return (
              <button key={d.fecha} type="button" disabled={pasado}
                onClick={() => setFecha(d.fecha)}
                className={`flex items-center justify-between px-4 py-3 rounded-xl border-2 text-sm transition-all ${
                  pasado ? 'opacity-30 cursor-not-allowed border-gray-100 bg-gray-50' :
                  fecha === d.fecha ? 'border-amber-500 bg-amber-50 text-amber-800' :
                  'border-gray-200 hover:border-amber-400 text-pm-navy'
                }`}>
                <span className="font-semibold">{d.label}</span>
                <span className="text-xs text-gray-500">
                  {new Date(d.fecha + 'T12:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Niños */}
      <div>
        <label className="block text-xs font-bold text-pm-navy mb-2">Número de niños *</label>
        <div className="flex items-center gap-4">
          <button type="button" onClick={() => setNinos(n => Math.max(1, n-1))} className="w-9 h-9 bg-amber-50 border border-amber-200 rounded-xl font-bold text-lg hover:border-amber-400 transition-colors">−</button>
          <div className="flex-1 text-center text-3xl font-black text-pm-navy">{ninos}</div>
          <button type="button" onClick={() => setNinos(n => n+1)} className="w-9 h-9 bg-amber-50 border border-amber-200 rounded-xl font-bold text-lg hover:border-amber-400 transition-colors">+</button>
        </div>
      </div>

      {/* Precio */}
      {fecha && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm">
          <div className="flex justify-between text-amber-800">
            <span>{ninos} niño{ninos > 1 ? 's' : ''} × {precioBase} €{cfg?.ivaIncluido ? '' : ' + IVA'}</span>
            <strong>{precioConIva} €</strong>
          </div>
        </div>
      )}

      <input required type="text" placeholder="Nombre *" value={form.nombre} onChange={e => setForm(f => ({...f, nombre: e.target.value}))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-amber-500"/>
      <input required type="email" placeholder="Email *" value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-amber-500"/>
      <input required type="tel" placeholder="Teléfono *" value={form.telefono} onChange={e => setForm(f => ({...f, telefono: e.target.value}))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-amber-500"/>

      {error && <p className="text-xs text-red-600">{error}</p>}
      <button type="submit" disabled={!fecha || !form.nombre || !form.email || !form.telefono || enviando}
        className="w-full bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-black py-3.5 rounded-xl transition-colors">
        {enviando ? 'Redirigiendo al pago…' : `Pagar ${precioConIva} € y reservar`}
      </button>
    </form>
  )
}

// ──────────────────────────────────────────────────────────────────────────────
// DOMINGOS EN FAMILIA
// ──────────────────────────────────────────────────────────────────────────────
const MESES_DOM = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']

function isoLocal(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function domingosDeMes(year: number, month: number): string[] {
  const res: string[] = []
  const d = new Date(year, month, 1)
  while (d.getMonth() === month) {
    if (d.getDay() === 0) res.push(isoLocal(d))
    d.setDate(d.getDate() + 1)
  }
  return res
}

export function ReservaDomingos({ cfg, onClose = () => {} }: { cfg?: EventoCentroCfg; onClose?: () => void }) {
  const precioNino = cfg ? cfg.precio : 15
  const hoy = useMemo(() => { const h = new Date(); h.setHours(0, 0, 0, 0); return h }, [])
  const [viewY, setViewY] = useState(hoy.getFullYear())
  const [viewM, setViewM] = useState(hoy.getMonth())
  const domingos = useMemo(() => domingosDeMes(viewY, viewM), [viewY, viewM])
  const canPrev = viewY > hoy.getFullYear() || (viewY === hoy.getFullYear() && viewM > hoy.getMonth())

  function prevMes() { if (viewM === 0) { setViewM(11); setViewY(y => y - 1) } else setViewM(m => m - 1) }
  function nextMes() { if (viewM === 11) { setViewM(0); setViewY(y => y + 1) } else setViewM(m => m + 1) }

  const [fecha, setFecha]   = useState('')
  const [ninos, setNinos]   = useState(1)
  const [form, setForm]     = useState({ nombre: '', email: '', telefono: '' })
  const [enviando, setEnviando] = useState(false)
  const [error, setError]   = useState('')

  const total = ninos * precioNino

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setEnviando(true); setError('')
    const r = await iniciarPagoReserva({
      servicioId: 'domingos',
      cliente: { nombre: form.nombre, email: form.email, telefono: form.telefono },
      fecha, participantes: ninos, total,
      datos: { horario: '11:00 - 13:00', numNinos: ninos, nota: 'Adultos gratis' },
    })
    if (r.ok) { redirigirARedsys(r); return }
    setEnviando(false); setError(r.error)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-bold text-pm-navy mb-2">Elige el domingo *</label>

        {/* Navegador de mes */}
        <div className="flex items-center justify-between mb-3">
          <button type="button" onClick={prevMes} disabled={!canPrev}
            className="w-9 h-9 flex items-center justify-center rounded-xl border-2 border-gray-200 text-pm-navy disabled:opacity-30 disabled:cursor-not-allowed hover:border-green-400 transition-colors">
            ‹
          </button>
          <span className="font-black text-pm-navy text-sm">{MESES_DOM[viewM]} {viewY}</span>
          <button type="button" onClick={nextMes}
            className="w-9 h-9 flex items-center justify-center rounded-xl border-2 border-gray-200 text-pm-navy hover:border-green-400 transition-colors">
            ›
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {domingos.map(d => {
            const obj = new Date(d + 'T12:00:00')
            const pasado = obj < hoy
            return (
              <button key={d} type="button" disabled={pasado} onClick={() => setFecha(d)}
                className={`px-3 py-2.5 rounded-xl border-2 text-sm transition-all text-center ${
                  pasado ? 'border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed'
                  : fecha === d ? 'border-green-500 bg-green-50 text-green-800'
                  : 'border-gray-200 hover:border-green-400 text-pm-navy'
                }`}>
                <div className="font-black">{obj.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })}</div>
                <div className="text-xs text-gray-400">11:00 – 13:00</div>
              </button>
            )
          })}
        </div>
        <p className="text-xs text-gray-400 mt-2 text-center">Desliza entre meses con las flechas para ver todos los domingos.</p>
      </div>

      <div>
        <label className="block text-xs font-bold text-pm-navy mb-1">Niños que asisten (desde 2 años) *</label>
        <p className="text-xs text-gray-400 mb-2">Los adultos entran gratis. Los menores de 2 años también.</p>
        <div className="flex items-center gap-4">
          <button type="button" onClick={() => setNinos(n => Math.max(1, n-1))} className="w-9 h-9 bg-green-50 border border-green-200 rounded-xl font-bold text-lg hover:border-green-400 transition-colors">−</button>
          <div className="flex-1 text-center text-3xl font-black text-pm-navy">{ninos}</div>
          <button type="button" onClick={() => setNinos(n => n+1)} className="w-9 h-9 bg-green-50 border border-green-200 rounded-xl font-bold text-lg hover:border-green-400 transition-colors">+</button>
        </div>
      </div>

      {fecha && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-sm">
          <div className="flex justify-between text-green-800">
            <span>{ninos} niño{ninos > 1 ? 's' : ''} × {precioNino} € · Adultos gratis</span>
            <strong>{total} €</strong>
          </div>
        </div>
      )}

      <input required type="text" placeholder="Nombre *" value={form.nombre} onChange={e => setForm(f => ({...f, nombre: e.target.value}))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-green-500"/>
      <input required type="email" placeholder="Email *" value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-green-500"/>
      <input required type="tel" placeholder="Teléfono *" value={form.telefono} onChange={e => setForm(f => ({...f, telefono: e.target.value}))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-green-500"/>

      {error && <p className="text-xs text-red-600">{error}</p>}
      <button type="submit" disabled={!fecha || !form.nombre || !form.email || !form.telefono || enviando}
        className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-black py-3.5 rounded-xl transition-colors">
        {enviando ? 'Redirigiendo al pago…' : `Pagar ${total} € y reservar`}
      </button>
    </form>
  )
}

// ──────────────────────────────────────────────────────────────────────────────
// NOCHE DE HALLOWEEN
// ──────────────────────────────────────────────────────────────────────────────
const PLAZAS_HALLOWEEN = 20

export function ReservaHalloween({ cfg, onClose = () => {} }: { cfg?: EventoCentroCfg; onClose?: () => void }) {
  const PLAZAS = cfg?.plazas || PLAZAS_HALLOWEEN
  const evento = cfg?.evento || 'Apocalipsis Zombie'
  const [ninos, setNinos]   = useState(1)
  const [form, setForm]     = useState({ nombre: '', email: '', telefono: '', edades: '', notas: '' })
  const [enviando, setEnviando] = useState(false)
  const [listo, setListo]   = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setEnviando(true)
    await submitBooking({
      servicio: 'Noche de Halloween',
      cliente_nombre: form.nombre, cliente_email: form.email, cliente_telefono: form.telefono,
      participantes: ninos, observaciones: form.notas,
      datos: { edades: form.edades, numNinos: ninos, evento },
    })
    setEnviando(false); setListo(true)
  }

  if (listo) return <Exito onClose={onClose}/>

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Info evento */}
      <div className="bg-orange-950/20 border border-orange-500/30 rounded-xl p-4 text-sm">
        <div className="font-black text-orange-400 mb-2">🧟 Noche de Halloween 2026</div>
        <div className="space-y-1 text-orange-200/80 text-xs">
          <div>📅 Noche del 31 de octubre al 1 de noviembre</div>
          <div>🕙 22:00 – 09:00 del día siguiente</div>
          <div>👦 Edad mínima: 10 años</div>
          <div>🎯 Plazas limitadas: {PLAZAS} máximo</div>
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-orange-200 mb-2">Número de niños *</label>
        <div className="flex items-center gap-4">
          <button type="button" onClick={() => setNinos(n => Math.max(1, n-1))} className="w-9 h-9 bg-orange-900/40 border border-orange-500/40 rounded-xl font-bold text-lg text-orange-300 hover:border-orange-400 transition-colors">−</button>
          <div className="flex-1 text-center text-3xl font-black text-white">{ninos}</div>
          <button type="button" onClick={() => setNinos(n => Math.min(PLAZAS, n+1))} className="w-9 h-9 bg-orange-900/40 border border-orange-500/40 rounded-xl font-bold text-lg text-orange-300 hover:border-orange-400 transition-colors">+</button>
        </div>
      </div>

      <input required type="text" placeholder="Nombre del responsable *" value={form.nombre} onChange={e => setForm(f => ({...f, nombre: e.target.value}))} className="w-full border border-orange-500/30 bg-orange-950/20 rounded-xl px-3 py-2.5 text-sm text-white placeholder-orange-300/50 focus:outline-none focus:border-orange-400"/>
      <input required type="email" placeholder="Email *" value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))} className="w-full border border-orange-500/30 bg-orange-950/20 rounded-xl px-3 py-2.5 text-sm text-white placeholder-orange-300/50 focus:outline-none focus:border-orange-400"/>
      <input required type="tel" placeholder="Teléfono *" value={form.telefono} onChange={e => setForm(f => ({...f, telefono: e.target.value}))} className="w-full border border-orange-500/30 bg-orange-950/20 rounded-xl px-3 py-2.5 text-sm text-white placeholder-orange-300/50 focus:outline-none focus:border-orange-400"/>
      <input type="text" placeholder="Edad(es) de los participantes" value={form.edades} onChange={e => setForm(f => ({...f, edades: e.target.value}))} className="w-full border border-orange-500/30 bg-orange-950/20 rounded-xl px-3 py-2.5 text-sm text-white placeholder-orange-300/50 focus:outline-none focus:border-orange-400"/>
      <textarea rows={2} placeholder="Alergias, necesidades especiales..." value={form.notas} onChange={e => setForm(f => ({...f, notas: e.target.value}))} className="w-full border border-orange-500/30 bg-orange-950/20 rounded-xl px-3 py-2.5 text-sm text-white placeholder-orange-300/50 focus:outline-none focus:border-orange-400 resize-none"/>

      <p className="text-xs text-orange-300/70">El precio se confirmará al ponernos en contacto contigo. Plazas muy limitadas.</p>

      <button type="submit" disabled={!form.nombre || !form.email || !form.telefono || enviando}
        className="w-full bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white font-black py-3.5 rounded-xl transition-colors">
        {enviando ? 'Enviando...' : '🧟 Reservar plaza'}
      </button>
    </form>
  )
}

// ──────────────────────────────────────────────────────────────────────────────
// MAÑANAS MÁGICAS (personaje editable desde el admin)
// ──────────────────────────────────────────────────────────────────────────────
export function ReservaMananaMagica({ cfg, onClose = () => {} }: { cfg: MananaMagica; onClose?: () => void }) {
  const [ninos, setNinos] = useState(1)
  const [form, setForm] = useState({ nombre: '', email: '', telefono: '', edades: '' })
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState('')

  const desc = cfg.descuentoHermanos / 100
  const total = Math.round((cfg.precio + Math.max(0, ninos - 1) * cfg.precio * (1 - desc)) * 100) / 100

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setEnviando(true); setError('')
    const r = await iniciarPagoReserva({
      servicioId: 'manana-magica',
      cliente: { nombre: form.nombre, email: form.email, telefono: form.telefono },
      fecha: cfg.fecha || null, participantes: ninos, total,
      datos: { personaje: cfg.personaje, tematica: cfg.tematica, horario: cfg.horario, fecha: cfg.fechaTexto, edades: form.edades, numNinos: ninos },
    })
    if (r.ok) { redirigirARedsys(r); return }
    setEnviando(false); setError(r.error)
  }

  const completo = cfg.estado === 'completo'

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-fuchsia-50 border border-fuchsia-200 rounded-xl p-4 text-sm">
        <div className="font-black text-fuchsia-700 mb-1">{cfg.emoji} {cfg.personaje}</div>
        <div className="space-y-1 text-fuchsia-900/70 text-xs">
          <div>📅 {cfg.fechaTexto}</div>
          <div>🕙 {cfg.horario}</div>
          <div>👧 {cfg.edades}</div>
          <div>💰 {cfg.precio} € / niño · Hermanos −{cfg.descuentoHermanos}%</div>
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-pm-navy mb-2">Número de niños *</label>
        <div className="flex items-center gap-4">
          <button type="button" onClick={() => setNinos(n => Math.max(1, n - 1))} className="w-9 h-9 bg-fuchsia-50 border border-fuchsia-200 rounded-xl font-bold text-lg hover:border-fuchsia-400 transition-colors">−</button>
          <div className="flex-1 text-center text-3xl font-black text-pm-navy">{ninos}</div>
          <button type="button" onClick={() => setNinos(n => n + 1)} className="w-9 h-9 bg-fuchsia-50 border border-fuchsia-200 rounded-xl font-bold text-lg hover:border-fuchsia-400 transition-colors">+</button>
        </div>
      </div>

      <div className="bg-fuchsia-50 border border-fuchsia-200 rounded-xl p-3 text-sm">
        <div className="flex justify-between text-fuchsia-800">
          <span>{ninos} niño{ninos > 1 ? 's' : ''}{ninos > 1 ? ` (hermanos −${cfg.descuentoHermanos}%)` : ''}</span>
          <strong>{total} €</strong>
        </div>
      </div>

      <input required type="text" placeholder="Nombre *" value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-fuchsia-500" />
      <input required type="email" placeholder="Email *" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-fuchsia-500" />
      <input required type="tel" placeholder="Teléfono *" value={form.telefono} onChange={e => setForm(f => ({ ...f, telefono: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-fuchsia-500" />
      <input type="text" placeholder="Edad(es) de los niños" value={form.edades} onChange={e => setForm(f => ({ ...f, edades: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-fuchsia-500" />

      {error && <p className="text-xs text-red-600">{error}</p>}
      <button type="submit" disabled={completo || !form.nombre || !form.email || !form.telefono || enviando}
        className="w-full bg-fuchsia-600 hover:bg-fuchsia-700 disabled:opacity-50 text-white font-black py-3.5 rounded-xl transition-colors">
        {completo ? 'Plazas completas' : enviando ? 'Redirigiendo al pago…' : `✨ Pagar ${total} € y reservar`}
      </button>
      <p className="text-center text-xs text-gray-400">Plazas limitadas · Pago seguro con tarjeta · Redsys</p>
    </form>
  )
}

// ──────────────────────────────────────────────────────────────────────────────
// COMPONENTE PRINCIPAL
// ──────────────────────────────────────────────────────────────────────────────
export default function EventosInstalaciones() {
  const [modalAbierto, setModalAbierto] = useState<null | 'diassinc' | 'domingos' | 'halloween'>(null)

  return (
    <section className="bg-pm-navy py-20" id="eventos-instalaciones">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Cabecera */}
        <div className="text-center mb-14">
          <span className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white text-xs font-bold px-4 py-1.5 rounded-full mb-5">
            🏟️ Eventos en nuestras instalaciones
          </span>
          <h2 className="text-4xl font-black text-white mb-3">
            Experiencias que no olvidaréis
          </h2>
          <p className="text-white/60 text-base max-w-xl mx-auto">
            Eventos especiales organizados dentro de Planeta Movimiento. Diversión, deporte y convivencia en un entorno seguro y único.
          </p>
        </div>

        {/* ── GRID DE 3 EVENTOS ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── DÍAS SIN COLE ── */}
          <div className="bg-gradient-to-b from-amber-500 to-amber-600 rounded-3xl overflow-hidden flex flex-col">
            {/* Header */}
            <div className="px-6 pt-8 pb-5 text-white">
              <div className="text-4xl mb-3">⚡🦸</div>
              <div className="text-xs font-bold uppercase tracking-widest text-amber-200 mb-1">Escuela de Superhéroes</div>
              <h3 className="text-2xl font-black mb-2">Días Sin Cole</h3>
              <p className="text-amber-100 text-sm leading-relaxed">
                ¡No hay clase pero hay aventura! Los niños viven una mañana épica de actividades mientras la familia puede conciliar.
              </p>
            </div>

            {/* Info rápida */}
            <div className="mx-4 bg-white/15 rounded-2xl p-4 text-white text-sm space-y-2 mb-4">
              <div className="flex items-center gap-2"><span className="text-lg">🕘</span><span>9:00 – 14:00</span></div>
              <div className="flex items-center gap-2"><span className="text-lg">👶</span><span>Desde 4 años</span></div>
              <div className="flex items-center gap-2"><span className="text-lg">💰</span><span><strong>30 € + IVA</strong> / niño</span></div>
            </div>

            {/* Actividades */}
            <div className="mx-4 bg-white/10 rounded-2xl p-4 mb-4">
              <div className="text-xs font-black text-amber-200 uppercase tracking-wider mb-2">Habilidades que entrenarán</div>
              <div className="flex flex-wrap gap-1.5">
                {['⚡ Agilidad', '💪 Fuerza', '🎯 Coordinación', '⚖️ Equilibrio', '🏃 Resistencia', '🤹 Destreza', '🤝 Equipo'].map(h => (
                  <span key={h} className="bg-white/15 text-white text-xs font-semibold px-2 py-1 rounded-full">{h}</span>
                ))}
              </div>
            </div>

            {/* Actividades detalle */}
            <div className="mx-4 mb-6">
              <div className="text-xs font-black text-amber-200 uppercase tracking-wider mb-2">Actividades incluidas</div>
              <div className="grid grid-cols-2 gap-1">
                {['Gimnasia acrobática', 'Parkour', 'Telas aéreas', 'Equilibrios', 'Circuitos', 'Juegos cooperativos', 'Retos físicos', 'Práctica libre'].map(a => (
                  <div key={a} className="flex items-center gap-1.5 text-xs text-white/80">
                    <span className="text-amber-300 font-bold">✓</span>{a}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-auto px-4 pb-6">
              <button onClick={() => setModalAbierto('diassinc')}
                className="w-full bg-white text-amber-600 hover:bg-amber-50 font-black py-3.5 rounded-xl transition-colors shadow-lg">
                ⚡ Reservar plaza
              </button>
            </div>
          </div>

          {/* ── DOMINGOS EN FAMILIA ── */}
          <div className="bg-gradient-to-b from-emerald-600 to-emerald-700 rounded-3xl overflow-hidden flex flex-col">
            {/* Header */}
            <div className="px-6 pt-8 pb-5 text-white">
              <div className="text-4xl mb-3">👨‍👩‍👧‍👦🎉</div>
              <div className="text-xs font-bold uppercase tracking-widest text-emerald-200 mb-1">Práctica libre familiar</div>
              <h3 className="text-2xl font-black mb-2">Domingos en Familia</h3>
              <p className="text-emerald-100 text-sm leading-relaxed">
                Dos horas de disfrute en familia dentro de nuestras instalaciones. Sin clases, sin presión — solo movimiento, juego y tiempo de calidad juntos.
              </p>
            </div>

            {/* Info rápida */}
            <div className="mx-4 bg-white/15 rounded-2xl p-4 text-white text-sm space-y-2 mb-4">
              <div className="flex items-center gap-2"><span className="text-lg">📅</span><span>Todos los domingos</span></div>
              <div className="flex items-center gap-2"><span className="text-lg">🕙</span><span>11:00 – 13:00 (2 horas)</span></div>
              <div className="flex items-center gap-2"><span className="text-lg">💰</span><span><strong>15 € / niño</strong> · Adultos gratis</span></div>
              <div className="flex items-center gap-2"><span className="text-lg">👶</span><span>Desde 2 años · Menores de 2 gratis</span></div>
            </div>

            {/* Qué hay */}
            <div className="mx-4 bg-white/10 rounded-2xl p-4 mb-4">
              <div className="text-xs font-black text-emerald-200 uppercase tracking-wider mb-2">El ambiente perfecto</div>
              <div className="space-y-1">
                {['🎵 Música de fondo', '🤸 Acceso a todo el material', '🛡 Supervisión de monitores', '💬 Monitores resuelven dudas', '🌿 Ambiente relajado', '🏆 Espacios de juego libre'].map(item => (
                  <div key={item} className="text-xs text-white/80">{item}</div>
                ))}
              </div>
            </div>

            {/* Aviso importante */}
            <div className="mx-4 bg-white/10 border border-white/20 rounded-xl p-3 mb-6 text-xs text-emerald-100">
              <strong className="text-white">Importante:</strong> Los padres deben permanecer dentro de la instalación durante toda la actividad. No es un servicio de guardería, ¡es una actividad para disfrutar juntos!
            </div>

            <div className="mt-auto px-4 pb-6">
              <button onClick={() => setModalAbierto('domingos')}
                className="w-full bg-white text-emerald-700 hover:bg-emerald-50 font-black py-3.5 rounded-xl transition-colors shadow-lg">
                🗓 Reservar domingo
              </button>
            </div>
          </div>

          {/* ── NOCHE DE HALLOWEEN ── */}
          <div className="bg-gradient-to-b from-gray-900 to-orange-950 rounded-3xl overflow-hidden flex flex-col border border-orange-500/30">
            {/* Header */}
            <div className="px-6 pt-8 pb-5 text-white">
              <div className="text-4xl mb-3">🧟🎃👻</div>
              <div className="text-xs font-bold uppercase tracking-widest text-orange-400 mb-1">Evento anual especial</div>
              <h3 className="text-2xl font-black mb-1">Noche de Halloween</h3>
              <div className="text-orange-400 font-black text-sm mb-3">«Apocalipsis Zombie»</div>
              <p className="text-gray-300 text-sm leading-relaxed">
                Una noche épica e inolvidable. Fiesta de pijamas temática, gymkana zombie, actividades nocturnas, película de terror y desayuno con churros al amanecer.
              </p>
            </div>

            {/* Info rápida */}
            <div className="mx-4 bg-orange-500/10 border border-orange-500/20 rounded-2xl p-4 text-white text-sm space-y-2 mb-4">
              <div className="flex items-center gap-2"><span className="text-lg">📅</span><span>31 oct → 1 nov 2026</span></div>
              <div className="flex items-center gap-2"><span className="text-lg">🕙</span><span><strong>22:00 – 09:00</strong> del día siguiente</span></div>
              <div className="flex items-center gap-2"><span className="text-lg">👦</span><span>Edad mínima: <strong>10 años</strong></span></div>
              <div className="flex items-center gap-2"><span className="text-lg">🎯</span><span>Plazas muy limitadas: <strong>20 max</strong></span></div>
            </div>

            {/* Programa */}
            <div className="mx-4 mb-4">
              <div className="text-xs font-black text-orange-400 uppercase tracking-wider mb-3">Programa de la noche</div>
              <div className="space-y-2">
                {[
                  { hora: '22:00', evento: 'Inicio del apocalipsis 🧟', color: 'text-orange-400' },
                  { hora: '22:00 – 23:00', evento: 'Gymkana temática zombie', color: 'text-gray-300' },
                  { hora: '23:00 – 00:00', evento: 'Actividades y retos especiales', color: 'text-gray-300' },
                  { hora: '00:00+', evento: 'Práctica libre', color: 'text-gray-300' },
                  { hora: 'Madrugada', evento: '🎬 Película de terror (+10 años)', color: 'text-gray-300' },
                  { hora: '08:00 – 09:00', evento: '🍫 Desayuno: churros con chocolate', color: 'text-orange-300' },
                  { hora: '09:00', evento: 'Recogida por las familias', color: 'text-gray-400' },
                ].map(({ hora, evento, color }) => (
                  <div key={hora} className="flex items-start gap-3 text-xs">
                    <span className="text-orange-500 font-black shrink-0 w-24">{hora}</span>
                    <span className={color}>{evento}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-auto px-4 pb-6">
              <button onClick={() => setModalAbierto('halloween')}
                className="w-full bg-orange-600 hover:bg-orange-500 text-white font-black py-3.5 rounded-xl transition-colors shadow-lg">
                🧟 Reservar plaza — Edición 2026
              </button>
              <p className="text-center text-xs text-orange-400/70 mt-2">Plazas muy limitadas · Respuesta en 24h</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── MODALES ── */}
      {modalAbierto === 'diassinc' && (
        <ModalReserva titulo="⚡ Reservar — Días Sin Cole" onClose={() => setModalAbierto(null)}>
          <ReservaDiasSinCole onClose={() => setModalAbierto(null)}/>
        </ModalReserva>
      )}
      {modalAbierto === 'domingos' && (
        <ModalReserva titulo="👨‍👩‍👧‍👦 Reservar — Domingos en Familia" onClose={() => setModalAbierto(null)}>
          <ReservaDomingos onClose={() => setModalAbierto(null)}/>
        </ModalReserva>
      )}
      {modalAbierto === 'halloween' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setModalAbierto(null)}/>
          <div className="relative bg-gray-900 border border-orange-500/30 rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="bg-orange-950/60 border-b border-orange-500/30 text-white px-6 py-4 rounded-t-2xl flex items-center justify-between sticky top-0">
              <h3 className="font-black text-base text-orange-400">🧟 Reservar — Noche de Halloween</h3>
              <button onClick={() => setModalAbierto(null)} className="text-orange-300/60 hover:text-orange-300">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>
            <div className="p-6"><ReservaHalloween onClose={() => setModalAbierto(null)}/></div>
          </div>
        </div>
      )}
    </section>
  )
}
