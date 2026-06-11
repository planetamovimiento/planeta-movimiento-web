'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { getServicio } from '@/lib/servicios/store'
import { montoReserva } from '@/lib/reservas/monto'
import { getRedsysConfig, getBaseUrl } from '@/lib/redsys/config'
import { crearPeticion } from '@/lib/redsys/firma'
import { generateReservaNumero } from '@/lib/utils'
import { getHorarioServicio } from '@/lib/reservas/horarios'
import { slotsDelDia, etiquetaSlot, horaInicioDe } from '@/lib/reservas/slots'
import { contarReservas } from '@/lib/reservas/disponibilidad'

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
 * Núcleo común: registra la reserva (bookings) y el cobro (payments) como
 * pendientes y devuelve los campos firmados para redirigir al TPV de Redsys.
 *  - total: precio total de referencia (€)
 *  - senal: importe a cobrar online ahora (€)  (señal o total)
 *  - esSenal: true si el cobro es una señal/fianza (el resto se paga aparte)
 */
async function emitirPago(args: {
  servicioNombre: string
  clienteNombre: string
  email: string
  telefono: string
  fecha: string | null
  hora: string | null
  participantes: number | null
  total: number
  senal: number
  esSenal: boolean
  observaciones: string
}): Promise<IniciarResult> {
  const cfg = getRedsysConfig()
  if (!cfg) return { ok: false, error: 'La pasarela de pago no está configurada todavía.' }
  const cents = Math.round(args.senal * 100)
  if (cents <= 0) return { ok: false, error: 'El importe no es válido. Contacta con nosotros.' }

  const db = createAdminClient()
  const numero = generateReservaNumero()
  const dsOrder = generarDsOrder()

  // 1) Reserva (pendiente de pago)
  const { data: bk, error: e1 } = await db.from('bookings').insert({
    numero,
    servicio: args.servicioNombre,
    cliente_nombre: args.clienteNombre,
    cliente_email: args.email,
    cliente_telefono: args.telefono,
    fecha: args.fecha || null,
    hora: args.hora || null,
    participantes: args.participantes ?? null,
    precio: args.total,
    estado_reserva: 'pendiente',
    estado_pago: 'pendiente',
    observaciones: args.observaciones,
    notas_internas: `Pago online (Redsys). Pedido ${dsOrder}.`,
  }).select('id').single()

  if (e1 || !bk) return { ok: false, error: 'No se pudo registrar la reserva. Inténtalo de nuevo.' }
  const bookingId = (bk as { id: string }).id

  // 2) Cobro (pendiente). referencia = Ds_Order → enlaza con la notificación.
  const { error: e2 } = await db.from('payments').insert({
    booking_id: bookingId,
    cliente_nombre: args.clienteNombre,
    servicio: args.servicioNombre,
    importe: args.senal,
    fianza: args.esSenal ? args.senal : null,
    pendiente: Math.max(0, args.total - args.senal),
    metodo: 'Tarjeta (Redsys)',
    estado: 'pendiente',
    referencia: dsOrder,
  })
  if (e2) return { ok: false, error: 'No se pudo registrar el cobro. Inténtalo de nuevo.' }

  // 3) Petición firmada para Redsys
  const base = getBaseUrl()
  const campos = crearPeticion({
    order: dsOrder,
    amountCents: cents,
    description: `Reserva ${args.servicioNombre} (${numero})`,
    urlOk: `${base}/api/redsys/retorno?estado=ok&numero=${encodeURIComponent(numero)}`,
    urlKo: `${base}/api/redsys/retorno?estado=ko&numero=${encodeURIComponent(numero)}`,
    urlNotificacion: `${base}/api/redsys/notificacion`,
  }, cfg)

  return { ok: true, ...campos }
}

/**
 * Asistente de reserva (/reservar): valida, calcula el importe EN SERVIDOR a
 * partir del catálogo y de las franjas, y delega en emitirPago.
 */
