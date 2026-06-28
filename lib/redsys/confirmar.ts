import { createAdminClient } from '@/lib/supabase/admin'
import { pagoAutorizado, type DatosNotificacion } from './firma'
import { enviarConfirmacionReserva, avisarNegocioReserva } from '@/lib/emails/confirmacion'

/**
 * Procesa una respuesta FIRMADA de Redsys (vale tanto para la notificación
 * servidor-a-servidor como para el retorno del navegador). Es idempotente: si
 * el cobro ya está resuelto como pagado, no reaplica nada (evita emails dobles).
 *
 * Devuelve true si encontró el cobro (para que la notificación responda 200 y
 * Redsys no reintente). El que llegue primero (notificación o retorno) gana.
 */
export async function procesarRespuestaRedsys(datos: DatosNotificacion): Promise<boolean> {
  const order = datos.Ds_Order
  const db = createAdminClient()

  const { data: pago } = await db.from('payments').select('*').eq('referencia', order).maybeSingle()
  if (!pago) return false

  const p = pago as Record<string, unknown>
  if (p.estado === 'pagado') return true // ya resuelto → idempotente

  const bookingId = (p.booking_id as string | null) || null
  const importe = Number(p.importe) || 0
  const esSenal = p.fianza != null
  const ahora = new Date().toISOString()
  const auth = (datos.Ds_AuthorisationCode || '').toString()

  if (pagoAutorizado(datos.Ds_Response)) {
    const bookingPago = esSenal ? 'parcial' : 'pagado'
    await db.from('payments').update({ estado: 'pagado' }).eq('id', p.id as string)

    if (bookingId) {
      await db.from('bookings').update({
        estado_pago: bookingPago,
        estado_reserva: 'confirmada',
        notas_internas: `Pago online (Redsys) OK. Pedido ${order}. Autorización ${auth}.`,
      }).eq('id', bookingId)

      await db.from('crm_gestion').upsert({
        origen: 'booking',
        origen_id: bookingId,
        estado_reserva: 'confirmada',
        estado_pago: esSenal ? 'parcial' : 'pagado',
        pagado: importe,
        metodo_pago: 'tarjeta',
        pagos: [{ fecha: ahora, importe, metodo: 'Tarjeta (Redsys)', nota: `Pedido ${order}` }],
        updated_at: ahora,
        updated_by: 'redsys',
      }, { onConflict: 'origen,origen_id' })

      // Email de confirmación al cliente (mensaje específico según el servicio).
      const { data: bk } = await db
        .from('bookings')
        .select('numero, servicio, cliente_nombre, cliente_email, fecha, hora, participantes, precio')
        .eq('id', bookingId).maybeSingle()
      if (bk) {
        const b = bk as Record<string, unknown>
        const d = {
          servicio: String(b.servicio || ''),
          clienteNombre: (b.cliente_nombre as string) || null,
          clienteEmail: (b.cliente_email as string) || null,
          fecha: (b.fecha as string) || null,
          hora: (b.hora as string) || null,
          participantes: b.participantes != null ? Number(b.participantes) : null,
          numero: (b.numero as string) || null,
          total: b.precio != null ? Number(b.precio) : null,
          pagado: importe,
          pendiente: Number(p.pendiente) || 0,
        }
        await enviarConfirmacionReserva(d)                                    // confirmación al cliente
        await avisarNegocioReserva({ ...d, motivo: 'Pago recibido — reserva confirmada' }) // aviso interno
      }
    }
    await db.from('activity_log').insert({
      actor_email: 'redsys', accion: `Cobro online confirmado (${order})`,
      entidad: 'booking', entidad_id: bookingId || order,
    })
  } else {
    await db.from('payments').update({ estado: 'fallido' }).eq('id', p.id as string)
    if (bookingId) await db.from('bookings').update({ estado_pago: 'fallido' }).eq('id', bookingId)
    await db.from('activity_log').insert({
      actor_email: 'redsys', accion: `Cobro online rechazado (${order}) · resp ${datos.Ds_Response}`,
      entidad: 'booking', entidad_id: bookingId || order,
    })
  }

  return true
}
