'use client'

import { useMemo, useState, useTransition } from 'react'
import { SubirImagen } from '@/components/admin/SubirImagen'
import { eurosDeCents } from '@/lib/navidad/precios'
import type { NavidadAjustes, PaseVista, ReservaNavidad, ResumenNavidad } from '@/lib/navidad/store'
import {
  guardarAjustesNavidad, bloquearPaseNavidad, cambiarAforoNavidad, cambiarHoraPaseNavidad,
  marcarAsistenciaNavidad, cancelarReservaNavidad,
} from './actions'

// ─────────────────────────────────────────────────────────────────────────────
// Panel de La Fábrica de Papá Noel: resumen, pases (aforo y bloqueos),
// reservas (búsqueda, asistencia, cancelación, CSV) y configuración.
// ─────────────────────────────────────────────────────────────────────────────

type Tab = 'resumen' | 'pases' | 'reservas' | 'config'

const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']
const DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado']

function fechaLarga(iso: string): string {
  const d = new Date(`${iso}T12:00:00`)
  return `${DIAS[d.getDay()]} ${d.getDate()} de ${MESES[d.getMonth()]}`
}

const ESTADO_RESERVA: Record<string, { label: string; clase: string }> = {
  confirmada:  { label: 'Confirmada',  clase: 'bg-green-100 text-green-700' },
  pendiente:   { label: 'Sin pagar',   clase: 'bg-amber-100 text-amber-700' },
  cancelada:   { label: 'Cancelada',   clase: 'bg-gray-200 text-gray-600' },
  reembolsada: { label: 'Reembolsada', clase: 'bg-blue-100 text-blue-700' },
}

function Metrica({ k, v, sub }: { k: string; v: string; sub?: string }) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-4">
      <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">{k}</div>
      <div className="text-2xl font-black text-pm-navy mt-1">{v}</div>
      {sub && <div className="text-[11px] text-gray-400 mt-0.5">{sub}</div>}
    </div>
  )
}

