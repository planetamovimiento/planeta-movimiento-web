'use client'

import { useState } from 'react'

const DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes']

export default function FormExtraescolar() {
  const [form, setForm] = useState({
    colegio: '', ampa: '', contacto: '', email: '', telefono: '',
    numAlumnos: '', edades: [] as string[], dias: [] as string[],
    horario: '', observaciones: '',
  })
  const [enviando, setEnviando] = useState(false)
  const [enviado, setEnviado] = useState(false)

  function toggleEdad(e: string) {
    setForm(f => ({ ...f, edades: f.edades.includes(e) ? f.edades.filter(x => x !== e) : [...f.edades, e] }))
  }
  function toggleDia(d: string) {
    setForm(f => ({ ...f, dias: f.dias.includes(d) ? f.dias.filter(x => x !== d) : [...f.dias, d] }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setEnviando(true)
    await new Promise(r => setTimeout(r, 1400)); setEnviando(false); setEnviado(true)
  }

  if (enviado) return (
    <div className="text-center py-10">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/>
        </svg>
      </div>
      <h3 className="text-xl font-black text-pm-navy mb-2">¡Solicitud enviada!</h3>
      <p className="text-gray-600 text-sm max-w-sm mx-auto mb-4">
        Nos pondremos en contacto con vosotros en menos de 48 horas para presentaros nuestra propuesta.
      </p>
      <div className="inline-block bg-pm-bg border border-gray-200 rounded-xl px-5 py-3 text-sm text-left space-y-1 max-w-xs mb-5">
        <div className="font-black text-pm-navy mb-1">Tu solicitud:</div>
        <div className="text-gray-600">🏫 {form.colegio}</div>
        {form.ampa && <div className="text-gray-600">👨‍👩‍👧 AMPA: {form.ampa}</div>}
        <div className="text-gray-600">👦 {form.numAlumnos} alumnos aprox.</div>
        {form.dias.length > 0 && <div className="text-gray-600">📅 {form.dias.join(', ')}</div>}
      </div>
      <br/>
      <button onClick={() => setEnviado(false)} className="text-pm-red underline text-sm">Enviar otra solicitud</button>
    </div>
  )

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Centro + AMPA */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-pm-navy mb-1.5">Nombre del colegio *</label>
          <input required type="text" placeholder="CEIP San Julián..."
            value={form.colegio} onChange={e => setForm(f => ({...f, colegio: e.target.value}))}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-pm-red"/>
        </div>
        <div>
          <label className="block text-xs font-bold text-pm-navy mb-1.5">AMPA (si aplica)</label>
          <input type="text" placeholder="AMPA Nombre del centro"
            value={form.ampa} onChange={e => setForm(f => ({...f, ampa: e.target.value}))}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-pm-red"/>
        </div>
      </div>

      {/* Contacto */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-bold text-pm-navy mb-1.5">Persona de contacto *</label>
          <input required type="text" placeholder="Nombre y apellidos"
            value={form.contacto} onChange={e => setForm(f => ({...f, contacto: e.target.value}))}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-pm-red"/>
        </div>
        <div>
          <label className="block text-xs font-bold text-pm-navy mb-1.5">Email *</label>
          <input required type="email" placeholder="ampa@colegio.es"
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

      {/* Alumnos + edades */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
        <div>
          <label className="block text-xs font-bold text-pm-navy mb-1.5">Nº aproximado de alumnos *</label>
          <input required type="number" min={5} placeholder="Ej. 20"
            value={form.numAlumnos} onChange={e => setForm(f => ({...f, numAlumnos: e.target.value}))}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-pm-red"/>
        </div>
        <div>
          <label className="block text-xs font-bold text-pm-navy mb-1.5">Edades participantes</label>
          <div className="flex gap-2">
            {['Ed. Infantil (3-5 años)', 'Ed. Primaria (6-12 años)'].map(e => (
              <button key={e} type="button" onClick={() => toggleEdad(e)}
                className={`flex-1 text-xs font-semibold border-2 rounded-xl py-2.5 px-2 transition-colors text-center ${
                  form.edades.includes(e) ? 'bg-pm-red border-pm-red text-white' : 'border-gray-200 text-gray-600 hover:border-pm-red hover:text-pm-red'
                }`}>
                {e}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Días + horario */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
        <div>
          <label className="block text-xs font-bold text-pm-navy mb-1.5">Días deseados</label>
          <div className="flex gap-1.5">
            {DIAS.map(d => (
              <button key={d} type="button" onClick={() => toggleDia(d)}
                className={`flex-1 py-2 rounded-xl text-xs font-bold border-2 transition-colors ${
                  form.dias.includes(d) ? 'bg-pm-navy border-pm-navy text-white' : 'border-gray-200 text-gray-600 hover:border-pm-navy'
                }`}>
                {d.slice(0, 2)}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-xs font-bold text-pm-navy mb-1.5">Horario deseado</label>
          <input type="text" placeholder="Ej. 16:00 – 17:00"
            value={form.horario} onChange={e => setForm(f => ({...f, horario: e.target.value}))}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-pm-red"/>
        </div>
      </div>

      {/* Observaciones */}
      <div>
        <label className="block text-xs font-bold text-pm-navy mb-1.5">Observaciones</label>
        <textarea rows={3} placeholder="Espacio disponible en el colegio, contexto del centro, necesidades especiales, preferencias de inicio, cursos implicados..."
          value={form.observaciones} onChange={e => setForm(f => ({...f, observaciones: e.target.value}))}
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-pm-red resize-none"/>
      </div>

      <div className="bg-green-50 border border-green-100 rounded-xl p-4 text-xs text-green-700 flex items-start gap-2">
        <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        <span><strong>Sin compromiso.</strong> Os presentaremos nuestra propuesta en menos de 48 horas. La implantación de la actividad se acuerda conjuntamente con el centro.</span>
      </div>

      <button type="submit"
        disabled={!form.colegio || !form.contacto || !form.email || !form.telefono || !form.numAlumnos || enviando}
        className="w-full bg-pm-red hover:bg-pm-red-dark disabled:opacity-50 disabled:cursor-not-allowed text-white font-black text-sm tracking-widest uppercase py-4 rounded-xl transition-colors shadow-lg">
        {enviando ? 'Enviando...' : '📋 Solicitar información'}
      </button>
    </form>
  )
}
