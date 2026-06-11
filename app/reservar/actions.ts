'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { getServicio } from '@/lib/servicios/store'
import { montoReserva } from '@/lib/reservas/monto'
import { getRedsysConfig, getBaseUrl } from '@/lib/redsys/config'
import { crearPeticion } from '@/lib/redsys/firma'
import { generateReservaNumero } from '@/lib/utils'

export type DatosReserva = {
  nombre: string
  apellidos: string
  email: string
  telefono: string
  nombreCumpleanero?: string
  edadCumpleanero?: string
  notas?: string
  acepta: boolean
}

export type IniciarPayload = {
  servicioId: string
  fecha: string | null
  hora: string | null
  datos: DatosReserva
}

export type IniciarResult =
  | { ok: true; url: string; Ds_SignatureVersion: string; Ds_MerchantParameters: string; Ds_Signature: string }
  | { ok: false; error: string }

/** Genera un número de pedido Redsys de 12 dígitos (los 4 primeros numéricos). */
function generarDsOrder(): string {
  const base = String(Date.now()).slice(-8)
  const rand = String(Math.floor(Math.random() * 10000)).padStart(4, '0')
  return base + rand
}

/**
 * Inicia el pago de una reserva: valida, calcula el importe EN SERVIDOR a partir
 * del catálogo, registra la reserva (pendiente) y devuelve los campos firmados
 * para redirigir al TPV de Redsys. El cliente nunca dicta el importe.
 */
export async function iniciarReserva(payload: IniciarPayload): Promise<IniciarResult> {
  const { servicioId, fecha, hora, datos } = payload

  // Validación mínima
  if (!datos?.acepta) return { ok: false, error: 'Debes aceptar las condiciones para continuar.' }
  if (!datos.nombre?.trim() || !datos.apellidos?.trim() || !datos.email?.trim() || !datos.telefono?.trim()) {
    return { ok: false, error: 'Faltan datos de contacto obligatorios.' }
  }

  const servicio = await getServicio(servicioId)
  if (!servicio || servicio.botonAccion !== 'reserva' || servicio.estado !== 'activo') {
    return { ok: false, error: 'Este servicio no admite reserva online.' }
  }

  const monto = montoReserva(servicio)
  if (monto.cents <= 0) {
    return { ok: false, error: 'Este servicio aún no tiene precio configurado. Contacta con nosotros.' }
  }

  const cfg = getRedsysConfig()
  if (!cfg) return { ok: false, error: 'La pasarela de pago no está configurada todavía.' }

  const db = createAdminClient()
  const numero = generateReservaNumero()
  const dsOrder = generarDsOrder()
  const clienteNombre = `${datos.nombre.trim()} ${datos.apellidos.trim()}`.trim()

  // Datos extra que el CRM extrae del JSON al final de `observaciones`.
  const datosObs = {
    apellidos: datos.apellidos.trim(),
    nombreCumpleanero: datos.nombreCumpleanero?.trim() || '',
    edadCumpleanero: datos.edadCumpleanero?.trim() || '',
    fecha: fecha || '',
    hora: hora || '',
    senal: monto.esSenal ? monto.euros : null,
    dsOrder,
  }
  const observaciones = `${datos.notas?.trim() || ''}\n${JSON.stringify(datosObs)}`.trim()

  // 1) Reserva (pendiente de pago)
  const { data: bk, error: e1 } = await db.from('bookings').insert({
    numero,
    servicio: servicio.nombre,
    cliente_nombre: clienteNombre,
    cliente_email: datos.email.trim(),
    cliente_telefono: datos.telefono.trim(),
    fecha: fecha || null,
    hora: hora || null,
    precio: monto.totalReferencia ?? monto.euros,
    estado_reserva: 'pendiente',
    estado_pago: 'pendiente',
    observaciones,
    notas_internas: `Pago online (Redsys). Pedido ${dsOrder}.`,
  }).select('id').single()

  if (e1 || !bk) return { ok: false, error: 'No se pudo registrar la reserva. Inténtalo de nuevo.' }
  const bookingId = (bk as { id: string }).id

  // 2) Cobro (pendiente). referencia = Ds_Order → enlaza con la notificación.
  const pendiente = monto.totalReferencia != null ? Math.max(0, monto.totalReferencia - monto.euros) : null
  const { error: e2 } = await db.from('payments').insert({
    booking_id: bookingId,
    cliente_nombre: clienteNombre,
    servicio: servicio.nombre,
    importe: monto.euros,
    fianza: monto.esSenal ? monto.euros : null,
    pendiente,
    metodo: 'Tarjeta (Redsys)',
    estado: 'pendiente',
    referencia: dsOrder,
  })
  if (e2) return { ok: false, error: 'No se pudo registrar el cobro. Inténtalo de nuevo.' }

  // 3) Petición firmada para Redsys
  const base = getBaseUrl()
  const campos = crearPeticion({
    order: dsOrder,
    amountCents: monto.cents,
    description: `Reserva ${servicio.nombre} (${numero})`,
    urlOk: `${base}/api/redsys/retorno?estado=ok&numero=${encodeURIComponent(numero)}`,
    urlKo: `${base}/api/redsys/retorno?estado=ko&numero=${encodeURIComponent(numero)}`,
    urlNotificacion: `${base}/api/redsys/notificacion`,
  }, cfg)

  return { ok: true, ...campos }
}
