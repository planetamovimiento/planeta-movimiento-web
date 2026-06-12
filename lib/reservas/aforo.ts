import { createAdminClient } from '@/lib/supabase/admin'
import { getServicio } from '@/lib/servicios/store'
import { getEventoCentro, getMananaMagica } from '@/lib/eventos/store'
import { getCampamentosConfig } from '@/lib/campamentos/store'

// ─────────────────────────────────────────────────────────────────────────────
// Aforo por fecha (en niños) de los servicios de eventos y campamentos.
// La ocupación se cuenta SUMANDO `participantes` de las reservas activas de
// `bookings` (no canceladas), con overlay de gestión del CRM (`crm_gestion`).
// Para campamentos, como `bookings.fecha` solo guarda el primer día, se parsea
// la lista de días de `observaciones` (campo datos.diasSeleccionados).
// Solo servidor (usa createAdminClient + stores de servidor).
// ─────────────────────────────────────────────────────────────────────────────

type Row = Record<string, unknown>
const str = (v: unknown) => (typeof v === 'string' ? v : v == null ? '' : String(v))
const num = (v: unknown) => { const n = Number(v); return Number.isFinite(n) ? n : 0 }

/** Estados que NO ocupan plaza. */
function ocupa(estado: string): boolean {
  return estado !== 'cancelada' && estado !== 'reembolsada'
}

/** Mapa origen_id → estado del overlay de gestión (CRM). */
async function leerOverlay(db: ReturnType<typeof createAdminClient>): Promise<Map<string, string>> {
  const overlay = new Map<string, string>()
  const gz = await db.from('crm_gestion').select('origen_id, estado_reserva').eq('origen', 'booking')
  for (const g of gz.data ?? []) overlay.set(str((g as Row).origen_id), str((g as Row).estado_reserva))
  return overlay
}

/**
 * Niños (suma de `participantes`) por fecha de un servicio de fecha única
 * (Días Sin Cole, Domingos, Mañanas Mágicas). Devuelve { 'YYYY-MM-DD': nNiños }.
 */
export async function getNinosPorFecha(servicioNombre: string): Promise<Record<string, number>> {
  const out: Record<string, number> = {}
  if (!servicioNombre) return out
  try {
    const db = createAdminClient()
    const [bk, overlay] = await Promise.all([
      db.from('bookings').select('id, fecha, participantes, estado_reserva').ilike('servicio', servicioNombre),
      leerOverlay(db),
    ])
    for (const b of (bk.data ?? []) as Row[]) {
      const estado = overlay.get(str(b.id)) || str(b.estado_reserva)
      if (!ocupa(estado)) continue
      const fecha = str(b.fecha).slice(0, 10)
      if (!fecha) continue
      out[fecha] = (out[fecha] ?? 0) + Math.max(1, num(b.participantes))
    }
  } catch { /* sin tabla o sin datos */ }
  return out
}

/**
 * Extrae los días seleccionados (YYYY-MM-DD) del JSON guardado en `observaciones`.
 * observaciones = `${notas}\n${JSON.stringify(datos)}` → la última línea es el JSON
 * con el campo `diasSeleccionados` = "fecha, fecha, …".
 */
export function diasDeObservaciones(observaciones: string): string[] {
  const lineas = observaciones.split('\n').map(l => l.trim()).filter(Boolean)
  for (let i = lineas.length - 1; i >= 0; i--) {
    const l = lineas[i]
    if (!l.startsWith('{') || !l.endsWith('}')) continue
    try {
      const o = JSON.parse(l) as Record<string, unknown>
      const raw = o.diasSeleccionados
      if (typeof raw === 'string') {
        return raw.split(',').map(s => s.trim()).filter(s => /^\d{4}-\d{2}-\d{2}$/.test(s))
      }
    } catch { /* línea no es JSON válido, sigue buscando */ }
  }
  return []
}

/**
 * Niños por día de un campamento (Verano/Navidad/Semana Santa). Cada niño ocupa
 * una plaza por cada día que reservó. Devuelve { 'YYYY-MM-DD': nNiños }.
 */
