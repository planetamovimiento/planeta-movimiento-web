'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { expandirOcurrencias } from '@/lib/calendario-club/expand'
import { iso, paleta, colorOcurrencia, type EventoClub, type Excepcion, type TipoEvento, type Ocurrencia } from '@/lib/calendario-club/tipos'
import VistaMes from './VistaMes'
import VistaSemana from './VistaSemana'
import VistaDia from './VistaDia'
import VistaAgenda from './VistaAgenda'
import EventoModal from './EventoModal'
import OcurrenciaModal from './OcurrenciaModal'

type Vista = 'mes' | 'semana' | 'dia' | 'agenda'

type Props = {
  eventos: EventoClub[]
  excepciones: Excepcion[]
  tipos: TipoEvento[]
  actividades: string[]; grupos: string[]; monitores: string[]; ubicaciones: string[]; temporadas: string[]
  puedeEditar: boolean
  esPrincipal: boolean
}

type Filtros = { tipo: string; actividad: string; grupo: string; monitor: string; temporada: string; ubicacion: string }
const SIN_FILTROS: Filtros = { tipo: '', actividad: '', grupo: '', monitor: '', temporada: '', ubicacion: '' }

function rango(vista: Vista, c: Date): [string, string] {
  const y = c.getFullYear(), m = c.getMonth(), d = c.getDate()
  if (vista === 'mes' || vista === 'agenda') return [iso(y, m, 1), iso(y, m, new Date(y, m + 1, 0).getDate())]
  if (vista === 'semana') {
    const dow = (c.getDay() + 6) % 7
    const lun = new Date(y, m, d - dow), dom = new Date(y, m, d - dow + 6)
    return [iso(lun.getFullYear(), lun.getMonth(), lun.getDate()), iso(dom.getFullYear(), dom.getMonth(), dom.getDate())]
  }
  return [iso(y, m, d), iso(y, m, d)]
}

function titulo(vista: Vista, c: Date): string {
  if (vista === 'semana') {
    const [a, b] = rango('semana', c)
    const da = new Date(a + 'T12:00:00'), db = new Date(b + 'T12:00:00')
    return `Semana del ${da.getDate()} al ${db.toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}`
  }
  if (vista === 'dia') return c.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  return c.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })
}

