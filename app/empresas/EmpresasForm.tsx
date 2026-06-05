'use client'

import { useState } from 'react'

export default function EmpresasForm() {
  const [sent, setSent] = useState(false)

  if (sent) {
    return (
      <div className="bg-white/10 rounded-2xl p-10 text-center">
        <div className="text-5xl mb-4">✅</div>
        <p className="font-black text-xl mb-2">¡Solicitud enviada!</p>
        <p className="text-gray-300 text-sm">Nuestro equipo de empresas te contactará en menos de 24 horas.</p>
      </div>
    )
  }

  return (
    <form
      className="bg-white/10 backdrop-blur rounded-2xl p-6 space-y-4"
      onSubmit={(e) => { e.preventDefault(); setSent(true) }}
    >
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-200 mb-1">Empresa</label>
          <input type="text" required placeholder="Nombre de la empresa" className="w-full rounded-xl px-4 py-3 text-pm-navy text-sm outline-none focus:ring-2 focus:ring-pm-red" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-200 mb-1">Nombre de contacto</label>
          <input type="text" required placeholder="Tu nombre" className="w-full rounded-xl px-4 py-3 text-pm-navy text-sm outline-none focus:ring-2 focus:ring-pm-red" />
        </div>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-200 mb-1">Email</label>
          <input type="email" required placeholder="tu@empresa.com" className="w-full rounded-xl px-4 py-3 text-pm-navy text-sm outline-none focus:ring-2 focus:ring-pm-red" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-200 mb-1">Teléfono</label>
          <input type="tel" required placeholder="600 000 000" className="w-full rounded-xl px-4 py-3 text-pm-navy text-sm outline-none focus:ring-2 focus:ring-pm-red" />
        </div>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-200 mb-1">Nº de personas</label>
          <select required className="w-full rounded-xl px-4 py-3 text-pm-navy text-sm outline-none focus:ring-2 focus:ring-pm-red">
            <option value="">Selecciona</option>
            <option>5-15 personas</option>
            <option>15-30 personas</option>
            <option>30-50 personas</option>
            <option>50+ personas</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-200 mb-1">Fecha aproximada</label>
          <input type="text" placeholder="Ej: septiembre 2026" className="w-full rounded-xl px-4 py-3 text-pm-navy text-sm outline-none focus:ring-2 focus:ring-pm-red" />
        </div>
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-200 mb-1">Actividad de interés</label>
        <select className="w-full rounded-xl px-4 py-3 text-pm-navy text-sm outline-none focus:ring-2 focus:ring-pm-red">
          <option value="">Selecciona una actividad</option>
          <option>Team Building Circense</option>
          <option>Retos de equilibrio</option>
          <option>Festival de circo</option>
          <option>Retiro activo (día completo)</option>
          <option>No lo tengo claro todavía</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-200 mb-1">Mensaje</label>
        <textarea rows={3} placeholder="Cuéntanos qué buscáis para vuestro equipo..." className="w-full rounded-xl px-4 py-3 text-pm-navy text-sm outline-none focus:ring-2 focus:ring-pm-red resize-none" />
      </div>
      <button type="submit" className="w-full bg-pm-red hover:bg-pm-red-dark text-white font-black py-3 rounded-xl transition-colors text-base">
        Enviar solicitud
      </button>
    </form>
  )
}
