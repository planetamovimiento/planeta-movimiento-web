'use client'

import { useState, useMemo, useTransition, useCallback } from 'react'
import { Metric, EmptyState } from '@/components/admin/ui'
import { waCliente } from '@/lib/whatsapp'
import {
  MESES_TEMPORADA, ESTADO_PAGO_META, CICLO_PAGO, ESTADOS_GENERAL, GRUPOS_BASE, GRUPOS_EXTRA, TEMPORADAS, ACTIVIDADES_CLUB,
  labelEstadoGeneral, mesActualKey, edadDe, fechaCorta,
  type Alumno, type Grupo, type EstadoPago, type EstadoGeneral,
} from '@/lib/club/constants'
import { guardarGestion, setPagoMes, crearGrupo, renombrarGrupo, eliminarGrupo, fijarHorarioGrupo, fijarWhatsappGrupo } from './actions'
import ImportarModal from './ImportarModal'
import { SubirImagen } from '@/components/admin/SubirImagen'

const MES_ACTUAL = mesActualKey() ?? 'jun'

function mensajeWhatsApp(a: Alumno): string {
  const nombre = a.nombre || ''
  const saludo = nombre ? `Hola ${nombre} 👋` : 'Hola 👋'
  const act = a.actividad ? ` sobre ${a.actividad}` : ''
  return `${saludo}, te escribimos del Club Deportivo Origen (Planeta Movimiento)${act}. ¿Te viene bien que hablemos? ¡Gracias!`
}

