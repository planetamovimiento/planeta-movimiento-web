'use client'

import { useState } from 'react'
import { submitForm } from '@/lib/forms/actions'

export function BotonColaboracion() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 bg-indigo-700 hover:bg-indigo-800 text-white font-bold px-8 py-4 rounded-xl transition-colors shadow-lg"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
        </svg>
        Pide más información
      </button>
      {open && <ModalColaboracion onClose={() => setOpen(false)} />}
    </>
  )
}

function ModalColaboracion({ onClose }: { onClose: () => void }) {
  const [enviado, setEnviado] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    asociacion: '', contacto: '', cargo: '',
    email: '', telefono: '', localidad: '',
    numPersonas: '', descripcion: '',
    aceptaPrivacidad: false,
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    await submitForm({
      tipo: 'colaboracion',
      nombre: form.contacto,
      email: form.email,
      telefono: form.telefono,
      asunto: `Colaboración Circo Inclusivo · ${form.asociacion}`,
      mensaje: form.descripcion,
      datos: {
        asociacion: form.asociacion, cargo: form.cargo,
        localidad: form.localidad, numPersonas: form.numPersonas,
      },
    })
    setLoading(false)
    setEnviado(true)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="bg-indigo-800 text-white px-6 py-5 rounded-t-2xl flex items-center justify-between sticky top-0 z-10">
          <div>
            <h2 className="text-lg font-black">Solicitud de colaboración</h2>
            <p className="text-indigo-300 text-sm">Circo inclusivo y psicomotricidad</p>
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
            <h3 className="text-xl font-black text-pm-navy mb-2">¡Solicitud recibida!</h3>
            <p className="text-gray-500 text-sm mb-6">
              Nos pondremos en contacto con vosotros en los próximos días para explorar una colaboración adaptada a vuestras necesidades.
            </p>
            <button onClick={onClose} className="bg-indigo-700 hover:bg-indigo-800 text-white font-bold px-8 py-3 rounded-xl transition-colors">
              Cerrar
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <p className="text-xs text-gray-500 leading-relaxed bg-indigo-50 border border-indigo-100 rounded-lg p-3">
              Completa este formulario y nos pondremos en contacto contigo para diseñar un programa adaptado a las necesidades de vuestra asociación o entidad.
            </p>

            {/* Nombre asociación */}
            <div>
              <label className="block text-xs font-semibold text-pm-navy mb-1.5">Nombre de la asociación / entidad *</label>
              <input required type="text" value={form.asociacion}
                onChange={e => setForm(f => ({ ...f, asociacion: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-500"
                placeholder="Ej. Asociación CADIG, ONCE, ASPACE..."
              />
            </div>

            {/* Contacto + Cargo */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-pm-navy mb-1.5">Persona de contacto *</label>
                <input required type="text" value={form.contacto}
                  onChange={e => setForm(f => ({ ...f, contacto: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-500"
                  placeholder="Nombre y apellidos"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-pm-navy mb-1.5">Cargo</label>
                <input type="text" value={form.cargo}
                  onChange={e => setForm(f => ({ ...f, cargo: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-500"
                  placeholder="Director/a, coordinador/a..."
                />
              </div>
            </div>

            {/* Email + Teléfono */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-pm-navy mb-1.5">Email *</label>
                <input required type="email" value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-500"
                  placeholder="correo@entidad.org"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-pm-navy mb-1.5">Teléfono *</label>
                <input required type="tel" value={form.telefono}
                  onChange={e => setForm(f => ({ ...f, telefono: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-500"
                  placeholder="600 000 000"
                />
              </div>
            </div>

            {/* Localidad + Nº personas */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-pm-navy mb-1.5">Localidad</label>
                <input type="text" value={form.localidad}
                  onChange={e => setForm(f => ({ ...f, localidad: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-500"
                  placeholder="Cuenca, Tarancón..."
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-pm-navy mb-1.5">Nº aproximado de personas</label>
                <select value={form.numPersonas}
                  onChange={e => setForm(f => ({ ...f, numPersonas: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-500 bg-white"
                >
                  <option value="">— Selecciona —</option>
                  <option>1 – 7 personas</option>
                  <option>8 – 15 personas</option>
                  <option>16 – 30 personas</option>
                  <option>Más de 30</option>
                </select>
              </div>
            </div>

            {/* Descripción */}
            <div>
              <label className="block text-xs font-semibold text-pm-navy mb-1.5">
                Cuéntanos sobre vuestra asociación y lo que buscáis
              </label>
              <textarea rows={4} value={form.descripcion}
                onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-500 resize-none"
                placeholder="Tipo de discapacidad, edades del grupo, disponibilidad horaria, objetivos que buscáis..."
              />
            </div>

            {/* Privacidad */}
            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" required checked={form.aceptaPrivacidad}
                onChange={e => setForm(f => ({ ...f, aceptaPrivacidad: e.target.checked }))}
                className="mt-0.5 accent-indigo-700 w-4 h-4 shrink-0"
              />
              <span className="text-xs text-gray-500 leading-relaxed">
                Acepto la <a href="#" className="text-indigo-700 underline">política de privacidad</a> y el tratamiento de mis datos para gestionar esta solicitud *
              </span>
            </label>

            <button type="submit" disabled={loading}
              className="w-full bg-indigo-700 hover:bg-indigo-800 disabled:opacity-60 text-white font-black text-sm tracking-wide py-4 rounded-xl transition-colors"
            >
              {loading ? 'Enviando...' : 'Enviar solicitud de colaboración'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
