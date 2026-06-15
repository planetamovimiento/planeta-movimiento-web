import { createAdminClient } from '@/lib/supabase/admin'
import type { Monitor, Actividad, Fichaje, Carpeta, Documento } from './tipos'

type Row = Record<string, unknown>
const str = (v: unknown) => (typeof v === 'string' ? v : v == null ? '' : String(v))
const num = (v: unknown) => { const n = Number(v); return Number.isFinite(n) ? n : 0 }

async function safe<T>(fn: () => Promise<{ data: T[] | null; error: unknown }>): Promise<T[]> {
  try { const { data, error } = await fn(); return error ? [] : (data ?? []) } catch { return [] }
}

function aMonitor(r: Row): Monitor {
  return {
    id: str(r.id), email: str(r.email), nombre: str(r.nombre), apellidos: str(r.apellidos),
    foto_url: str(r.foto_url), telefono: str(r.telefono), fecha_alta: r.fecha_alta ? str(r.fecha_alta) : null,
    especialidades: Array.isArray(r.especialidades) ? (r.especialidades as string[]) : [],
    estado: str(r.estado) || 'activo', observaciones: str(r.observaciones),
  }
}
function aActividad(r: Row): Actividad {
  return {
    id: str(r.id), monitor_id: str(r.monitor_id), fecha: str(r.fecha).slice(0, 10),
    hora_inicio: str(r.hora_inicio), hora_fin: str(r.hora_fin), actividad: str(r.actividad),
    lugar: str(r.lugar), grupo: str(r.grupo), observaciones: str(r.observaciones),
  }
}
function aFichaje(r: Row): Fichaje {
  return {
    id: str(r.id), monitor_id: str(r.monitor_id), fecha: str(r.fecha).slice(0, 10),
    entrada: str(r.entrada), salida: r.salida ? str(r.salida) : null,
    actividad: str(r.actividad), observaciones: str(r.observaciones),
  }
}

/** Todos los monitores (orden alfabético). */
export async function getMonitores(): Promise<Monitor[]> {
  const db = createAdminClient()
  const rows = await safe<Row>(() => db.from('monitores').select('*') as never)
  return rows.map(aMonitor).sort((a, b) => `${a.nombre} ${a.apellidos}`.localeCompare(`${b.nombre} ${b.apellidos}`, 'es'))
}

/** Un monitor por su correo (el del login). */
export async function getMonitorPorEmail(email: string): Promise<Monitor | null> {
  const db = createAdminClient()
  try {
    const { data } = await db.from('monitores').select('*').eq('email', email.trim().toLowerCase()).maybeSingle()
    return data ? aMonitor(data as Row) : null
  } catch { return null }
}

/** Actividades asignadas. Filtra por monitor y/o rango de fechas (YYYY-MM-DD). */
export async function getActividades(opts: { monitorId?: string; desde?: string; hasta?: string } = {}): Promise<Actividad[]> {
  const db = createAdminClient()
  const rows = await safe<Row>(() => {
    let q = db.from('monitor_actividades').select('*')
    if (opts.monitorId) q = q.eq('monitor_id', opts.monitorId)
    if (opts.desde) q = q.gte('fecha', opts.desde)
    if (opts.hasta) q = q.lte('fecha', opts.hasta)
    return q as never
  })
  return rows.map(aActividad).sort((a, b) => (a.fecha + a.hora_inicio).localeCompare(b.fecha + b.hora_inicio))
}

/** Fichajes (jornadas). Filtra por monitor si se indica. */
export async function getFichajes(monitorId?: string): Promise<Fichaje[]> {
  const db = createAdminClient()
  const rows = await safe<Row>(() => {
    let q = db.from('monitor_fichajes').select('*')
    if (monitorId) q = q.eq('monitor_id', monitorId)
    return q as never
  })
  return rows.map(aFichaje).sort((a, b) => (b.entrada || '').localeCompare(a.entrada || ''))
}

/** Fichaje abierto (sin salida) de un monitor, o null. */
export async function getFichajeAbierto(monitorId: string): Promise<Fichaje | null> {
  const db = createAdminClient()
  try {
    const { data } = await db.from('monitor_fichajes').select('*').eq('monitor_id', monitorId).is('salida', null).order('entrada', { ascending: false }).limit(1).maybeSingle()
    return data ? aFichaje(data as Row) : null
  } catch { return null }
}

/** Carpetas de recursos con el número de documentos de cada una. */
export async function getCarpetas(): Promise<Carpeta[]> {
  const db = createAdminClient()
  const [carps, docs] = await Promise.all([
    safe<Row>(() => db.from('recursos_carpetas').select('*') as never),
    safe<Row>(() => db.from('recursos_documentos').select('carpeta_id') as never),
  ])
  const conteo = new Map<string, number>()
  for (const d of docs) conteo.set(str(d.carpeta_id), (conteo.get(str(d.carpeta_id)) ?? 0) + 1)
  return carps
    .map(c => ({ id: str(c.id), nombre: str(c.nombre), orden: num(c.orden), numDocs: conteo.get(str(c.id)) ?? 0 }))
    .sort((a, b) => a.orden - b.orden || a.nombre.localeCompare(b.nombre, 'es'))
}

/** Todos los documentos (para agrupar por carpeta en el navegador). */
export async function getTodosDocumentos(): Promise<Documento[]> {
  const db = createAdminClient()
  const rows = await safe<Row>(() => db.from('recursos_documentos').select('*') as never)
  return rows
    .map(r => ({
      id: str(r.id), carpeta_id: str(r.carpeta_id), nombre: str(r.nombre), tipo: str(r.tipo),
      url: str(r.url), tamano: num(r.tamano), subido_por: str(r.subido_por), created_at: str(r.created_at),
    }))
    .sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''))
}

/** Documentos de una carpeta. */
export async function getDocumentos(carpetaId: string): Promise<Documento[]> {
  const db = createAdminClient()
  const rows = await safe<Row>(() => db.from('recursos_documentos').select('*').eq('carpeta_id', carpetaId) as never)
  return rows
    .map(r => ({
      id: str(r.id), carpeta_id: str(r.carpeta_id), nombre: str(r.nombre), tipo: str(r.tipo),
      url: str(r.url), tamano: num(r.tamano), subido_por: str(r.subido_por), created_at: str(r.created_at),
    }))
    .sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''))
}
