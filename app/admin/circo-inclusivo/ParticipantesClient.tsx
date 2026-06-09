'use client'

import { useMemo, useState, useTransition } from 'react'
import Link from 'next/link'
import { guardarParticipante, eliminarParticipante, type ParticipanteInput } from './actions'
import { ESTADOS, labelEstado, type Participante, type Grupo, type Actividad, type EstadoParticipante } from '@/lib/circo-inclusivo/tipos'

function calcEdad(fecha?: string | null): number | null {
  if (!fecha) return null
  const f = new Date(fecha)
  if (isNaN(f.getTime())) return null
  const h = new Date()
  let e = h.getFullYear() - f.getFullYear()
  const m = h.getMonth() - f.getMonth()
  if (m < 0 || (m === 0 && h.getDate() < f.getDate())) e--
  return e
}

const estadoColor = (e: EstadoParticipante) => ESTADOS.find(x => x.valor === e)?.color ?? 'bg-gray-100 text-gray-500 border-gray-300'

type Props = { participantes: Participante[]; grupos: Grupo[]; actividades: Actividad[]; puedeGestionar: boolean }

export default function ParticipantesClient({ participantes, grupos, actividades, puedeGestionar }: Props) {
  const [q, setQ] = useState('')
  const [fGrupo, setFGrupo] = useState('')
  const [fEntidad, setFEntidad] = useState('')
  const [fActividad, setFActividad] = useState('')
  const [fEstado, setFEstado] = useState('')
  const [editando, setEditando] = useState<Participante | null>(null)
  const [creando, setCreando] = useState(false)

  const grupoNombre = useMemo(() => new Map(grupos.map(g => [g.id, g.nombre])), [grupos])
  const entidades = useMemo(() => Array.from(new Set(participantes.map(p => p.entidad).filter(Boolean))) as string[], [participantes])
  const actividadesNombres = useMemo(() => Array.from(new Set([...actividades.map(a => a.nombre), ...participantes.map(p => p.actividad).filter(Boolean) as string[]])), [actividades, participantes])

  const filtrados = participantes.filter(p => {
    const nombre = `${p.nombre} ${p.apellidos ?? ''}`.toLowerCase()
    if (q && !nombre.includes(q.toLowerCase())) return false
    if (fGrupo && p.grupo_id !== fGrupo) return false
    if (fEntidad && p.entidad !== fEntidad) return false
    if (fActividad && p.actividad !== fActividad) return false
    if (fEstado && p.estado !== fEstado) return false
    return true
  })

  return (
    <div className="p-4 lg:p-8 space-y-5">
      {/* Barra de filtros */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-wrap gap-2 items-center">
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar participante…"
          className="flex-1 min-w-[180px] border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-pm-red" />
        <select value={fGrupo} onChange={e => setFGrupo(e.target.value)} className="border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white">
          <option value="">Todos los grupos</option>
          {grupos.map(g => <option key={g.id} value={g.id}>{g.nombre}</option>)}
        </select>
        <select value={fEntidad} onChange={e => setFEntidad(e.target.value)} className="border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white">
          <option value="">Todas las entidades</option>
          {entidades.map(e => <option key={e} value={e}>{e}</option>)}
        </select>
        <select value={fActividad} onChange={e => setFActividad(e.target.value)} className="border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white">
          <option value="">Todas las actividades</option>
          {actividadesNombres.map(a => <option key={a} value={a}>{a}</option>)}
        </select>
        <select value={fEstado} onChange={e => setFEstado(e.target.value)} className="border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white">
          <option value="">Todos los estados</option>
          {ESTADOS.map(e => <option key={e.valor} value={e.valor}>{e.label}</option>)}
        </select>
        {puedeGestionar && (
          <button onClick={() => { setCreando(true); setEditando(null) }} className="bg-pm-red hover:bg-pm-red-dark text-white font-bold px-4 py-2 rounded-xl text-sm whitespace-nowrap">
            + Añadir participante
          </button>
        )}
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 text-sm text-gray-500">{filtrados.length} participante(s)</div>
        {filtrados.length === 0 ? (
          <div className="p-10 text-center text-gray-400 text-sm">
            {participantes.length === 0 ? 'Aún no hay participantes. Añade el primero con el botón de arriba.' : 'Ningún participante coincide con los filtros.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left text-xs text-gray-500 uppercase tracking-wider">
                  <th className="px-5 py-3 font-semibold">Participante</th>
                  <th className="px-5 py-3 font-semibold">Edad</th>
                  <th className="px-5 py-3 font-semibold">Grupo</th>
                  <th className="px-5 py-3 font-semibold">Actividad</th>
                  <th className="px-5 py-3 font-semibold">Entidad</th>
                  <th className="px-5 py-3 font-semibold">Estado</th>
                  <th className="px-5 py-3 font-semibold text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtrados.map(p => {
                  const edad = calcEdad(p.fecha_nacimiento)
                  return (
                    <tr key={p.id} className="hover:bg-gray-50">
                      <td className="px-5 py-3">
                        <Link href={`/admin/circo-inclusivo/participantes/${p.id}`} className="font-semibold text-pm-navy hover:text-pm-red">
                          {p.nombre} {p.apellidos ?? ''}
                        </Link>
                      </td>
                      <td className="px-5 py-3 text-gray-600">{edad != null ? `${edad} años` : '—'}</td>
                      <td className="px-5 py-3 text-gray-600">{p.grupo_id ? grupoNombre.get(p.grupo_id) ?? '—' : '—'}</td>
                      <td className="px-5 py-3 text-gray-600">{p.actividad ?? '—'}</td>
                      <td className="px-5 py-3 text-gray-600">{p.entidad ?? '—'}</td>
                      <td className="px-5 py-3"><span className={`text-xs font-semibold border px-2 py-0.5 rounded-full ${estadoColor(p.estado)}`}>{labelEstado(p.estado)}</span></td>
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/admin/circo-inclusivo/participantes/${p.id}`} className="text-xs font-semibold text-pm-navy hover:text-pm-red">Ficha →</Link>
                          {puedeGestionar && (
                            <button onClick={() => { setEditando(p); setCreando(false) }} className="text-xs font-semibold text-gray-500 hover:text-pm-red">Editar</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {(creando || editando) && puedeGestionar && (
        <FormParticipante
          inicial={editando}
          grupos={grupos}
          entidades={entidades}
          actividades={actividadesNombres}
          onClose={() => { setCreando(false); setEditando(null) }}
        />
      )}
    </div>
  )
}

function FormParticipante(
  { inicial, grupos, entidades, actividades, onClose }:
  { inicial: Participante | null; grupos: Grupo[]; entidades: string[]; actividades: string[]; onClose: () => void },
) {
  const [f, setF] = useState<ParticipanteInput>({
    id: inicial?.id,
    nombre: inicial?.nombre ?? '',
    apellidos: inicial?.apellidos ?? '',
    fecha_nacimiento: inicial?.fecha_nacimiento ?? '',
    entidad: inicial?.entidad ?? '',
    grupo_id: inicial?.grupo_id ?? '',
    actividad: inicial?.actividad ?? '',
    observaciones: inicial?.observaciones ?? '',
    necesidades_apoyo: inicial?.necesidades_apoyo ?? '',
    info_monitor: inicial?.info_monitor ?? '',
    estado: inicial?.estado ?? 'activo',
  })
  const [error, setError] = useState('')
  const [pending, startTransition] = useTransition()
  const set = (k: keyof ParticipanteInput, v: string) => setF(prev => ({ ...prev, [k]: v }))

  function guardar() {
    setError('')
    startTransition(async () => {
      const r = await guardarParticipante(f)
      if (!r.ok) setError(r.error || 'Error al guardar')
      else onClose()
    })
  }
  function borrar() {
    if (!f.id) return
    if (!confirm('¿Eliminar este participante y todas sus evaluaciones? Esta acción no se puede deshacer.')) return
    startTransition(async () => {
      const r = await eliminarParticipante(f.id!)
      if (!r.ok) setError(r.error || 'Error al eliminar')
      else onClose()
    })
  }

  const inputCls = 'w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-pm-red'

  return (
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-black/50 p-4 overflow-y-auto" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-8" onClick={e => e.stopPropagation()}>
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-black text-pm-navy">{f.id ? 'Editar participante' : 'Nuevo participante'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-pm-red text-xl leading-none">×</button>
        </div>
        <div className="p-6 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div><label className="text-xs font-bold text-gray-500">Nombre *</label><input className={inputCls} value={f.nombre} onChange={e => set('nombre', e.target.value)} /></div>
            <div><label className="text-xs font-bold text-gray-500">Apellidos</label><input className={inputCls} value={f.apellidos} onChange={e => set('apellidos', e.target.value)} /></div>
            <div><label className="text-xs font-bold text-gray-500">Fecha de nacimiento</label><input type="date" className={inputCls} value={f.fecha_nacimiento ?? ''} onChange={e => set('fecha_nacimiento', e.target.value)} /></div>
            <div>
              <label className="text-xs font-bold text-gray-500">Entidad o centro</label>
              <input className={inputCls} list="ci-entidades" value={f.entidad} onChange={e => set('entidad', e.target.value)} />
              <datalist id="ci-entidades">{entidades.map(e => <option key={e} value={e} />)}</datalist>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500">Grupo asignado</label>
              <select className={inputCls} value={f.grupo_id ?? ''} onChange={e => set('grupo_id', e.target.value)}>
                <option value="">— Sin grupo —</option>
                {grupos.map(g => <option key={g.id} value={g.id}>{g.nombre}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500">Actividad asignada</label>
              <input className={inputCls} list="ci-actividades" value={f.actividad} onChange={e => set('actividad', e.target.value)} />
              <datalist id="ci-actividades">{actividades.map(a => <option key={a} value={a} />)}</datalist>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500">Estado</label>
              <select className={inputCls} value={f.estado} onChange={e => set('estado', e.target.value)}>
                {ESTADOS.map(e => <option key={e.valor} value={e.valor}>{e.label}</option>)}
              </select>
            </div>
          </div>
          <div><label className="text-xs font-bold text-gray-500">Observaciones generales</label><textarea rows={2} className={inputCls} value={f.observaciones} onChange={e => set('observaciones', e.target.value)} /></div>
          <div><label className="text-xs font-bold text-gray-500">Necesidades de apoyo</label><textarea rows={2} className={inputCls} value={f.necesidades_apoyo} onChange={e => set('necesidades_apoyo', e.target.value)} /></div>
          <div><label className="text-xs font-bold text-gray-500">Información relevante para el monitor</label><textarea rows={2} className={inputCls} value={f.info_monitor} onChange={e => set('info_monitor', e.target.value)} /></div>
          {error && <p className="text-pm-red text-sm">{error}</p>}
        </div>
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
          {f.id ? <button onClick={borrar} disabled={pending} className="text-sm text-gray-400 hover:text-pm-red font-semibold">Eliminar</button> : <span />}
          <div className="flex gap-2">
            <button onClick={onClose} className="border border-gray-200 text-gray-600 font-bold px-5 py-2 rounded-xl text-sm">Cancelar</button>
            <button onClick={guardar} disabled={pending || !f.nombre.trim()} className="bg-pm-red hover:bg-pm-red-dark disabled:opacity-50 text-white font-bold px-5 py-2 rounded-xl text-sm">
              {pending ? 'Guardando…' : 'Guardar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