export async function getNinosPorDiaCampamento(servicioNombre: string): Promise<Record<string, number>> {
  const out: Record<string, number> = {}
  if (!servicioNombre) return out
  try {
    const db = createAdminClient()
    const [bk, overlay] = await Promise.all([
      db.from('bookings').select('id, fecha, participantes, observaciones, estado_reserva').ilike('servicio', servicioNombre),
      leerOverlay(db),
    ])
    for (const b of (bk.data ?? []) as Row[]) {
      const estado = overlay.get(str(b.id)) || str(b.estado_reserva)
      if (!ocupa(estado)) continue
      const n = Math.max(1, num(b.participantes))
      const dias = diasDeObservaciones(str(b.observaciones))
      const lista = dias.length ? dias : [str(b.fecha).slice(0, 10)].filter(Boolean)
      for (const d of lista) out[d] = (out[d] ?? 0) + n
    }
  } catch { /* sin tabla o sin datos */ }
  return out
}

// ─── Configuración de aforo por servicio ─────────────────────────────────────

export type AforoConfig = { aforo: number; kind: 'fecha' | 'campamento-dia' }

/** Nombres con los que se guardan los campamentos en `bookings.servicio`. */
export const CAMPAMENTO_NOMBRES = {
  verano: 'Campamento de Verano',
  navidad: 'Campamento de Navidad',
  ssanta: 'Campamento de Semana Santa',
} as const

/** Aforo configurado de un servicio (0 = sin límite). null si el servicio no tiene aforo. */
export async function getAforoConfig(servicioId: string): Promise<AforoConfig | null> {
  if (servicioId === 'dias-sin-cole' || servicioId === 'domingos') {
    const cfg = await getEventoCentro(servicioId)
    return { aforo: num(cfg.aforo), kind: 'fecha' }
  }
  if (servicioId === 'manana-magica') {
    const cfg = await getMananaMagica()
    return { aforo: num(cfg.aforo), kind: 'fecha' }
  }
  if (servicioId === 'campamentos') {
    const cfg = await getCampamentosConfig()
    return { aforo: num(cfg.aforoDia), kind: 'campamento-dia' }
  }
  return null
}

/** Ocupación (niños por fecha) de un servicio de fecha única, resolviendo su nombre. */
export async function getOcupacionFecha(servicioId: string): Promise<Record<string, number>> {
  const s = await getServicio(servicioId)
  if (!s) return {}
  return getNinosPorFecha(s.nombre)
}

/** Ocupación por día de los tres campamentos. */
export async function getOcupacionCampamentos(): Promise<{
  verano: Record<string, number>; navidad: Record<string, number>; ssanta: Record<string, number>
}> {
  const [verano, navidad, ssanta] = await Promise.all([
    getNinosPorDiaCampamento(CAMPAMENTO_NOMBRES.verano),
    getNinosPorDiaCampamento(CAMPAMENTO_NOMBRES.navidad),
    getNinosPorDiaCampamento(CAMPAMENTO_NOMBRES.ssanta),
  ])
  return { verano, navidad, ssanta }
}

// ─── Validación (anti-overbooking autoritativa en servidor) ───────────────────

function formatoCorto(iso: string): string {
  try { return new Date(iso + 'T12:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }) }
  catch { return iso }
}

/**
 * Valida que quepan `ninos` en la(s) fecha(s) elegida(s) según el aforo del servicio.
 * - kind 'fecha': comprueba la `fecha` única.
 * - kind 'campamento-dia': comprueba cada día de `dias` contra el aforo diario.
 * Si el servicio no tiene aforo (o es 0), siempre ok.
 */
export async function validarAforo(args: {
  servicioId: string
  servicioNombre: string
  fecha?: string | null
  dias?: string[]
  ninos: number
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const cfg = await getAforoConfig(args.servicioId)
  if (!cfg || cfg.aforo <= 0) return { ok: true }
  const ninos = Math.max(1, args.ninos)

  if (cfg.kind === 'campamento-dia') {
    const dias = (args.dias ?? []).filter(Boolean)
    if (dias.length === 0) return { ok: true }
    const ocup = await getNinosPorDiaCampamento(args.servicioNombre)
    for (const d of dias) {
      if ((ocup[d] ?? 0) + ninos > cfg.aforo) {
        return { ok: false, error: `No quedan plazas suficientes para el día ${formatoCorto(d)}. Prueba con menos días o menos niños.` }
      }
    }
    return { ok: true }
  }

  // kind 'fecha'
  if (!args.fecha) return { ok: true }
  const ocup = await getNinosPorFecha(args.servicioNombre)
  if ((ocup[args.fecha] ?? 0) + ninos > cfg.aforo) {
    return { ok: false, error: 'No quedan plazas suficientes para esa fecha. Elige otra fecha o menos niños.' }
  }
  return { ok: true }
}
