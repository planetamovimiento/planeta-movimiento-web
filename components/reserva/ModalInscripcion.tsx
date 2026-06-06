'use client'

import { useState } from 'react'
import { submitForm } from '@/lib/forms/actions'

// ─── Tipos ───────────────────────────────────────────────────────────────────

export type Modalidad = {
  id: string
  label: string
  sublabel: string
  precio: string
}

type Props = {
  servicio: string
  niveles: string[]
  modalidades: Modalidad[]
  onClose: () => void
}

// ─── Modal ───────────────────────────────────────────────────────────────────

export function ModalInscripcion({ servicio, niveles, modalidades, onClose }: Props) {
  const [enviado, setEnviado] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    nombre: '',
    apellidos: '',
    email: '',
    telefono: '',
    fechaNacimiento: '',
    tutorLegal: '',
    experiencia: '',
    modalidad: '',
    nivel: '',
    diasSemana: [] as string[],
    notas: '',
    aceptaCondiciones: false,
  })

  const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes']

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
    await submitForm({
      tipo: 'inscripcion_club',
      nombre: `${form.nombre} ${form.apellidos}`.trim(),
      email: form.email,
      telefono: form.telefono,
      asunto: `Inscripción Club · ${servicio}`,
      mensaje: form.notas,
      datos: {
        actividad: servicio,
        nombre: form.nombre,
        apellidos: form.apellidos,
        fechaNacimiento: form.fechaNacimiento,
        tutorLegal: form.tutorLegal,
        experienciaPrevia: form.experiencia,
        modalidad: form.modalidad,
        nivel: form.nivel,
        disponibilidad: form.diasSemana.join(', '),
      },
    })
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
        <div className="bg-pm-navy text-white px-6 py-5 rounded-t-2xl flex items-center justify-between sticky top-0 z-10">
          <div>
            <h2 className="text-lg font-black">Inscripción</h2>
            <p className="text-white/60 text-sm">{servicio}</p>
          </div>
          <button onClick={onClose} className="text-white/60 hover:text-white transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        {enviado ? (
          /* ── Éxito ── */
          <div className="p-10 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/>
              </svg>
            </div>
            <h3 className="text-xl font-black text-pm-navy mb-2">¡Solicitud enviada!</h3>
            <p className="text-gray-500 text-sm mb-2">
              Nos pondremos en contacto contigo en las próximas 24 horas para confirmar tu plaza.
            </p>
            {form.modalidad && (
              <p className="text-xs text-pm-red font-semibold mb-6">
                Modalidad elegida: {modalidades.find(m => m.id === form.modalidad)?.label}
              </p>
            )}
            <button
              onClick={onClose}
              className="bg-pm-red hover:bg-pm-red-dark text-white font-bold px-8 py-3 rounded-xl transition-colors"
            >
              Cerrar
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-5">

            {/* ── 1. Modalidad ── */}
            <div>
              <label className="block text-xs font-black text-pm-navy mb-2 uppercase tracking-wider">
                ¿Cómo quieres apuntarte? *
              </label>
              <div className="grid grid-cols-2 gap-2">
                {modalidades.map(m => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, modalidad: m.id }))}
                    className={`text-left border-2 rounded-xl p-3 transition-all ${
                      form.modalidad === m.id
                        ? 'border-pm-red bg-pm-red-light'
                        : 'border-gray-200 hover:border-pm-red/40'
                    }`}
                  >
                    <div className={`font-bold text-sm ${form.modalidad === m.id ? 'text-pm-red' : 'text-pm-navy'}`}>
                      {m.label}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">{m.sublabel}</div>
                    <div className={`text-xs font-black mt-1 ${form.modalidad === m.id ? 'text-pm-red' : 'text-gray-400'}`}>
                      {m.precio}
                    </div>
                  </button>
                ))}
              </div>
              {!form.modalidad && (
                <p className="text-xs text-gray-400 mt-1.5">Selecciona una opción para continuar</p>
              )}
            </div>

            {/* ── 2. Datos personales ── */}
            <p className="text-xs text-gray-400 -mb-1">Datos de la persona que se inscribe (el participante)</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-pm-navy mb-1.5">Nombre del participante *</label>
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
                <label className="block text-xs font-semibold text-pm-navy mb-1.5">Apellidos del participante *</label>
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

            {/* Fecha de nacimiento del participante — justo bajo el nombre para que no haya dudas */}
            <div>
              <label className="block text-xs font-semibold text-pm-navy mb-1.5">Fecha de nacimiento del participante *</label>
              <input
                required
                type="date"
                value={form.fechaNacimiento}
                onChange={e => setForm(f => ({ ...f, fechaNacimiento: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-pm-red"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
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
            </div>

            {/* ── Tutor legal y experiencia (opcionales) ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-pm-navy mb-1.5">Tutor legal <span className="text-gray-400 font-normal">(si es menor)</span></label>
                <input
                  type="text"
                  value={form.tutorLegal}
                  onChange={e => setForm(f => ({ ...f, tutorLegal: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-pm-red"
                  placeholder="Nombre del padre/madre/tutor"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-pm-navy mb-1.5">Experiencia previa</label>
                <select
                  value={form.experiencia}
                  onChange={e => setForm(f => ({ ...f, experiencia: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-pm-red bg-white"
                >
                  <option value="">— Selecciona —</option>
                  <option>Ninguna</option>
                  <option>Algo de experiencia</option>
                  <option>Bastante experiencia</option>
                </select>
              </div>
            </div>

            {/* ── 3. Nivel ── */}
            <div>
              <label className="block text-xs font-semibold text-pm-navy mb-1.5">Nivel / Grupo de preferencia</label>
              <select
                value={form.nivel}
                onChange={e => setForm(f => ({ ...f, nivel: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-pm-red bg-white"
              >
                <option value="">— No lo sé aún, me orientáis vosotros —</option>
                {niveles.map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>

            {/* ── 4. Días preferidos ── */}
            <div>
              <label className="block text-xs font-semibold text-pm-navy mb-2">
                Días preferidos
                {form.modalidad && form.modalidad !== 'suelta' && (
                  <span className="text-gray-400 font-normal ml-1">
                    ({modalidades.find(m => m.id === form.modalidad)?.label})
                  </span>
                )}
              </label>
              <div className="flex flex-wrap gap-2">
                {diasSemana.map(dia => (
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

            {/* ── 5. Notas ── */}
            <div>
              <label className="block text-xs font-semibold text-pm-navy mb-1.5">Notas o preguntas</label>
              <textarea
                rows={3}
                value={form.notas}
                onChange={e => setForm(f => ({ ...f, notas: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-pm-red resize-none"
                placeholder="Experiencia previa, lesiones, dudas sobre horarios..."
              />
            </div>

            {/* ── 6. Condiciones ── */}
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                required
                checked={form.aceptaCondiciones}
                onChange={e => setForm(f => ({ ...f, aceptaCondiciones: e.target.checked }))}
                className="mt-0.5 accent-pm-red w-4 h-4 shrink-0"
              />
              <span className="text-xs text-gray-500 leading-relaxed">
                Acepto las{' '}
                <a href="#" className="text-pm-red underline">condiciones de uso</a>{' '}
                y la{' '}
                <a href="#" className="text-pm-red underline">política de privacidad</a> *
              </span>
            </label>

            <button
              type="submit"
              disabled={loading || !form.modalidad}
              className="w-full bg-pm-red hover:bg-pm-red-dark disabled:opacity-50 disabled:cursor-not-allowed text-white font-black text-sm tracking-widest uppercase py-4 rounded-xl transition-colors"
            >
              {loading ? 'Enviando...' : 'Enviar solicitud'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