export default function NavidadClient({ cfg, pases, reservas, resumen, puedeEditar, migracionPendiente }: {
  cfg: NavidadAjustes
  pases: PaseVista[]
  reservas: ReservaNavidad[]
  resumen: ResumenNavidad
  puedeEditar: boolean
  migracionPendiente: boolean
}) {
  const [tab, setTab] = useState<Tab>('resumen')
  const [msg, setMsg] = useState('')
  const [pendiente, startTransition] = useTransition()
  const [form, setForm] = useState<NavidadAjustes>(cfg)
  const [busca, setBusca] = useState('')
  const [filtro, setFiltro] = useState<'todas' | 'confirmada' | 'pendiente' | 'cancelada'>('todas')

  const paseDe = useMemo(() => new Map(pases.map(p => [p.id, p])), [pases])
  const porFecha = useMemo(() => {
    const m = new Map<string, PaseVista[]>()
    for (const p of pases) m.set(p.fecha, [...(m.get(p.fecha) ?? []), p])
    return [...m.entries()].sort((a, b) => a[0].localeCompare(b[0]))
  }, [pases])

  const reservasFiltradas = useMemo(() => {
    const q = busca.trim().toLowerCase()
    return reservas.filter(r => {
      if (filtro !== 'todas' && r.estado !== filtro) return false
      if (!q) return true
      return r.nombre.toLowerCase().includes(q) || r.email.toLowerCase().includes(q)
        || r.localizador.toLowerCase().includes(q) || r.telefono.includes(q)
    })
  }, [reservas, busca, filtro])

  function correr(fn: () => Promise<{ ok: true } | { ok: false; error: string }>, exito = 'Hecho') {
    setMsg('')
    startTransition(async () => {
      const r = await fn()
      setMsg(r.ok ? exito : r.error)
    })
  }

  function exportarCSV() {
    const cab = ['Localizador', 'Estado', 'Fecha', 'Pase', 'Nombre', 'Email', 'Teléfono', 'Niños', 'Adultos', 'Bebés', 'Asistentes', 'Descuento', 'Total', 'Asistió', 'Notas']
    const filas = reservasFiltradas.map(r => {
      const p = paseDe.get(r.paseId)
      return [
        r.localizador, ESTADO_RESERVA[r.estado]?.label ?? r.estado,
        p?.fecha ?? '', p ? `${p.hora}-${p.horaFin}` : '',
        r.nombre, r.email, r.telefono,
        r.ninos, r.adultos, r.bebes, r.plazas,
        r.descuentoPct > 0 ? `${r.descuentoTipo} -${r.descuentoPct}%` : '',
        (r.totalCents / 100).toFixed(2).replace('.', ','),
        r.asistio ? 'Sí' : 'No',
        r.notas.replace(/[\r\n;]+/g, ' '),
      ]
    })
    const csv = [cab, ...filas].map(f => f.map(c => `"${String(c).replace(/"/g, '""')}"`).join(';')).join('\r\n')
    const url = URL.createObjectURL(new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' }))
    const a = document.createElement('a')
    a.href = url
    a.download = `fabrica-papa-noel-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const input = 'w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-pm-red'
  const label = 'block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5'
  const TABS: [Tab, string][] = [['resumen', 'Resumen'], ['pases', 'Pases'], ['reservas', `Reservas (${reservas.length})`], ['config', 'Configuración']]

  return (
    <div className="space-y-5">
      {migracionPendiente && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl p-4 text-sm">
          <strong>Falta ejecutar la migración.</strong> Pega <code>supabase/migration_navidad.sql</code> en Supabase →
          SQL Editor → Run para crear los pases y las entradas. Hasta entonces esta sección y la página pública salen vacías.
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        {TABS.map(([id, t]) => (
          <button key={id} onClick={() => setTab(id)}
            className={`text-sm font-bold px-4 py-2 rounded-xl transition-colors ${
              tab === id ? 'bg-pm-navy text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-pm-navy'
            }`}>{t}</button>
        ))}
        <span className={`ml-auto text-xs font-black px-3 py-1.5 rounded-full ${
          cfg.ventaActiva ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'
        }`}>
          {cfg.ventaActiva ? 'Venta abierta' : 'Venta cerrada'}
        </span>
      </div>

      {msg && <p className="text-sm font-semibold text-pm-navy bg-white border border-gray-100 rounded-xl px-4 py-2.5">{msg}</p>}

      {/* ── Resumen ─────────────────────────────────────────────────────────── */}
      {tab === 'resumen' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <Metrica k="Reservas confirmadas" v={String(resumen.reservas)} sub={`${resumen.pendientes} sin pagar ahora mismo`} />
            <Metrica k="Asistentes" v={String(resumen.asistentes)} sub={`${resumen.ninos} niños · ${resumen.adultos} adultos · ${resumen.bebes} bebés`} />
            <Metrica k="Recaudado" v={eurosDeCents(resumen.recaudadoCents)} sub="Solo entradas pagadas" />
            <Metrica k="Ocupación" v={`${resumen.ocupacionPct} %`} sub={`${resumen.plazasLibres} plazas libres de ${resumen.aforoTotal}`} />
          </div>

          <div className="bg-white border border-gray-100 rounded-2xl p-4">
            <h3 className="font-black text-pm-navy mb-3">Ocupación por día</h3>
            <div className="space-y-2">
              {porFecha.map(([fecha, lista]) => {
                const aforo = lista.reduce((s, p) => s + p.aforo, 0)
                const ocupadas = lista.reduce((s, p) => s + p.ocupadas, 0)
                const pct = aforo > 0 ? Math.round((ocupadas / aforo) * 100) : 0
                return (
                  <div key={fecha}>
                    <div className="flex justify-between text-sm">
                      <span className="font-bold text-pm-navy capitalize">{fechaLarga(fecha)}</span>
                      <span className="text-gray-500">{ocupadas}/{aforo} · {pct} %</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full mt-1 overflow-hidden">
                      <div className="h-full bg-pm-red rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )
              })}
              {porFecha.length === 0 && <p className="text-sm text-gray-400">Todavía no hay pases creados.</p>}
            </div>
          </div>
        </div>
      )}

      {/* ── Pases ───────────────────────────────────────────────────────────── */}
      {tab === 'pases' && (
        <div className="space-y-4">
          {porFecha.map(([fecha, lista]) => (
            <div key={fecha} className="bg-white border border-gray-100 rounded-2xl p-4">
              <h3 className="font-black text-pm-navy capitalize mb-3">{fechaLarga(fecha)}</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs text-gray-400 uppercase tracking-wider">
                      <th className="py-2">Pase</th><th>Aforo</th><th>Ocupadas</th><th>Libres</th>
                      <th>Reservas</th><th>Recaudado</th><th>Estado</th><th />
                    </tr>
                  </thead>
                  <tbody>
                    {lista.map(p => {
                      const delPase = reservas.filter(r => r.paseId === p.id && r.estado === 'confirmada')
                      return (
                        <tr key={p.id} className="border-t border-gray-100">
                          <td className="py-2 font-bold text-pm-navy">{p.hora} – {p.horaFin}</td>
                          <td>
                            {puedeEditar ? (
                              <input type="number" min={1} max={200} defaultValue={p.aforo} disabled={pendiente}
                                onBlur={e => {
                                  const v = Number(e.target.value)
                                  if (v !== p.aforo) correr(() => cambiarAforoNavidad(p.id, v), 'Aforo actualizado')
                                }}
                                className="w-16 border border-gray-200 rounded-lg px-2 py-1 text-sm" />
                            ) : p.aforo}
                          </td>
                          <td>{p.ocupadas}</td>
                          <td className={p.libres === 0 ? 'text-red-600 font-bold' : ''}>{p.libres}</td>
                          <td>{delPase.length}</td>
                          <td>{eurosDeCents(delPase.reduce((s, r) => s + r.totalCents, 0))}</td>
                          <td>
                            <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                              p.estado === 'bloqueado' ? 'bg-gray-200 text-gray-600'
                                : p.estado === 'completo' ? 'bg-red-100 text-red-700'
                                : p.estado === 'ultimas' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
                            }`}>
                              {p.estado === 'bloqueado' ? 'Bloqueado' : p.estado === 'completo' ? 'Completo'
                                : p.estado === 'ultimas' ? 'Últimas plazas' : 'Disponible'}
                            </span>
                          </td>
                          <td className="text-right">
                            {puedeEditar && (
                              <button disabled={pendiente}
                                onClick={() => correr(() => bloquearPaseNavidad(p.id, !p.bloqueado), p.bloqueado ? 'Pase reabierto' : 'Pase bloqueado')}
                                className="text-xs font-bold text-pm-red hover:underline">
                                {p.bloqueado ? 'Reabrir' : 'Bloquear'}
                              </button>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
              {puedeEditar && lista.some(p => p.ocupadas === 0) && (
                <details className="mt-3">
                  <summary className="text-xs font-bold text-gray-500 cursor-pointer">Cambiar horarios (solo pases sin ventas)</summary>
                  <div className="mt-2 space-y-2">
                    {lista.filter(p => p.ocupadas === 0).map(p => (
                      <HoraPase key={p.id} pase={p} disabled={pendiente}
                        onGuardar={(h, f) => correr(() => cambiarHoraPaseNavidad(p.id, h, f), 'Horario actualizado')} />
                    ))}
                  </div>
                </details>
              )}
            </div>
          ))}
          {porFecha.length === 0 && <p className="text-sm text-gray-400">No hay pases. Ejecuta la migración para crearlos.</p>}
        </div>
      )}

      {/* ── Reservas ────────────────────────────────────────────────────────── */}
      {tab === 'reservas' && (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <input value={busca} onChange={e => setBusca(e.target.value)} placeholder="Buscar por nombre, correo, teléfono o localizador"
              className={`${input} max-w-sm`} />
            <select value={filtro} onChange={e => setFiltro(e.target.value as typeof filtro)} className={`${input} max-w-[180px]`}>
              <option value="todas">Todas</option>
              <option value="confirmada">Confirmadas</option>
              <option value="pendiente">Sin pagar</option>
              <option value="cancelada">Canceladas</option>
            </select>
            <button onClick={exportarCSV} className="bg-white border border-gray-200 hover:border-pm-navy text-sm font-bold px-4 py-2.5 rounded-xl">
              Exportar CSV
            </button>
          </div>

          <div className="space-y-2">
            {reservasFiltradas.map(r => {
              const p = paseDe.get(r.paseId)
              const est = ESTADO_RESERVA[r.estado] ?? { label: r.estado, clase: 'bg-gray-100 text-gray-600' }
              return (
                <div key={r.id} className="bg-white border border-gray-100 rounded-2xl p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="inline-flex items-center gap-1.5 bg-red-50 border border-red-200 rounded-lg px-2 py-1">
                          <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider">Código</span>
                          <span className="font-black text-red-800 tracking-widest">{r.localizador}</span>
                        </span>
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${est.clase}`}>{est.label}</span>
                        {r.asistio && <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">Presente</span>}
                      </div>
                      <div className="text-sm text-pm-navy font-bold mt-1">{r.nombre}</div>
                      <div className="text-xs text-gray-500">{r.email} · {r.telefono}</div>
                      <div className="text-xs text-gray-500 mt-1 capitalize">
                        {p ? `${fechaLarga(p.fecha)} · ${p.hora}–${p.horaFin}` : 'Pase borrado'}
                      </div>
                      <div className="text-xs text-gray-500">
                        {r.ninos} niños · {r.adultos} adultos · {r.bebes} bebés = {r.plazas} plazas
                        {r.descuentoPct > 0 && ` · ${r.descuentoTipo === 'grupo' ? 'Grupo' : `Socio nº ${r.socioNumero}`} −${r.descuentoPct} %`}
                      </div>
                      {r.notas && <div className="text-xs text-gray-600 mt-1 italic">«{r.notas}»</div>}
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-black text-pm-navy text-lg">{eurosDeCents(r.totalCents)}</div>
                      {r.descuentoCents > 0 && (
                        <div className="text-[11px] text-gray-400 line-through">{eurosDeCents(r.subtotalCents)}</div>
                      )}
                      {puedeEditar && (
                        <div className="flex flex-col items-end gap-1 mt-2">
                          {r.estado === 'confirmada' && (
                            <button disabled={pendiente} onClick={() => correr(() => marcarAsistenciaNavidad(r.id, !r.asistio), 'Asistencia actualizada')}
                              className="text-xs font-bold text-pm-navy hover:underline">
                              {r.asistio ? 'Quitar presente' : 'Marcar presente'}
                            </button>
                          )}
                          {(r.estado === 'confirmada' || r.estado === 'pendiente') && (
                            <>
                              <button disabled={pendiente} onClick={() => correr(() => cancelarReservaNavidad(r.id, false), 'Reserva cancelada')}
                                className="text-xs font-bold text-red-600 hover:underline">Cancelar</button>
                              {r.estado === 'confirmada' && (
                                <button disabled={pendiente} onClick={() => correr(() => cancelarReservaNavidad(r.id, true), 'Marcada como reembolsada')}
                                  className="text-xs font-bold text-blue-600 hover:underline">Marcar reembolsada</button>
                              )}
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
            {reservasFiltradas.length === 0 && <p className="text-sm text-gray-400">No hay reservas que encajen con la búsqueda.</p>}
          </div>

          <p className="text-[11px] text-gray-400">
            Las devoluciones de dinero se hacen desde el TPV de Redsys. Aquí solo se deja constancia y se liberan las plazas.
          </p>
        </div>
      )}

      {/* ── Configuración ───────────────────────────────────────────────────── */}
      {tab === 'config' && (
        <div className="space-y-5 max-w-3xl">
          <div className="bg-white border border-gray-100 rounded-2xl p-5">
            <label className="flex items-center gap-3">
              <input type="checkbox" checked={form.ventaActiva} disabled={!puedeEditar}
                onChange={e => setForm({ ...form, ventaActiva: e.target.checked })} className="w-5 h-5 accent-pm-red" />
              <span>
                <span className="block font-black text-pm-navy">Venta de entradas abierta</span>
                <span className="block text-xs text-gray-500">Mientras esté desactivada, la web enseña el evento pero no deja comprar.</span>
              </span>
            </label>
          </div>

          <div className="bg-white border border-gray-100 rounded-2xl p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={label}>Entrada infantil (€)</label>
              <input type="number" step="0.01" min={0} disabled={!puedeEditar} className={input}
                value={(form.precioNinoCents / 100).toString()}
                onChange={e => setForm({ ...form, precioNinoCents: Math.round(Number(e.target.value) * 100) })} />
            </div>
            <div>
              <label className={label}>Entrada adulto (€)</label>
              <input type="number" step="0.01" min={0} disabled={!puedeEditar} className={input}
                value={(form.precioAdultoCents / 100).toString()}
                onChange={e => setForm({ ...form, precioAdultoCents: Math.round(Number(e.target.value) * 100) })} />
            </div>
            <div>
              <label className={label}>Descuento de grupo (%)</label>
              <input type="number" min={0} max={100} disabled={!puedeEditar} className={input}
                value={form.pctGrupo} onChange={e => setForm({ ...form, pctGrupo: Number(e.target.value) })} />
            </div>
            <div>
              <label className={label}>Entradas para el grupo</label>
              <input type="number" min={1} disabled={!puedeEditar} className={input}
                value={form.minGrupo} onChange={e => setForm({ ...form, minGrupo: Number(e.target.value) })} />
            </div>
            <div>
              <label className={label}>Descuento socios (%)</label>
              <input type="number" min={0} max={100} disabled={!puedeEditar} className={input}
                value={form.pctSocio} onChange={e => setForm({ ...form, pctSocio: Number(e.target.value) })} />
            </div>
            <div>
              <label className={label}>Minutos para pagar</label>
              <input type="number" min={5} max={240} disabled={!puedeEditar} className={input}
                value={form.minutosReserva} onChange={e => setForm({ ...form, minutosReserva: Number(e.target.value) })} />
              <p className="text-[11px] text-gray-400 mt-1.5">Tiempo que se guarda la plaza mientras el cliente paga.</p>
            </div>
            <div>
              <label className={label}>Máximo por compra</label>
              <input type="number" min={1} max={100} disabled={!puedeEditar} className={input}
                value={form.maxPorCompra} onChange={e => setForm({ ...form, maxPorCompra: Number(e.target.value) })} />
            </div>
          </div>

          <div className="bg-white border border-gray-100 rounded-2xl p-5 space-y-4">
            <div>
              <label className={label}>Política de cancelación (sale en las condiciones de compra)</label>
              <textarea rows={2} disabled={!puedeEditar} className={`${input} resize-none`} value={form.politicaCancelacion}
                onChange={e => setForm({ ...form, politicaCancelacion: e.target.value })}
                placeholder="Vacío = no se muestra ninguna política" />
            </div>
            <div>
              <label className={label}>Aviso de accesibilidad (sale en las preguntas frecuentes)</label>
              <textarea rows={2} disabled={!puedeEditar} className={`${input} resize-none`} value={form.avisoAccesibilidad}
                onChange={e => setForm({ ...form, avisoAccesibilidad: e.target.value })}
                placeholder="Vacío = no se muestra" />
            </div>
          </div>

          <div className="bg-white border border-gray-100 rounded-2xl p-5 space-y-4">
            <p className="text-sm text-gray-500">
              Fotos reales del montaje. Si subes una, sustituye al dibujo de esa parte de la página.
            </p>
            {([
              ['imagenHero', 'Foto principal (hero)'],
              ['imagenCartas', 'Taller de cartas'],
              ['imagenFabrica', 'Fábrica de juguetes'],
              ['imagenPapaNoel', 'Papá Noel'],
              ['imagenFiesta', 'Fiesta de despedida'],
            ] as [keyof NavidadAjustes, string][]).map(([clave, titulo]) => (
              <div key={clave}>
                <label className={label}>{titulo}</label>
                <SubirImagen value={String(form[clave] ?? '')} carpeta="navidad"
                  onChange={url => setForm({ ...form, [clave]: url })} />
              </div>
            ))}
          </div>

          {puedeEditar && (
            <button disabled={pendiente} onClick={() => correr(() => guardarAjustesNavidad(form), 'Ajustes guardados')}
              className="bg-pm-red hover:bg-pm-red-dark disabled:opacity-50 text-white font-black px-6 py-3 rounded-xl transition-colors">
              {pendiente ? 'Guardando…' : 'Guardar cambios'}
            </button>
          )}
        </div>
      )}
    </div>
  )
}

/** Fila para cambiar la hora de un pase que todavía no ha vendido nada. */
function HoraPase({ pase, disabled, onGuardar }: {
  pase: PaseVista
  disabled: boolean
  onGuardar: (hora: string, horaFin: string) => void
}) {
  const [hora, setHora] = useState(pase.hora)
  const [fin, setFin] = useState(pase.horaFin)
  const inp = 'w-20 border border-gray-200 rounded-lg px-2 py-1 text-sm'
  return (
    <div className="flex items-center gap-2">
      <input value={hora} onChange={e => setHora(e.target.value)} className={inp} placeholder="10:00" />
      <span className="text-gray-400">–</span>
      <input value={fin} onChange={e => setFin(e.target.value)} className={inp} placeholder="10:50" />
      <button disabled={disabled || (hora === pase.hora && fin === pase.horaFin)}
        onClick={() => onGuardar(hora, fin)}
        className="text-xs font-bold text-pm-red hover:underline disabled:opacity-40 disabled:no-underline">
        Guardar
      </button>
    </div>
  )
}
