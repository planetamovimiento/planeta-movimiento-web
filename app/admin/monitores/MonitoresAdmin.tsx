'use client'

import { useState, useMemo, useTransition } from 'react'
import { AdminHeader, Metric } from '@/components/admin/ui'
import { SubirImagen } from '@/components/admin/SubirImagen'
import { ACTIVIDADES_MONITOR, ESTADOS_MONITOR, badgeEstadoMonitor, labelEstadoMonitor, resumenHoras, resumenHorasActividades, horasActividad, horasDeFichaje, fmtHoras } from '@/lib/monitores/constants'
import { crearMonitor, editarMonitor, eliminarMonitor, asignarActividad, editarActividad, eliminarActividad } from './actions'
import Calendario from './Calendario'
import Recursos from './Recursos'
import type { Monitor, Actividad, Fichaje, Carpeta, Documento } from '@/lib/monitores/tipos'

const fechaLarga = (s: string) => new Intl.DateTimeFormat('es-ES', { weekday: 'short', day: 'numeric', month: 'short' }).format(new Date(s + 'T12:00:00'))
const horaCorta = (iso: string) => new Date(iso).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })

type Tab = 'equipo' | 'calendario' | 'horas' | 'recursos'

export default function MonitoresAdmin({ monitores, actividades, fichajes, carpetas, documentos, puedeBorrar, puedeEditar }: {
  monitores: Monitor[]; actividades: Actividad[]; fichajes: Fichaje[]; carpetas: Carpeta[]; documentos: Documento[]; puedeBorrar: boolean; puedeEditar: boolean
}) {
  const [tab, setTab] = useState<Tab>('equipo')
  const [ficha, setFicha] = useState<Monitor | 'nuevo' | null>(null)
  const [actModal, setActModal] = useState<Actividad | 'nueva' | null>(null)
  const [monSel, setMonSel] = useState('')
  const [error, setError] = useState('')

  const nombreDe = useMemo(() => {
    const m = new Map(monitores.map(x => [x.id, `${x.nombre} ${x.apellidos}`.trim()]))
    return (id: string) => m.get(id) ?? '—'
  }, [monitores])

  const actsFiltradas = monSel ? actividades.filter(a => a.monitor_id === monSel) : actividades
  const fichajesMon = monSel ? fichajes.filter(f => f.monitor_id === monSel) : fichajes
  const horas = resumenHoras(fichajesMon)
  const horasNom = resumenHorasActividades(actsFiltradas)

  return (
    <>
      <AdminHeader titulo="Monitores · Equipo de trabajo" subtitulo="Fichas, calendario de actividades, fichajes, horas y recursos" />
      <div className="p-4 lg:p-6 space-y-4">
        <div className="flex flex-wrap gap-1 bg-white rounded-xl border border-gray-100 p-1 w-fit">
          {([['equipo', 'Equipo'], ['calendario', 'Calendario'], ['horas', 'Fichajes y horas'], ['recursos', 'Recursos']] as const).map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)} className={`px-4 py-2 rounded-lg text-sm font-semibold ${tab === id ? 'bg-pm-red text-white' : 'text-gray-500 hover:bg-gray-50'}`}>{label}</button>
          ))}
        </div>
        {error && <p className="text-red-600 text-sm">{error}</p>}

        {/* ── EQUIPO ── */}
        {tab === 'equipo' && (
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <Metric label="Monitores" valor={monitores.length} tono="navy" />
              {puedeEditar && <button onClick={() => setFicha('nuevo')} className="bg-pm-red hover:bg-pm-red-dark text-white font-bold text-sm px-4 py-2.5 rounded-xl">+ Añadir monitor</button>}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {monitores.map(m => (
                <button key={m.id} onClick={() => setFicha(m)} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:border-pm-red/40 transition-colors p-4 text-left flex gap-3 items-center">
                  {m.foto_url
                    // eslint-disable-next-line @next/next/no-img-element
                    ? <img src={m.foto_url} alt="" className="w-12 h-12 rounded-full object-cover shrink-0" />
                    : <div className="w-12 h-12 rounded-full bg-pm-navy/10 flex items-center justify-center text-pm-navy font-black shrink-0">{(m.nombre || m.email)[0]?.toUpperCase()}</div>}
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-pm-navy truncate">{`${m.nombre} ${m.apellidos}`.trim() || m.email}</div>
                    <div className="text-xs text-gray-400 truncate">{m.especialidades.join(', ') || m.email}</div>
                  </div>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${badgeEstadoMonitor(m.estado)}`}>{labelEstadoMonitor(m.estado)}</span>
                </button>
              ))}
              {monitores.length === 0 && <p className="text-gray-400 text-sm col-span-full py-8 text-center">No hay monitores todavía{puedeEditar ? '. Pulsa «Añadir monitor».' : '.'}</p>}
            </div>
          </div>
        )}

        {/* ── CALENDARIO ── */}
        {tab === 'calendario' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <SelectorMonitor monitores={monitores} value={monSel} onChange={setMonSel} />
              {puedeEditar && <button onClick={() => setActModal('nueva')} className="bg-pm-navy text-white font-bold text-sm px-4 py-2 rounded-xl">+ Asignar actividad</button>}
            </div>
            {puedeEditar && <p className="text-xs text-gray-400">Pulsa cualquier actividad del calendario o de la lista para editarla o eliminarla.</p>}
            <Calendario actividades={actsFiltradas} nombreMonitor={monSel ? undefined : nombreDe} onEditarActividad={puedeEditar ? a => setActModal(a) : undefined} />
            <ListaActividades actividades={actsFiltradas} nombreMonitor={nombreDe} onError={setError} puedeEditar={puedeEditar} onEditar={a => setActModal(a)} />
          </div>
        )}

        {/* ── FICHAJES Y HORAS ── */}
        {tab === 'horas' && (
          <div className="space-y-4">
            <SelectorMonitor monitores={monitores} value={monSel} onChange={setMonSel} />

            {/* HORAS EN NÓMINA (según el calendario) */}
            <div className="bg-white rounded-2xl border border-pm-red/20 shadow-sm p-5 space-y-4">
              <div>
                <h3 className="font-black text-pm-navy">💶 Horas en nómina · según el calendario {monSel ? '' : '(todos los monitores)'}</h3>
                <p className="text-xs text-gray-500 mt-0.5">Calculadas con las horas programadas en el calendario (inicio → fin de cada actividad). Es la base para la nómina, aunque el monitor fiche mal o se le olvide. Elige un monitor arriba para ver sus horas individuales.</p>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <Metric label="Programadas hoy" valor={fmtHoras(horasNom.dia)} tono="navy" />
                <Metric label="Esta semana" valor={fmtHoras(horasNom.semana)} tono="green" />
                <Metric label="Este mes" valor={fmtHoras(horasNom.mes)} tono="amber" />
                <Metric label="Acumulado" valor={fmtHoras(horasNom.total)} tono="purple" />
              </div>
            </div>

            {/* REGISTRO MENSUAL (nómina + fichadas) con filtro de mes */}
            <RegistroMensual actividades={actsFiltradas} fichajes={fichajesMon} />

            {/* HORAS FICHADAS (control real) */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
              <div>
                <h3 className="font-black text-pm-navy">⏱️ Horas fichadas · control real</h3>
                <p className="text-xs text-gray-500 mt-0.5">Lo que el monitor fichó realmente con Entrar/Salir. Útil para comparar con lo programado.</p>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <Metric label="Fichadas hoy" valor={fmtHoras(horas.dia)} tono="navy" />
                <Metric label="Esta semana" valor={fmtHoras(horas.semana)} tono="green" />
                <Metric label="Este mes" valor={fmtHoras(horas.mes)} tono="amber" />
                <Metric label="Acumulado" valor={fmtHoras(horas.total)} tono="purple" />
              </div>
              <div>
                <h4 className="font-bold text-pm-navy mb-2 text-sm">Historial de jornadas {monSel ? '' : '(todos)'}</h4>
                {fichajesMon.length ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="text-xs text-gray-400 uppercase"><tr>
                        {!monSel && <th className="text-left py-2 px-2">Monitor</th>}
                        <th className="text-left py-2 px-2">Fecha</th><th className="text-left py-2 px-2">Entrada</th><th className="text-left py-2 px-2">Salida</th><th className="text-right py-2 px-2">Horas</th>
                      </tr></thead>
                      <tbody className="divide-y divide-gray-50">
                        {fichajesMon.slice(0, 100).map(f => {
                          const h = f.salida ? (new Date(f.salida).getTime() - new Date(f.entrada).getTime()) / 3600000 : 0
                          return (
                            <tr key={f.id}>
                              {!monSel && <td className="py-2 px-2 text-gray-600">{nombreDe(f.monitor_id)}</td>}
                              <td className="py-2 px-2 text-gray-600 capitalize">{fechaLarga(f.fecha)}</td>
                              <td className="py-2 px-2">{horaCorta(f.entrada)}</td>
                              <td className="py-2 px-2">{f.salida ? horaCorta(f.salida) : <span className="text-green-600 font-semibold">abierta</span>}</td>
                              <td className="py-2 px-2 text-right font-semibold text-pm-navy">{f.salida ? fmtHoras(h) : '—'}</td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : <p className="text-gray-400 text-sm py-6 text-center">Sin fichajes registrados.</p>}
              </div>
            </div>
          </div>
        )}

        {/* ── RECURSOS ── */}
        {tab === 'recursos' && <Recursos carpetas={carpetas} documentos={documentos} admin={puedeEditar} />}
      </div>

      {ficha && <FichaMonitor monitor={ficha === 'nuevo' ? null : ficha} puedeBorrar={puedeBorrar} puedeEditar={puedeEditar} onClose={() => setFicha(null)} />}
      {actModal && <ActividadModal monitores={monitores} actividad={actModal === 'nueva' ? null : actModal} monSelDefault={monSel} onClose={() => setActModal(null)} />}
    </>
  )
}

function SelectorMonitor({ monitores, value, onChange }: { monitores: Monitor[]; value: string; onChange: (v: string) => void }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)} className="border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:border-pm-red">
      <option value="">Todos los monitores</option>
      {monitores.map(m => <option key={m.id} value={m.id}>{`${m.nombre} ${m.apellidos}`.trim() || m.email}</option>)}
    </select>
  )
}

function ActividadModal({ monitores, actividad, monSelDefault, onClose }: {
  monitores: Monitor[]; actividad: Actividad | null; monSelDefault: string; onClose: () => void
}) {
  const edit = !!actividad
  const [f, setF] = useState({
    monitor_id: actividad?.monitor_id ?? monSelDefault ?? '',
    fecha: actividad?.fecha ?? '', hora_inicio: actividad?.hora_inicio ?? '', hora_fin: actividad?.hora_fin ?? '',
    actividad: actividad?.actividad ?? ACTIVIDADES_MONITOR[0], lugar: actividad?.lugar ?? '',
    grupo: actividad?.grupo ?? '', observaciones: actividad?.observaciones ?? '',
  })
  const [repetir, setRepetir] = useState(false)
  const [repetirHasta, setRepetirHasta] = useState('')
  const [error, setError] = useState('')
  const [loading, start] = useTransition()
  const input = 'w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-pm-red'
  const label = 'block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5'

  function guardar() {
    setError('')
    if (!f.monitor_id || !f.fecha) { setError('Elige monitor y fecha'); return }
    if (repetir && (!repetirHasta || repetirHasta <= f.fecha)) { setError('Indica una fecha final posterior para repetir cada semana'); return }
    start(async () => {
      const r = edit
        ? await editarActividad(actividad!.id, { fecha: f.fecha, hora_inicio: f.hora_inicio, hora_fin: f.hora_fin, actividad: f.actividad, lugar: f.lugar, grupo: f.grupo, observaciones: f.observaciones })
        : await asignarActividad({ ...f, repetir_hasta: repetir ? repetirHasta : undefined })
      if (!r.ok) setError(r.error); else onClose()
    })
  }
  function borrar() {
    if (!actividad || !window.confirm('¿Eliminar esta actividad del calendario?')) return
    start(async () => { const r = await eliminarActividad(actividad.id); if (!r.ok) setError(r.error); else onClose() })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="bg-pm-navy text-white px-5 py-4 flex items-center justify-between sticky top-0">
          <div className="font-black text-lg">{edit ? 'Editar actividad' : 'Asignar actividad'}</div>
          <button onClick={onClose} className="text-white/60 hover:text-white text-xl">✕</button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className={label}>Monitor</label>
            <select value={f.monitor_id} onChange={e => setF({ ...f, monitor_id: e.target.value })} className={input}>
              <option value="">— Elige monitor —</option>
              {monitores.map(m => <option key={m.id} value={m.id}>{`${m.nombre} ${m.apellidos}`.trim() || m.email}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div><label className={label}>Fecha</label><input type="date" value={f.fecha} onChange={e => setF({ ...f, fecha: e.target.value })} className={input} /></div>
            <div><label className={label}>Inicio</label><input type="time" value={f.hora_inicio} onChange={e => setF({ ...f, hora_inicio: e.target.value })} className={input} /></div>
            <div><label className={label}>Fin</label><input type="time" value={f.hora_fin} onChange={e => setF({ ...f, hora_fin: e.target.value })} className={input} /></div>
          </div>
          <div>
            <label className={label}>Actividad</label>
            <select value={f.actividad} onChange={e => setF({ ...f, actividad: e.target.value })} className={input}>
              {ACTIVIDADES_MONITOR.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className={label}>Lugar</label><input value={f.lugar} onChange={e => setF({ ...f, lugar: e.target.value })} className={input} /></div>
            <div><label className={label}>Grupo</label><input value={f.grupo} onChange={e => setF({ ...f, grupo: e.target.value })} className={input} /></div>
          </div>
          <div><label className={label}>Observaciones</label><textarea rows={2} value={f.observaciones} onChange={e => setF({ ...f, observaciones: e.target.value })} className={`${input} resize-none`} /></div>

          {/* Repetición semanal (solo al crear) */}
          {!edit && (
            <div className="bg-pm-bg rounded-xl p-3 border border-gray-100">
              <label className="flex items-center gap-2 text-sm font-semibold text-pm-navy cursor-pointer">
                <input type="checkbox" checked={repetir} onChange={e => setRepetir(e.target.checked)} className="w-4 h-4 accent-pm-red" />
                🔁 Repetir cada semana (mismo día y hora)
              </label>
              {repetir && (
                <div className="mt-3 flex items-center gap-2 text-sm">
                  <span className="text-gray-500">hasta el</span>
                  <input type="date" value={repetirHasta} min={f.fecha} onChange={e => setRepetirHasta(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-pm-red" />
                </div>
              )}
              {repetir && <p className="text-xs text-gray-400 mt-2">Se creará una copia cada 7 días desde la fecha elegida hasta esa fecha final (máx. 60 semanas).</p>}
            </div>
          )}

          {error && <p className="text-red-600 text-sm">{error}</p>}
          <div className="flex items-center justify-between gap-2 pt-1">
            {edit ? <button onClick={borrar} disabled={loading} className="text-red-600 border border-red-200 hover:bg-red-50 disabled:opacity-50 font-bold text-sm px-4 py-2.5 rounded-xl">Eliminar</button> : <span />}
            <button onClick={guardar} disabled={loading} className="bg-pm-red hover:bg-pm-red-dark disabled:opacity-50 text-white font-black px-6 py-2.5 rounded-xl">{edit ? 'Guardar cambios' : repetir ? 'Crear actividades' : 'Crear actividad'}</button>
          </div>
        </div>
      </div>
    </div>
  )
}

function ListaActividades({ actividades, nombreMonitor, onError, puedeEditar, onEditar }: { actividades: Actividad[]; nombreMonitor: (id: string) => string; onError: (e: string) => void; puedeEditar: boolean; onEditar?: (a: Actividad) => void }) {
  const [, start] = useTransition()
  const hoy = new Date().toISOString().slice(0, 10)
  const proximas = actividades.filter(a => a.fecha >= hoy).slice(0, 30)
  if (proximas.length === 0) return null
  const Texto = ({ a }: { a: Actividad }) => (
    <>
      <span className="text-pm-red font-bold w-24 shrink-0 capitalize">{fechaLarga(a.fecha)}</span>
      <span className="text-gray-500 w-24 shrink-0">{a.hora_inicio}{a.hora_fin ? `–${a.hora_fin}` : ''}</span>
      <span className="flex-1 min-w-0 text-pm-navy text-left"><strong>{a.actividad}</strong> · {nombreMonitor(a.monitor_id)}{a.lugar ? ` · ${a.lugar}` : ''}{a.grupo ? ` · ${a.grupo}` : ''}</span>
    </>
  )
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <h3 className="font-black text-pm-navy mb-3">Próximas actividades asignadas</h3>
      <div className="divide-y divide-gray-50">
        {proximas.map(a => (
          <div key={a.id} className="flex items-center gap-3 py-2 text-sm">
            {puedeEditar && onEditar
              ? <button onClick={() => onEditar(a)} className="flex-1 min-w-0 flex items-center gap-3 hover:opacity-70" title="Editar"><Texto a={a} /></button>
              : <div className="flex-1 min-w-0 flex items-center gap-3"><Texto a={a} /></div>}
            {puedeEditar && <button onClick={() => start(async () => { const r = await eliminarActividad(a.id); if (!r.ok) onError(r.error) })} className="text-gray-300 hover:text-red-500 px-1 shrink-0" title="Eliminar">🗑</button>}
          </div>
        ))}
      </div>
    </div>
  )
}

function RegistroMensual({ actividades, fichajes }: { actividades: Actividad[]; fichajes: Fichaje[] }) {
  const [mesSel, setMesSel] = useState('')
  const meses = useMemo(() => {
    const map = new Map<string, { nomina: number; fichadas: number }>()
    for (const a of actividades) {
      const h = horasActividad(a); if (!h) continue
      const k = a.fecha.slice(0, 7); const c = map.get(k) ?? { nomina: 0, fichadas: 0 }; c.nomina += h; map.set(k, c)
    }
    for (const f of fichajes) {
      const h = horasDeFichaje(f); if (!h) continue
      const k = f.fecha.slice(0, 7); const c = map.get(k) ?? { nomina: 0, fichadas: 0 }; c.fichadas += h; map.set(k, c)
    }
    return [...map.entries()].sort((a, b) => b[0].localeCompare(a[0])).map(([mes, v]) => {
      const [y, mm] = mes.split('-').map(Number)
      return { mes, label: new Intl.DateTimeFormat('es-ES', { month: 'long', year: 'numeric' }).format(new Date(y, mm - 1, 1)), ...v }
    })
  }, [actividades, fichajes])

  const filas = mesSel ? meses.filter(m => m.mes === mesSel) : meses
  const totalNom = filas.reduce((s, m) => s + m.nomina, 0)
  const totalFich = filas.reduce((s, m) => s + m.fichadas, 0)

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-black text-pm-navy">📅 Registro mensual de horas</h3>
        <select value={mesSel} onChange={e => setMesSel(e.target.value)} className="border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:border-pm-red capitalize">
          <option value="">Todos los meses</option>
          {meses.map(m => <option key={m.mes} value={m.mes} className="capitalize">{m.label}</option>)}
        </select>
      </div>
      {filas.length ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs text-gray-400 uppercase"><tr>
              <th className="text-left py-2 px-2">Mes</th>
              <th className="text-right py-2 px-2">En nómina (calendario)</th>
              <th className="text-right py-2 px-2">Fichadas (real)</th>
            </tr></thead>
            <tbody className="divide-y divide-gray-50">
              {filas.map(m => (
                <tr key={m.mes}>
                  <td className="py-2 px-2 text-gray-600 capitalize">{m.label}</td>
                  <td className="py-2 px-2 text-right font-black text-pm-navy">{fmtHoras(m.nomina)}</td>
                  <td className="py-2 px-2 text-right font-semibold text-gray-500">{fmtHoras(m.fichadas)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot><tr className="border-t-2 border-gray-100">
              <td className="py-2 px-2 font-black text-pm-navy">Total</td>
              <td className="py-2 px-2 text-right font-black text-pm-red">{fmtHoras(totalNom)}</td>
              <td className="py-2 px-2 text-right font-bold text-gray-500">{fmtHoras(totalFich)}</td>
            </tr></tfoot>
          </table>
        </div>
      ) : <p className="text-gray-400 text-sm py-2">Aún no hay horas registradas. Asigna actividades con horario para empezar a contabilizar.</p>}
    </div>
  )
}

function FichaMonitor({ monitor, puedeBorrar, puedeEditar, onClose }: { monitor: Monitor | null; puedeBorrar: boolean; puedeEditar: boolean; onClose: () => void }) {
  const nuevo = !monitor
  const ro = !puedeEditar
  const [f, setF] = useState({
    email: monitor?.email ?? '', nombre: monitor?.nombre ?? '', apellidos: monitor?.apellidos ?? '',
    telefono: monitor?.telefono ?? '', fecha_alta: monitor?.fecha_alta ?? '', estado: monitor?.estado ?? 'activo',
    observaciones: monitor?.observaciones ?? '', foto_url: monitor?.foto_url ?? '',
    especialidades: monitor?.especialidades ?? [] as string[],
  })
  const [error, setError] = useState('')
  const [, start] = useTransition()
  const input = 'w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-pm-red'
  const label = 'block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5'
  const toggleEsp = (a: string) => setF(x => ({ ...x, especialidades: x.especialidades.includes(a) ? x.especialidades.filter(e => e !== a) : [...x.especialidades, a] }))

  function guardar() {
    setError('')
    if (!f.nombre.trim() || (nuevo && !f.email.trim())) { setError('Nombre y correo son obligatorios'); return }
    start(async () => {
      const r = nuevo
        ? await crearMonitor({ email: f.email, nombre: f.nombre, apellidos: f.apellidos, telefono: f.telefono, fecha_alta: f.fecha_alta || null, especialidades: f.especialidades, estado: f.estado, observaciones: f.observaciones })
        : await editarMonitor(monitor!.id, { nombre: f.nombre, apellidos: f.apellidos, telefono: f.telefono || null, fecha_alta: f.fecha_alta || null, especialidades: f.especialidades, estado: f.estado, observaciones: f.observaciones || null, foto_url: f.foto_url || null })
      if (!r.ok) setError(r.error); else onClose()
    })
  }
  function borrar() {
    if (!monitor || !window.confirm(`¿Eliminar al monitor ${f.nombre}? Se borrarán sus actividades y fichajes, y perderá el acceso.`)) return
    start(async () => { const r = await eliminarMonitor(monitor.id, monitor.email); if (!r.ok) setError(r.error); else onClose() })
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white h-full overflow-y-auto shadow-2xl">
        <div className="bg-pm-navy text-white px-5 py-4 flex items-center justify-between sticky top-0 z-10">
          <div className="font-black text-lg">{nuevo ? 'Nuevo monitor' : `${f.nombre} ${f.apellidos}`}</div>
          <button onClick={onClose} className="text-white/60 hover:text-white text-xl">✕</button>
        </div>
        <div className="p-5 space-y-4">
          {!nuevo && puedeEditar && <div><label className={label}>Foto</label><SubirImagen value={f.foto_url} onChange={url => setF(x => ({ ...x, foto_url: url }))} carpeta="monitores" /></div>}
          {ro && <div className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-500">Vista de solo lectura. No tienes permiso para editar fichas.</div>}
          <div className="grid grid-cols-2 gap-3">
            <div><label className={label}>Nombre *</label><input value={f.nombre} disabled={ro} onChange={e => setF({ ...f, nombre: e.target.value })} className={input} /></div>
            <div><label className={label}>Apellidos</label><input value={f.apellidos} disabled={ro} onChange={e => setF({ ...f, apellidos: e.target.value })} className={input} /></div>
          </div>
          <div>
            <label className={label}>Correo {nuevo ? '* (acceso al portal)' : '(no editable)'}</label>
            <input type="email" value={f.email} disabled={!nuevo || ro} onChange={e => setF({ ...f, email: e.target.value })} className={`${input} ${!nuevo ? 'bg-gray-50 text-gray-400' : ''}`} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className={label}>Teléfono</label><input value={f.telefono} disabled={ro} onChange={e => setF({ ...f, telefono: e.target.value })} className={input} /></div>
            <div><label className={label}>Fecha de alta</label><input type="date" value={f.fecha_alta ?? ''} disabled={ro} onChange={e => setF({ ...f, fecha_alta: e.target.value })} className={input} /></div>
          </div>
          <div>
            <label className={label}>Estado</label>
            <div className="flex flex-wrap gap-1.5">
              {ESTADOS_MONITOR.map(e => (
                <button key={e.id} disabled={ro} onClick={() => setF({ ...f, estado: e.id })} className={`text-xs font-bold px-3 py-1.5 rounded-full border disabled:opacity-60 ${f.estado === e.id ? `${e.badge} border-transparent ring-2 ring-offset-1 ring-pm-navy/20` : 'border-gray-200 text-gray-500'}`}>{e.label}</button>
              ))}
            </div>
          </div>
          <div>
            <label className={label}>Especialidades</label>
            <div className="flex flex-wrap gap-1.5">
              {ACTIVIDADES_MONITOR.map(a => (
                <button key={a} disabled={ro} onClick={() => toggleEsp(a)} className={`text-xs font-semibold px-2.5 py-1 rounded-full border disabled:opacity-60 ${f.especialidades.includes(a) ? 'bg-pm-red-light text-pm-red border-pm-red/30' : 'border-gray-200 text-gray-500'}`}>{a}</button>
              ))}
            </div>
          </div>
          <div><label className={label}>Observaciones internas</label><textarea rows={3} value={f.observaciones} disabled={ro} onChange={e => setF({ ...f, observaciones: e.target.value })} className={`${input} resize-none`} /></div>
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <div className="flex items-center justify-between gap-2 pt-1">
            {!nuevo && puedeBorrar ? <button onClick={borrar} className="text-red-600 border border-red-200 hover:bg-red-50 font-bold text-sm px-4 py-2.5 rounded-xl">Eliminar</button> : <span />}
            {puedeEditar
              ? <button onClick={guardar} className="bg-pm-red hover:bg-pm-red-dark text-white font-black px-6 py-2.5 rounded-xl">{nuevo ? 'Crear monitor' : 'Guardar cambios'}</button>
              : <button onClick={onClose} className="border border-gray-200 text-gray-600 font-bold text-sm px-6 py-2.5 rounded-xl">Cerrar</button>}
          </div>
          {nuevo && <p className="text-xs text-gray-400">Se creará su acceso al portal con este correo (entra por enlace mágico, sin contraseña).</p>}
        </div>
      </div>
    </div>
  )
}
