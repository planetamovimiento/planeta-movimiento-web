'use client'

import { useState } from 'react'
import { submitSocio } from '@/lib/forms/actions'
import { TALLAS_EQUIPACION, eurosCuota, importeCuotaSugeridoCents } from '@/lib/club/cuota'
import { edadDe } from '@/lib/club/constants'
import { CLUB_IBAN, CLUB_TITULAR, conceptoPagoSocio } from '@/lib/club/pago'

// ─────────────────────────────────────────────────────────────────────────────
// "Hazte socio": botón + formulario de alta para el padre/madre/tutor. Permite
// añadir varios hijos en un solo envío. Conecta con el CRM (submitSocio). Pago
// siempre manual (efectivo o transferencia): NO hay carrito ni pasarela.
// ─────────────────────────────────────────────────────────────────────────────

export type SocioInfo = {
  temporada: string          // display: "2026-2027"
  reducidaCents: number
  normalCents: number
  fechaLimiteReducida: string // ISO
  iban: string
  conceptoTransferencia: string
}

const ACTIVIDADES_SOCIO = ['Gimnasia Acrobática', 'Telas Aéreas', 'Escuela de Bienestar', 'Jiu-Jitsu Brasileño', 'Escuela Infantil', 'Circo Inclusivo']

type Hijo = { nombre: string; apellidos: string; fechaNacimiento: string; actividades: string[]; talla: string; observaciones: string }
const hijoVacio = (): Hijo => ({ nombre: '', apellidos: '', fechaNacimiento: '', actividades: [], talla: '', observaciones: '' })

const inputCls = 'w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-pm-red'
const lblCls = 'block text-xs font-semibold text-pm-navy mb-1.5'

export function BotonHazteSocio({ info, variant = 'principal' }: { info: SocioInfo; variant?: 'principal' | 'secundario' }) {
  const [open, setOpen] = useState(false)
  const cls = variant === 'principal'
    ? 'inline-block bg-pm-red hover:bg-pm-red-dark text-white font-black px-8 py-3.5 rounded-xl transition-colors text-center'
    : 'inline-block bg-pm-navy hover:bg-pm-navy-md text-white font-bold px-6 py-3 rounded-xl transition-colors text-sm text-center'
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={cls}>Hazte socio</button>
      {open && <FormularioSocio info={info} onClose={() => setOpen(false)} />}
    </>
  )
}

