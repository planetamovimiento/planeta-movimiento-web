'use client'

import { useState, useTransition } from 'react'
import { guardarExcepcion, quitarExcepcion } from './actions'
import { paleta, type Ocurrencia } from '@/lib/calendario-club/tipos'

type Props = { ocurrencia: Ocurrencia; color: string; onEditarSerie: () => void; onClose: () => void; onDone: () => void }

export default function OcurrenciaModal({ ocurrencia: o, color, onEditarSerie, onClose, onDone }: Props) {
  const [editando, setEditando] = useState(false)
  const [titulo, setTitulo] = useState(o.titulo)
  const [horaInicio, setHoraInicio] = useState(o.hora_inicio ?? '')
  const [horaFin, setHoraFin] = useState(o.hora_fin ?? '')
  const [monitor, setMonitor] = useState(o.monitor ?? '')
  const [ubicacion, setUbicacion] = useState(o.ubicacion ?? '')
  const [error, setError] = useState('')
  const [pending, startTransition] = useTransition()

  const fechaLarga = new Date(o.fecha + 'T12:00:00').toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  const input = 'w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-pm-red'

  function correr(fn: () => Promise<{ ok: boolean; error?: string | null }>) {
    setError('')
    startTransition(async () => { const r = await fn(); if (!r.ok) setError(r.error || 'Error'); else onDone() })
  }
  function guardarSesion() {
    correr(() => guardarExcepcion({
      evento_id: o.eventoId, fecha: o.fecha, accion: 'modificar',
      cambios: { titulo, hora_inicio: horaInicio || null, hora_fin: horaFin || null, monitor: monitor || null, ubicacion: ubicacion || null },
    }))
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-black/50 p-4 overflow-y-auto" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg my-8" onClick={e => e.stopPropagation()}>
        <div className={`px-6 py-4 ${paleta(color).solid} rounded-t-2xl flex items-center justify-between`}>
          <div>
            <div className="font-black">{o.titulo}</div>
            <div className="text-xs opacity-80 capitalize">{fechaLarga}{o.hora_inicio ? ` · ${o.hora_inicio}${o.hora_fin ? `–${o.hora_fin}` : ''}` : ''}</div>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white text-xl leading-none">×</button>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-xs text-gray-500">Esta es una <strong>sesión de una clase recurrente</strong>. Puedes editar toda la serie o solo esta sesión concreta.</p>

          {!editando ? (
            <div className="grid grid-cols-1 gap-2">
              <button onClick={onEditarSerie} className="text-left border border-gray-200 rounded-xl px-4 py-3 hover:border-pm-red">
                <div className="font-bold text-pm-navy text-sm">✏️ Editar toda la serie</div>
                <div className="text-xs text-gray-500">Cambia el horario, días, etc. de todas las sesiones.</div>
              </button>
              <button onClick={() => setEditando(true)} className="text-left border border-gray-200 rounded-xl px-4 py-3 hover:border-pm-red">
                <div className="font-bold text-pm-navy text-sm">🕒 Editar solo esta sesión</div>
                <div className="text-xs text-gray-500">Cambios solo para el {o.fecha} (no afecta al resto).</div>
              </button>
              <button onClick={() => correr(() => guardarExcepcion({ evento_id: o.eventoId, fecha: o.fecha, accion: 'cancelar' }))} disabled={pending}
                className="text-left border border-amber-200 bg-amber-50 rounded-xl px-4 py-3 hover:border-amber-400">
                <div className="font-bold text-amber-700 text-sm">🚫 Cancelar solo esta sesión</div>
                <div className="text-xs text-amber-600">Marca esta sesión como cancelada.</div>
              </button>
              <button onClick={() => correr(() => quitarExcepcion(o.eventoId, o.fecha))} disabled={pending}
                className="text-left border border-gray-200 rounded-xl px-4 py-3 hover:border-pm-red">
                <div className="font-bold text-pm-navy text-sm">↩️ Restaurar esta sesión</div>
                <div className="text-xs text-gray-500">Deshace cualquier cambio o cancelación de este día.</div>
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div><label className="text-xs font-bold text-gray-500">Título</label><input className={input} value={titulo} onChange={e => setTitulo(e.target.value)} /></div>
              <div className="flex gap-2">
                <div className="flex-1"><label className="text-xs font-bold text-gray-500">Inicio</label><input type="time" className={input} value={horaInicio} onChange={e => setHoraInicio(e.target.value)} /></div>
                <div className="flex-1"><label className="text-xs font-bold text-gray-500">Fin</label><input type="time" className={input} value={horaFin} onChange={e => setHoraFin(e.target.value)} /></div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div><label className="text-xs font-bold text-gray-500">Monitor</label><input className={input} value={monitor} onChange={e => setMonitor(e.target.value)} /></div>
                <div><label className="text-xs font-bold text-gray-500">Ubicación</label><input className={input} value={ubicacion} onChange={e => setUbicacion(e.target.value)} /></div>
              </div>
              <div className="flex gap-2 justify-end">
                <button onClick={() => setEditando(false)} className="border border-gray-200 text-gray-600 font-bold px-4 py-2 rounded-xl text-sm">Volver</button>
                <button onClick={guardarSesion} disabled={pending} className="bg-pm-red hover:bg-pm-red-dark disabled:opacity-50 text-white font-bold px-5 py-2 rounded-xl text-sm">{pending ? 'Guardando…' : 'Guardar esta sesión'}</button>
              </div>
            </div>
          )}

          {error && <p className="text-pm-red text-sm">{error}</p>}
        </div>
      </div>
    </div>
  )
}
