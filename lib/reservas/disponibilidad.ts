import { createAdminClient } from '@/lib/supabase/admin'
import { horaInicioDe } from './slots'

// ─────────────────────────────────────────────────────────────────────────────
// Ocupación real de las reservas, contada sobre `bookings` (no canceladas),
// teniendo en cuenta el overlay de gestión del CRM (`crm_gestion`).
// Generaliza lib/cumpleanos/disponibilidad.ts a cualquier servicio.
// ─────────────────────────────────────────────────────────────────────────────

type Row = Record<string, unknown>
const str = (v: unknown) => (typeof v === 'string' ? v : v == null ? '' : String(v))

/**
 * Una reserva ocupa el hueco SOLO cuando está confirmada (pagada la señal) o
 * finalizada. Una reserva sin pagar (nueva/pendiente) o rechazada/cancelada NO
 * bloquea el horario: si no se paga la señal, no se reserva nada.
 */
function ocupa(estado: string): boolean {
  return estado === 'confirmada' || estado === 'finalizada'
}

/**
 * Reservas por servicio → { servicioId: { 'YYYY-MM-DD': { 'HH:MM': nReservados } } }.
 * `servicios` mapea el nombre del servicio (como se guarda en bookings) a su id.
 */
export async function getReservadosPorServicio(
  servicios: { id: string; nombre: string }[],
): Promise<Record<string, Record<string, Record<string, number>>>> {
  const out: Record<string, Record<string, Record<string, number>>> = {}
  for (const s of servicios) out[s.id] = {}
  if (servicios.length === 0) return out

  const nombreAId = new Map(servicios.map(s => [s.nombre.trim().toLowerCase(), s.id]))

  try {
    const db = createAdminClient()
    const [bk, gz] = await Promise.all([
      db.from('bookings').select('id, servicio, fecha, hora, estado_reserva'),
      db.from('crm_gestion').select('origen_id, estado_reserva').eq('origen', 'booking'),
    ])
    const overlay = new Map<string, string>()
    for (const g of gz.data ?? []) overlay.set(str((g as Row).origen_id), str((g as Row).estado_reserva))

    for (const b of (bk.data ?? []) as Row[]) {
      const id = nombreAId.get(str(b.servicio).trim().toLowerCase())
      if (!id) continue
      const fecha = str(b.fecha).slice(0, 10)
      const hora = str(b.hora).trim()
      if (!fecha || !hora) continue
      const estado = overlay.get(str(b.id)) || str(b.estado_reserva)
      if (!ocupa(estado)) continue
      const hi = horaInicioDe(hora)
      const porFecha = (out[id][fecha] ||= {})
      porFecha[hi] = (porFecha[hi] ?? 0) + 1
    }
  } catch { /* sin tabla o sin datos */ }

  return out
}

/** Cuenta reservas activas de un servicio en una fecha+franja concreta (anti-overbooking). */
export async function contarReservas(servicioNombre: string, fecha: string, horaInicio: string): Promise<number> {
  try {
    const db = createAdminClient()
    const [bk, gz] = await Promise.all([
      db.from('bookings').select('id, hora, estado_reserva').ilike('servicio', servicioNombre).eq('fecha', fecha),
      db.from('crm_gestion').select('origen_id, estado_reserva').eq('origen', 'booking'),
    ])
    const overlay = new Map<string, string>()
    for (const g of gz.data ?? []) overlay.set(str((g as Row).origen_id), str((g as Row).estado_reserva))

    let n = 0
    for (const b of (bk.data ?? []) as Row[]) {
      const estado = overlay.get(str(b.id)) || str(b.estado_reserva)
      if (!ocupa(estado)) continue
      if (horaInicioDe(str(b.hora)) === horaInicio) n++
    }
    return n
  } catch {
    return 0
  }
}
