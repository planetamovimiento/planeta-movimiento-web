'use client'

import { useState, useMemo } from 'react'
import { submitBooking } from '@/lib/forms/actions'

// ─── Constantes ───────────────────────────────────────────────────────────────
const IVA = 0.21
const PACK_BASICO  = { nombre: 'Pack Básico',  precio: 150, monitores: 1, maxParticipantes: 12 }
const PACK_GRANDE  = { nombre: 'Pack Grande',  precio: 250, monitores: 2, maxParticipantes: Infinity }
const PRECIO_HORA_EXTRA = 40  // € por hora y por monitor

const EXTRAS = [
  { id: 'pintacaras',  label: 'Pintacaras + tatuajes temporales', precio: 50,  icon: '🎨', desc: 'Pintacaras artístico y tatuajes temporales infantiles' },
  { id: 'airtrack',   label: 'AirTrack',                          precio: 250, icon: '🤸', desc: 'Colchoneta hinchable profesional para saltos y acrobacias' },
  { id: 'portico',    label: 'Pórtico aéreo',                     precio: 300, icon: '🎪', desc: 'Estructura aérea portátil con telas para circo aéreo' },
]

const TIPOS_EVENTO = [
  'Boda', 'Comunión', 'Bautizo', 'Fiesta privada', 'Evento familiar', 'Celebración especial', 'Otro',
]

// ─── Cálculo ──────────────────────────────────────────────────────────────────
function calcular(participantes: number, extrasIds: Set<string>, horasExtra: number) {
  const pack = participantes > 12 ? PACK_GRANDE : PACK_BASICO
  const baseNet = pack.precio
  const extrasNet = EXTRAS.filter(e => extrasIds.has(e.id)).reduce((s, e) => s + e.precio, 0)
  const horasNet = horasExtra * PRECIO_HORA_EXTRA * pack.monitores
  const subtotalNet = baseNet + extrasNet + horasNet
  const ivaAmount = Math.round(subtotalNet * IVA * 100) / 100
  const total = Math.round((subtotalNet + ivaAmount) * 100) / 100
  return { pack, baseNet, extrasNet, horasNet, subtotalNet, ivaAmount, total }
}

