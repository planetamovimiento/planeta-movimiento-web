'use client'

import { useState } from 'react'

const NIVELES = ['Iniciación 1', 'Iniciación 2', 'Iniciación 3', 'Medio 1', 'Medio 2', 'Medio 3', 'Avanzado 1', 'Avanzado 2', 'Adultos']

export function BotonApuntarme() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="w-full sm:w-auto bg-pm-red hover:bg-pm-red-dark text-white font-black text-sm tracking-widest uppercase px-10 py-4 rounded-xl transition-colors shadow-lg"
      >
        Apuntarme
      </button>
      {open && <InscripcionModal onClose={() => setOpen(false)} />}
    </>
  )
}

function InscripcionModal({ onClose }: { onClose: () => void }) {
  const [enviado, setEnviado] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    nombre: '', apellidos: '', email: '', telefono: '',
    fechaNacimiento: '', nivel: '', diasSemana: [] as string[], notas: '',
    aceptaCondiciones: false,
  })

  const dias = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes']

  function toggleDia(dia: string) {
    setForm(f => ({
      ...f,
      diasSemana: f.diasSemana.includes(dia)
        ? f.diasSemana.filter(d => d !== dia)
        : [...f.diasSemana, dia],
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    await new Promise(r => setTimeout(r, 1200))
    setLoading(false)
    setEnviado(true)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-pm-navy text-white px-6 py-5 rounded-t-2xl flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black">Inscripción</h2>
            <p className="text-white/60 text-sm">Gimnasia acrobática y trampolín</p>
          </div>
          <button onClick={onClose} className="text-white/60 hover:text-white transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        {enviado ? (
          <div className="p-10 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/>
              </svg>
            </div>
            <h3 className="text-xl font-black text-pm-navy mb-2">¡Solicitud enviada!</h3>
            <p className="text-gray-500 text-sm mb-6">
              Nos pondremos en contacto contigo en las próximas 24 horas para confirmar tu plaza.
            </p>
            <button
              onClick={onClose}
              className="bg-pm-red hover:bg-pm-red-dark text-white font-bold px-8 py-3 rounded-xl transition-colors"
            >
              Cerrar
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Nombre + Apellidos */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-pm-navy mb-1.5">Nombre *</label>
                <input
                  required
                  type="text"
                  value={form.nombre}
                  onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-pm-red"
                  placeholder="Ana"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-pm-navy mb-1.5">Apellidos *</label>
                <input
                  required
                  type="text"
                  value={form.apellidos}
                  onChange={e => setForm(f => ({ ...f, apellidos: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-pm-red"
                  placeholder="García López"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-pm-navy mb-1.5">Email *</label>
              <input
                required
                type="email"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-pm-red"
                placeholder="ana@ejemplo.com"
              />
            </div>

            {/* Teléfono + Fecha nacimiento */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-pm-navy mb-1.5">Teléfono *</label>
                <input
                  required
                  type="tel"
                  value={form.telefono}
                  onChange={e => setForm(f => ({ ...f, telefono: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-pm-red"
                  placeholder="600 000 000"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-pm-navy mb-1.5">Fecha de nacimiento *</label>
                <input
                  required
                  type="date"
                  value={form.fechaNacimiento}
                  onChange={e => setForm(f => ({ ...f, fechaNacimiento: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-pm-red"
                />
              </div>
            </div>

            {/* Nivel */}
            <div>
              <label className="block text-xs font-semibold text-pm-navy mb-1.5">Nivel / Grupo de preferencia</label>
              <select
                value={form.nivel}
                onChange={e => setForm(f => ({ ...f, nivel: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-pm-red bg-white"
              >
                <option value="">— No lo sé aún —</option>
                {NIVELES.map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>

            {/* Días preferidos */}
            <div>
              <label className="block text-xs font-semibold text-pm-navy mb-2">Días preferidos</label>
              <div className="flex flex-wrap gap-2">
                {dias.map(dia => (
                  <button
                    key={dia}
                    type="button"
                    onClick={() => toggleDia(dia)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                      form.diasSemana.includes(dia)
                        ? 'bg-pm-red border-pm-red text-white'
                        : 'border-gray-200 text-gray-600 hover:border-pm-red hover:text-pm-red'
                    }`}
                  >
                    {dia}
                  </button>
                ))}
              </div>
            </div>

            {/* Notas */}
            <div>
              <label className="block text-xs font-semibold text-pm-navy mb-1.5">Notas o preguntas</label>
              <textarea
                rows={3}
                value={form.notas}
                onChange={e => setForm(f => ({ ...f, notas: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-pm-red resize-none"
                placeholder="Experiencia previa, lesiones, dudas..."
              />
            </div>

            {/* Condiciones */}
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                required
                checked={form.aceptaCondiciones}
                onChange={e => setForm(f => ({ ...f, aceptaCondiciones: e.target.checked }))}
                className="mt-0.5 accent-pm-red w-4 h-4"
              />
              <span className="text-xs text-gray-500">
                Acepto las{' '}
                <a href="#" className="text-pm-red underline">condiciones de uso</a>{' '}
                y la{' '}
                <a href="#" className="text-pm-red underline">política de privacidad</a> *
              </span>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-pm-red hover:bg-pm-red-dark disabled:opacity-60 text-white font-black text-sm tracking-widest uppercase py-4 rounded-xl transition-colors"
            >
              {loading ? 'Enviando...' : 'Enviar solicitud'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
