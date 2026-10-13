import { createAdminClient } from '@/lib/supabase/admin'
import { getRedsysConfig, getBaseUrl } from './config'
import { crearPeticion } from './firma'
import { generateReservaNumero } from '@/lib/utils'

// ─────────────────────────────────────────────────────────────────────────────
// Emisión de un cobro con tarjeta (Redsys) para cualquier servicio: registra la
// reserva en `bookings` y el cobro en `payments` como pendientes, y devuelve los
// campos firmados para redirigir al TPV.
//
// Es un módulo normal (NO 'use server'): así puede usarse desde las acciones de
// servidor sin quedar expuesto como acción invocable desde el navegador.
// El pago SOLO se da por bueno cuando llega la notificación firmada de Redsys
// (lib/redsys/confirmar.ts), nunca por volver del navegador.
// ─────────────────────────────────────────────────────────────────────────────

export type CamposRedsys = {
  url: string
  Ds_SignatureVersion: string
  Ds_MerchantParameters: string
  Ds_Signature: string
}

export type CobroOk = { ok: true; numero: string; dsOrder: string; bookingId: string; campos: CamposRedsys }
export type CobroError = { ok: false; error: string }

/** Nº de pedido Redsys de 12 dígitos (los 4 primeros numéricos). */
function generarDsOrder(): string {
  const base = String(Date.now()).slice(-8)
  const rand = String(Math.floor(Math.random() * 10000)).padStart(4, '0')
  return base + rand
}

export async function emitirCobroRedsys(args: {
  servicioNombre: string
  clienteNombre: string
  email: string
  telefono: string
  fecha: string | null
  hora: string | null
  participantes: number | null
  /** Importe a cobrar ahora, en céntimos (entero). */
  importeCents: number
  observaciones: string
  /** Texto que se guarda en notas_internas mientras el pago no se completa. */
  notaPendiente?: string
}): Promise<CobroOk | CobroError> {
  const cfg = getRedsysConfig()
  if (!cfg) return { ok: false, error: 'La pasarela de pago no está configurada todavía.' }

  const cents = Math.round(args.importeCents)
  if (!Number.isFinite(cents) || cents <= 0) return { ok: false, error: 'El importe no es válido. Contacta con nosotros.' }

  const db = createAdminClient()
  const numero = generateReservaNumero()
  const dsOrder = generarDsOrder()
  const euros = cents / 100

  const { data: bk, error: e1 } = await db.from('bookings').insert({
    numero,
    servicio: args.servicioNombre,
    cliente_nombre: args.clienteNombre,
    cliente_email: args.email,
    cliente_telefono: args.telefono,
    fecha: args.fecha || null,
    hora: args.hora || null,
    participantes: args.participantes ?? null,
    precio: euros,
    estado_reserva: 'pendiente',
    estado_pago: 'pendiente',
    observaciones: args.observaciones,
    notas_internas: args.notaPendiente
      || `⏳ SIN PAGAR · Pago con tarjeta empezado pero no completado (Redsys). Pedido ${dsOrder}.`,
  }).select('id').single()
  if (e1 || !bk) return { ok: false, error: 'No se pudo registrar la reserva. Inténtalo de nuevo.' }
  const bookingId = (bk as { id: string }).id

  const { error: e2 } = await db.from('payments').insert({
    booking_id: bookingId,
    cliente_nombre: args.clienteNombre,
    servicio: args.servicioNombre,
    importe: euros,
    fianza: null,
    pendiente: 0,
    metodo: 'Tarjeta (Redsys)',
    estado: 'pendiente',
    referencia: dsOrder,
  })
  if (e2) return { ok: false, error: 'No se pudo registrar el cobro. Inténtalo de nuevo.' }

  const base = getBaseUrl()
  const campos = crearPeticion({
    order: dsOrder,
    amountCents: cents,
    description: `${args.servicioNombre} (${numero})`,
    urlOk: `${base}/api/redsys/retorno?estado=ok&numero=${encodeURIComponent(numero)}`,
    urlKo: `${base}/api/redsys/retorno?estado=ko&numero=${encodeURIComponent(numero)}`,
    urlNotificacion: `${base}/api/redsys/notificacion`,
  }, cfg)

  return { ok: true, numero, dsOrder, bookingId, campos }
}
