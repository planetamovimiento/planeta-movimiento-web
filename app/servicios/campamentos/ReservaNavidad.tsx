'use client'

import { useState } from 'react'
import { submitBooking } from '@/lib/forms/actions'
import { FECHAS_NAVIDAD, formatFechaLarga } from './config'

export default function ReservaNavidad() {
  const [seleccionados, setSeleccionados] = useState<Set<string>>(new Set())
  const [numNinos, setNumNinos] = useState(1)
  const [form, setForm] = useState({ nombre: '', email: '', telefono: '', notas: '' })
  const [paso, setPaso] = useState<'seleccion' | 'datos' | 'confirmado'>('seleccion')
  const [enviando, setEnviando] = useState(false)

  function toggle(dia: string) {
    setSeleccionados(prev => {
      const next = new Set(prev)
      next.has(dia) ? next.delete(dia) : next.add(dia)
      return next
    })
  }

  function seleccionarTodo() {
    if (seleccionados.size === FECHAS_NAVIDAD.length) setSeleccionados(new Set())
    else setSeleccionados(new Set(FECHAS_NAVIDAD))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setEnviando(true)
    const dias = Array.from(seleccionados).sort()
    await submitBooking({
      servicio: 'Campamento de Navidad',
      cliente_nombre: form.nombre,
      cliente_email: form.email,
      cliente_telefono: form.telefono,
      fecha: dias[0],
      participantes: numNinos,
      observaciones: form.notas,
      datos: { diasSeleccionados: dias.join(', '), numNinos },
    })
    setEnviando(false)
    setPaso('confirmado')
  }

  const diasLabel: Record<string, string> = {
    '0': 'Dom', '1': 'Lun', '2': 'Mar', '3': 'Mié', '4': 'Jue', '5': 'Vie', '6': 'Sáb'
  }

  if (paso === 'confirmado') return (
    <div className="text-center py-6">
      <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
        <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/>
        </svg>
      </div>
      <h3 className="font-black text-pm-navy text-lg mb-2">¡Solicitud enviada!</h3>
      <p className="text-sm text-gray-600 mb-4">Nos pondremos en contacto contigo para confirmar la reserva del Campamento de Navidad.</p>
      <button onClick={() => { setPaso('seleccion'); setSeleccionados(new Set()) }} className="text-pm-red underline text-sm">
        Hacer otra reserva
      </button>
    </div>
  )

  return (
    <div className="space-y-4">
      {/* Fechas disponibles */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="font-black text-pm-navy text-sm">Fechas disponibles 2025-2026</div>
          <button onClick={seleccionarTodo}
            className="text-xs text-pm-red underline font-semibold">
            {seleccionados.size === FECHAS_NAVIDAD.length ? 'Quitar todos' : 'Seleccionar todos'}
          </button>
        </div>
        <div className="grid grid-cols-5 gap-2">
          {FECHAS_NAVIDAD.map(dia => {
            const d = new Date(dia + 'T12:00:00')
            const numDia = d.getDate()
            const diaSemana = diasLabel[d.getDay().toString()]
            const selec = seleccionados.has(dia)
            return (
              <button key={dia} onClick={() => toggle(dia)}
                className={`flex flex-col items-center py-3 rounded-xl border-2 transition-all ${
                  selec ? 'bg-blue-600 border-blue-600 text-white' : 'bg-pm-bg border-gray-200 text-gray-700 hover:border-blue-400'
                }`}>
                <span className="text-xs opacity-70 mb-0.5">{diaSemana}</span>
                <span className="text-lg font-black">{numDia}</span>
                <span className="text-xs opacity-70">dic</span>
              </button>
            )
          })}
        </div>
        <p className="text-xs text-gray-400 mt-3">Horario: 9:00 – 14:00 · Escuela de Superhéroes</p>
      </div>

      {seleccionados.size > 0 && (
        <>
          <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
            <div className="font-black text-pm-navy text-sm mb-3">👶 Número de niños</div>
            <div className="flex items-center gap-4">
              <button onClick={() => setNumNinos(n => Math.max(1, n - 1))} className="w-9 h-9 bg-pm-bg border border-gray-200 rounded-xl text-lg font-bold hover:border-pm-red transition-colors">−</button>
              <div className="text-3xl font-black text-pm-navy flex-1 text-center">{numNinos}</div>
              <button onClick={() => setNumNinos(n => n + 1)} className="w-9 h-9 bg-pm-bg border border-gray-200 rounded-xl text-lg font-bold hover:border-pm-red transition-colors">+</button>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm">
            <div className="font-black text-blue-800 mb-1">Resumen</div>
            <div className="text-blue-700">{seleccionados.size} día{seleccionados.size > 1 ? 's' : ''} seleccionado{seleccionados.size > 1 ? 's' : ''} · {numNinos} niño{numNinos > 1 ? 's' : ''}</div>
            <p className="text-xs text-blue-500 mt-1">El precio se confirma al contactar con el equipo.</p>
          </div>

          {paso === 'seleccion' && (
            <button onClick={() => setPaso('datos')} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-3.5 rounded-xl transition-colors">
              Continuar con mis datos →
            </button>
          )}

          {paso === 'datos' && (
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm space-y-3">
              <div className="font-black text-pm-navy text-sm mb-1">Datos de contacto</div>
              <input required type="text" placeholder="Nombre completo *" value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500"/>
              <input required type="email" placeholder="Email *" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500"/>
              <input required type="tel" placeholder="Teléfono *" value={form.telefono} onChange={e => setForm(f => ({ ...f, telefono: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500"/>
              <textarea rows={2} placeholder="Notas" value={form.notas} onChange={e => setForm(f => ({ ...f, notas: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500 resize-none"/>
              <div className="flex gap-2">
                <button type="button" onClick={() => setPaso('seleccion')} className="border border-gray-200 text-gray-600 text-sm font-bold px-4 py-3 rounded-xl hover:border-blue-400 transition-colors">← Volver</button>
                <button type="submit" disabled={!form.nombre || !form.email || !form.telefono || enviando} className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-black text-sm py-3 rounded-xl transition-colors">
                  {enviando ? 'Enviando...' : 'Enviar solicitud'}
                </button>
              </div>
            </form>
          )}
        </>
      )}
    </div>
  )
}
