'use client'

import { useState, useTransition } from 'react'
import { guardarEvento, eliminarEvento, duplicarEvento, cambiarEstadoEvento } from './actions'
import { COLORES, PALETA, DIAS_SEMANA, type EventoClub, type TipoEvento } from '@/lib/calendario-club/tipos'

type Opciones = { actividades: string[]; grupos: string[]; monitores: string[]; ubicaciones: string[]; temporadas: string[] }
type Props = { evento: EventoClub | null; fechaPreset?: string; tipos: TipoEvento[]; opciones: Opciones; onClose: () => void; onDone: () => void }

const HOY = new Date().toISOString().slice(0, 10)

export default function EventoModal({ evento, fechaPreset, tipos, opciones, onClose, onDone }: Props) {
  const r = evento?.recurrencia
  const [tipo, setTipo] = useState(evento?.tipo ?? 'clase')
  const [titulo, setTitulo] = useState(evento?.titulo ?? '')
  const [actividad, setActividad] = useState(evento?.actividad ?? '')
  const [grupo, setGrupo] = useState(evento?.grupo ?? '')
  const [monitor, setMonitor] = useState(evento?.monitor ?? '')
  const [ubicacion, setUbicacion] = useState(evento?.ubicacion ?? '')
  const [temporada, setTemporada] = useState(evento?.temporada ?? '')
  const [fecha, setFecha] = useState(evento?.fecha ?? fechaPreset ?? HOY)
  const [fechaFin, setFechaFin] = useState(evento?.fecha_fin ?? '')
  const [todoDia, setTodoDia] = useState(evento?.todo_el_dia ?? false)
  const [horaInicio, setHoraInicio] = useState(evento?.hora_inicio ?? '16:00')
  const [horaFin, setHoraFin] = useState(evento?.hora_fin ?? '17:00')
  const [repetir, setRepetir] = useState(!!r)
  const [dias, setDias] = useState<number[]>(r?.dias ?? [])
  const [hasta, setHasta] = useState(r?.hasta ?? '')
  const [exFest, setExFest] = useState(r?.excluir_festivos ?? true)
  const [exSin, setExSin] = useState(r?.excluir_sin_clase ?? true)
  const [color, setColor] = useState(evento?.color ?? '')
  const [publico, setPublico] = useState(evento?.publico ?? true)
  const [descripcion, setDescripcion] = useState(evento?.descripcion ?? '')
  const [observaciones, setObservaciones] = useState(evento?.observaciones ?? '')
  const [error, setError] = useState('')
  const [pending, startTransition] = useTransition()

  const toggleDia = (n: number) => setDias(d => d.includes(n) ? d.filter(x => x !== n) : [...d, n].sort())
  const input = 'w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-pm-red'

  function guardar() {
    setError('')
    if (!titulo.trim()) { setError('El título es obligatorio'); return }
    if (repetir && dias.length === 0) { setError('Elige al menos un día de la semana para repetir'); return }
    startTransition(async () => {
      const res = await guardarEvento({
        id: evento?.id, tipo, titulo, actividad, grupo, monitor, ubicacion, temporada,
        fecha, fecha_fin: fechaFin || null,
        hora_inicio: horaInicio, hora_fin: horaFin, todo_el_dia: todoDia,
        recurrencia: repetir && dias.length ? { dias, hasta: hasta || fecha, excluir_festivos: exFest, excluir_sin_clase: exSin } : null,
        color: color || null, publico, descripcion, observaciones,
      })
      if (!res.ok) setError(res.error || 'Error al guardar'); else onDone()
    })
  }
  function accion(fn: () => Promise<{ ok: boolean; error?: string | null }>) {
    startTransition(async () => { const r = await fn(); if (!r.ok) setError(r.error || 'Error'); else onDone() })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-black/50 p-4 overflow-y-auto" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-8" onClick={e => e.stopPropagation()}>
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-black text-pm-navy">{evento?.id ? 'Editar evento' : 'Nuevo evento'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-pm-red text-xl leading-none">×</button>
        </div>

        <div className="p-6 space-y-3 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-gray-500">Tipo de evento</label>
              <select className={input} value={tipo} onChange={e => setTipo(e.target.value)}>
                {[...tipos].sort((a, b) => a.orden - b.orden).map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500">Título *</label>
              <input className={input} value={titulo} onChange={e => setTitulo(e.target.value)} placeholder="Ej. Gimnasia Acrobática · Iniciación 1" />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500">Actividad</label>
              <input className={input} list="cc-act" value={actividad} onChange={e => setActividad(e.target.value)} />
              <datalist id="cc-act">{opciones.actividades.map(a => <option key={a} value={a} />)}</datalist>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500">Grupo</label>
              <input className={input} list="cc-grp" value={grupo} onChange={e => setGrupo(e.target.value)} />
              <datalist id="cc-grp">{opciones.grupos.map(g => <option key={g} value={g} />)}</datalist>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500">Monitor</label>
              <input className={input} list="cc-mon" value={monitor} onChange={e => setMonitor(e.target.value)} />
              <datalist id="cc-mon">{opciones.monitores.map(m => <option key={m} value={m} />)}</datalist>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500">Ubicación</label>
              <input className={input} list="cc-ubi" value={ubicacion} onChange={e => setUbicacion(e.target.value)} />
              <datalist id="cc-ubi">{opciones.ubicaciones.map(u => <option key={u} value={u} />)}</datalist>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500">Temporada</label>
              <input className={input} list="cc-temp" value={temporada} onChange={e => setTemporada(e.target.value)} />
              <datalist id="cc-temp">{opciones.temporadas.map(t => <option key={t} value={t} />)}</datalist>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500">Color</label>
              <select className={input} value={color} onChange={e => setColor(e.target.value)}>
                <option value="">Color del tipo (por defecto)</option>
                {COLORES.map(c => <option key={c} value={c}>{PALETA[c].label}</option>)}
              </select>
            </div>
          </div>

          {/* Fechas y horas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 border-t border-gray-100 pt-3">
            <div>
              <label className="text-xs font-bold text-gray-500">{repetir ? 'Fecha de inicio' : 'Fecha'}</label>
              <input type="date" className={input} value={fecha} onChange={e => setFecha(e.target.value)} />
            </div>
            {!repetir && (
              <div>
                <label className="text-xs font-bold text-gray-500">Fecha fin (opcional, varios días)</label>
                <input type="date" className={input} value={fechaFin} onChange={e => setFechaFin(e.target.value)} />
              </div>
            )}
            <label className="flex items-center gap-2 text-sm text-gray-600 self-end">
              <input type="checkbox" className="accent-pm-red" checked={todoDia} onChange={e => setTodoDia(e.target.checked)} /> Todo el día (sin horas)
            </label>
            {!todoDia && (
              <div className="flex gap-2">
                <div className="flex-1"><label className="text-xs font-bold text-gray-500">Inicio</label><input type="time" className={input} value={horaInicio} onChange={e => setHoraInicio(e.target.value)} /></div>
                <div className="flex-1"><label className="text-xs font-bold text-gray-500">Fin</label><input type="time" className={input} value={horaFin} onChange={e => setHoraFin(e.target.value)} /></div>
              </div>
            )}
          </div>

          {/* Recurrencia */}
          <div className="border-t border-gray-100 pt-3">
            <label className="flex items-center gap-2 text-sm font-bold text-pm-navy">
              <input type="checkbox" className="accent-pm-red" checked={repetir} onChange={e => setRepetir(e.target.checked)} /> Repetir semanalmente (clase recurrente)
            </label>
            {repetir && (
              <div className="mt-3 space-y-3 bg-pm-bg border border-gray-200 rounded-xl p-3">
                <div>
                  <div className="text-xs font-bold text-gray-500 mb-1">Días de la semana</div>
                  <div className="flex flex-wrap gap-1">
                    {DIAS_SEMANA.map(d => (
                      <button key={d.n} type="button" onClick={() => toggleDia(d.n)}
                        className={`w-10 h-9 rounded-lg text-xs font-bold border ${dias.includes(d.n) ? 'bg-pm-red text-white border-pm-red' : 'border-gray-200 text-gray-500 hover:border-pm-red'}`}>{d.corto}</button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div><label className="text-xs font-bold text-gray-500">Repetir hasta</label><input type="date" className={input} value={hasta} onChange={e => setHasta(e.target.value)} /></div>
                </div>
                <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-gray-600">
                  <label className="flex items-center gap-2"><input type="checkbox" className="accent-pm-red" checked={exFest} onChange={e => setExFest(e.target.checked)} /> Excluir festivos</label>
                  <label className="flex items-center gap-2"><input type="checkbox" className="accent-pm-red" checked={exSin} onChange={e => setExSin(e.target.checked)} /> Excluir días sin clase</label>
                </div>
              </div>
            )}
          </div>

          {/* Otros */}
          <div className="border-t border-gray-100 pt-3 space-y-3">
            <label className="flex items-center gap-2 text-sm text-gray-600">
              <input type="checkbox" className="accent-pm-red" checked={publico} onChange={e => setPublico(e.target.checked)} /> Visible en el calendario para familias
            </label>
            <div><label className="text-xs font-bold text-gray-500">Descripción</label><textarea rows={2} className={input} value={descripcion} onChange={e => setDescripcion(e.target.value)} /></div>
            <div><label className="text-xs font-bold text-gray-500">Observaciones internas (no salen en el PDF de familias)</label><textarea rows={2} className={input} value={observaciones} onChange={e => setObservaciones(e.target.value)} /></div>
          </div>

          {error && <p className="text-pm-red text-sm">{error}</p>}
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between gap-2 flex-wrap">
          <div className="flex gap-3">
            {evento && (
              <>
                <button onClick={() => accion(() => duplicarEvento(evento.id))} disabled={pending} className="text-sm text-gray-500 hover:text-pm-navy font-semibold">Duplicar</button>
                <button onClick={() => accion(() => cambiarEstadoEvento(evento.id, evento.estado === 'cancelado' ? 'activo' : 'cancelado'))} disabled={pending} className="text-sm text-amber-600 hover:text-amber-700 font-semibold">{evento.estado === 'cancelado' ? 'Reactivar' : 'Cancelar'}</button>
                <button onClick={() => { if (confirm('¿Eliminar este evento y toda su serie?')) accion(() => eliminarEvento(evento.id)) }} disabled={pending} className="text-sm text-gray-400 hover:text-pm-red font-semibold">Eliminar</button>
              </>
            )}
          </div>
          <div className="flex gap-2 ml-auto">
            <button onClick={onClose} className="border border-gray-200 text-gray-600 font-bold px-5 py-2 rounded-xl text-sm">Cancelar</button>
            <button onClick={guardar} disabled={pending || !titulo.trim()} className="bg-pm-red hover:bg-pm-red-dark disabled:opacity-50 text-white font-bold px-5 py-2 rounded-xl text-sm">{pending ? 'Guardando…' : 'Guardar'}</button>
          </div>
        </div>
      </div>
    </div>
  )
}
