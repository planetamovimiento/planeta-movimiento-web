import { createAdminClient } from '@/lib/supabase/admin'
import { getConfig, setConfig } from '@/lib/config/store'
import { normalizarNumeroSocio } from '@/lib/familias/socio'
import { NAVIDAD_DEFAULT, type NavidadConfig } from './precios'

// ─────────────────────────────────────────────────────────────────────────────
// LA FÁBRICA DE PAPÁ NOEL — lectura de pases, aforo y ajustes. SOLO SERVIDOR.
// Los pases viven en `navidad_pases` y la ocupación la da la vista
// `navidad_ocupacion` (confirmadas + pendientes sin caducar), así que la
// disponibilidad que ve la web es siempre la de la base de datos.
// ─────────────────────────────────────────────────────────────────────────────

type Row = Record<string, unknown>
const str = (v: unknown) => (typeof v === 'string' ? v : v == null ? '' : String(v))
const num = (v: unknown) => { const n = Number(v); return Number.isFinite(n) ? n : 0 }

/** Ajustes + textos e imágenes editables de la landing. */
export type NavidadAjustes = NavidadConfig & {
  /** Avisos y políticas que Carlos aún no ha definido (vacío = no se muestra). */
  politicaCancelacion: string
  avisoAccesibilidad: string
  /** Fotos reales del montaje; vacío = ilustración por defecto. */
  imagenHero: string
  imagenCartas: string
  imagenFabrica: string
  imagenPapaNoel: string
  imagenFiesta: string
}

export const NAVIDAD_AJUSTES_DEFAULT: NavidadAjustes = {
  ...NAVIDAD_DEFAULT,
  politicaCancelacion: '',
  avisoAccesibilidad: '',
  imagenHero: '/fotos/navidad/cartel-fabrica-papa-noel-v3.webp',
  imagenCartas: '/fotos/navidad/taller-cartas.webp',
  imagenFabrica: '/fotos/navidad/fabrica-juguetes.webp',
  imagenPapaNoel: '/fotos/navidad/papa-noel.webp',
  imagenFiesta: '',
}

const CLAVE = 'navidad_config'

/** Ajustes guardados fusionados con los valores por defecto. */
export async function getAjustesNavidad(): Promise<NavidadAjustes> {
  const raw = await getConfig(CLAVE)
  if (!raw) return { ...NAVIDAD_AJUSTES_DEFAULT }
  try {
    const guardado = JSON.parse(raw) as Partial<NavidadAjustes>
    // Un texto vacío guardado (p. ej. una imagen que nunca se subió) no pisa al
    // valor por defecto: así las fotos del código se siguen viendo.
    for (const k of Object.keys(guardado) as (keyof NavidadAjustes)[]) {
      if (typeof guardado[k] === 'string' && guardado[k] === '') delete guardado[k]
    }
    return { ...NAVIDAD_AJUSTES_DEFAULT, ...guardado }
  } catch {
    return { ...NAVIDAD_AJUSTES_DEFAULT }
  }
}

export async function setAjustesNavidad(parcial: Partial<NavidadAjustes>, email?: string): Promise<boolean> {
  const actual = await getAjustesNavidad()
  return setConfig(CLAVE, JSON.stringify({ ...actual, ...parcial }), email)
}

// ─── Pases ───────────────────────────────────────────────────────────────────

export type EstadoPase = 'disponible' | 'ultimas' | 'completo' | 'bloqueado'

export type PaseVista = {
  id: string
  fecha: string        // YYYY-MM-DD
  hora: string         // '10:00'
  horaFin: string      // '10:50'
  aforo: number
  bloqueado: boolean
  ocupadas: number
  libres: number
  estado: EstadoPase
}

/** A partir de cuántas plazas libres se avisa de «últimas plazas». */
export const UMBRAL_ULTIMAS = 5

export function estadoDePase(p: { aforo: number; bloqueado: boolean; ocupadas: number }): EstadoPase {
  if (p.bloqueado) return 'bloqueado'
  const libres = Math.max(0, p.aforo - p.ocupadas)
  if (libres <= 0) return 'completo'
  if (libres <= UMBRAL_ULTIMAS) return 'ultimas'
  return 'disponible'
}

/** Todos los pases con su ocupación real, ordenados por fecha y hora. */
export async function getPases(): Promise<PaseVista[]> {
  try {
    const db = createAdminClient()
    const [pases, ocup] = await Promise.all([
      db.from('navidad_pases').select('*').order('fecha').order('hora'),
      db.from('navidad_ocupacion').select('*'),
    ])
    const ocupadasPorPase = new Map<string, number>()
    for (const o of (ocup.data ?? []) as Row[]) ocupadasPorPase.set(str(o.pase_id), num(o.ocupadas))

    return ((pases.data ?? []) as Row[]).map(p => {
      const id = str(p.id)
      const aforo = num(p.aforo)
      const bloqueado = Boolean(p.bloqueado)
      const ocupadas = ocupadasPorPase.get(id) ?? 0
      return {
        id, fecha: str(p.fecha).slice(0, 10), hora: str(p.hora), horaFin: str(p.hora_fin),
        aforo, bloqueado, ocupadas,
        libres: Math.max(0, aforo - ocupadas),
        estado: estadoDePase({ aforo, bloqueado, ocupadas }),
      }
    })
  } catch {
    return []   // migración aún sin ejecutar
  }
}

