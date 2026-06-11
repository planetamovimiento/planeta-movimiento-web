import { createAdminClient } from '@/lib/supabase/admin'
import type { SlotSemanal } from './slots'

// Re-exporta los helpers puros para quien ya importa desde aquí.
export { DIAS_LABEL, diaSemana, etiquetaSlot, horaInicioDe, slotsDelDia } from './slots'
export type { SlotSemanal } from './slots'

/** Semilla por defecto si un servicio aún no tiene horario guardado. */
const SEMILLA: Record<string, SlotSemanal[]> = {
  cumpleanos: [
    { dias: [1, 2, 3, 4, 5], horaInicio: '18:15', horaFin: '20:15', plazas: 1 },
    { dias: [6, 7], horaInicio: '16:45', horaFin: '18:45', plazas: 1 },
    { dias: [6, 7], horaInicio: '18:15', horaFin: '20:15', plazas: 1 },
  ],
}

function normaliza(rows: Record<string, unknown>[], ids: string[]): Record<string, SlotSemanal[]> {
  const byId = new Map(rows.map(r => [String(r.servicio_id), (r.slots as SlotSemanal[]) ?? []]))
  const out: Record<string, SlotSemanal[]> = {}
  for (const id of ids) {
    const guardado = byId.get(id)
    out[id] = (guardado && guardado.length ? guardado : (SEMILLA[id] ?? [])) as SlotSemanal[]
  }
  return out
}

/** Horarios de varios servicios (BD + semilla por defecto). */
export async function getHorarios(ids: string[]): Promise<Record<string, SlotSemanal[]>> {
  if (ids.length === 0) return {}
  try {
    const db = createAdminClient()
    const { data } = await db.from('reserva_horarios').select('servicio_id, slots').in('servicio_id', ids)
    return normaliza((data ?? []) as Record<string, unknown>[], ids)
  } catch {
    return normaliza([], ids)
  }
}

/** Horario de un único servicio (BD + semilla por defecto). */
export async function getHorarioServicio(id: string): Promise<SlotSemanal[]> {
  return (await getHorarios([id]))[id] ?? []
}
