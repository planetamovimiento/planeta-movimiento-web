'use client'

import { useState } from 'react'
import { submitForm } from '@/lib/forms/actions'

// ─── Talleres de envejecimiento activo ────────────────────────────────────────
export const TALLERES_PIEA = [
  { id: 'bingo', nombre: 'Bingo Musical', precio: 200, icon: '🎵', grad: 'from-pm-red to-pm-red-dark',
    desc: 'La música como herramienta para estimular recuerdos, fomentar la interacción y generar experiencias positivas. Una actividad participativa que une al grupo.' },
  { id: 'arte', nombre: 'Creatividad y Arte', precio: 200, icon: '🎨', grad: 'from-amber-500 to-orange-600',
    desc: 'Expresión artística y participación activa. Un espacio para crear, compartir y disfrutar potenciando la imaginación y la autoestima.' },
  { id: 'cognitiva', nombre: 'Bienestar y Estimulación Cognitiva', precio: 200, icon: '🧠', grad: 'from-emerald-600 to-teal-700',
    desc: 'Actividades diseñadas para trabajar la memoria, la atención, la concentración y otras capacidades cognitivas de forma amena y dinámica.' },
  { id: 'ergonomia', nombre: 'Ergonomía y Movimiento', precio: 200, icon: '🤸', grad: 'from-sky-600 to-blue-700',
    desc: 'Mejora de la movilidad, la postura, la conciencia corporal y el bienestar físico a través de movimiento adaptado y seguro.' },
]

function Enviado({ onReset }: { onReset: () => void }) {
  return (
    <div className="text-center py-10">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/></svg>
      </div>
      <h3 className="text-xl font-black text-pm-navy mb-2">¡Solicitud enviada!</h3>
      <p className="text-gray-500 text-sm mb-5 max-w-sm mx-auto">Gracias por tu interés. Nos pondremos en contacto contigo en menos de 48 horas con toda la información.</p>
      <button onClick={onReset} className="text-pm-red underline text-sm">Enviar otra solicitud</button>
    </div>
  )
}

const inp = 'w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-pm-red'

// ─── FORM 1 · Programas en residencias ────────────────────────────────────────
export function FormResidencias() {
  const [form, setForm] = useState({ centro: '', contacto: '', telefono: '', email: '', usuarios: '', observaciones: '' })
  const [enviando, setEnviando] = useState(false)
  const [enviado, setEnviado] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setEnviando(true)
    await submitForm({
      tipo: 'piea-residencias',
      nombre: form.contacto,
      email: form.email,
      telefono: form.telefono,
      asunto: `PIEA · Programa en residencia — ${form.centro}`,
      mensaje: form.observaciones,
      datos: { centro: form.centro, usuarios: form.usuarios },
    })
    setEnviando(false); setEnviado(true)
  }

  if (enviado) return <Enviado onReset={() => { setEnviado(false); setForm({ centro: '', contacto: '', telefono: '', email: '', usuarios: '', observaciones: '' }) }} />

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input required type="text" placeholder="Nombre del centro / residencia *" value={form.centro} onChange={e => setForm(f => ({ ...f, centro: e.target.value }))} className={inp} />
        <input required type="text" placeholder="Persona de contacto *" value={form.contacto} onChange={e => setForm(f => ({ ...f, contacto: e.target.value }))} className={inp} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input required type="tel" placeholder="Teléfono *" value={form.telefono} onChange={e => setForm(f => ({ ...f, telefono: e.target.value }))} className={inp} />
        <input required type="email" placeholder="Email *" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className={inp} />
      </div>
      <input type="text" placeholder="Nº aproximado de usuarios" value={form.usuarios} onChange={e => setForm(f => ({ ...f, usuarios: e.target.value }))} className={inp} />
      <textarea rows={3} placeholder="Observaciones (perfil del grupo, necesidades, disponibilidad...)" value={form.observaciones} onChange={e => setForm(f => ({ ...f, observaciones: e.target.value }))} className={inp + ' resize-none'} />
      <button type="submit" disabled={!form.centro || !form.contacto || !form.telefono || !form.email || enviando}
        className="w-full bg-pm-red hover:bg-pm-red-dark disabled:opacity-50 text-white font-black py-3.5 rounded-xl transition-colors">
        {enviando ? 'Enviando...' : 'Solicitar información'}
      </button>
      <p className="text-center text-xs text-gray-400">Sin compromiso · Respuesta en menos de 48 horas</p>
    </form>
  )
}