export async function iniciarReserva(payload: IniciarPayload): Promise<IniciarResult> {
  const { servicioId, fecha, hora, datos } = payload

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

  // Validación de franja y plazas (anti-overbooking, autoritativa en servidor).
  const slots = await getHorarioServicio(servicioId)
  if (slots.length === 0) return { ok: false, error: 'Este servicio no tiene horarios de reserva configurados.' }
  if (!fecha || !hora) return { ok: false, error: 'Elige una fecha y un horario para continuar.' }
  const slot = slotsDelDia(slots, new Date(fecha + 'T00:00:00')).find(s => etiquetaSlot(s) === hora)
  if (!slot) return { ok: false, error: 'La franja elegida no está disponible para esa fecha.' }
  const yaReservadas = await contarReservas(servicio.nombre, fecha, horaInicioDe(hora))
  if (yaReservadas >= slot.plazas) {
    return { ok: false, error: 'Esa franja acaba de quedarse sin plazas. Por favor, elige otro horario.' }
  }

  const clienteNombre = `${datos.nombre.trim()} ${datos.apellidos.trim()}`.trim()
  const datosObs = {
    apellidos: datos.apellidos.trim(),
    nombreCumpleanero: datos.nombreCumpleanero?.trim() || '',
    edadCumpleanero: datos.edadCumpleanero?.trim() || '',
    fecha: fecha || '',
    hora: hora || '',
    senal: monto.esSenal ? monto.euros : null,
  }
  const observaciones = `${datos.notas?.trim() || ''}\n${JSON.stringify(datosObs)}`.trim()

  return emitirPago({
    servicioNombre: servicio.nombre,
    clienteNombre,
    email: datos.email.trim(),
    telefono: datos.telefono.trim(),
    fecha, hora,
    participantes: null,
    total: monto.totalReferencia ?? monto.euros,
    senal: monto.euros,
    esSenal: monto.esSenal,
    observaciones,
  })
}

export type PagoReservaPayload = {
  servicioId: string
  servicioNombre?: string          // nombre a guardar en la reserva (override; p.ej. "Campamento de Navidad")
  cliente: { nombre: string; email: string; telefono: string }
  fecha?: string | null
  hora?: string | null
  participantes?: number | null
  total: number                    // total de referencia (€) que calcula el widget
  observaciones?: string
  datos?: Record<string, unknown>  // datos extra para el CRM
}

/**
 * Inicio de pago para los widgets de Ocio (cumpleaños, campamentos, eventos).
 * Cobra la FIANZA del servicio como señal si está configurada (>0); si no, el
 * total. El widget calcula el total; el importe a cobrar se decide en servidor.
 */
export async function iniciarPagoReserva(p: PagoReservaPayload): Promise<IniciarResult> {
  const { servicioId, cliente, fecha = null, hora = null, participantes = null, total, datos } = p

  if (!cliente?.nombre?.trim() || !cliente.email?.trim() || !cliente.telefono?.trim()) {
    return { ok: false, error: 'Faltan datos de contacto obligatorios.' }
  }
  if (!Number.isFinite(total) || total <= 0) {
    return { ok: false, error: 'El importe de la reserva no es válido.' }
  }

  const servicio = await getServicio(servicioId)
  if (!servicio || servicio.botonAccion !== 'reserva') {
    return { ok: false, error: 'Este servicio no admite reserva online.' }
  }

  const fianza = Number(servicio.fianza) || 0
  const esSenal = fianza > 0
  const senal = esSenal ? fianza : total

  // Anti-overbooking solo si el servicio tiene franjas configuradas y hay fecha+hora.
  const slots = await getHorarioServicio(servicioId)
  if (slots.length > 0 && fecha && hora) {
    const slot = slotsDelDia(slots, new Date(fecha + 'T00:00:00')).find(s => etiquetaSlot(s) === hora)
    if (!slot) return { ok: false, error: 'La franja elegida no está disponible para esa fecha.' }
    const ya = await contarReservas(servicio.nombre, fecha, horaInicioDe(hora))
    if (ya >= slot.plazas) return { ok: false, error: 'Esa franja acaba de quedarse sin plazas. Elige otra.' }
  }

  const observaciones = `${(p.observaciones ?? '').trim()}${datos ? '\n' + JSON.stringify(datos) : ''}`.trim()

  return emitirPago({
    servicioNombre: p.servicioNombre?.trim() || servicio.nombre,
    clienteNombre: cliente.nombre.trim(),
    email: cliente.email.trim(),
    telefono: cliente.telefono.trim(),
    fecha, hora, participantes,
    total,
    senal,
    esSenal,
    observaciones,
  })
}
