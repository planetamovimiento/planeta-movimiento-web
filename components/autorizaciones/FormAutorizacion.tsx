'use client'

import { useState } from 'react'
import { CANALES, RELACIONES, TEXTO, validarFirma, type CanalId, type DatosFirma } from '@/lib/autorizaciones/documento'
import { useProteccion, ProteccionCampos, type SeguridadValores } from '@/components/seguridad/ProteccionFormulario'

// Formulario de la autorización de imagen. Lo usan el Portal de Familias (menor
// fijo, correo de la cuenta) y la página pública /autorizacion (menores, correo
// y actividad editables). Firmar = marcar las opciones + datos del tutor +
// declaración, y pulsar «Firmar»: el servidor guarda fecha, IP y versión del texto.

export type EnvioAutorizacion = {
  firma: DatosFirma
  menores: string[]
  email: string
  actividad: string
  seguridad: SeguridadValores
}

const VACIA: DatosFirma = {
  tutorNombre: '', tutorDni: '', relacion: '',
  canales: { web: null, redes: null, material: null, memorias: null },
  declaracion: false, conformidadMenor: false,
}

export default function FormAutorizacion({ menoresFijos, emailFijo, actividadInicial = '', inicial, onFirmar, onHecho }: {
  /** Portal: el menor ya se sabe. Sin esto, se piden los nombres. */
  menoresFijos?: string[]
  /** Portal: el correo de la cuenta. Sin esto, se pide. */
  emailFijo?: string
  actividadInicial?: string
  inicial?: Partial<DatosFirma>
  onFirmar: (e: EnvioAutorizacion) => Promise<{ ok: boolean; error?: string }>
  onHecho?: () => void
}) {
  const [f, setF] = useState<DatosFirma>({ ...VACIA, ...inicial, canales: { ...VACIA.canales, ...inicial?.canales } })
  const [menores, setMenores] = useState<string[]>(menoresFijos ?? [''])
  const [email, setEmail] = useState(emailFijo ?? '')
  const [actividad, setActividad] = useState(actividadInicial)
  const [error, setError] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [hecho, setHecho] = useState(false)
  const { valores, hpRef, onToken } = useProteccion()

  const publico = !menoresFijos
  const set = <K extends keyof DatosFirma>(k: K, v: DatosFirma[K]) => setF(p => ({ ...p, [k]: v }))
  const setCanal = (id: CanalId, v: boolean) => setF(p => ({ ...p, canales: { ...p.canales, [id]: v } }))
  const todos = (v: boolean) => setF(p => ({ ...p, canales: { web: v, redes: v, material: v, memorias: v } }))

  async function firmar(e: React.FormEvent) {
    e.preventDefault()
    const nombres = menores.map(m => m.trim()).filter(Boolean)
    const err = !nombres.length ? 'Escribe el nombre y apellidos del menor.'
      : nombres.some(n => n.length < 4) ? 'Escribe el nombre y apellidos completos de cada menor.'
      : publico && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ? 'Escribe un correo electrónico válido para enviarte el justificante.'
      : validarFirma(f)
    setError(err)
    if (err) return
    setEnviando(true)
    const r = await onFirmar({ firma: f, menores: nombres, email: email.trim(), actividad: actividad.trim(), seguridad: valores() })
    setEnviando(false)
    if (!r.ok) { setError(r.error || 'No se ha podido firmar. Inténtalo de nuevo.'); return }
    setHecho(true)
    onHecho?.()
  }

  if (hecho) {
    return (
      <div role="status" className="rounded-2xl bg-green-50 border border-green-200 p-5 text-sm text-green-800">
        <div className="font-black text-base mb-1">Autorización firmada. ¡Gracias!</div>
        Te hemos enviado el justificante por correo. Puedes cambiar tu elección cuando quieras.
      </div>
    )
  }

  const input = 'w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-pm-navy'
  const parrafo = 'text-[13px] leading-relaxed text-gray-600'

  return (
    <form onSubmit={firmar} className="space-y-5" noValidate>
      {publico && <ProteccionCampos hpRef={hpRef} onToken={onToken} />}

      {/* Texto completo del documento */}
      <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 max-h-72 overflow-y-auto space-y-3" tabIndex={0} aria-label="Texto de la autorización">
        <p className={parrafo}>{TEXTO.autorizo}</p>
        <p className={parrafo}><b>Finalidad y medios de difusión.</b> {TEXTO.finalidad}</p>
        <ul className={`${parrafo} list-disc pl-5`}>{CANALES.map(c => <li key={c.id}>{c.label}</li>)}</ul>
        <p className={parrafo}>{TEXTO.limite}</p>
        <p className={parrafo}>{TEXTO.internet}</p>
        <p className={parrafo}>{TEXTO.voluntario}</p>
        <p className={parrafo}><b>Protección de datos.</b> {TEXTO.proteccion}</p>
      </div>

      {/* Menores */}
      {publico ? (
        <fieldset className="space-y-2">
          <legend className="text-sm font-black text-pm-navy mb-1">Menor{menores.length > 1 ? 'es' : ''}</legend>
          {menores.map((m, i) => (
            <div key={i} className="flex gap-2">
              <input value={m} onChange={e => setMenores(p => p.map((x, j) => (j === i ? e.target.value : x)))}
                placeholder="Nombre y apellidos del menor" aria-label={`Nombre y apellidos del menor ${i + 1}`} className={input} />
              {menores.length > 1 && (
                <button type="button" onClick={() => setMenores(p => p.filter((_, j) => j !== i))}
                  className="text-xs text-gray-400 hover:text-red-600 px-2" aria-label={`Quitar menor ${i + 1}`}>Quitar</button>
              )}
            </div>
          ))}
          {menores.length < 6 && (
            <button type="button" onClick={() => setMenores(p => [...p, ''])} className="text-xs font-bold text-pm-red">
              + Añadir otro hermano/a
            </button>
          )}
        </fieldset>
      ) : (
        <div className="text-sm text-pm-navy">Menor: <b>{menores.join(', ')}</b></div>
      )}

      {/* Las cuatro opciones */}
      <fieldset>
        <legend className="text-sm font-black text-pm-navy">¿Dónde podemos usar sus fotos y vídeos?</legend>
        <div className="flex gap-2 mt-2 mb-3">
          <button type="button" onClick={() => todos(true)} className="text-xs font-bold px-3 py-1.5 rounded-full border border-green-300 text-green-700 hover:bg-green-50">Autorizo todo</button>
          <button type="button" onClick={() => todos(false)} className="text-xs font-bold px-3 py-1.5 rounded-full border border-gray-300 text-gray-600 hover:bg-gray-50">No autorizo nada</button>
        </div>
        <div className="space-y-2">
          {CANALES.map(c => {
            const v = f.canales[c.id]
            return (
              <div key={c.id} role="radiogroup" aria-label={c.label}
                className={`rounded-xl border p-3 flex flex-col sm:flex-row sm:items-center gap-2 ${v == null ? 'border-gray-200' : v ? 'border-green-300 bg-green-50/50' : 'border-red-200 bg-red-50/40'}`}>
                <span className="flex-1 text-sm text-gray-700">{c.label}</span>
                <div className="flex gap-2 shrink-0">
                  <button type="button" role="radio" aria-checked={v === true} onClick={() => setCanal(c.id, true)}
                    className={`text-xs font-bold px-3 py-2 rounded-lg border ${v === true ? 'bg-green-600 border-green-600 text-white' : 'border-gray-300 text-gray-600 hover:border-green-500'}`}>
                    Autorizo
                  </button>
                  <button type="button" role="radio" aria-checked={v === false} onClick={() => setCanal(c.id, false)}
                    className={`text-xs font-bold px-3 py-2 rounded-lg border ${v === false ? 'bg-red-600 border-red-600 text-white' : 'border-gray-300 text-gray-600 hover:border-red-500'}`}>
                    No autorizo
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </fieldset>

      {/* Tutor */}
      <fieldset className="space-y-3">
        <legend className="text-sm font-black text-pm-navy mb-1">Padre, madre o tutor/a legal</legend>
        <div className="grid sm:grid-cols-2 gap-3">
          <label className="text-xs text-gray-500 space-y-1 block">Nombre y apellidos
            <input value={f.tutorNombre} onChange={e => set('tutorNombre', e.target.value)} autoComplete="name" className={input} />
          </label>
          <label className="text-xs text-gray-500 space-y-1 block">DNI / NIE
            <input value={f.tutorDni} onChange={e => set('tutorDni', e.target.value)} placeholder="12345678Z" className={input} />
          </label>
          {publico && (
            <label className="text-xs text-gray-500 space-y-1 block">Correo electrónico (para el justificante)
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" className={input} />
            </label>
          )}
          {publico && (
            <label className="text-xs text-gray-500 space-y-1 block">Actividad (opcional)
              <input value={actividad} onChange={e => setActividad(e.target.value)} className={input} />
            </label>
          )}
        </div>
        <div role="radiogroup" aria-label="Actuando en calidad de" className="flex flex-wrap items-center gap-2 text-sm">
          <span className="text-xs text-gray-500 mr-1">Actuando en calidad de:</span>
          {RELACIONES.map(r => (
            <button key={r.id} type="button" role="radio" aria-checked={f.relacion === r.id} onClick={() => set('relacion', r.id)}
              className={`text-xs font-bold px-3 py-2 rounded-lg border ${f.relacion === r.id ? 'bg-pm-navy border-pm-navy text-white' : 'border-gray-300 text-gray-600 hover:border-pm-navy'}`}>
              {r.label}
            </button>
          ))}
        </div>
      </fieldset>

      <label className="flex gap-3 items-start text-[13px] text-gray-700 leading-relaxed">
        <input type="checkbox" checked={f.declaracion} onChange={e => set('declaracion', e.target.checked)} className="mt-1 w-4 h-4 accent-pm-red shrink-0" />
        <span>{TEXTO.declaracion}</span>
      </label>
      <label className="flex gap-3 items-start text-[13px] text-gray-500 leading-relaxed">
        <input type="checkbox" checked={f.conformidadMenor} onChange={e => set('conformidadMenor', e.target.checked)} className="mt-1 w-4 h-4 accent-pm-red shrink-0" />
        <span>(Opcional) {TEXTO.conformidad}</span>
      </label>

      {error && <p role="alert" className="text-sm text-red-600 font-semibold">{error}</p>}

      <button type="submit" disabled={enviando}
        className="w-full sm:w-auto px-6 py-3 rounded-xl bg-pm-red text-white font-black text-sm hover:bg-pm-red-dark disabled:opacity-50">
        {enviando ? 'Firmando…' : 'Firmar autorización'}
      </button>
      <p className="text-[11px] text-gray-400">
        Al pulsar «Firmar autorización» firmas electrónicamente este documento. Guardamos la fecha, la hora y la versión del texto, y te enviamos un justificante por correo.
      </p>
    </form>
  )
}