export default function ClubInscripcionesClient({
  alumnos: alumnosIniciales, grupos: gruposIniciales, puedeEditar, gestionOk,
}: {
  alumnos: Alumno[]; grupos: Grupo[]; puedeEditar: boolean; gestionOk: boolean
}) {
  const [lista, setLista] = useState<Alumno[]>(alumnosIniciales)
  const [grupos, setGrupos] = useState<Grupo[]>(gruposIniciales)
  const [, startTransition] = useTransition()
  const [error, setError] = useState('')

  // ── Filtros ──────────────────────────────────────────────────────────────
  const [q, setQ] = useState('')
  const [fActividad, setFActividad] = useState('')
  const [fGrupo, setFGrupo] = useState('')
  const [fTemporada, setFTemporada] = useState('')
  const [fEstado, setFEstado] = useState('')
  const [fMes, setFMes] = useState('')
  const [fPago, setFPago] = useState('')

  const [detalleId, setDetalleId] = useState<string | null>(null)
  const [modalGrupos, setModalGrupos] = useState(false)
  const [modalImportar, setModalImportar] = useState(false)

  const detalle = lista.find(a => a.id === detalleId) ?? null

  // ── Derivados ──────────────────────────────────────────────────────────────
  const actividades = useMemo(
    () => Array.from(new Set([...ACTIVIDADES_CLUB, ...lista.map(a => a.actividad)].filter(Boolean))).sort((a, b) => a.localeCompare(b, 'es')),
    [lista]
  )

  /** Grupos disponibles para una actividad: globales + de esa actividad + los ya usados. */
  const gruposParaActividad = useCallback((actividad: string): string[] => {
    const cfg = grupos.filter(g => !g.actividad || g.actividad === actividad).map(g => g.nombre)
    const base = cfg.length > 0 ? cfg : [...GRUPOS_BASE]
    const usados = lista.filter(a => !actividad || a.actividad === actividad).map(a => a.grupo).filter(Boolean)
    return Array.from(new Set([...base, ...usados, ...GRUPOS_EXTRA]))
  }, [grupos, lista])

  const gruposFiltro = useMemo(() => gruposParaActividad(fActividad), [gruposParaActividad, fActividad])

  // ── Filtrado principal ─────────────────────────────────────────────────────
  const coincide = useCallback((a: Alumno) => {
    if (q.trim()) {
      const t = q.trim().toLowerCase()
      if (!(`${a.nombre} ${a.apellidos} ${a.nombreCompleto}`.toLowerCase().includes(t))) return false
    }
    if (fActividad && a.actividad !== fActividad) return false
    if (fGrupo && a.grupo !== fGrupo) return false
    if (fTemporada && a.temporada !== fTemporada) return false
    if (fEstado && a.estado_general !== fEstado) return false
    if (fPago) {
      if (fMes) {
        const e: EstadoPago | '' = (a.pagos[fMes] as EstadoPago | undefined) ?? ''
        if (fPago === 'sin' ? e !== '' : e !== fPago) return false
      } else {
        // cualquier mes con ese estado
        const valores: (EstadoPago | '')[] = MESES_TEMPORADA.map(m => (a.pagos[m.key] as EstadoPago | undefined) ?? '')
        if (fPago === 'sin' ? !valores.some(v => v === '') : !valores.includes(fPago as EstadoPago)) return false
      }
    }
    return true
  }, [q, fActividad, fGrupo, fTemporada, fEstado, fMes, fPago])

  const filtradas = useMemo(() => lista.filter(coincide), [lista, coincide])

  // Contadores por grupo (ignoran el filtro de grupo para mostrar el reparto)
  const contadores = useMemo(() => {
    const coincideSinGrupo = (a: Alumno) => {
      if (q.trim() && !`${a.nombre} ${a.apellidos}`.toLowerCase().includes(q.trim().toLowerCase())) return false
      if (fActividad && a.actividad !== fActividad) return false
      if (fTemporada && a.temporada !== fTemporada) return false
      if (fEstado && a.estado_general !== fEstado) return false
      return true
    }
    const mapa = new Map<string, { actividad: string; grupo: string; n: number }>()
    lista.filter(coincideSinGrupo).forEach(a => {
      const grupo = a.grupo || 'Sin grupo'
      const clave = `${a.actividad}||${grupo}`
      const cur = mapa.get(clave) ?? { actividad: a.actividad, grupo, n: 0 }
      cur.n++
      mapa.set(clave, cur)
    })
    return Array.from(mapa.values()).sort((x, y) =>
      x.actividad.localeCompare(y.actividad, 'es') || x.grupo.localeCompare(y.grupo, 'es'))
  }, [lista, q, fActividad, fTemporada, fEstado])

  // Métricas globales
  const metricas = useMemo(() => {
    const total = lista.length
    const activos = lista.filter(a => a.estado_general === 'activo').length
    const bajas = lista.filter(a => a.estado_general === 'baja').length
    const pendientesPago = lista.filter(a =>
      a.estado_general !== 'baja' && a.estado_general !== 'archivado' && (a.pagos[MES_ACTUAL] ?? '') !== 'pagado'
    ).length
    return { total, activos, bajas, pendientesPago }
  }, [lista])

  const hayFiltros = !!(q || fActividad || fGrupo || fTemporada || fEstado || fMes || fPago)
  function limpiar() { setQ(''); setFActividad(''); setFGrupo(''); setFTemporada(''); setFEstado(''); setFMes(''); setFPago('') }

  // ── Mutaciones (optimistas) ──────────────────────────────────────────────
  const patchLocal = useCallback((id: string, patch: Partial<Alumno>) => {
    setLista(prev => prev.map(a => (a.id === id ? { ...a, ...patch } : a)))
  }, [])

  function aplicarGestion(id: string, patch: Partial<Alumno>) {
    if (!puedeEditar) return
    patchLocal(id, patch)
    startTransition(async () => {
      const r = await guardarGestion(id, patch as never)
      if (!r.ok) setError(r.error || 'No se pudo guardar')
    })
  }

  function cicloPago(a: Alumno, mes: string) {
    if (!puedeEditar) return
    const actual = (a.pagos[mes] ?? '') as EstadoPago | ''
    const idx = CICLO_PAGO.indexOf(actual)
    const siguiente = CICLO_PAGO[(idx + 1) % CICLO_PAGO.length]
    const nuevos = { ...a.pagos }
    if (siguiente) nuevos[mes] = siguiente as EstadoPago
    else delete nuevos[mes]
    patchLocal(a.id, { pagos: nuevos })
    startTransition(async () => {
      const r = await setPagoMes(a.id, mes, siguiente)
      if (!r.ok) setError(r.error || 'No se pudo guardar el pago')
    })
  }

  function exportarCSV() {
    const cols = [
      'Nombre', 'Apellidos', 'Actividad', 'Grupo', 'Fecha nacimiento', 'Edad', 'Tutor legal',
      'Teléfono', 'Email', 'Inscrito', 'Estado general', 'Temporada',
      ...MESES_TEMPORADA.map(m => m.nombre), 'Observaciones', 'Fecha alta', 'Fecha baja',
    ]
    const esc = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`
    const lineas = filtradas.map(a => [
      a.nombre, a.apellidos, a.actividad, a.grupo, a.fechaNacimiento, edadDe(a.fechaNacimiento) ?? '',
      a.tutorLegal, a.telefono, a.email, fechaCorta(a.created_at), labelEstadoGeneral(a.estado_general), a.temporada,
      ...MESES_TEMPORADA.map(m => ESTADO_PAGO_META[a.pagos[m.key] as EstadoPago]?.label ?? ''),
      a.observaciones, fechaCorta(a.fecha_alta), fechaCorta(a.fecha_baja),
    ].map(esc).join(';'))
    const csv = '﻿' + [cols.map(esc).join(';'), ...lineas].join('\r\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `inscripciones-club-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-4">
      {!gestionOk && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-sm text-amber-800">
          <div className="font-black mb-1">⚙️ Falta una migración</div>
          Ejecuta una vez <code className="bg-amber-100 px-1.5 py-0.5 rounded">supabase/migration_club.sql</code> en el
          SQL Editor de Supabase para poder guardar grupos, estados y pagos. Mientras tanto puedes ver los datos pero los cambios no se guardarán.
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700 flex justify-between">
          <span>{error}</span>
          <button onClick={() => setError('')} className="font-bold">✕</button>
        </div>
      )}

      {/* Métricas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Metric label="Alumnos inscritos" valor={metricas.total} tono="navy" />
        <Metric label="Activos" valor={metricas.activos} tono="green" />
        <Metric label={`Pago pendiente · ${MESES_TEMPORADA.find(m => m.key === MES_ACTUAL)?.nombre ?? ''}`} valor={metricas.pendientesPago} tono="amber" />
        <Metric label="En baja" valor={metricas.bajas} tono="red" />
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">
        <div className="flex flex-wrap items-center gap-2.5">
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar por nombre o apellidos…"
            className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm flex-1 min-w-[200px] focus:outline-none focus:border-pm-red" />
          <select value={fActividad} onChange={e => { setFActividad(e.target.value); setFGrupo('') }}
            className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:border-pm-red">
            <option value="">Todas las actividades</option>
            {actividades.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
          <select value={fGrupo} onChange={e => setFGrupo(e.target.value)}
            className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:border-pm-red">
            <option value="">Todos los grupos</option>
            {gruposFiltro.map(g => <option key={g} value={g}>{g}</option>)}
            <option value="Sin grupo">Sin grupo</option>
          </select>
          <select value={fEstado} onChange={e => setFEstado(e.target.value)}
            className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:border-pm-red">
            <option value="">Cualquier estado</option>
            {ESTADOS_GENERAL.map(e => <option key={e.id} value={e.id}>{e.label}</option>)}
          </select>
          <select value={fTemporada} onChange={e => setFTemporada(e.target.value)}
            className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:border-pm-red">
            <option value="">Toda temporada</option>
            {TEMPORADAS.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Pago</span>
          <select value={fMes} onChange={e => setFMes(e.target.value)}
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:border-pm-red">
            <option value="">Cualquier mes</option>
            {MESES_TEMPORADA.map(m => <option key={m.key} value={m.key}>{m.nombre}</option>)}
          </select>
          <select value={fPago} onChange={e => setFPago(e.target.value)}
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:border-pm-red">
            <option value="">Cualquier pago</option>
            <option value="pagado">Pagado</option>
            <option value="pendiente">Pendiente</option>
            <option value="baja">Baja</option>
            <option value="sin">Sin definir</option>
          </select>
          {hayFiltros && <button onClick={limpiar} className="text-xs font-semibold text-pm-red hover:underline px-2 py-1">Limpiar filtros</button>}

          <div className="ml-auto flex items-center gap-2">
            {puedeEditar && (
              <>
                <button onClick={() => setModalImportar(true)} className="text-sm font-semibold text-pm-navy border border-gray-200 hover:border-pm-navy rounded-xl px-3 py-2 transition-colors">
                  ⬆ Importar CSV/Excel
                </button>
                <button onClick={() => setModalGrupos(true)} className="text-sm font-semibold text-pm-navy border border-gray-200 hover:border-pm-navy rounded-xl px-3 py-2 transition-colors">
                  ⚙️ Gestionar grupos
                </button>
              </>
            )}
            <button onClick={exportarCSV} className="text-sm font-bold text-white bg-pm-navy hover:bg-pm-navy-md rounded-xl px-3 py-2 transition-colors">
              ⬇ Exportar CSV/Excel
            </button>
          </div>
        </div>
      </div>

      {/* Contadores por grupo */}
      {contadores.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {contadores.map(c => {
            const activo = fGrupo === c.grupo && (!fActividad || fActividad === c.actividad)
            return (
              <button key={`${c.actividad}||${c.grupo}`}
                onClick={() => { setFActividad(c.actividad); setFGrupo(c.grupo === 'Sin grupo' ? 'Sin grupo' : c.grupo) }}
                className={`text-xs rounded-full border px-3 py-1.5 transition-colors ${activo ? 'bg-pm-red border-pm-red text-white' : 'bg-white border-gray-200 text-pm-navy hover:border-pm-red'}`}>
                <span className="font-semibold">{c.actividad || 'Sin actividad'}</span>
                <span className="opacity-60"> · {c.grupo}</span>
                <span className={`ml-1.5 font-black ${activo ? '' : 'text-pm-red'}`}>{c.n}</span>
              </button>
            )
          })}
        </div>
      )}

      {/* Leyenda + recuento */}
      <div className="flex items-center justify-between flex-wrap gap-2 text-xs text-gray-500">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-green-500" /> Pagado</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-amber-500" /> Pendiente</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-red-500" /> Baja</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-white border border-gray-300" /> Sin definir</span>
        </div>
        <span className="font-semibold">{filtradas.length} {filtradas.length === 1 ? 'alumno' : 'alumnos'}</span>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {filtradas.length === 0 ? (
          <EmptyState icon="🏅" titulo="Sin inscripciones" desc="Las inscripciones recibidas desde los formularios del Club aparecerán aquí." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-pm-bg text-xs text-gray-500 uppercase tracking-wider">
                <tr>
                  <th className="text-left font-bold px-4 py-3 sticky left-0 bg-pm-bg z-10">Alumno</th>
                  <th className="text-left font-bold px-3 py-3">Actividad</th>
                  <th className="text-left font-bold px-3 py-3">Grupo</th>
                  <th className="text-left font-bold px-3 py-3">Edad</th>
                  <th className="text-left font-bold px-3 py-3">Tutor</th>
                  <th className="text-left font-bold px-3 py-3">Teléfono</th>
                  <th className="text-left font-bold px-3 py-3">Inscrito</th>
                  <th className="text-left font-bold px-3 py-3">Estado</th>
                  <th className="text-center font-bold px-3 py-3">Temporada (Sep → Jun)</th>
                  <th className="text-right font-bold px-4 py-3">Ficha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtradas.map(a => (
                  <tr key={a.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2.5 sticky left-0 bg-white z-10">
                      <div className="font-semibold text-pm-navy whitespace-nowrap">{a.nombre} <span className="text-gray-500">{a.apellidos}</span></div>
                      <div className="text-xs text-gray-400 truncate max-w-[180px]">{a.email}</div>
                    </td>
                    <td className="px-3 py-2.5 whitespace-nowrap text-gray-600">{a.actividad || '—'}</td>
                    <td className="px-3 py-2.5">
                      <select value={a.grupo} disabled={!puedeEditar} onChange={e => aplicarGestion(a.id, { grupo: e.target.value })}
                        className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs bg-white focus:outline-none focus:border-pm-red max-w-[150px] disabled:opacity-60">
                        <option value="">— Sin grupo —</option>
                        {gruposParaActividad(a.actividad).map(g => <option key={g} value={g}>{g}</option>)}
                        {a.grupo && !gruposParaActividad(a.actividad).includes(a.grupo) && <option value={a.grupo}>{a.grupo}</option>}
                      </select>
                    </td>
                    <td className="px-3 py-2.5 whitespace-nowrap text-gray-600" title={a.fechaNacimiento}>
                      {edadDe(a.fechaNacimiento) != null ? `${edadDe(a.fechaNacimiento)} años` : '—'}
                    </td>
                    <td className="px-3 py-2.5 whitespace-nowrap text-gray-600 max-w-[140px] truncate">{a.tutorLegal || '—'}</td>
                    <td className="px-3 py-2.5 whitespace-nowrap text-gray-600">{a.telefono || '—'}</td>
                    <td className="px-3 py-2.5 whitespace-nowrap text-gray-500 text-xs">{fechaCorta(a.created_at)}</td>
                    <td className="px-3 py-2.5">
                      <select value={a.estado_general} disabled={!puedeEditar} onChange={e => aplicarGestion(a.id, { estado_general: e.target.value as EstadoGeneral })}
                        className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs bg-white focus:outline-none focus:border-pm-red disabled:opacity-60">
                        {ESTADOS_GENERAL.map(e => <option key={e.id} value={e.id}>{e.label}</option>)}
                      </select>
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center justify-center gap-1">
                        {MESES_TEMPORADA.map(m => <CirculoMes key={m.key} alumno={a} mesKey={m.key} mesLabel={m.label} mesNombre={m.nombre} onClick={() => setDetalleId(a.id)} editable />)}
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <button onClick={() => setDetalleId(a.id)} className="text-pm-red font-bold text-xs hover:underline whitespace-nowrap">Ver ficha →</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Ficha del alumno */}
      {detalle && (
        <FichaAlumno
          a={detalle}
          puedeEditar={puedeEditar}
          gruposActividad={gruposParaActividad(detalle.actividad)}
          onClose={() => setDetalleId(null)}
          onGestion={p => aplicarGestion(detalle.id, p)}
          onPago={mes => cicloPago(detalle, mes)}
        />
      )}

      {/* Importar CSV / Excel */}
      {modalImportar && <ImportarModal onClose={() => setModalImportar(false)} />}

      {/* Gestión de grupos */}
      {modalGrupos && (
        <ModalGrupos
          grupos={grupos} actividades={actividades}
          onClose={() => setModalGrupos(false)}
          onCrear={(nombre, act) => startTransition(async () => {
            const r = await crearGrupo(nombre, act)
            if (r.ok) setGrupos(prev => [...prev, { id: crypto.randomUUID(), actividad: act, nombre, orden: 99 }])
            else setError(r.error || 'No se pudo crear')
          })}
          onRenombrar={(id, nombre) => startTransition(async () => {
            const r = await renombrarGrupo(id, nombre)
            if (r.ok) setGrupos(prev => prev.map(g => g.id === id ? { ...g, nombre } : g))
            else setError(r.error || 'No se pudo renombrar')
          })}
          onEliminar={(id) => startTransition(async () => {
            const r = await eliminarGrupo(id)
            if (r.ok) setGrupos(prev => prev.filter(g => g.id !== id))
            else setError(r.error || 'No se pudo eliminar')
          })}
          onHorario={(id, horario) => startTransition(async () => {
            const r = await fijarHorarioGrupo(id, horario)
            if (r.ok) setGrupos(prev => prev.map(g => g.id === id ? { ...g, horario } : g))
            else setError(r.error || 'No se pudo guardar el horario')
          })}
          onWhatsapp={(id, whatsapp_url) => startTransition(async () => {
            const r = await fijarWhatsappGrupo(id, whatsapp_url)
            if (r.ok) setGrupos(prev => prev.map(g => g.id === id ? { ...g, whatsapp_url } : g))
            else setError(r.error || 'No se pudo guardar el enlace')
          })}
        />
      )}
    </div>
  )
}

// ─── Círculo de estado mensual ─────────────────────────────────────────────────
function CirculoMes({ alumno, mesKey, mesLabel, mesNombre, onClick, editable }: {
  alumno: Alumno; mesKey: string; mesLabel: string; mesNombre: string; onClick: () => void; editable: boolean
}) {
  const estado = (alumno.pagos[mesKey] ?? '') as EstadoPago | ''
  const meta = estado ? ESTADO_PAGO_META[estado] : null
  return (
    <div className="flex flex-col items-center gap-0.5">
      <button onClick={onClick} disabled={!editable} title={`${mesNombre}: ${meta?.label ?? 'sin definir'} · abrir ficha para editar`}
        className={`w-5 h-5 rounded-full border transition-transform ${editable ? 'hover:scale-125 cursor-pointer' : 'cursor-default'} ${meta ? `${meta.dot} border-transparent` : 'bg-white border-gray-300'}`} />
      <span className="text-[9px] text-gray-400 leading-none">{mesLabel}</span>
    </div>
  )
}

// ─── Ficha del alumno (panel lateral) ──────────────────────────────────────────
function FichaAlumno({ a, puedeEditar, gruposActividad, onClose, onGestion, onPago }: {
  a: Alumno; puedeEditar: boolean; gruposActividad: string[]
  onClose: () => void; onGestion: (p: Partial<Alumno>) => void; onPago: (mes: string) => void
}) {
  const [obs, setObs] = useState(a.observaciones)
  const [obsFam, setObsFam] = useState(a.observaciones_familia)
  const [horario, setHorario] = useState(a.horario)
  const [whatsapp, setWhatsapp] = useState(a.whatsapp_url)
  const edad = edadDe(a.fechaNacimiento)

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white h-full overflow-y-auto shadow-2xl">
        <div className="bg-pm-navy text-white px-5 py-4 flex items-center justify-between sticky top-0 z-10">
          <div>
            <div className="font-black text-lg">{a.nombre} {a.apellidos}</div>
            <div className="text-white/60 text-xs">{a.actividad || 'Sin actividad'} · {a.temporada}</div>
          </div>
          <button onClick={onClose} className="text-white/60 hover:text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>

        <div className="p-5 space-y-5 text-sm">
          {/* Estado general */}
          <div>
            <div className="text-xs font-black text-pm-navy uppercase tracking-wider mb-2">Estado general</div>
            <div className="flex flex-wrap gap-1.5">
              {ESTADOS_GENERAL.map(e => (
                <button key={e.id} disabled={!puedeEditar} onClick={() => onGestion({ estado_general: e.id })}
                  className={`text-xs font-bold px-3 py-1.5 rounded-full border transition-colors ${a.estado_general === e.id ? `${e.badge} border-transparent ring-2 ring-offset-1 ring-pm-navy/20` : 'border-gray-200 text-gray-500 hover:border-pm-navy'}`}>
                  {e.label}
                </button>
              ))}
            </div>
          </div>

          {/* Datos personales */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-2">
            <Dato k="Nombre" v={a.nombre} />
            <Dato k="Apellidos" v={a.apellidos} />
            <Dato k="Fecha nacimiento" v={a.fechaNacimiento ? `${fechaCorta(a.fechaNacimiento)}${edad != null ? ` · ${edad} años` : ''}` : '—'} />
            <Dato k="Nivel solicitado" v={a.nivel || '—'} />
            <Dato k="Tutor legal" v={a.tutorLegal || '—'} />
            <Dato k="Teléfono" v={a.telefono || '—'} />
            <Dato k="Email" v={a.email || '—'} />
            <Dato k="Inscrito el" v={fechaCorta(a.created_at)} />
            <Dato k="Fecha de alta" v={fechaCorta(a.fecha_alta)} />
            <Dato k="Fecha de baja" v={fechaCorta(a.fecha_baja)} />
          </div>

          {/* Actividad / Grupo / Temporada */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Grupo</label>
              <select value={a.grupo} disabled={!puedeEditar} onChange={e => onGestion({ grupo: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-2.5 py-2 text-sm bg-white focus:outline-none focus:border-pm-red disabled:opacity-60">
                <option value="">— Sin grupo —</option>
                {gruposActividad.map(g => <option key={g} value={g}>{g}</option>)}
                {a.grupo && !gruposActividad.includes(a.grupo) && <option value={a.grupo}>{a.grupo}</option>}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Temporada</label>
              <select value={a.temporada} disabled={!puedeEditar} onChange={e => onGestion({ temporada: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-2.5 py-2 text-sm bg-white focus:outline-none focus:border-pm-red disabled:opacity-60">
                {TEMPORADAS.map(t => <option key={t} value={t}>{t}</option>)}
                {!TEMPORADAS.includes(a.temporada) && <option value={a.temporada}>{a.temporada}</option>}
              </select>
            </div>
          </div>

          {/* Portal de Familias — datos visibles para la familia */}
          <div className="border-t border-gray-100 pt-4">
            <div className="text-xs font-black text-pm-navy uppercase tracking-wider mb-3">
              Portal de Familias <span className="text-gray-400 font-medium normal-case">· lo que ve la familia</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Foto del alumno</label>
                {puedeEditar ? (
                  <SubirImagen value={a.foto_url} onChange={url => onGestion({ foto_url: url })} carpeta="club-alumnos" />
                ) : a.foto_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={a.foto_url} alt={a.nombre} className="w-24 h-24 rounded-xl object-cover border border-gray-200" />
                ) : (
                  <span className="text-xs text-gray-400">Sin foto</span>
                )}
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Horario (visible)</label>
                <input value={horario} disabled={!puedeEditar} onChange={e => setHorario(e.target.value)}
                  placeholder="Ej. Lunes y miércoles · 16:00–17:00"
                  className="w-full border border-gray-200 rounded-lg px-2.5 py-2 text-sm focus:outline-none focus:border-pm-red disabled:opacity-60" />
                {puedeEditar && horario !== a.horario && (
                  <button onClick={() => onGestion({ horario })} className="mt-1.5 bg-pm-navy text-white text-xs font-bold px-3 py-1.5 rounded-lg">Guardar horario</button>
                )}
              </div>
            </div>
            <div className="mt-3">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Enlace al grupo de WhatsApp <span className="text-gray-300 normal-case">(opcional · anula el del grupo)</span></label>
              <input value={whatsapp} disabled={!puedeEditar} onChange={e => setWhatsapp(e.target.value)} placeholder="https://chat.whatsapp.com/…"
                className="w-full border border-gray-200 rounded-lg px-2.5 py-2 text-sm focus:outline-none focus:border-pm-red disabled:opacity-60" />
              {puedeEditar && whatsapp !== a.whatsapp_url && (
                <button onClick={() => onGestion({ whatsapp_url: whatsapp })} className="mt-1.5 bg-pm-navy text-white text-xs font-bold px-3 py-1.5 rounded-lg">Guardar enlace</button>
              )}
            </div>

            <div className="mt-3">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Observaciones visibles para la familia</label>
              <textarea value={obsFam} disabled={!puedeEditar} onChange={e => setObsFam(e.target.value)} rows={2}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-pm-red resize-none disabled:opacity-60"
                placeholder="Mensaje o información que verá la familia (no son las notas internas)" />
              {puedeEditar && obsFam !== a.observaciones_familia && (
                <button onClick={() => onGestion({ observaciones_familia: obsFam })} className="mt-1.5 bg-pm-navy text-white text-xs font-bold px-3 py-1.5 rounded-lg">Guardar observación</button>
              )}
            </div>
          </div>

          {/* Historial de pagos */}
          <div>
            <div className="text-xs font-black text-pm-navy uppercase tracking-wider mb-2">Estado mensual de pago</div>
            <div className="grid grid-cols-5 gap-2">
              {MESES_TEMPORADA.map(m => {
                const estado = (a.pagos[m.key] ?? '') as EstadoPago | ''
                const meta = estado ? ESTADO_PAGO_META[estado] : null
                return (
                  <button key={m.key} disabled={!puedeEditar} onClick={() => onPago(m.key)} title="Clic para cambiar"
                    className={`flex flex-col items-center gap-1 rounded-xl border py-2 transition-colors ${meta ? 'border-transparent' : 'border-gray-200'} ${editableBg(estado)}`}>
                    <span className="text-[11px] font-bold text-gray-600">{m.label}</span>
                    <span className={`w-3.5 h-3.5 rounded-full ${meta ? meta.dot : 'bg-white border border-gray-300'}`} />
                  </button>
                )
              })}
            </div>
            <p className="text-xs text-gray-400 mt-2">Clic en cada mes para alternar: sin definir → pagado → pendiente → baja.</p>
          </div>

          {/* Observaciones */}
          <div>
            <label className="block text-xs font-black text-pm-navy uppercase tracking-wider mb-1.5">Observaciones internas</label>
            <textarea value={obs} disabled={!puedeEditar} onChange={e => setObs(e.target.value)} rows={3}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-pm-red resize-none disabled:opacity-60"
              placeholder="Notas internas sobre el alumno, pagos, incidencias…" />
            {puedeEditar && obs !== a.observaciones && (
              <button onClick={() => onGestion({ observaciones: obs })} className="mt-2 bg-pm-navy text-white text-xs font-bold px-4 py-2 rounded-lg">Guardar observaciones</button>
            )}
          </div>

          {/* Acciones de contacto */}
          <div className="flex gap-2 flex-wrap border-t border-gray-100 pt-4">
            {a.email && <a href={`mailto:${a.email}`} className="bg-pm-navy text-white text-sm font-bold px-4 py-2 rounded-xl">Email</a>}
            {a.telefono && <a href={waCliente(a.telefono, mensajeWhatsApp(a))} target="_blank" rel="noopener noreferrer" className="bg-green-600 text-white text-sm font-bold px-4 py-2 rounded-xl">WhatsApp</a>}
          </div>
          {a.mensaje && (
            <div className="bg-pm-bg rounded-xl p-3">
              <div className="text-xs font-bold text-gray-400 uppercase mb-1">Mensaje de la familia</div>
              <p className="text-gray-600 whitespace-pre-wrap text-sm">{a.mensaje}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function editableBg(estado: EstadoPago | '') {
  if (estado === 'pagado') return 'bg-green-50 hover:bg-green-100'
  if (estado === 'pendiente') return 'bg-amber-50 hover:bg-amber-100'
  if (estado === 'baja') return 'bg-red-50 hover:bg-red-100'
  return 'bg-white hover:bg-gray-50'
}

function Dato({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">{k}</div>
      <div className="text-pm-navy font-semibold break-words">{v}</div>
    </div>
  )
}

// ─── Modal de gestión de grupos ────────────────────────────────────────────────
function ModalGrupos({ grupos, actividades, onClose, onCrear, onRenombrar, onEliminar, onHorario, onWhatsapp }: {
  grupos: Grupo[]; actividades: string[]
  onClose: () => void
  onCrear: (nombre: string, actividad: string | null) => void
  onRenombrar: (id: string, nombre: string) => void
  onEliminar: (id: string) => void
  onHorario: (id: string, horario: string) => void
  onWhatsapp: (id: string, url: string) => void
}) {
  const [nuevo, setNuevo] = useState('')
  const [nuevaAct, setNuevaAct] = useState('')

  const globales = grupos.filter(g => !g.actividad)
  const porActividad = actividades.map(act => ({ act, items: grupos.filter(g => g.actividad === act) })).filter(x => x.items.length > 0)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[88vh] overflow-y-auto">
        <div className="bg-pm-navy text-white px-5 py-4 flex items-center justify-between sticky top-0">
          <div className="font-black">Gestionar grupos</div>
          <button onClick={onClose} className="text-white/60 hover:text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>
        <div className="p-5 space-y-5 text-sm">
          {/* Crear */}
          <div className="bg-pm-bg rounded-xl p-3 space-y-2">
            <div className="text-xs font-black text-pm-navy uppercase tracking-wider">Crear grupo</div>
            <div className="flex gap-2">
              <input value={nuevo} onChange={e => setNuevo(e.target.value)} placeholder="Nombre del grupo"
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-pm-red" />
              <select value={nuevaAct} onChange={e => setNuevaAct(e.target.value)}
                className="border border-gray-200 rounded-lg px-2 py-2 text-sm bg-white focus:outline-none focus:border-pm-red">
                <option value="">Global</option>
                {actividades.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
              <button onClick={() => { if (nuevo.trim()) { onCrear(nuevo.trim(), nuevaAct || null); setNuevo('') } }}
                className="bg-pm-red text-white font-bold px-4 py-2 rounded-lg text-sm">Añadir</button>
            </div>
            <p className="text-xs text-gray-400">«Global» = disponible en todas las actividades. O asígnalo a una actividad concreta.</p>
          </div>

          {/* Globales */}
          <FilaGrupos titulo="Grupos globales" items={globales} onRenombrar={onRenombrar} onEliminar={onEliminar} onHorario={onHorario} onWhatsapp={onWhatsapp} />

          {/* Por actividad */}
          {porActividad.map(({ act, items }) => (
            <FilaGrupos key={act} titulo={act} items={items} onRenombrar={onRenombrar} onEliminar={onEliminar} onHorario={onHorario} onWhatsapp={onWhatsapp} />
          ))}
        </div>
      </div>
    </div>
  )
}

function FilaGrupos({ titulo, items, onRenombrar, onEliminar, onHorario, onWhatsapp }: {
  titulo: string; items: Grupo[]; onRenombrar: (id: string, nombre: string) => void; onEliminar: (id: string) => void; onHorario: (id: string, horario: string) => void; onWhatsapp: (id: string, url: string) => void
}) {
  if (items.length === 0) return null
  const inp = 'border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-pm-red'
  return (
    <div>
      <div className="text-xs font-black text-gray-400 uppercase tracking-wider mb-2">{titulo}</div>
      <div className="space-y-2">
        {items.map(g => (
          <div key={g.id} className="border border-gray-100 rounded-xl p-2 space-y-1.5">
            <div className="flex items-center gap-2">
              <input defaultValue={g.nombre} onBlur={e => { if (e.target.value.trim() && e.target.value !== g.nombre) onRenombrar(g.id, e.target.value.trim()) }}
                className={`${inp} flex-1`} title="Nombre del grupo" />
              <button onClick={() => { if (confirm(`¿Eliminar el grupo «${g.nombre}»?`)) onEliminar(g.id) }}
                className="text-gray-300 hover:text-red-500 transition-colors p-1.5 shrink-0" title="Eliminar grupo">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input defaultValue={g.horario ?? ''} placeholder="Horario (ej. L y X · 16:00-17:00)" onBlur={e => { if (e.target.value !== (g.horario ?? '')) onHorario(g.id, e.target.value.trim()) }}
                className={inp} title="Horario por defecto del grupo (visible para las familias)" />
              <input defaultValue={g.whatsapp_url ?? ''} placeholder="URL del grupo de WhatsApp" onBlur={e => { if (e.target.value !== (g.whatsapp_url ?? '')) onWhatsapp(g.id, e.target.value.trim()) }}
                className={inp} title="Enlace al grupo de WhatsApp (visible para las familias)" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