// ─── FORM 2 · Talleres de envejecimiento activo (configurador) ─────────────────
export function ConfiguradorTalleresPiea() {
  const [seleccionado, setSeleccionado] = useState<string>('')
  const [form, setForm] = useState({ entidad: '', contacto: '', telefono: '', email: '', localidad: '', fecha: '', participantes: '', observaciones: '' })
  const [enviando, setEnviando] = useState(false)
  const [enviado, setEnviado] = useState(false)

  const taller = TALLERES_PIEA.find(t => t.id === seleccionado)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setEnviando(true)
    await submitForm({
      tipo: 'piea-talleres',
      nombre: form.contacto,
      email: form.email,
      telefono: form.telefono,
      asunto: `PIEA · Taller envejecimiento activo${taller ? ' — ' + taller.nombre : ''} (${form.entidad})`,
      mensaje: form.observaciones,
      datos: {
        entidad: form.entidad, localidad: form.localidad,
        taller: taller ? `${taller.nombre} (${taller.precio} €)` : 'Por determinar',
        fecha: form.fecha, participantes: form.participantes,
      },
    })
    setEnviando(false); setEnviado(true)
  }

  if (enviado) return <Enviado onReset={() => { setEnviado(false); setSeleccionado(''); setForm({ entidad: '', contacto: '', telefono: '', email: '', localidad: '', fecha: '', participantes: '', observaciones: '' }) }} />

  return (
    <div className="space-y-6">
      {/* Selección de taller */}
      <div>
        <h3 className="font-black text-pm-navy mb-1">1. Elige el taller</h3>
        <p className="text-gray-500 text-sm mb-4">Selecciona el que mejor encaja con tu grupo. Puedes contratar varios.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {TALLERES_PIEA.map(t => (
            <button key={t.id} type="button" onClick={() => setSeleccionado(t.id)}
              className={`text-left border-2 rounded-2xl overflow-hidden transition-all ${seleccionado === t.id ? 'border-pm-red shadow-md' : 'border-gray-200 hover:border-pm-red/40'}`}>
              <div className={`bg-gradient-to-br ${t.grad} px-5 py-4 text-white flex items-center justify-between`}>
                <span className="font-black">{t.nombre}</span>
                <span className="bg-white/20 text-white text-xs font-black px-2.5 py-1 rounded-full">{t.precio} €</span>
              </div>
              <div className="p-4">
                <p className="text-xs text-gray-500 leading-relaxed">{t.desc}</p>
                <div className={`mt-3 text-xs font-bold ${seleccionado === t.id ? 'text-pm-red' : 'text-gray-400'}`}>
                  {seleccionado === t.id ? '✓ Seleccionado' : 'Seleccionar'}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="bg-pm-bg rounded-2xl border border-gray-200 p-6 space-y-4">
        <h3 className="font-black text-pm-navy">2. Solicita información o presupuesto</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input required type="text" placeholder="Ayuntamiento o entidad *" value={form.entidad} onChange={e => setForm(f => ({ ...f, entidad: e.target.value }))} className={inp} />
          <input required type="text" placeholder="Persona de contacto *" value={form.contacto} onChange={e => setForm(f => ({ ...f, contacto: e.target.value }))} className={inp} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input required type="tel" placeholder="Teléfono *" value={form.telefono} onChange={e => setForm(f => ({ ...f, telefono: e.target.value }))} className={inp} />
          <input required type="email" placeholder="Email *" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className={inp} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <input type="text" placeholder="Localidad" value={form.localidad} onChange={e => setForm(f => ({ ...f, localidad: e.target.value }))} className={inp} />
          <input type="text" placeholder="Fecha aproximada" value={form.fecha} onChange={e => setForm(f => ({ ...f, fecha: e.target.value }))} className={inp} />
          <input type="text" placeholder="Nº participantes" value={form.participantes} onChange={e => setForm(f => ({ ...f, participantes: e.target.value }))} className={inp} />
        </div>
        <div>
          <label className="block text-xs font-bold text-pm-navy mb-1.5">Taller de interés</label>
          <select value={seleccionado} onChange={e => setSeleccionado(e.target.value)} className={inp + ' bg-white'}>
            <option value="">— Selecciona arriba o aquí —</option>
            {TALLERES_PIEA.map(t => <option key={t.id} value={t.id}>{t.nombre} · {t.precio} €</option>)}
          </select>
        </div>
        <textarea rows={3} placeholder="Observaciones" value={form.observaciones} onChange={e => setForm(f => ({ ...f, observaciones: e.target.value }))} className={inp + ' resize-none'} />
        <button type="submit" disabled={!form.entidad || !form.contacto || !form.telefono || !form.email || enviando}
          className="w-full bg-pm-red hover:bg-pm-red-dark disabled:opacity-50 text-white font-black py-3.5 rounded-xl transition-colors">
          {enviando ? 'Enviando...' : 'Solicitar presupuesto'}
        </button>
      </form>
    </div>
  )
}
