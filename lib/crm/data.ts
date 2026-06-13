import { createAdminClient } from '@/lib/supabase/admin'
import { normEstadoReserva, normEstadoPago } from './constants'
import type { Registro, Origen, Pago } from './constants'

async function safe<T>(fn: () => Promise<{ data: T[] | null; error: unknown }>): Promise<{ rows: T[]; ok: boolean }> {
  try {
    const { data, error } = await fn()
    if (error) return { rows: [], ok: false }
    return { rows: data ?? [], ok: true }
  } catch { return { rows: [], ok: false } }
}

const str = (v: unknown) => (typeof v === 'string' ? v : v == null ? '' : String(v))
const num = (v: unknown) => { const n = Number(v); return isNaN(n) ? null : n }

/** Convierte importes en texto («950 €», «1.200,50 €») o número a number. */
function importe(v: unknown): number | null {
  if (typeof v === 'number') return isNaN(v) ? null : v
  if (typeof v !== 'string') return null
  let s = v.replace(/[^\d.,]/g, '')
  if (!s) return null
  if (s.includes('.') && s.includes(',')) s = s.replace(/\./g, '').replace(',', '.')
  else if (s.includes(',')) s = s.replace(',', '.')
  const n = Number(s)
  return isNaN(n) ? null : n
}

/** Separa el texto libre del JSON que las reservas guardan al final de observaciones. */
function parseObs(obs: string): { mensaje: string; datos: Record<string, unknown> } {
  if (!obs) return { mensaje: '', datos: {} }
  const m = obs.match(/\{[\s\S]*\}\s*$/)
  if (m && m.index != null) {
    try {
      const d = JSON.parse(m[0])
      if (d && typeof d === 'object') return { mensaje: obs.slice(0, m.index).trim(), datos: d as Record<string, unknown> }
    } catch { /* no era JSON */ }
  }
  return { mensaje: obs, datos: {} }
}

// ── Etiqueta de servicio para formularios (por tipo) ─────────────────────────────
const SERVICIO_FORM: Record<string, string> = {
  presupuesto: 'Talleres Participativos',
  colegio: 'Excursiones Escolares',
  extraescolar: 'Actividades Extraescolares',
  licitaciones: 'Licitaciones',
  'piea-residencias': 'PIEA · Residencias',
  'piea-talleres': 'PIEA · Talleres mayores',
  colchonetas: 'Colchonetas (consulta)',
  inscripcion: 'Talleres Intensivos',
  informacion: 'Información',
  contacto: 'Contacto',
  empresa: 'Eventos de empresa',
  ayuntamiento: 'Administración pública',
}

function categoriaDe(servicio: string): string {
  const s = servicio.toLowerCase()
  if (s.includes('cumpleañ')) return 'Cumpleaños'
  if (s.includes('campamento')) return 'Campamentos'
  if (s.includes('días sin cole') || s.includes('domingos') || s.includes('halloween') || s.includes('mágica') || s.includes('magica') || s.startsWith('evento')) return 'Eventos'
  if (s.includes('taller')) return 'Talleres'
  if (s.includes('excursi') || s.includes('extraescolar')) return 'Educación'
  if (s.includes('piea')) return 'PIEA'
  if (s.includes('licitaci') || s.includes('administración')) return 'Licitaciones'
  if (s.includes('colchoneta')) return 'Colchonetas'
  return 'Otros'
}

const MAP_RESERVA_BOOKING: Record<string, string> = { pendiente: 'nueva', confirmada: 'confirmada', pagada: 'confirmada', cancelada: 'cancelada', espera: 'espera', reembolsada: 'cancelada' }
const MAP_RESERVA_FORM: Record<string, string> = { nueva: 'nueva', leida: 'revision', respondida: 'revision', seguimiento: 'revision', cerrada: 'finalizada' }
const MAP_RESERVA_ORDER: Record<string, string> = { nuevo: 'nueva', preparando: 'en_curso', enviado: 'en_curso', entregado: 'finalizada', cancelado: 'cancelada' }
const MAP_PAGO_BOOKING: Record<string, string> = { pagado: 'pagado', pendiente: 'pendiente', fallido: 'impagado', reembolsado: 'na', parcial: 'parcial' }

const firstNum = (d: Record<string, unknown>, keys: string[]) => { for (const k of keys) { const n = importe(d[k]); if (n != null) return n } return null }
const firstStr = (d: Record<string, unknown>, keys: string[]) => { for (const k of keys) { const s = str(d[k]); if (s) return s } return '' }

