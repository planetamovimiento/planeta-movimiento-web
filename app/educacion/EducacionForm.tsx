'use client'

import { useState } from 'react'

export default function EducacionForm() {
  const [sent, setSent] = useState(false)

  if (sent) {
    return (
      <div className="bg-pm-bg rounded-2xl p-8 text-center">
        <div className="text-4xl mb-3">✅</div>
        <p className="font-bold text-pm-navy text-xl">¡Mensaje enviado!</p>
        <p className="text-gray-500 text-sm mt-2">Te contactaremos en menos de 24 horas.</p>
      </div>
    )
  }

  return (
    <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setSent(true) }}>
      <div>
        <label className="block text-sm font-semibold text-pm-navy mb-1">Nombre del colegio</label>
        <input type="text" required placeholder="CEIP / IES / Colegio..." className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-pm-red" />
      </div>
      <div>
        <label className="block text-sm font-semibold text-pm-navy mb-1">Email de contacto</label>
        <input type="email" required placeholder="direccion@colegio.es" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-pm-red" />
      </div>
      <div>
        <label className="block text-sm font-semibold text-pm-navy mb-1">Teléfono</label>
        <input type="tel" required placeholder="657 604 665" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-pm-red" />
      </div>
      <div>
        <label className="block text-sm font-semibold text-pm-navy mb-1">Programa de interés</label>
        <select required className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-pm-red">
          <option value="">Selecciona un programa</option>
          <option>Visita de un día</option>
          <option>Programa trimestral</option>
          <option>Campamento escolar</option>
          <option>Extraescolares semanales</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-semibold text-pm-navy mb-1">Mensaje</label>
        <textarea rows={3} placeholder="Cuéntanos qué necesitáis..." className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-pm-red resize-none" />
      </div>
      <button type="submit" className="w-full bg-pm-red hover:bg-pm-red-dark text-white font-black py-3 rounded-xl transition-colors">
        Enviar solicitud
      </button>
    </form>
  )
}
