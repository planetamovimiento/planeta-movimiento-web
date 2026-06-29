'use client'

import { useState } from 'react'

export default function ClubCTA() {
  const [sent, setSent] = useState(false)

  if (sent) {
    return (
      <div className="bg-white/20 rounded-2xl p-8 text-center">
        <div className="w-14 h-14 bg-white/25 rounded-full flex items-center justify-center mx-auto mb-3">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/></svg>
        </div>
        <p className="font-bold text-xl">¡Recibido! Te avisaremos pronto.</p>
      </div>
    )
  }

  return (
    <form
      className="bg-white/10 backdrop-blur rounded-2xl p-6 text-left space-y-4"
      onSubmit={(e) => { e.preventDefault(); setSent(true) }}
    >
      <div>
        <label className="block text-sm font-semibold mb-1 text-red-100">Nombre completo</label>
        <input
          type="text"
          required
          placeholder="Tu nombre"
          className="w-full rounded-xl px-4 py-3 text-pm-navy text-sm outline-none focus:ring-2 focus:ring-white"
        />
      </div>
      <div>
        <label className="block text-sm font-semibold mb-1 text-red-100">Email</label>
        <input
          type="email"
          required
          placeholder="tu@email.com"
          className="w-full rounded-xl px-4 py-3 text-pm-navy text-sm outline-none focus:ring-2 focus:ring-white"
        />
      </div>
      <div>
        <label className="block text-sm font-semibold mb-1 text-red-100">Actividad de interés</label>
        <select
          required
          className="w-full rounded-xl px-4 py-3 text-pm-navy text-sm outline-none focus:ring-2 focus:ring-white"
        >
          <option value="">Selecciona una actividad</option>
          <option>Acrobacia de suelo</option>
          <option>Malabares</option>
          <option>Trapecio y aéreos</option>
          <option>Equilibrio y contorsión</option>
        </select>
      </div>
      <button
        type="submit"
        className="w-full bg-white text-pm-red font-black py-3 rounded-xl hover:bg-red-50 transition-colors"
      >
        Reservar plaza
      </button>
    </form>
  )
}