/** Pases agrupados por fecha, como los pinta el calendario. */
export function agruparPorFecha(pases: PaseVista[]): { fecha: string; pases: PaseVista[] }[] {
  const mapa = new Map<string, PaseVista[]>()
  for (const p of pases) {
    const a = mapa.get(p.fecha) ?? []
    a.push(p)
    mapa.set(p.fecha, a)
  }
  return [...mapa.entries()].sort((a, b) => a[0].localeCompare(b[0])).map(([fecha, lista]) => ({ fecha, pases: lista }))
}

// ─── Socios ──────────────────────────────────────────────────────────────────

/**
 * Comprueba de verdad que quien pide el descuento de socio lo es: el nº de
 * socio tiene que coincidir con el que tiene esa familia en el Portal de
 * Familias (misma pareja correo + número, familia activa). Marcar una casilla
 * no basta.
 */
export async function verificarSocio(numero: string, email: string): Promise<boolean> {
  const n = normalizarNumeroSocio(numero)
  const e = (email || '').trim().toLowerCase()
  if (!n || !e) return false
  try {
    const db = createAdminClient()
    const { data } = await db.from('club_familias')
      .select('numero_socio, estado').eq('email', e).maybeSingle()
    const fam = data as { numero_socio: string | null; estado: string | null } | null
    if (!fam?.numero_socio) return false
    if (fam.estado && fam.estado !== 'activo') return false
    return normalizarNumeroSocio(fam.numero_socio) === n
  } catch {
    return false
  }
}

// ─── Reservas (panel) ────────────────────────────────────────────────────────

export type ReservaNavidad = {
  id: string
  paseId: string
  localizador: string
  bookingId: string | null
  dsOrder: string
  nombre: string
  email: string
  telefono: string
  notas: string
  ninos: number
  adultos: number
  bebes: number
  plazas: number
  subtotalCents: number
  descuentoTipo: string
  descuentoPct: number
  descuentoCents: number
  totalCents: number
  socioNumero: string
  estado: string
  expiraAt: string | null
  asistio: boolean
  createdAt: string
}

function aReserva(r: Row): ReservaNavidad {
  return {
    id: str(r.id), paseId: str(r.pase_id), localizador: str(r.localizador),
    bookingId: (r.booking_id as string | null) ?? null, dsOrder: str(r.ds_order),
    nombre: str(r.cliente_nombre), email: str(r.cliente_email), telefono: str(r.cliente_telefono),
    notas: str(r.notas),
    ninos: num(r.ninos), adultos: num(r.adultos), bebes: num(r.bebes), plazas: num(r.plazas),
    subtotalCents: num(r.subtotal_cents), descuentoTipo: str(r.descuento_tipo),
    descuentoPct: num(r.descuento_pct), descuentoCents: num(r.descuento_cents),
    totalCents: num(r.total_cents), socioNumero: str(r.socio_numero),
    estado: str(r.estado), expiraAt: (r.expira_at as string | null) ?? null,
    asistio: Boolean(r.asistio), createdAt: str(r.created_at),
  }
}

/** Todas las reservas (el panel filtra en cliente: el volumen es pequeño). */
export async function getReservasNavidad(): Promise<ReservaNavidad[]> {
  try {
    const db = createAdminClient()
    const { data } = await db.from('navidad_reservas').select('*').order('created_at', { ascending: false })
    return ((data ?? []) as Row[]).map(aReserva)
  } catch {
    return []
  }
}

export async function getReservaPorLocalizador(localizador: string): Promise<ReservaNavidad | null> {
  const loc = (localizador || '').trim().toUpperCase()
  if (!loc) return null
  try {
    const db = createAdminClient()
    const { data } = await db.from('navidad_reservas').select('*').eq('localizador', loc).maybeSingle()
    return data ? aReserva(data as Row) : null
  } catch {
    return null
  }
}

// ─── Resumen para el panel ───────────────────────────────────────────────────

export type ResumenNavidad = {
  reservas: number
  asistentes: number
  ninos: number
  adultos: number
  bebes: number
  recaudadoCents: number
  aforoTotal: number
  plazasLibres: number
  ocupacionPct: number
  pendientes: number
}

export function resumirNavidad(pases: PaseVista[], reservas: ReservaNavidad[]): ResumenNavidad {
  const confirmadas = reservas.filter(r => r.estado === 'confirmada')
  const aforoTotal = pases.reduce((s, p) => s + p.aforo, 0)
  const ocupadas = pases.reduce((s, p) => s + p.ocupadas, 0)
  return {
    reservas: confirmadas.length,
    asistentes: confirmadas.reduce((s, r) => s + r.plazas, 0),
    ninos: confirmadas.reduce((s, r) => s + r.ninos, 0),
    adultos: confirmadas.reduce((s, r) => s + r.adultos, 0),
    bebes: confirmadas.reduce((s, r) => s + r.bebes, 0),
    recaudadoCents: confirmadas.reduce((s, r) => s + r.totalCents, 0),
    aforoTotal,
    plazasLibres: Math.max(0, aforoTotal - ocupadas),
    ocupacionPct: aforoTotal > 0 ? Math.round((ocupadas / aforoTotal) * 100) : 0,
    pendientes: reservas.filter(r => r.estado === 'pendiente').length,
  }
}
