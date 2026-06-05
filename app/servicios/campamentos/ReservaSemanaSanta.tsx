'use client'

import { useState } from 'react'
import { FECHAS_SEMANA_SANTA, formatFechaLarga } from './config'

export default function ReservaSemanaSanta() {
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
    if (seleccionados.size === FECHAS_SEMANA_SANTA.length) setSeleccionados(new Set())
    else setSeleccionados(new Set(FECHAS_SEMANA_SANTA))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setEnviando(true)
    await new Promise(r => setTimeout(r, 1300))
    setEnviando(false)
    setPaso('confirmado')
  }

  const diasLabel: Record<string, string> = {
    '0': 'Dom', '1': 'Lun', '2': 'Mar', '3': 'Mié', '4': 'Jue', '5': 'Vie', '6': 'Sáb'
  }
  const mesesLabel: Record<string, string> = {
    '0': 'ene', '1': 'feb', '2': 'mar', '3': 'abr', '4': 'may', '5': 'jun',
    '6': 'jul', '7': 'ago', '8': 'sep', '9': 'oct', '10': 'nov', '11': 'dic',
  }

  if (paso === 'confirmado') return (
    <div className="text-center py-6">
      <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
        <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/>
        </svg>
      </div>
      <h3 className="font-black text-pm-navy text-lg mb-2">¡Solicitud enviada!</h3>
      <p className="text-sm text-gray-600 mb-4">Nos pondremos en contacto contigo para confirmar la reserva del Campamento de Semana Santa.</p>
      <button onClick={() => { setPaso('seleccion'); setSeleccionados(new Set()) }} className="text-pm-red underline text-sm">Hacer otra reserva</button>
    </div>
  )

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="font-black text-pm-navy text-sm">Fechas disponibles — Semana Santa 2026</div>
          <button onClick={seleccionarTodo} className="text-xs text-pm-red underline font-semibold">
            {seleccionados.size === FECHAS_SEMANA_SANTA.length ? 'Quitar todos' : 'Seleccionar todos'}
          </button>
        </div>
        <div className="grid grid-cols-5 gap-2">
          {FECHAS_SEMANA_SANTA.map(dia => {
            const d = new Date(dia + 'T12:00:00')
            const selec = seleccionados.has(dia)
            return (
              <button key={dia} onClick={() => toggle(dia)}
                className={`flex flex-col items-center py-3 rounded-xl border-2 transition-all ${
                  selec ? 'bg-violet-600 border-violet-600 text-white' : 'bg-pm-bg border-gray-200 text-gray-700 hover:border-violet-400'
                }`}>
                <span className="text-xs opacity-70 mb-0.5">{diasLabel[d.getDay().toString()]}</span>
                <span className="text-lg font-black">{d.getDate()}</span>
                <span className="text-xs opacity-70">{mesesLabel[d.getMonth().toString()]}</span>
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

          <div className="bg-violet-50 border border-violet-200 rounded-xl p-4 text-sm">
            <div className="font-black text-violet-800 mb-1">Resumen</div>
            <div className="text-violet-700">{seleccionados.size} día{seleccionados.size > 1 ? 's' : ''} · {numNinos} niño{numNinos > 1 ? 's' : ''}</div>
            <p className="text-xs text-violet-500 mt-1">El precio se confirma al contactar con el equipo.</p>
          </div>

          {paso === 'seleccion' && (
            <button onClick={() => setPaso('datos')} className="w-full bg-violet-600 hover:bg-violet-700 text-white font-black py-3.5 rounded-xl transition-colors">
              Continuar con mis datos →
            </button>
          )}

          {paso === 'datos' && (
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm space-y-3">
              <div className="font-black text-pm-navy text-sm mb-1">Datos de contacto</div>
              <input required type="text" placeholder="Nombre completo *" value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-violet-500"/>
              <input required type="email" placeholder="Email *" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-violet-500"/>
              <input required type="tel" placeholder="Teléfono *" value={form.telefono} onChange={e => setForm(f => ({ ...f, telefono: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-violet-500"/>
              <textarea rows={2} placeholder="Notas" value={form.notas} onChange={e => setForm(f => ({ ...f, notas: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-violet-500 resize-none"/>
              <div className="flex gap-2">
                <button type="button" onClick={() => setPaso('seleccion')} className="border border-gray-200 text-gray-600 text-sm font-bold px-4 py-3 rounded-xl hover:border-violet-400 transition-colors">← Volver</button>
                <button type="submit" disabled={!form.nombre || !form.email || !form.telefono || enviando} className="flex-1 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white font-black text-sm py-3 rounded-xl transition-colors">
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
