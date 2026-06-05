'use client'

import { useState } from 'react'

const CURSOS = [
  'Educación Infantil (3-6 años)',
  '1º Primaria', '2º Primaria', '3º Primaria',
  '4º Primaria', '5º Primaria', '6º Primaria',
  '1º ESO', '2º ESO', '3º ESO', '4º ESO',
  'Bachillerato', 'FP / Ciclos',
]

export default function FormExcursion() {
  const [form, setForm] = useState({
    centro: '', contacto: '', email: '', telefono: '',
    fecha: '', alumnos: '', cursosSelec: [] as string[],
    acompanantes: '', observaciones: '',
  })
  const [enviando, setEnviando] = useState(false)
  const [enviado, setEnviado] = useState(false)

  function toggleCurso(c: string) {
    setForm(f => ({
      ...f,
      cursosSelec: f.cursosSelec.includes(c)
        ? f.cursosSelec.filter(x => x !== c)
        : [...f.cursosSelec, c],
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setEnviando(true)
    await new Promise(r => setTimeout(r, 1400))
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
      <h3 className="text-2xl font-black text-pm-navy mb-3">¡Solicitud enviada correctamente!</h3>
      <p className="text-gray-600 text-sm max-w-md mx-auto mb-4">
        Nos pondremos en contacto con vosotros en menos de 48 horas con una propuesta personalizada adaptada a vuestro grupo.
      </p>
      <div className="inline-block bg-pm-bg border border-gray-200 rounded-xl px-6 py-4 text-sm text-left max-w-xs mb-6 space-y-1">
        <div className="font-black text-pm-navy mb-1">Resumen de tu solicitud:</div>
        <div className="text-gray-600">🏫 {form.centro}</div>
        <div className="text-gray-600">👦 {form.alumnos} alumnos</div>
        <div className="text-gray-600">📅 {form.fecha ? new Date(form.fecha + 'T12:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'}</div>
      </div>
      <br/>
      <button onClick={() => setEnviado(false)} className="text-pm-red underline text-sm">
        Enviar otra solicitud
      </button>
    </div>
  )

  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      {/* Centro + Contacto */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-pm-navy mb-1.5">Centro educativo *</label>
          <input required type="text" placeholder="CEIP San Julián, IES Río Júcar..."
            value={form.centro} onChange={e => setForm(f => ({...f, centro: e.target.value}))}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-pm-red"/>
        </div>
        <div>
          <label className="block text-xs font-bold text-pm-navy mb-1.5">Persona de contacto *</label>
          <input required type="text" placeholder="Nombre y apellidos"
            value={form.contacto} onChange={e => setForm(f => ({...f, contacto: e.target.value}))}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-pm-red"/>
        </div>
      </div>

      {/* Email + Teléfono */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-pm-navy mb-1.5">Email *</label>
          <input required type="email" placeholder="secretaria@colegio.es"
            value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-pm-red"/>
        </div>
        <div>
          <label className="block text-xs font-bold text-pm-navy mb-1.5">Teléfono *</label>
          <input required type="tel" placeholder="969 000 000"
            value={form.telefono} onChange={e => setForm(f => ({...f, telefono: e.target.value}))}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-pm-red"/>
        </div>
      </div>

      {/* Fecha + Alumnos + Acompañantes */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-bold text-pm-navy mb-1.5">Fecha deseada *</label>
          <input required type="date" min={new Date().toISOString().slice(0,10)}
            value={form.fecha} onChange={e => setForm(f => ({...f, fecha: e.target.value}))}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-pm-red"/>
        </div>
        <div>
          <label className="block text-xs font-bold text-pm-navy mb-1.5">Nº de alumnos *</label>
          <input required type="number" min={10} placeholder="Ej. 60"
            value={form.alumnos} onChange={e => setForm(f => ({...f, alumnos: e.target.value}))}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-pm-red"/>
        </div>
        <div>
          <label className="block text-xs font-bold text-pm-navy mb-1.5">Nº de acompañantes</label>
          <input type="number" min={0} placeholder="Ej. 4"
            value={form.acompanantes} onChange={e => setForm(f => ({...f, acompanantes: e.target.value}))}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-pm-red"/>
        </div>
      </div>

      {/* Cursos */}
      <div>
        <label className="block text-xs font-bold text-pm-navy mb-2">Cursos participantes</label>
        <div className="flex flex-wrap gap-2">
          {CURSOS.map(c => (
            <button key={c} type="button" onClick={() => toggleCurso(c)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                form.cursosSelec.includes(c)
                  ? 'bg-pm-red border-pm-red text-white'
                  : 'border-gray-200 text-gray-600 hover:border-pm-red hover:text-pm-red'
              }`}>
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Observaciones */}
      <div>
        <label className="block text-xs font-bold text-pm-navy mb-1.5">Observaciones</label>
        <textarea rows={4} placeholder="Necesidades especiales, alumnos con movilidad reducida, alergias, contexto del grupo, si prefieren una fecha alternativa..."
          value={form.observaciones} onChange={e => setForm(f => ({...f, observaciones: e.target.value}))}
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-pm-red resize-none"/>
      </div>

      {/* Aviso */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-xs text-blue-700 flex items-start gap-2">
        <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        <span>
          <strong>Sin compromiso.</strong> Recibiréis en menos de 48 horas una propuesta personalizada con el precio adaptado a vuestro grupo. No se realiza ningún pago en este paso.
        </span>
      </div>

      <button type="submit"
        disabled={!form.centro || !form.contacto || !form.email || !form.telefono || !form.fecha || !form.alumnos || enviando}
        className="w-full bg-pm-red hover:bg-pm-red-dark disabled:opacity-50 disabled:cursor-not-allowed text-white font-black text-sm tracking-widest uppercase py-4 rounded-xl transition-colors shadow-lg">
        {enviando ? 'Enviando solicitud...' : '📋 Solicitar presupuesto'}
      </button>
    </form>
  )
}
