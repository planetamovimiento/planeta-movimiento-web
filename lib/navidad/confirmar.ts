import { createAdminClient } from '@/lib/supabase/admin'
import { enviarEntradasNavidad, avisarNegocioNavidad } from '@/lib/emails/navidad'
import { eurosDeCents } from './precios'

// ─────────────────────────────────────────────────────────────────────────────
// Confirmación (o anulación) de unas entradas de La Fábrica de Papá Noel según
// lo que diga Redsys. Lo llama el webhook firmado: el navegador nunca confirma
// una reserva por su cuenta.
// ─────────────────────────────────────────────────────────────────────────────

/** Nombre con el que se guardan estas reservas en `bookings.servicio`. */
export const SERVICIO_NAVIDAD = 'La Fábrica de Papá Noel'

type Row = Record<string, unknown>
const str = (v: unknown) => (typeof v === 'string' ? v : v == null ? '' : String(v))
const num = (v: unknown) => { const n = Number(v); return Number.isFinite(n) ? n : 0 }

/**
 * Resuelve las entradas asociadas a un pedido de Redsys.
 * Idempotente: si ya estaban confirmadas, no reenvía nada.
 */
export async function confirmarEntradasNavidad(dsOrder: string, pagado: boolean): Promise<void> {
  if (!dsOrder) return
  try {
    const db = createAdminClient()
    const { data } = await db.from('navidad_reservas').select('*').eq('ds_order', dsOrder).maybeSingle()
    if (!data) return
    const r = data as Row
    const estado = str(r.estado)
    if (estado === 'confirmada' || estado === 'cancelada') return

    const ahora = new Date().toISOString()

    if (!pagado) {
      // Pago rechazado: la plaza se suelta ya, sin esperar a que caduque.
      await db.from('navidad_reservas')
        .update({ estado: 'cancelada', expira_at: null, updated_at: ahora })
        .eq('id', str(r.id))
      return
    }

    await db.from('navidad_reservas')
      .update({ estado: 'confirmada', expira_at: null, updated_at: ahora })
      .eq('id', str(r.id))

    const { data: paseRow } = await db.from('navidad_pases')
      .select('fecha, hora, hora_fin').eq('id', str(r.pase_id)).maybeSingle()
    const pase = (paseRow ?? {}) as Row

    const descuentoPct = num(r.descuento_pct)
    const entradas = {
      localizador: str(r.localizador),
      nombre: str(r.cliente_nombre),
      email: str(r.cliente_email),
      fecha: str(pase.fecha).slice(0, 10),
      hora: str(pase.hora),
      horaFin: str(pase.hora_fin),
      ninos: num(r.ninos), adultos: num(r.adultos), bebes: num(r.bebes),
      plazas: num(r.plazas),
      totalCents: num(r.total_cents),
      descuento: descuentoPct > 0
        ? `${str(r.descuento_tipo) === 'grupo' ? 'Grupo' : 'Socio del club'} −${descuentoPct} % (${eurosDeCents(num(r.descuento_cents))})`
        : '',
    }

    await enviarEntradasNavidad(entradas)
    await avisarNegocioNavidad(entradas)
  } catch { /* la tabla aún no existe o fallo puntual: el cobro no se toca */ }
}
