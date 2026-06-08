import { createAdminClient } from '@/lib/supabase/admin'

/**
 * Devuelve, por fecha (YYYY-MM-DD), los horarios ya reservados de cumpleaños
 * (excluyendo cancelados/reembolsados, teniendo en cuenta la gestión del CRM).
 * Se usa para que el formulario público no permita doble reserva del mismo hueco.
 */
export async function getCumpleanosOcupados(): Promise<Record<string, string[]>> {
  const out: Record<string, string[]> = {}
  try {
    const db = createAdminClient()
    const [bk, gz] = await Promise.all([
      db.from('bookings').select('id, fecha, hora, estado_reserva').ilike('servicio', '%cumplea%'),
      db.from('crm_gestion').select('origen_id, estado_reserva').eq('origen', 'booking'),
    ])
    const overlay = new Map<string, string>()
    for (const g of gz.data ?? []) overlay.set(String(g.origen_id), String(g.estado_reserva ?? ''))

    for (const b of bk.data ?? []) {
      const fecha = b.fecha ? String(b.fecha).slice(0, 10) : ''
      const hora = b.hora ? String(b.hora).trim() : ''
      if (!fecha || !hora) continue
      const estado = overlay.get(String(b.id)) || String(b.estado_reserva ?? '')
      if (estado === 'cancelada' || estado === 'reembolsada') continue
      // Guardamos la hora de inicio (HH:MM) para casar formatos antiguos ("18:15") y nuevos ("18:15 – 20:15")
      const inicio = hora.match(/\d{1,2}:\d{2}/)?.[0] ?? hora
      ;(out[fecha] ||= []).push(inicio)
    }
  } catch { /* tabla sin migrar o sin datos */ }
  return out
}
