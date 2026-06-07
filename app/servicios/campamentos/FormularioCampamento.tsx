'use client'

import { useState, useEffect } from 'react'

export type Participante = { nombre: string; apellidos: string; fnac: string }
export type PayloadCampamento = {
  contacto: { nombre: string; email: string; telefono: string }
  participantes: Participante[]
  notas: string
}

const TEMAS = {
  red:    { focus: 'focus:border-pm-red',     btn: 'bg-pm-red hover:bg-pm-red-dark',   soft: 'bg-pm-red-light border-pm-red/20',   text: 'text-pm-red' },
  blue:   { focus: 'focus:border-blue-500',   btn: 'bg-blue-600 hover:bg-blue-700',    soft: 'bg-blue-50 border-blue-200',         text: 'text-blue-600' },
  violet: { focus: 'focus:border-violet-500', btn: 'bg-violet-600 hover:bg-violet-700', soft: 'bg-violet-50 border-violet-200',     text: 'text-violet-600' },
}

const vacio = (): Participante => ({ nombre: '', apellidos: '', fnac: '' })

/** Texto legible de los participantes para guardar en la reserva (lo muestra el CRM). */
export function textoParticipantes(parts: Participante[]): string {
  return parts
    .filter(p => p.nombre || p.apellidos)
    .map((p, i) => {
      const fecha = p.fnac ? ` — ${p.fnac.split('-').reverse().join('/')}` : ''
      return `${i + 1}) ${`${p.nombre} ${p.apellidos}`.trim()}${fecha}`
    })
    .join('\n')
}

export default function FormularioCampamento({
  numNinos, setNumNinos, total, color = 'red', enviando, ctaLabel, onVolver, onSubmit,
}: {
  numNinos: number
  setNumNinos: (n: number) => void
  total: number
  color?: keyof typeof TEMAS
  enviando: boolean
  ctaLabel?: string
  onVolver: () => void
  onSubmit: (p: PayloadCampamento) => void
}) {
  const t = TEMAS[color]
  const [contacto, setContacto] = useState({ nombre: '', email: '', telefono: '' })
  const [parts, setParts] = useState<Participante[]>(() => Array.from({ length: Math.max(1, numNinos) }, vacio))
  const [notas, setNotas] = useState('')

  // El nº de fichas de participante sigue al contador (numNinos)
  useEffect(() => {
    setParts(prev => {
      if (prev.length === numNinos) return prev
      if (numNinos > prev.length) return [...prev, ...Array.from({ length: numNinos - prev.length }, vacio)]
      return prev.slice(0, Math.max(1, numNinos))
    })
  }, [numNinos])

  const setPart = (i: number, k: keyof Participante, v: string) => setParts(p => p.map((x, idx) => (idx === i ? { ...x, [k]: v } : x)))
  const addHermano = () => setNumNinos(numNinos + 1)
  const quitar = (i: number) => { if (parts.length > 1) { setParts(p => p.filter((_, idx) => idx !== i)); setNumNinos(Math.max(1, numNinos - 1)) } }

  const inputCls = `w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none ${t.focus}`
  const valido = contacto.nombre && contacto.email && contacto.telefono && parts.every(p => p.nombre && p.apellidos && p.fnac)

  function enviar(e: React.FormEvent) {
    e.preventDefault()
    if (!valido) return
    onSubmit({ contacto, participantes: parts, notas })
  }

  return (
    <form onSubmit={enviar} className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm space-y-5">
      {/* Contacto (tutor) */}
      <div className="space-y-3">
        <div className="font-black text-pm-navy text-sm">Datos de contacto (madre / padre / tutor)</div>
        <input required type="text" placeholder="Nombre y apellidos del contacto *" value={contacto.nombre} onChange={e => setContacto(c => ({ ...c, nombre: e.target.value }))} className={inputCls} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input required type="email" placeholder="Email *" value={contacto.email} onChange={e => setContacto(c => ({ ...c, email: e.target.value }))} className={inputCls} />
          <input required type="tel" placeholder="Teléfono *" value={contacto.telefono} onChange={e => setContacto(c => ({ ...c, telefono: e.target.value }))} className={inputCls} />
        </div>
      </div>

      {/* Participantes */}
      <div className="space-y-3">
        <div className="font-black text-pm-navy text-sm">Datos del participante{parts.length > 1 ? 's' : ''}</div>
        {parts.map((p, i) => (
          <div key={i} className={`rounded-xl border ${t.soft} p-3 space-y-2`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-pm-navy uppercase tracking-wider">{i === 0 ? 'Participante' : `Hermano/a ${i}`}</span>
              {parts.length > 1 && <button type="button" onClick={() => quitar(i)} className="text-xs text-gray-400 hover:text-red-500">Quitar</button>}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input required type="text" placeholder="Nombre *" value={p.nombre} onChange={e => setPart(i, 'nombre', e.target.value)} className={inputCls} />
              <input required type="text" placeholder="Apellidos *" value={p.apellidos} onChange={e => setPart(i, 'apellidos', e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className="block text-[11px] text-gray-500 mb-1">Fecha de nacimiento *</label>
              <input required type="date" value={p.fnac} onChange={e => setPart(i, 'fnac', e.target.value)} className={inputCls} />
            </div>
          </div>
        ))}
        <button type="button" onClick={addHermano} className={`w-full border-2 border-dashed border-gray-300 rounded-xl py-2.5 text-sm font-bold ${t.text} hover:border-gray-400 transition-colors`}>
          + Añadir hermano/a
        </button>
      </div>

      {/* Notas */}
      <textarea rows={2} placeholder="Notas (alergias, necesidades especiales...)" value={notas} onChange={e => setNotas(e.target.value)} className={`${inputCls} resize-none`} />

      {/* Botones */}
      <div className="flex gap-2">
        <button type="button" onClick={onVolver} className="border border-gray-200 text-gray-600 text-sm font-bold px-4 py-3 rounded-xl hover:border-gray-400 transition-colors">← Volver</button>
        <button type="submit" disabled={!valido || enviando} className={`flex-1 ${t.btn} disabled:opacity-50 text-white font-black text-sm py-3 rounded-xl transition-colors`}>
          {enviando ? 'Enviando...' : (ctaLabel ?? `Reservar — ${total} €`)}
        </button>
      </div>
    </form>
  )
}