// ─── Componente ──────────────────────────────────────────────────────────────
export default function CalculadoraEventos() {
  const [participantes, setParticipantes] = useState<number>(10)
  const [extrasIds, setExtrasIds] = useState<Set<string>>(new Set())
  const [horasExtra, setHorasExtra] = useState(0)
  const [form, setForm] = useState({
    nombre: '', apellidos: '', telefono: '', email: '',
    tipoEvento: '', fecha: '', ubicacion: '', horario: '', observaciones: '',
  })
  const [enviado, setEnviado] = useState(false)
  const [enviando, setEnviando] = useState(false)

  const { pack, baseNet, extrasNet, horasNet, subtotalNet, ivaAmount, total } = useMemo(
    () => calcular(participantes, extrasIds, horasExtra),
    [participantes, extrasIds, horasExtra]
  )

  const packCambia = participantes === 13 // justo el umbral

  function toggleExtra(id: string) {
    setExtrasIds(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setEnviando(true)
    const extras = EXTRAS.filter(x => extrasIds.has(x.id)).map(x => x.label).join(', ')
    await submitBooking({
      servicio: `Evento · ${form.tipoEvento || 'externo'}`,
      cliente_nombre: `${form.nombre} ${form.apellidos}`.trim(),
      cliente_email: form.email,
      cliente_telefono: form.telefono,
      fecha: form.fecha || undefined,
      hora: form.horario,
      participantes,
      precio: total,
      observaciones: form.observaciones,
      datos: {
        tipoEvento: form.tipoEvento, ubicacion: form.ubicacion,
        pack: pack.nombre, extras: extras || 'Ninguno', horasExtra,
        totalConIva: `${total} €`,
      },
    })
    setEnviando(false)
    setEnviado(true)
  }

  if (enviado) return (
    <div className="text-center py-12">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
        <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/>
        </svg>
      </div>
      <h3 className="text-2xl font-black text-pm-navy mb-3">¡Solicitud recibida!</h3>
      <p className="text-gray-600 text-sm max-w-sm mx-auto mb-2">
        Nos pondremos en contacto contigo en menos de 24 horas para confirmar todos los detalles del evento.
      </p>
      <div className="inline-block bg-pm-bg border border-gray-200 rounded-xl px-5 py-3 text-sm text-pm-navy mt-4">
        <span className="font-semibold">{pack.nombre}</span> · {participantes} participantes · <strong>{total} € (IVA incl.)</strong>
      </div>
      <div className="mt-6">
        <button onClick={() => setEnviado(false)} className="text-pm-red underline text-sm">Enviar otra solicitud</button>
      </div>
    </div>
  )

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-10" id="reservar">

      {/* ── FORMULARIO ── */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <h2 className="text-2xl font-black text-pm-navy">Solicita tu presupuesto</h2>

        {/* Datos personales */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-4">
          <div className="text-xs font-black text-pm-navy uppercase tracking-wider pb-2 border-b border-gray-100">1. Tus datos</div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Nombre *</label>
              <input required type="text" value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-pm-red" placeholder="Ana"/>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Apellidos *</label>
              <input required type="text" value={form.apellidos} onChange={e => setForm(f => ({ ...f, apellidos: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-pm-red" placeholder="García López"/>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Teléfono *</label>
              <input required type="tel" value={form.telefono} onChange={e => setForm(f => ({ ...f, telefono: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-pm-red" placeholder="600 000 000"/>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Email *</label>
              <input required type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-pm-red" placeholder="correo@email.com"/>
            </div>
          </div>
        </div>

        {/* Detalles del evento */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-4">
          <div className="text-xs font-black text-pm-navy uppercase tracking-wider pb-2 border-b border-gray-100">2. Tu evento</div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Tipo de evento *</label>
              <select required value={form.tipoEvento} onChange={e => setForm(f => ({ ...f, tipoEvento: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-pm-red bg-white">
                <option value="">— Selecciona —</option>
                {TIPOS_EVENTO.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Fecha del evento *</label>
              <input required type="date" value={form.fecha} onChange={e => setForm(f => ({ ...f, fecha: e.target.value }))}
                min={new Date().toISOString().slice(0, 10)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-pm-red"/>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Dirección / Ubicación del evento *</label>
            <input required type="text" value={form.ubicacion} onChange={e => setForm(f => ({ ...f, ubicacion: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-pm-red"
              placeholder="Finca Las Acacias, Calle Mayor 15, Hotel XYZ..."/>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Horario deseado</label>
            <input type="text" value={form.horario} onChange={e => setForm(f => ({ ...f, horario: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-pm-red"
              placeholder="Ej. de 17:00 a 19:00"/>
          </div>
        </div>

        {/* Participantes */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <div className="text-xs font-black text-pm-navy uppercase tracking-wider pb-3 border-b border-gray-100 mb-4">3. Número de niños participantes</div>
          <div className="flex items-center gap-5 mb-4">
            <button type="button" onClick={() => setParticipantes(p => Math.max(1, p - 1))}
              className="w-11 h-11 bg-pm-bg border border-gray-200 rounded-xl text-xl font-bold hover:border-pm-red transition-colors">−</button>
            <div className="flex-1 text-center">
              <div className="text-5xl font-black text-pm-navy">{participantes}</div>
              <div className="text-xs text-gray-400 mt-1">participantes</div>
            </div>
            <button type="button" onClick={() => setParticipantes(p => p + 1)}
              className="w-11 h-11 bg-pm-bg border border-gray-200 rounded-xl text-xl font-bold hover:border-pm-red transition-colors">+</button>
          </div>

          {/* Pack asignado automáticamente */}
          <div className={`rounded-xl p-4 text-center border-2 transition-all ${
            participantes > 12
              ? 'bg-pm-red-light border-pm-red'
              : 'bg-green-50 border-green-300'
          }`}>
            <div className={`font-black text-base ${participantes > 12 ? 'text-pm-red' : 'text-green-700'}`}>
              {pack.nombre} — asignado automáticamente
            </div>
            <div className={`text-xs mt-1 ${participantes > 12 ? 'text-pm-red/70' : 'text-green-600'}`}>
              {participantes > 12
                ? `Más de 12 participantes → Pack Grande obligatorio (2 monitores)`
                : `Hasta 12 participantes → Pack Básico (1 monitor)`
              }
            </div>
            {packCambia && (
              <div className="mt-2 text-xs font-bold text-amber-600">⚠ Estás justo en el límite. Con 13 o más → Pack Grande</div>
            )}
          </div>
        </div>

        {/* Extras */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <div className="text-xs font-black text-pm-navy uppercase tracking-wider pb-3 border-b border-gray-100 mb-4">4. Extras opcionales</div>
          <div className="space-y-3">
            {EXTRAS.map(extra => (
              <button key={extra.id} type="button" onClick={() => toggleExtra(extra.id)}
                className={`w-full flex items-center gap-4 border-2 rounded-xl p-4 text-left transition-all ${
                  extrasIds.has(extra.id) ? 'border-pm-red bg-pm-red-light' : 'border-gray-200 hover:border-pm-red/40'
                }`}>
                <span className="text-2xl shrink-0">{extra.icon}</span>
                <div className="flex-1">
                  <div className={`font-bold text-sm ${extrasIds.has(extra.id) ? 'text-pm-red' : 'text-pm-navy'}`}>{extra.label}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{extra.desc}</div>
                </div>
                <div className={`font-black text-base shrink-0 ${extrasIds.has(extra.id) ? 'text-pm-red' : 'text-gray-400'}`}>
                  +{extra.precio} €
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                  extrasIds.has(extra.id) ? 'bg-pm-red border-pm-red' : 'border-gray-300'
                }`}>
                  {extrasIds.has(extra.id) && <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/></svg>}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Horas extra */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <div className="text-xs font-black text-pm-navy uppercase tracking-wider pb-3 border-b border-gray-100 mb-4">5. Horas adicionales</div>
          <p className="text-xs text-gray-500 mb-4">
            Los packs incluyen 2 horas. Cada hora extra: <strong>40 € × {pack.monitores} monitor{pack.monitores > 1 ? 'es' : ''} = {40 * pack.monitores} €</strong>
          </p>
          <div className="flex items-center gap-5">
            <button type="button" onClick={() => setHorasExtra(h => Math.max(0, h - 1))}
              className="w-11 h-11 bg-pm-bg border border-gray-200 rounded-xl text-xl font-bold hover:border-pm-red transition-colors">−</button>
            <div className="flex-1 text-center">
              <div className="text-4xl font-black text-pm-navy">{horasExtra}</div>
              <div className="text-xs text-gray-400 mt-1">hora{horasExtra !== 1 ? 's' : ''} extra</div>
            </div>
            <button type="button" onClick={() => setHorasExtra(h => Math.min(6, h + 1))}
              className="w-11 h-11 bg-pm-bg border border-gray-200 rounded-xl text-xl font-bold hover:border-pm-red transition-colors">+</button>
          </div>
          {horasExtra > 0 && (
            <div className="mt-3 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2 text-xs text-blue-700 text-center">
              {horasExtra}h × {pack.monitores} monitor{pack.monitores > 1 ? 'es' : ''} × 40 € = <strong>{horasNet} €</strong>
            </div>
          )}
        </div>

        {/* Observaciones */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <div className="text-xs font-black text-pm-navy uppercase tracking-wider pb-3 border-b border-gray-100 mb-4">6. Observaciones</div>
          <textarea rows={3} value={form.observaciones} onChange={e => setForm(f => ({ ...f, observaciones: e.target.value }))}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-pm-red resize-none"
            placeholder="Temática del evento, necesidades especiales, rango de edad de los niños, alergias, etc."/>
        </div>

        <button type="submit" disabled={!form.nombre || !form.email || !form.telefono || !form.tipoEvento || !form.fecha || !form.ubicacion || enviando}
          className="w-full bg-pm-red hover:bg-pm-red-dark disabled:opacity-50 disabled:cursor-not-allowed text-white font-black text-sm tracking-widest uppercase py-5 rounded-2xl transition-colors shadow-lg">
          {enviando ? 'Enviando...' : `Solicitar presupuesto — ${total} € (IVA incl.)`}
        </button>
        <p className="text-center text-xs text-gray-400">
          Recibirás respuesta en menos de 24 horas · Sin compromiso
        </p>
      </form>

      {/* ── CALCULADORA STICKY ── */}
      <div className="lg:sticky lg:top-24 lg:self-start">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-pm-navy text-white px-5 py-4">
            <div className="font-black text-base">💰 Calculadora de precio</div>
            <div className="text-white/60 text-xs mt-0.5">Se actualiza en tiempo real</div>
          </div>
          <div className="p-5 space-y-3">

            {/* Pack */}
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <div>
                <div className="font-bold text-pm-navy text-sm">{pack.nombre}</div>
                <div className="text-xs text-gray-500">{pack.monitores} monitor{pack.monitores > 1 ? 'es'  : ''} · 2 horas base · hasta {pack.maxParticipantes === Infinity ? '+12' : pack.maxParticipantes} niños</div>
              </div>
              <div className="font-black text-pm-navy">{baseNet} €</div>
            </div>

            {/* Extras */}
            {EXTRAS.filter(e => extrasIds.has(e.id)).map(e => (
              <div key={e.id} className="flex justify-between items-center py-1.5 border-b border-gray-50 text-sm">
                <span className="text-gray-600">{e.icon} {e.label}</span>
                <span className="font-semibold text-pm-navy">+{e.precio} €</span>
              </div>
            ))}

            {/* Horas extra */}
            {horasExtra > 0 && (
              <div className="flex justify-between items-center py-1.5 border-b border-gray-50 text-sm">
                <span className="text-gray-600">⏱ {horasExtra}h extra ({pack.monitores} monitor{pack.monitores > 1 ? 'es' : ''})</span>
                <span className="font-semibold text-pm-navy">+{horasNet} €</span>
              </div>
            )}

            {/* Subtotal */}
            <div className="flex justify-between items-center py-2 border-b border-gray-200 text-sm">
              <span className="font-semibold text-gray-700">Subtotal (sin IVA)</span>
              <span className="font-bold text-pm-navy">{subtotalNet} €</span>
            </div>

            {/* IVA */}
            <div className="flex justify-between items-center text-sm text-gray-500">
              <span>IVA (21%)</span>
              <span>+{ivaAmount} €</span>
            </div>

            {/* Total */}
            <div className="bg-pm-red-light border border-pm-red/20 rounded-xl p-4 flex justify-between items-center mt-2">
              <div>
                <div className="font-black text-pm-red text-lg">Total</div>
                <div className="text-xs text-gray-500">IVA incluido</div>
              </div>
              <div className="text-3xl font-black text-pm-red">{total} €</div>
            </div>

            {/* Info */}
            <div className="space-y-2 pt-1">
              <div className="flex items-start gap-2 text-xs text-gray-500">
                <span className="text-green-500 font-bold shrink-0 mt-0.5">✓</span>
                Nos desplazamos al lugar del evento
              </div>
              <div className="flex items-start gap-2 text-xs text-gray-500">
                <span className="text-green-500 font-bold shrink-0 mt-0.5">✓</span>
                Todo el material incluido
              </div>
              <div className="flex items-start gap-2 text-xs text-gray-500">
                <span className="text-green-500 font-bold shrink-0 mt-0.5">✓</span>
                Respuesta en menos de 24 horas
              </div>
            </div>

            <a href="#reservar"
              className="block w-full bg-pm-red hover:bg-pm-red-dark text-white font-black text-sm text-center py-3 rounded-xl transition-colors mt-2">
              Solicitar presupuesto →
            </a>
          </div>
        </div>

        {/* FAQ rápido */}
        <div className="mt-5 bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
          <div className="font-black text-pm-navy text-sm mb-2">¿Tienes dudas?</div>
          <a href="tel:+34969000000" className="flex items-center gap-2 text-sm text-pm-navy hover:text-pm-red transition-colors font-semibold">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
            969 000 000
          </a>
          <a href="https://wa.me/34969000000" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-green-600 hover:text-green-700 transition-colors font-semibold">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            WhatsApp
          </a>
        </div>
      </div>
    </div>
  )
}