export default function CalendarioClubClient(props: Props) {
  const { eventos, excepciones, tipos, puedeEditar } = props
  const router = useRouter()
  const [vista, setVista] = useState<Vista>('mes')
  const [cursor, setCursor] = useState(new Date())
  const [f, setF] = useState<Filtros>(SIN_FILTROS)
  const [modalEvento, setModalEvento] = useState<{ evento: EventoClub | null; fecha?: string } | null>(null)
  const [modalOcurrencia, setModalOcurrencia] = useState<Ocurrencia | null>(null)

  const [desde, hasta] = rango(vista, cursor)
  const eventosById = useMemo(() => new Map(eventos.map(e => [e.id, e])), [eventos])

  const ocurrencias = useMemo(() => {
    const todas = expandirOcurrencias(eventos, excepciones, desde, hasta)
    return todas.filter(o =>
      (!f.tipo || o.tipo === f.tipo) &&
      (!f.actividad || o.actividad === f.actividad) &&
      (!f.grupo || o.grupo === f.grupo) &&
      (!f.monitor || o.monitor === f.monitor) &&
      (!f.temporada || o.temporada === f.temporada) &&
      (!f.ubicacion || o.ubicacion === f.ubicacion),
    )
  }, [eventos, excepciones, desde, hasta, f])

  function nav(dir: number) {
    setCursor(c => {
      const n = new Date(c)
      if (vista === 'mes' || vista === 'agenda') n.setMonth(n.getMonth() + dir)
      else if (vista === 'semana') n.setDate(n.getDate() + 7 * dir)
      else n.setDate(n.getDate() + dir)
      return n
    })
  }

  function crear(fecha?: string) { if (puedeEditar) setModalEvento({ evento: null, fecha }) }
  function abrir(o: Ocurrencia) {
    const ev = eventosById.get(o.eventoId)
    if (!ev) return
    if (ev.recurrencia) setModalOcurrencia(o)
    else setModalEvento({ evento: ev })
  }
  function editarSerie(o: Ocurrencia) {
    const ev = eventosById.get(o.eventoId)
    setModalOcurrencia(null)
    if (ev) setModalEvento({ evento: ev })
  }
  function cerrar() { setModalEvento(null); setModalOcurrencia(null); router.refresh() }

  const sel = 'border border-gray-200 rounded-xl px-2.5 py-2 text-sm bg-white focus:outline-none focus:border-pm-red'
  const tiposOrden = [...tipos].sort((a, b) => a.orden - b.orden)

  const vistaProps = { ocurrencias, tipos, cursor, puedeEditar, onCrear: crear, onAbrir: abrir }

  return (
    <div className="p-4 lg:p-6 space-y-4">
      {/* Barra superior */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3 flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1">
          <button onClick={() => nav(-1)} className="w-9 h-9 rounded-xl border border-gray-200 text-pm-navy hover:border-pm-red">‹</button>
          <button onClick={() => nav(1)} className="w-9 h-9 rounded-xl border border-gray-200 text-pm-navy hover:border-pm-red">›</button>
          <button onClick={() => setCursor(new Date())} className="ml-1 text-xs font-bold text-pm-navy border border-gray-200 rounded-xl px-3 py-2 hover:border-pm-red">Hoy</button>
        </div>
        <h2 className="text-lg font-black text-pm-navy capitalize min-w-[12rem]">{titulo(vista, cursor)}</h2>

        {/* Selector de vista */}
        <div className="flex bg-pm-bg rounded-xl p-1 ml-auto">
          {(['mes', 'semana', 'dia', 'agenda'] as Vista[]).map(v => (
            <button key={v} onClick={() => setVista(v)}
              className={`text-xs font-bold px-3 py-1.5 rounded-lg capitalize transition-colors ${vista === v ? 'bg-white text-pm-red shadow-sm' : 'text-gray-500 hover:text-pm-navy'}`}>
              {v === 'dia' ? 'Día' : v}
            </button>
          ))}
        </div>
        {puedeEditar && (
          <button onClick={() => crear()} className="bg-pm-red hover:bg-pm-red-dark text-white font-bold px-4 py-2 rounded-xl text-sm">+ Evento</button>
        )}
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3 flex flex-wrap items-center gap-2">
        <select value={f.tipo} onChange={e => setF({ ...f, tipo: e.target.value })} className={sel}>
          <option value="">Todos los tipos</option>
          {tiposOrden.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
        </select>
        <select value={f.actividad} onChange={e => setF({ ...f, actividad: e.target.value })} className={sel}>
          <option value="">Toda actividad</option>
          {props.actividades.map(a => <option key={a} value={a}>{a}</option>)}
        </select>
        <select value={f.grupo} onChange={e => setF({ ...f, grupo: e.target.value })} className={sel}>
          <option value="">Todos los grupos</option>
          {props.grupos.map(g => <option key={g} value={g}>{g}</option>)}
        </select>
        <select value={f.monitor} onChange={e => setF({ ...f, monitor: e.target.value })} className={sel}>
          <option value="">Todos los monitores</option>
          {props.monitores.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
        <select value={f.temporada} onChange={e => setF({ ...f, temporada: e.target.value })} className={sel}>
          <option value="">Toda temporada</option>
          {props.temporadas.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        {props.ubicaciones.length > 0 && (
          <select value={f.ubicacion} onChange={e => setF({ ...f, ubicacion: e.target.value })} className={sel}>
            <option value="">Toda ubicación</option>
            {props.ubicaciones.map(u => <option key={u} value={u}>{u}</option>)}
          </select>
        )}
        {(f.tipo || f.actividad || f.grupo || f.monitor || f.temporada || f.ubicacion) && (
          <button onClick={() => setF(SIN_FILTROS)} className="text-xs font-semibold text-pm-red hover:underline">Limpiar</button>
        )}
        <div className="ml-auto flex gap-2">
          {props.esPrincipal && (
            <a href="/admin/calendario-club/ajustes"
              className="text-xs font-bold text-pm-navy border border-gray-200 rounded-xl px-3 py-2 hover:border-pm-red">🎨 Colores</a>
          )}
          <a href={`/admin/calendario-club/imprimir?desde=${desde}&hasta=${hasta}`} target="_blank"
            className="text-xs font-bold text-pm-navy border border-gray-200 rounded-xl px-3 py-2 hover:border-pm-red">🖨️ Exportar / PDF</a>
        </div>
      </div>

      {/* Leyenda */}
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 px-1">
        {tiposOrden.map(t => (
          <span key={t.id} className="flex items-center gap-1.5">
            <span className={`w-3 h-3 rounded-full ${paleta(t.color).dot}`} /> {t.label}
          </span>
        ))}
      </div>

      {/* Vista activa */}
      {vista === 'mes' && <VistaMes {...vistaProps} />}
      {vista === 'semana' && <VistaSemana {...vistaProps} />}
      {vista === 'dia' && <VistaDia {...vistaProps} />}
      {vista === 'agenda' && <VistaAgenda {...vistaProps} />}

      {modalEvento && (
        <EventoModal
          evento={modalEvento.evento}
          fechaPreset={modalEvento.fecha}
          tipos={tipos}
          opciones={{ actividades: props.actividades, grupos: props.grupos, monitores: props.monitores, ubicaciones: props.ubicaciones, temporadas: props.temporadas }}
          onClose={() => setModalEvento(null)}
          onDone={cerrar}
        />
      )}
      {modalOcurrencia && (
        <OcurrenciaModal
          ocurrencia={modalOcurrencia}
          color={colorOcurrencia(modalOcurrencia, tipos)}
          onEditarSerie={() => editarSerie(modalOcurrencia)}
          onClose={() => setModalOcurrencia(null)}
          onDone={cerrar}
        />
      )}
    </div>
  )
}
