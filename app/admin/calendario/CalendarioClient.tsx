'use client'

import { useState, useMemo, useTransition } from 'react'
import { MESES, DIAS_SEMANA, COLOR_CATEGORIA, colorDe, type EventoCalendario } from '@/lib/calendario/constants'
import { crearEventoManual, eliminarEventoManual } from './actions'

const HOY = new Date()
const pad = (n: number) => String(n).padStart(2, '0')
const iso = (y: number, m: number, d: number) => `${y}-${pad(m + 1)}-${pad(d)}`
const HOY_ISO = iso(HOY.getFullYear(), HOY.getMonth(), HOY.getDate())

export default function CalendarioClient({ eventos: ini, servicios, puedeEditar, gestionOk }: {
  eventos: EventoCalendario[]; servicios: string[]; puedeEditar: boolean; gestionOk: boolean
}) {
  const [eventos, setEventos] = useState<EventoCalendario[]>(ini)
  const [year, setYear] = useState(HOY.getFullYear())
  const [month, setMonth] = useState(HOY.getMonth())
  const [fServicio, setFServicio] = useState('')
  const [diaSel, setDiaSel] = useState<string | null>(null)
  const [, startTransition] = useTransition()
  const [error, setError] = useState('')

  const filtrados = useMemo(() => eventos.filter(e => !fServicio || e.servicio === fServicio), [eventos, fServicio])
  const porDia = useMemo(() => {
    const m = new Map<string, EventoCalendario[]>()
    for (const e of filtrados) { const a = m.get(e.fecha) || []; a.push(e); m.set(e.fecha, a) }
    // Dentro de cada día, primero los que tienen hora (ordenados), luego el resto.
    for (const a of m.values()) a.sort((x, y) => (x.hora || '~~').localeCompare(y.hora || '~~'))
    return m
  }, [filtrados])

  const mesActual = `${year}-${pad(month + 1)}`
  const totalMes = useMemo(() => filtrados.filter(e => e.fecha.startsWith(mesActual)).length, [filtrados, mesActual])

  const primerDiaSemana = (new Date(year, month, 1).getDay() + 6) % 7
  const diasEnMes = new Date(year, month + 1, 0).getDate()
  const celdas: (number | null)[] = [...Array(primerDiaSemana).fill(null), ...Array.from({ length: diasEnMes }, (_, i) => i + 1)]

  const prev = () => (month === 0 ? (setMonth(11), setYear(y => y - 1)) : setMonth(m => m - 1))
  const next = () => (month === 11 ? (setMonth(0), setYear(y => y + 1)) : setMonth(m => m + 1))
  const hoy = () => { setYear(HOY.getFullYear()); setMonth(HOY.getMonth()) }

  function addManual(fecha: string, titulo: string, servicio: string, hora: string, nota: string) {
    startTransition(async () => {
      const r = await crearEventoManual({ fecha, titulo, servicio, hora, nota })
      if (r.ok) setEventos(prev => [...prev, { id: `m-${r.id}`, fecha, titulo, servicio: servicio || 'Evento manual', categoria: 'Manual', tipo: 'manual', hora: hora || undefined, detalle: nota }])
      else setError(r.error || 'No se pudo crear')
    })
  }
  function delManual(id: string) {
    setEventos(prev => prev.filter(e => e.id !== id))
    startTransition(async () => { await eliminarEventoManual(id.replace(/^m-/, '')) })
  }

  const eventosDia = diaSel ? (porDia.get(diaSel) || []) : []

  return (
    <div className="space-y-4">
      {!gestionOk && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-sm text-amber-800">
          <div className="font-black mb-1">⚙️ Falta una migración</div>
          Ejecuta <code className="bg-amber-100 px-1.5 py-0.5 rounded">supabase/migration_calendario.sql</code> en Supabase para poder añadir eventos manuales. Las reservas y fechas programadas se ven igualmente.
        </div>
      )}
      {error && <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700 flex justify-between"><span>{error}</span><button onClick={() => setError('')} className="font-bold">✕</button></div>}

      {/* Barra superior */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1">
          <button onClick={prev} className="w-9 h-9 rounded-xl border border-gray-200 text-pm-navy hover:border-pm-red transition-colors">‹</button>
          <button onClick={next} className="w-9 h-9 rounded-xl border border-gray-200 text-pm-navy hover:border-pm-red transition-colors">›</button>
          <button onClick={hoy} className="ml-1 text-xs font-bold text-pm-navy border border-gray-200 rounded-xl px-3 py-2 hover:border-pm-red transition-colors">Hoy</button>
        </div>
        <h2 className="text-xl font-black text-pm-navy">{MESES[month]} {year}</h2>
        <select value={fServicio} onChange={e => setFServicio(e.target.value)} className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:border-pm-red max-w-[16rem]">
          <option value="">Todos los servicios</option>
          {servicios.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <span className="text-xs text-gray-400 font-semibold">{totalMes} este mes</span>
        {puedeEditar && (
          <button onClick={() => setDiaSel(iso(year, month, HOY.getMonth() === month && HOY.getFullYear() === year ? HOY.getDate() : 1))}
            className="ml-auto text-sm font-bold text-white bg-pm-red hover:bg-pm-red-dark rounded-xl px-4 py-2 transition-colors">+ Añadir evento</button>
        )}
      </div>

      {/* Leyenda */}
      <div className="flex flex-wrap gap-2 text-xs text-gray-500">
        {Object.entries(COLOR_CATEGORIA).map(([cat, cls]) => (
          <span key={cat} className={`px-2 py-0.5 rounded-full font-semibold ${cls}`}>{cat}</span>
        ))}
      </div>

      {/* Rejilla del mes */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="grid grid-cols-7 bg-pm-bg text-xs font-black text-gray-500 uppercase">
          {DIAS_SEMANA.map(d => <div key={d} className="px-2 py-2 text-center">{d}</div>)}
        </div>
        <div className="grid grid-cols-7">
          {celdas.map((dia, i) => {
            if (dia === null) return <div key={`b${i}`} className="min-h-[96px] border-b border-r border-gray-50 bg-gray-50/40" />
            const fecha = iso(year, month, dia)
            const evs = porDia.get(fecha) || []
            const esHoy = fecha === HOY_ISO
            return (
              <button key={fecha} onClick={() => setDiaSel(fecha)}
                className="min-h-[96px] border-b border-r border-gray-50 p-1.5 text-left hover:bg-gray-50 transition-colors align-top flex flex-col gap-1">
                <span className={`text-xs font-bold ${esHoy ? 'bg-pm-red text-white w-6 h-6 rounded-full flex items-center justify-center' : 'text-gray-500'}`}>{dia}</span>
                <div className="space-y-0.5 overflow-hidden">
                  {evs.slice(0, 3).map(e => (
                    <div key={e.id} className={`text-[10px] leading-tight px-1.5 py-0.5 rounded truncate ${colorDe(e.categoria)}`} title={(e.hora ? `${e.hora} · ` : '') + e.titulo}>
                      {e.hora && <span className="font-bold">{e.hora} </span>}{e.titulo}
                    </div>
                  ))}
                  {evs.length > 3 && <div className="text-[10px] text-gray-400 font-semibold px-1">+{evs.length - 3} más</div>}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Panel del día */}
      {diaSel && (
        <DiaPanel
          fecha={diaSel} eventos={eventosDia} servicios={servicios} puedeEditar={puedeEditar}
          onClose={() => setDiaSel(null)} onAdd={addManual} onDel={delManual}
        />
      )}
    </div>
  )
}

// ─── Panel de un día ────────────────────────────────────────────────────────────
function DiaPanel({ fecha, eventos, servicios, puedeEditar, onClose, onAdd, onDel }: {
  fecha: string; eventos: EventoCalendario[]; servicios: string[]; puedeEditar: boolean
  onClose: () => void; onAdd: (fecha: string, titulo: string, servicio: string, hora: string, nota: string) => void; onDel: (id: string) => void
}) {
  const [titulo, setTitulo] = useState('')
  const [servicio, setServicio] = useState('')
  const [hora, setHora] = useState('')
  const [nota, setNota] = useState('')
  const d = new Date(fecha + 'T12:00:00')
  const fechaLarga = d.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white h-full overflow-y-auto shadow-2xl">
        <div className="bg-pm-navy text-white px-5 py-4 flex items-center justify-between sticky top-0 z-10">
          <div className="font-black capitalize">{fechaLarga}</div>
          <button onClick={onClose} className="text-white/60 hover:text-white"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg></button>
        </div>
        <div className="p-5 space-y-4 text-sm">
          <div className="text-xs font-black text-pm-navy uppercase tracking-wider">{eventos.length} evento(s)</div>
          {eventos.length === 0 && <p className="text-gray-400">No hay nada programado este día.</p>}
          <div className="space-y-2">
            {eventos.map(e => (
              <div key={e.id} className={`rounded-xl p-3 ${colorDe(e.categoria)} flex items-start justify-between gap-2`}>
                <div>
                  <div className="font-bold text-sm">{e.titulo}</div>
                  {e.hora && <div className="text-xs font-semibold opacity-80">🕒 {e.hora}</div>}
                  <div className="text-xs opacity-70">{e.servicio} · {e.tipo === 'reserva' ? 'Reserva' : e.tipo === 'manual' ? 'Manual' : 'Programado'}{e.detalle ? ` · ${e.detalle}` : ''}</div>
                </div>
                {e.tipo === 'manual' && puedeEditar && (
                  <button onClick={() => onDel(e.id)} className="text-current/60 hover:text-red-600 shrink-0" title="Eliminar"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg></button>
                )}
              </div>
            ))}
          </div>

          {puedeEditar && (
            <div className="border-t border-gray-100 pt-4 space-y-2">
              <div className="text-xs font-black text-pm-navy uppercase tracking-wider">Añadir evento este día</div>
              <input value={titulo} onChange={e => setTitulo(e.target.value)} placeholder="Título del evento *" className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-pm-red" />
              <input value={servicio} onChange={e => setServicio(e.target.value)} placeholder="Servicio (opcional)" list="servicios-cal" className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-pm-red" />
              <datalist id="servicios-cal">{servicios.map(s => <option key={s} value={s} />)}</datalist>
              <input value={hora} onChange={e => setHora(e.target.value)} placeholder="Hora (opcional) · ej. 18:00 o 18:00 – 20:00" className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-pm-red" />
              <input value={nota} onChange={e => setNota(e.target.value)} placeholder="Nota (opcional)" className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-pm-red" />
              <button onClick={() => { if (titulo.trim()) { onAdd(fecha, titulo.trim(), servicio.trim(), hora.trim(), nota.trim()); setTitulo(''); setServicio(''); setHora(''); setNota('') } }}
                className="w-full bg-pm-red hover:bg-pm-red-dark text-white font-bold py-2.5 rounded-lg text-sm transition-colors">Añadir al calendario</button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