function FormularioSocio({ info, onClose }: { info: SocioInfo; onClose: () => void }) {
  const [tutor, setTutor] = useState({ nombre: '', apellidos: '', dni: '', telefono: '', email: '', direccion: '', observaciones: '' })
  const [hijos, setHijos] = useState<Hijo[]>([hijoVacio()])
  const [hp, setHp] = useState('')
  const [renderedAt] = useState(() => Date.now())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [enviado, setEnviado] = useState(false)

  const setHijo = (i: number, patch: Partial<Hijo>) => setHijos(hs => hs.map((h, j) => j === i ? { ...h, ...patch } : h))
  const toggleAct = (i: number, act: string) => setHijo(i, {
    actividades: hijos[i].actividades.includes(act) ? hijos[i].actividades.filter(a => a !== act) : [...hijos[i].actividades, act],
  })
  const addHijo = () => setHijos(hs => [...hs, hijoVacio()])
  const quitarHijo = (i: number) => setHijos(hs => hs.length > 1 ? hs.filter((_, j) => j !== i) : hs)

  const importeHoy = importeCuotaSugeridoCents()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')
    let r: { ok: boolean; error?: string | null }
    try {
      r = await submitSocio({
        tutor,
        participantes: hijos.filter(h => h.nombre.trim()).map(h => ({
          nombre: h.nombre, apellidos: h.apellidos, fechaNacimiento: h.fechaNacimiento,
          actividades: h.actividades.join(', '), talla: h.talla, observaciones: h.observaciones,
        })),
        seguridad: { hp, renderedAt },
      })
    } catch {
      r = { ok: false, error: 'No se pudo enviar. Revisa tu conexión e inténtalo de nuevo.' }
    }
    setLoading(false)
    if (!r?.ok) { setError(r?.error || 'No se pudo enviar. Inténtalo de nuevo en unos minutos.'); return }
    setEnviado(true)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 overflow-y-auto">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-6">
        {/* Header */}
        <div className="bg-pm-navy text-white px-6 py-5 rounded-t-2xl flex items-center justify-between sticky top-0 z-10">
          <div>
            <h2 className="text-lg font-black">Hazte socio del Club Deportivo Origen</h2>
            <p className="text-white/60 text-sm">Temporada {info.temporada}</p>
          </div>
          <button onClick={onClose} className="text-white/60 hover:text-white transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>

        {enviado ? (
          <div className="p-10 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/></svg>
            </div>
            <h3 className="text-xl font-black text-pm-navy mb-2">Solicitud de alta como socio recibida correctamente</h3>
            <p className="text-gray-500 text-sm mb-6 max-w-md mx-auto">
              Recuerda realizar el pago por transferencia o en la instalación para completar el alta.
            </p>
            <button onClick={onClose} className="bg-pm-red hover:bg-pm-red-dark text-white font-bold px-8 py-3 rounded-xl transition-colors">Cerrar</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* honeypot */}
            <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" value={hp} onChange={e => setHp(e.target.value)} className="absolute -left-[9999px] w-px h-px opacity-0" />

            {/* Datos del tutor */}
            <section className="space-y-3">
              <h3 className="text-xs font-black text-pm-red uppercase tracking-widest">Datos del tutor</h3>
              <p className="text-xs text-gray-400 -mt-1">Persona que realiza el alta (padre, madre o tutor legal).</p>
              <div className="grid sm:grid-cols-2 gap-3">
                <div><label className={lblCls}>Nombre *</label><input required className={inputCls} value={tutor.nombre} onChange={e => setTutor({ ...tutor, nombre: e.target.value })} /></div>
                <div><label className={lblCls}>Apellidos *</label><input required className={inputCls} value={tutor.apellidos} onChange={e => setTutor({ ...tutor, apellidos: e.target.value })} /></div>
                <div><label className={lblCls}>DNI / NIE</label><input className={inputCls} value={tutor.dni} onChange={e => setTutor({ ...tutor, dni: e.target.value })} /></div>
                <div><label className={lblCls}>Teléfono *</label><input required type="tel" className={inputCls} value={tutor.telefono} onChange={e => setTutor({ ...tutor, telefono: e.target.value })} /></div>
                <div><label className={lblCls}>Correo electrónico *</label><input required type="email" className={inputCls} value={tutor.email} onChange={e => setTutor({ ...tutor, email: e.target.value })} /></div>
                <div><label className={lblCls}>Dirección <span className="text-gray-400 font-normal">(opcional)</span></label><input className={inputCls} value={tutor.direccion} onChange={e => setTutor({ ...tutor, direccion: e.target.value })} /></div>
              </div>
              <div><label className={lblCls}>Observaciones</label><textarea className={`${inputCls} min-h-[44px]`} value={tutor.observaciones} onChange={e => setTutor({ ...tutor, observaciones: e.target.value })} /></div>
              <p className="text-xs text-gray-400">El correo se usará para vincular el alta con el Portal de Familias.</p>
            </section>

            {/* Participantes */}
            <section className="space-y-3">
              <h3 className="text-xs font-black text-pm-red uppercase tracking-widest">Participantes asociados</h3>
              {hijos.map((h, i) => {
                const edad = h.fechaNacimiento ? edadDe(h.fechaNacimiento) : null
                return (
                  <div key={i} className="border border-gray-100 rounded-xl p-4 space-y-3 bg-pm-bg">
                    <div className="flex items-center justify-between">
                      <div className="font-black text-pm-navy text-sm">Participante {i + 1}</div>
                      {hijos.length > 1 && <button type="button" onClick={() => quitarHijo(i)} className="text-xs text-gray-400 hover:text-red-500">Quitar</button>}
                    </div>
                    <div className="grid sm:grid-cols-2 gap-3">
                      <div><label className={lblCls}>Nombre *</label><input required className={inputCls} value={h.nombre} onChange={e => setHijo(i, { nombre: e.target.value })} /></div>
                      <div><label className={lblCls}>Apellidos *</label><input required className={inputCls} value={h.apellidos} onChange={e => setHijo(i, { apellidos: e.target.value })} /></div>
                      <div>
                        <label className={lblCls}>Fecha de nacimiento *{edad != null && <span className="text-gray-400 font-normal"> · {edad} años</span>}</label>
                        <input required type="date" className={inputCls} value={h.fechaNacimiento} onChange={e => setHijo(i, { fechaNacimiento: e.target.value })} />
                      </div>
                      <div>
                        <label className={lblCls}>Talla de equipación</label>
                        <select className={`${inputCls} bg-white`} value={h.talla} onChange={e => setHijo(i, { talla: e.target.value })}>
                          <option value="">— Sin definir —</option>
                          {TALLAS_EQUIPACION.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className={lblCls}>Actividad(es) en las que está inscrito</label>
                      <div className="flex flex-wrap gap-1.5">
                        {ACTIVIDADES_SOCIO.map(act => (
                          <button key={act} type="button" onClick={() => toggleAct(i, act)}
                            className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors ${h.actividades.includes(act) ? 'bg-pm-red border-pm-red text-white' : 'border-gray-200 text-gray-600 hover:border-pm-red'}`}>
                            {act}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div><label className={lblCls}>Observaciones <span className="text-gray-400 font-normal">(opcional)</span></label><input className={inputCls} value={h.observaciones} onChange={e => setHijo(i, { observaciones: e.target.value })} /></div>
                  </div>
                )
              })}
              <button type="button" onClick={addHijo} className="w-full border-2 border-dashed border-gray-200 hover:border-pm-red text-sm font-bold text-gray-500 hover:text-pm-red rounded-xl py-2.5">
                + Añadir otro participante
              </button>
            </section>

            {/* Cuota + pago */}
            <section className="rounded-xl border border-pm-red/20 bg-pm-red-light p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-pm-navy">Cuota de socio {info.temporada}</span>
                <span className="text-lg font-black text-pm-red">{eurosCuota(importeHoy)}</span>
              </div>
              <p className="text-xs text-gray-600">
                {eurosCuota(info.reducidaCents)} hasta el 27/09/2026 · {eurosCuota(info.normalCents)} a partir del 28/09. El importe se confirma al registrar el pago.
              </p>
              <div className="text-xs text-gray-600 border-t border-pm-red/15 pt-2 space-y-0.5">
                <div className="font-bold text-pm-navy mb-0.5">Formas de pago (sin cobro online):</div>
                <div>· En efectivo en las instalaciones.</div>
                <div>· Por transferencia a <span className="font-mono font-semibold text-pm-navy">{info.iban || CLUB_IBAN}</span> <span className="text-gray-400">(titular {CLUB_TITULAR})</span>.</div>
                <div>· Concepto de la transferencia: «<span className="font-semibold text-pm-navy">{conceptoPagoSocio()}</span>».</div>
              </div>
            </section>

            {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2" role="alert">{error}</p>}

            <div className="flex gap-2">
              <button type="submit" disabled={loading} className="flex-1 bg-pm-red hover:bg-pm-red-dark disabled:opacity-50 text-white font-black text-sm tracking-wide uppercase py-4 rounded-xl transition-colors">
                {loading ? 'Enviando…' : 'Enviar solicitud de alta'}
              </button>
              <button type="button" onClick={onClose} className="px-4 text-sm font-bold text-gray-400 hover:text-pm-navy">Cancelar</button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
