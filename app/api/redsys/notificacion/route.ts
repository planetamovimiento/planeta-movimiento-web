import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { verificarNotificacion, pagoAutorizado } from '@/lib/redsys/firma'
import { enviarConfirmacionReserva, avisarNegocioReserva } from '@/lib/emails/confirmacion'

// El cifrado 3DES requiere el runtime de Node (no edge).
export const runtime = 'nodejs'

/**
 * Notificación servidor-a-servidor de Redsys (DS_MERCHANT_MERCHANTURL).
 * Es la ÚNICA fuente de verdad del cobro. Verifica la firma, y de forma
 * idempotente marca el cobro y la reserva como pagados (o fallidos).
 */
export async function POST(request: Request) {
  let merchantParameters = ''
  let signature = ''
  try {
    const form = await request.formData()
    merchantParameters = String(form.get('Ds_MerchantParameters') || '')
    signature = String(form.get('Ds_Signature') || '')
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 })
  }
  if (!merchantParameters || !signature) return NextResponse.json({ ok: false }, { status: 400 })

  const datos = verificarNotificacion(merchantParameters, signature)
  if (!datos) return NextResponse.json({ ok: false, error: 'firma' }, { status: 403 })

  const order = datos.Ds_Order
  const db = createAdminClient()

  const { data: pago } = await db.from('payments').select('*').eq('referencia', order).maybeSingle()
  // Si no encontramos el cobro, respondemos 200 para que Redsys no reintente sin fin.
  if (!pago) return NextResponse.json({ ok: true })

  const p = pago as Record<string, unknown>
  // Idempotencia: si ya está resuelto, no reaplicamos.
  if (p.estado === 'pagado') return NextResponse.json({ ok: true })

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
        const datos = {
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
        await enviarConfirmacionReserva(datos)                                   // confirmación al cliente
        await avisarNegocioReserva({ ...datos, motivo: 'Pago recibido — reserva confirmada' }) // aviso interno (info@)
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

  return NextResponse.json({ ok: true })
}
