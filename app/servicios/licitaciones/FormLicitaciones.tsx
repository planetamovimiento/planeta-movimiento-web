'use client'

import { useState } from 'react'
import { submitForm } from '@/lib/forms/actions'

const TIPOS_PROYECTO = [
  'Programa para residencia / centro de mayores',
  'Programa municipal de ocio y tiempo libre',
  'Ludoteca / espacio educativo',
  'Programa deportivo municipal',
  'Escuela de verano / campamento urbano',
  'Licitación / contrato de servicios',
  'Otro',
]

const inp = 'w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-pm-red'

export default function FormLicitaciones() {
  const [form, setForm] = useState({
    entidad: '', contacto: '', cargo: '', telefono: '', email: '',
    tipoProyecto: '', localidad: '', necesidades: '', observaciones: '',
  })
  const [enviando, setEnviando] = useState(false)
  const [enviado, setEnviado] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setEnviando(true)
    await submitForm({
      tipo: 'licitaciones',
      nombre: form.contacto,
      email: form.email,
      telefono: form.telefono,
      asunto: `Licitaciones · ${form.tipoProyecto || 'Proyecto'} — ${form.entidad}`,
      mensaje: form.necesidades + (form.observaciones ? `\n\nObservaciones: ${form.observaciones}` : ''),
      datos: {
        entidad: form.entidad, cargo: form.cargo, tipoProyecto: form.tipoProyecto, localidad: form.localidad,
      },
    })
    setEnviando(false); setEnviado(true)
  }

  if (enviado) return (
    <div className="text-center py-10">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/></svg>
      </div>
      <h3 className="text-xl font-black text-pm-navy mb-2">Gracias por contactar</h3>
      <p className="text-gray-500 text-sm max-w-sm mx-auto">Hemos recibido tu solicitud. Nuestro equipo la revisará y se pondrá en contacto contigo para estudiar el proyecto.</p>
    </div>
  )

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input required type="text" placeholder="Nombre de la entidad *" value={form.entidad} onChange={e => setForm(f => ({ ...f, entidad: e.target.value }))} className={inp} />
        <input required type="text" placeholder="Persona de contacto *" value={form.contacto} onChange={e => setForm(f => ({ ...f, contacto: e.target.value }))} className={inp} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input type="text" placeholder="Cargo" value={form.cargo} onChange={e => setForm(f => ({ ...f, cargo: e.target.value }))} className={inp} />
        <input type="text" placeholder="Localidad" value={form.localidad} onChange={e => setForm(f => ({ ...f, localidad: e.target.value }))} className={inp} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input required type="tel" placeholder="Teléfono *" value={form.telefono} onChange={e => setForm(f => ({ ...f, telefono: e.target.value }))} className={inp} />
        <input required type="email" placeholder="Correo electrónico *" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className={inp} />
      </div>
      <div>
        <label className="block text-xs font-bold text-pm-navy mb-1.5">Tipo de proyecto</label>
        <select value={form.tipoProyecto} onChange={e => setForm(f => ({ ...f, tipoProyecto: e.target.value }))} className={inp + ' bg-white'}>
          <option value="">— Selecciona —</option>
          {TIPOS_PROYECTO.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>
      <textarea rows={4} placeholder="Descripción de necesidades (objetivos, alcance, plazos, número de usuarios...)" value={form.necesidades} onChange={e => setForm(f => ({ ...f, necesidades: e.target.value }))} className={inp + ' resize-none'} />
      <textarea rows={2} placeholder="Observaciones" value={form.observaciones} onChange={e => setForm(f => ({ ...f, observaciones: e.target.value }))} className={inp + ' resize-none'} />
      <button type="submit" disabled={!form.entidad || !form.contacto || !form.telefono || !form.email || enviando}
        className="w-full bg-pm-red hover:bg-pm-red-dark disabled:opacity-50 text-white font-black py-4 rounded-xl transition-colors">
        {enviando ? 'Enviando...' : 'Hablemos de tu proyecto'}
      </button>
      <p className="text-center text-xs text-gray-400">Respuesta en menos de 48 horas · Trato directo y confidencial</p>
    </form>
  )
}