export async function getRegistrosCRM(): Promise<{ registros: Registro[]; ok: boolean; gestionOk: boolean }> {
  const db = createAdminClient()
  const [bk, fm, od, gz] = await Promise.all([
    safe<Record<string, unknown>>(() => db.from('bookings').select('*').order('created_at', { ascending: false }).limit(3000) as never),
    safe<Record<string, unknown>>(() => db.from('form_submissions').select('*').neq('tipo', 'inscripcion_club').order('created_at', { ascending: false }).limit(3000) as never),
    safe<Record<string, unknown>>(() => db.from('product_orders').select('*').order('created_at', { ascending: false }).limit(3000) as never),
    safe<Record<string, unknown>>(() => db.from('crm_gestion').select('*') as never),
  ])

  const gestion = new Map<string, Record<string, unknown>>()
  gz.rows.forEach(g => gestion.set(`${g.origen}|${g.origen_id}`, g))

  const out: Registro[] = []

  // BOOKINGS
  for (const b of bk.rows) {
    const servicio = str(b.servicio) || 'Reserva'
    const { mensaje, datos } = parseObs(str(b.observaciones))
    out.push(base({
      origen: 'booking', id: str(b.id), numero: str(b.numero) || 'PM-' + str(b.id).slice(0, 6),
      servicio, categoria: categoriaDe(servicio),
      cliente_nombre: str(b.cliente_nombre), cliente_email: str(b.cliente_email), cliente_telefono: str(b.cliente_telefono),
      entidad: firstStr(datos, ['entidad', 'empresa', 'centro']),
      fecha_reserva: str(b.created_at), fecha_realizacion: b.fecha ? str(b.fecha) : null, hora: str(b.hora),
      participantes: num(b.participantes), total: num(b.precio), pagado: null,
      estado_reserva: MAP_RESERVA_BOOKING[str(b.estado_reserva)] || 'nueva',
      estado_pago: MAP_PAGO_BOOKING[str(b.estado_pago)] || 'pendiente',
      observaciones: str(b.notas_internas), mensaje, datos,
    }, gestion))
  }

  // FORM SUBMISSIONS (no-club)
  for (const f of fm.rows) {
    const tipo = str(f.tipo)
    const datos = (f.datos as Record<string, unknown>) || {}
    const servicio = SERVICIO_FORM[tipo] || (str(f.asunto) || tipo || 'Solicitud')
    out.push(base({
      origen: 'form', id: str(f.id), numero: 'F-' + str(f.id).slice(0, 6),
      servicio, categoria: categoriaDe(servicio + ' ' + tipo),
      cliente_nombre: str(f.nombre) || firstStr(datos, ['contacto', 'persona', 'entidad']), cliente_email: str(f.email), cliente_telefono: str(f.telefono),
      entidad: firstStr(datos, ['entidad', 'empresa', 'centro', 'colegio', 'ayuntamiento']),
      fecha_reserva: str(f.created_at), fecha_realizacion: datos.fecha ? str(datos.fecha) : null, hora: str(datos.hora),
      participantes: firstNum(datos, ['participantes', 'asistentes', 'alumnos', 'numParticipantes']),
      total: firstNum(datos, ['precio', 'total', 'importe', 'presupuesto', 'precioEstimado']), pagado: null,
      estado_reserva: MAP_RESERVA_FORM[str(f.estado)] || 'nueva', estado_pago: 'na',
      observaciones: '', mensaje: str(f.mensaje), datos,
    }, gestion))
  }

  // PRODUCT ORDERS (colchonetas)
  for (const o of od.rows) {
    const servicio = str(o.tipo) === 'personalizacion' ? 'Colchonetas · Personalización' : 'Colchonetas · Pedido'
    out.push(base({
      origen: 'order', id: str(o.id), numero: 'P-' + str(o.id).slice(0, 6),
      servicio, categoria: 'Colchonetas',
      cliente_nombre: str(o.cliente_nombre), cliente_email: str(o.cliente_email), cliente_telefono: str(o.cliente_telefono),
      entidad: '',
      fecha_reserva: str(o.created_at), fecha_realizacion: null, hora: '',
      participantes: null, total: num(o.total), pagado: null,
      estado_reserva: MAP_RESERVA_ORDER[str(o.estado)] || 'nueva', estado_pago: 'pendiente',
      observaciones: '', mensaje: str(o.detalle), datos: { items: o.items },
    }, gestion))
  }

  out.sort((a, b) => (b.fecha_reserva || '').localeCompare(a.fecha_reserva || ''))
  return { registros: out, ok: bk.ok || fm.ok || od.ok, gestionOk: gz.ok }
}

type RegInput = Omit<Registro, 'pagos' | 'metodo_pago'>

// Aplica el overlay de gestión sobre los valores base de la fuente
function base(r: RegInput, gestion: Map<string, Record<string, unknown>>): Registro {
  const full: Registro = { ...r, estado_reserva: normEstadoReserva(r.estado_reserva), estado_pago: normEstadoPago(r.estado_pago), metodo_pago: '', pagos: [] }
  const g = gestion.get(`${r.origen}|${r.id}`)
  if (!g) return full
  const ov = <T,>(v: unknown, fallback: T): T => (v == null ? fallback : (v as T))
  return {
    ...full,
    estado_reserva: normEstadoReserva(ov(g.estado_reserva, full.estado_reserva)),
    estado_pago: normEstadoPago(ov(g.estado_pago, full.estado_pago)),
    total: ov(num(g.total), full.total),
    pagado: ov(num(g.pagado), full.pagado),
    metodo_pago: ov(g.metodo_pago, ''),
    fecha_realizacion: ov(g.fecha_realizacion ? String(g.fecha_realizacion) : null, full.fecha_realizacion),
    participantes: ov(num(g.participantes), full.participantes),
    observaciones: ov(g.observaciones, full.observaciones),
    pagos: (g.pagos as Pago[]) || [],
  }
}
