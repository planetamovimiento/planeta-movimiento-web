import { getConfig, setConfig } from '@/lib/config/store'
import { getEventosCalendario } from '@/lib/calendario/data'
import { getEventos, getExcepciones } from '@/lib/calendario-club/data'
import { expandirOcurrencias } from '@/lib/calendario-club/expand'
import { categoriaDe } from '@/lib/crm/data'
import type { Actividad, ReglaMonitor } from './tipos'

// ─────────────────────────────────────────────────────────────────────────────
// Calendario AUTOMÁTICO de los monitores.
//
// Cada monitor puede tener reglas del tipo «Cumpleaños · viernes, sábado y
// domingo» o «Club · Jiu-Jitsu Brasileño · martes y jueves». Su calendario
// muestra, además de lo asignado a mano, todo evento del calendario de la
// empresa o del club que encaje con alguna de sus reglas.
//
// No se copian filas: se calcula al leer. Así, si una reserva se cancela o se
// cambia de día, desaparece o se mueve sola del calendario del monitor.
// ─────────────────────────────────────────────────────────────────────────────

const CLAVE = 'monitor_reglas'

/** Categorías del calendario de la empresa que se pueden asignar (las del CRM). */
export const CATEGORIAS_EMPRESA = ['Cumpleaños', 'Eventos', 'Campamentos', 'Talleres', 'Educación', 'PIEA', 'Otros']

const norm = (s: string) => (s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').trim().toLowerCase()

/** 1=Lun … 7=Dom para una fecha YYYY-MM-DD. */
const diaSemana = (f: string) => ((new Date(f + 'T12:00:00').getDay() + 6) % 7) + 1

/** "De 17:00 a 19:00", "18:15 – 20:15" o "17:00" → { ini, fin }. */
function horas(texto?: string): { ini: string; fin: string } {
  const m = (texto || '').match(/\d{1,2}:\d{2}/g) ?? []
  const pad = (h?: string) => (h ? h.padStart(5, '0') : '')
  return { ini: pad(m[0]), fin: pad(m[1]) }
}

/** Reglas de todos los monitores: { [monitorId]: ReglaMonitor[] }. */
export async function getReglasMonitores(): Promise<Record<string, ReglaMonitor[]>> {
  const raw = await getConfig(CLAVE)
  try {
    const j = raw ? JSON.parse(raw) : {}
    return j && typeof j === 'object' && !Array.isArray(j) ? j : {}
  } catch {
    return {}
  }
}

/**
 * Guarda las reglas de un monitor.
 * ponytail: todas las reglas viven en un único valor de global_config (el último
 * que guarda gana). Vale para un solo administrador editando; si se editan a la
 * vez desde varios sitios, pasar a una tabla monitor_reglas.
 */
export async function setReglasMonitor(monitorId: string, reglas: ReglaMonitor[], updatedBy?: string): Promise<boolean> {
  const todas = await getReglasMonitores()
  if (reglas.length) todas[monitorId] = reglas
  else delete todas[monitorId]
  return setConfig(CLAVE, JSON.stringify(todas), updatedBy)
}

/**
 * Actividades que les tocan a los monitores por sus reglas, entre dos fechas.
 * Si se pasa `soloMonitor`, solo calcula las de ese monitor.
 */
export async function actividadesAutomaticas(desde: string, hasta: string, soloMonitor?: string): Promise<Actividad[]> {
  const todas = await getReglasMonitores()
  const entradas = Object.entries(todas).filter(([id, r]) => r?.length && (!soloMonitor || id === soloMonitor))
  if (!entradas.length) return []

  const quiereEmpresa = entradas.some(([, rs]) => rs.some(r => r.ambito === 'empresa'))
  const quiereClub = entradas.some(([, rs]) => rs.some(r => r.ambito === 'club'))

  const [empresa, club] = await Promise.all([
    quiereEmpresa ? getEventosCalendario().then(r => r.eventos).catch(() => []) : Promise.resolve([]),
    quiereClub
      ? Promise.all([getEventos(), getExcepciones()]).then(([ev, ex]) => expandirOcurrencias(ev, ex, desde, hasta)).catch(() => [])
      : Promise.resolve([]),
  ])

  const out: Actividad[] = []
  for (const [monitorId, reglas] of entradas) {
    // Empresa: reservas confirmadas, programados y eventos manuales.
    for (const e of empresa) {
      if (e.fecha < desde || e.fecha > hasta) continue
      // Los eventos manuales no traen categoría: se deduce de su servicio y título.
      const categoria = e.categoria === 'Manual' ? categoriaDe(`${e.servicio} ${e.titulo}`) : e.categoria
      const dia = diaSemana(e.fecha)
      const regla = reglas.find(r => r.ambito === 'empresa' && norm(r.categoria) === norm(categoria) && r.dias.includes(dia))
      if (!regla) continue
      const h = horas(e.hora)
      out.push({
        id: `auto:${monitorId}:${e.id}`, monitor_id: monitorId, fecha: e.fecha,
        hora_inicio: h.ini, hora_fin: h.fin,
        actividad: `⚡ ${e.titulo}`, lugar: '', grupo: '',
        observaciones: `Automática · ${categoria}`, auto: true,
      })
    }

    // Club: sesiones del calendario del club (sin festivos, días sin clase ni canceladas).
    for (const o of club) {
      if (o.cancelado || o.tipo === 'festivo' || o.tipo === 'sin_clase') continue
      if (!o.actividad) continue
      const dia = diaSemana(o.fecha)
      const regla = reglas.find(r => r.ambito === 'club' && norm(r.categoria) === norm(o.actividad!) && r.dias.includes(dia))
      if (!regla) continue
      out.push({
        id: `auto:${monitorId}:club:${o.eventoId}:${o.fecha}`, monitor_id: monitorId, fecha: o.fecha,
        hora_inicio: o.hora_inicio || '', hora_fin: o.hora_fin || '',
        actividad: `⚡ ${o.actividad}${o.grupo ? ` · ${o.grupo}` : ''}`,
        lugar: o.ubicacion || '', grupo: o.grupo || '',
        observaciones: 'Automática · Club', auto: true,
      })
    }
  }
  return out
}
