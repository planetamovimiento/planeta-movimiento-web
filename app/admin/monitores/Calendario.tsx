'use client'

import { useState, useMemo } from 'react'
import type { Actividad } from '@/lib/monitores/tipos'

const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
const DIAS = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do']
const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
const lunesDe = (d: Date) => { const x = new Date(d); x.setDate(x.getDate() - ((x.getDay() + 6) % 7)); return x }
const fechaLarga = (s: string) => new Intl.DateTimeFormat('es-ES', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date(s + 'T12:00:00'))

type Vista = 'dia' | 'semana' | 'mes'

export default function Calendario({ actividades, nombreMonitor, onEditarActividad, onExportar }: {
  actividades: Actividad[]
  nombreMonitor?: (id: string) => string
  /** Si se pasa (admin), al pulsar una actividad se abre su edición. */
  onEditarActividad?: (a: Actividad) => void
  onExportar?: () => void
}) {
  const [vista, setVista] = useState<Vista>('semana')
  const [ref, setRef] = useState(() => { const d = new Date(); d.setHours(12, 0, 0, 0); return d })

  const porFecha = useMemo(() => {
    const m = new Map<string, Actividad[]>()
    for (const a of actividades) { (m.get(a.fecha) ?? m.set(a.fecha, []).get(a.fecha)!).push(a) }
    return m
  }, [actividades])

  const hoy = iso(new Date())
  const mover = (n: number) => setRef(d => { const x = new Date(d); if (vista === 'mes') x.setMonth(x.getMonth() + n); else if (vista === 'semana') x.setDate(x.getDate() + n * 7); else x.setDate(x.getDate() + n); return x })

  const titulo = vista === 'mes' ? `${MESES[ref.getMonth()]} ${ref.getFullYear()}`
    : vista === 'dia' ? fechaLarga(iso(ref))
    : `Semana del ${new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'short' }).format(lunesDe(ref))}`

  const Chip = ({ a }: { a: Actividad }) => {
    const contenido = <>{a.hora_inicio && <span className="font-bold">{a.hora_inicio} </span>}{a.actividad}{nombreMonitor ? ` · ${nombreMonitor(a.monitor_id)}` : ''}</>
    const titulo = `${a.hora_inicio || ''} ${a.actividad}${a.lugar ? ' · ' + a.lugar : ''}${onEditarActividad ? ' · pulsa para editar' : ''}`
    const cls = 'block w-full text-left text-[11px] leading-tight bg-pm-red-light text-pm-red rounded px-1.5 py-0.5 truncate'
    return onEditarActividad
      ? <button type="button" onClick={() => onEditarActividad(a)} className={`${cls} hover:bg-pm-red hover:text-white cursor-pointer`} title={titulo}>{contenido}</button>
      : <div className={cls} title={titulo}>{contenido}</div>
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <button onClick={() => mover(-1)} className="w-8 h-8 rounded-lg border border-gray-200 text-gray-500 hover:border-pm-red">‹</button>
          <button onClick={() => setRef(() => { const d = new Date(); d.setHours(12, 0, 0, 0); return d })} className="text-xs font-bold text-gray-500 hover:text-pm-red px-2">Hoy</button>
          <button onClick={() => mover(1)} className="w-8 h-8 rounded-lg border border-gray-200 text-gray-500 hover:border-pm-red">›</button>
          <span className="font-black text-pm-navy capitalize ml-1">{titulo}</span>
        </div>
        <div className="flex items-center gap-2">
          {onExportar && (
            <button onClick={onExportar} className="flex items-center gap-1.5 text-sm font-bold text-pm-navy border border-gray-200 hover:border-pm-red rounded-xl px-3 py-1.5" title="Descargar para Google Calendar, Apple o el móvil">
              📅 Exportar
            </button>
          )}
          <div className="flex rounded-xl border border-gray-200 overflow-hidden text-sm">
            {(['dia', 'semana', 'mes'] as Vista[]).map(v => (
              <button key={v} onClick={() => setVista(v)} className={`px-3 py-1.5 font-semibold capitalize ${vista === v ? 'bg-pm-red text-white' : 'text-gray-500 hover:bg-gray-50'}`}>{v}</button>
            ))}
          </div>
        </div>
      </div>

      {/* MES */}
      {vista === 'mes' && (() => {
        const first = new Date(ref.getFullYear(), ref.getMonth(), 1)
        const last = new Date(ref.getFullYear(), ref.getMonth() + 1, 0)
        const offset = (first.getDay() + 6) % 7
        const cells: (number | null)[] = [...Array(offset).fill(null), ...Array.from({ length: last.getDate() }, (_, i) => i + 1)]
        return (
          <>
            <div className="grid grid-cols-7 gap-1 mb-1">{DIAS.map(d => <div key={d} className="text-center text-xs text-gray-400 font-semibold">{d}</div>)}</div>
            <div className="grid grid-cols-7 gap-1">
              {cells.map((day, i) => {
                if (!day) return <div key={i} />
                const f = iso(new Date(ref.getFullYear(), ref.getMonth(), day))
                const acts = porFecha.get(f) ?? []
                return (
                  <div key={f} className={`min-h-[72px] text-left rounded-lg border p-1 align-top ${f === hoy ? 'border-pm-red bg-pm-red-light/40' : 'border-gray-100'}`}>
                    <div className={`text-xs font-bold mb-0.5 ${f === hoy ? 'text-pm-red' : 'text-gray-500'}`}>{day}</div>
                    <div className="space-y-0.5">{acts.slice(0, 3).map(a => <Chip key={a.id} a={a} />)}{acts.length > 3 && <div className="text-[10px] text-gray-400">+{acts.length - 3} más</div>}</div>
                  </div>
                )
              })}
            </div>
          </>
        )
      })()}

      {/* SEMANA */}
      {vista === 'semana' && (() => {
        const ini = lunesDe(ref)
        const dias = Array.from({ length: 7 }, (_, i) => { const d = new Date(ini); d.setDate(ini.getDate() + i); return iso(d) })
        return (
          <div className="grid grid-cols-1 sm:grid-cols-7 gap-2">
            {dias.map(f => {
              const acts = porFecha.get(f) ?? []
              const d = new Date(f + 'T12:00:00')
              return (
                <div key={f} className={`rounded-xl border p-2 min-h-[100px] ${f === hoy ? 'border-pm-red' : 'border-gray-100'}`}>
                  <div className={`text-xs font-bold mb-1 capitalize ${f === hoy ? 'text-pm-red' : 'text-gray-500'}`}>{d.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric' })}</div>
                  <div className="space-y-1">{acts.length ? acts.map(a => <Chip key={a.id} a={a} />) : <span className="text-[11px] text-gray-300">—</span>}</div>
                </div>
              )
            })}
          </div>
        )
      })()}

      {/* DÍA */}
      {vista === 'dia' && (() => {
        const acts = porFecha.get(iso(ref)) ?? []
        return acts.length ? (
          <div className="space-y-2">
            {acts.map(a => {
              const fila = (
                <>
                  <div className="text-pm-red font-black text-sm w-28 shrink-0">{a.hora_inicio || '—'}{a.hora_fin ? ` – ${a.hora_fin}` : ''}</div>
                  <div className="min-w-0">
                    <div className="font-bold text-pm-navy text-sm">{a.actividad}{nombreMonitor ? ` · ${nombreMonitor(a.monitor_id)}` : ''}</div>
                    <div className="text-xs text-gray-500">{[a.lugar, a.grupo].filter(Boolean).join(' · ')}{a.observaciones ? ` — ${a.observaciones}` : ''}</div>
                  </div>
                </>
              )
              return onEditarActividad
                ? <button key={a.id} type="button" onClick={() => onEditarActividad(a)} className="w-full flex items-start gap-3 border border-gray-100 rounded-xl p-3 text-left hover:border-pm-red/50 hover:bg-pm-red-light/20">{fila}<span className="ml-auto text-gray-300 text-xs self-center">✎ editar</span></button>
                : <div key={a.id} className="flex items-start gap-3 border border-gray-100 rounded-xl p-3">{fila}</div>
            })}
          </div>
        ) : <p className="text-gray-400 text-sm py-8 text-center">Sin actividades este día.</p>
      })()}
    </div>
  )
}
