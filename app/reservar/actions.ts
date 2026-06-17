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
import { validarAforo } from '@/lib/reservas/aforo'
import { CUMPLE_MIN_PARTICIPANTES, calcularTotalCumple } from '@/lib/cumpleanos/precio'
import { enviarConfirmacionReserva } from '@/lib/emails/confirmacion'

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

export type ReservaResult = { ok: true; numero: string } | { ok: false; error: string }

/** Servicios con botonAccion 'presupuesto' que SÍ cobran online (calculadora con precio). */
const PAGABLES_PRESUPUESTO = new Set(['eventos'])

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
 * Núcleo de "pago en la instalación": registra la reserva (bookings) y un cobro
 * (payments) pendiente con método "En la instalación", SIN pasar por Redsys.
 */
async function emitirReservaInstalacion(args: {
  servicioNombre: string
  clienteNombre: string
  email: string
  telefono: string
  fecha: string | null
  hora: string | null
  participantes: number | null
  total: number
  observaciones: string
}): Promise<ReservaResult> {
  const db = createAdminClient()
  const numero = generateReservaNumero()

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
    notas_internas: 'Pago en la instalación (sin pasarela).',
  }).select('id').single()
  if (e1 || !bk) return { ok: false, error: 'No se pudo registrar la reserva. Inténtalo de nuevo.' }
  const bookingId = (bk as { id: string }).id

  const { error: e2 } = await db.from('payments').insert({
    booking_id: bookingId,
    cliente_nombre: args.clienteNombre,
    servicio: args.servicioNombre,
    importe: args.total,
    fianza: null,
    pendiente: args.total,
    metodo: 'En la instalación',
    estado: 'pendiente',
    referencia: numero,
  })
  if (e2) return { ok: false, error: 'No se pudo registrar la reserva. Inténtalo de nuevo.' }

  return { ok: true, numero }
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

  // Cumpleaños: por defecto el mínimo facturable (13) y total estimado según el día.
  const esCumple = servicioId === 'cumpleanos'
  const participantes = esCumple ? CUMPLE_MIN_PARTICIPANTES : null
  const total = esCumple ? calcularTotalCumple(fecha, CUMPLE_MIN_PARTICIPANTES) : (monto.totalReferencia ?? monto.euros)

  const clienteNombre = `${datos.nombre.trim()} ${datos.apellidos.trim()}`.trim()
  const datosObs = {
    apellidos: datos.apellidos.trim(),
    nombreCumpleanero: datos.nombreCumpleanero?.trim() || '',
    edadCumpleanero: datos.edadCumpleanero?.trim() || '',
    numNinos: esCumple ? CUMPLE_MIN_PARTICIPANTES : undefined,
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
    participantes,
    total,
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

type ReservaResuelta = {
  servicioNombre: string
  fianza: number
  total: number
  participantes: number | null
  fecha: string | null
  hora: string | null
  observaciones: string
  clienteNombre: string
  email: string
  telefono: string
}

/** Validación común (cliente, importe, servicio reservable, franjas y aforo) para ambos métodos de pago. */
async function comprobarReserva(p: PagoReservaPayload): Promise<{ ok: true; data: ReservaResuelta } | { ok: false; error: string }> {
  const { servicioId, cliente, fecha = null, hora = null, participantes = null, total, datos } = p

  if (!cliente?.nombre?.trim() || !cliente.email?.trim() || !cliente.telefono?.trim()) {
    return { ok: false, error: 'Faltan datos de contacto obligatorios.' }
  }
  if (!Number.isFinite(total) || total <= 0) {
    return { ok: false, error: 'El importe de la reserva no es válido.' }
  }

  const servicio = await getServicio(servicioId)
  if (!servicio) return { ok: false, error: 'Este servicio no admite reserva online.' }
  // 'eventos' (Animación en tu evento) es 'presupuesto' pero cobra online con su calculadora.
  const reservable = servicio.botonAccion === 'reserva' || PAGABLES_PRESUPUESTO.has(servicioId)
  if (!reservable) return { ok: false, error: 'Este servicio no admite reserva online.' }

  const servicioNombre = p.servicioNombre?.trim() || servicio.nombre

  // Anti-overbooking solo si el servicio tiene franjas configuradas y hay fecha+hora.
  const slots = await getHorarioServicio(servicioId)
  if (slots.length > 0 && fecha && hora) {
    const slot = slotsDelDia(slots, new Date(fecha + 'T00:00:00')).find(s => etiquetaSlot(s) === hora)
    if (!slot) return { ok: false, error: 'La franja elegida no está disponible para esa fecha.' }
    const ya = await contarReservas(servicio.nombre, fecha, horaInicioDe(hora))
    if (ya >= slot.plazas) return { ok: false, error: 'Esa franja acaba de quedarse sin plazas. Elige otra.' }
  }

  // Aforo por fecha (Días Sin Cole / Domingos / Mañanas / Campamentos). Autoritativo en servidor.
  const diasSel = typeof datos?.diasSeleccionados === 'string'
    ? (datos.diasSeleccionados as string).split(',').map(s => s.trim()).filter(Boolean)
    : (fecha ? [fecha] : [])
  const aforoOk = await validarAforo({ servicioId, servicioNombre, fecha, dias: diasSel, ninos: participantes ?? 1 })
  if (!aforoOk.ok) return aforoOk

  const observaciones = `${(p.observaciones ?? '').trim()}${datos ? '\n' + JSON.stringify(datos) : ''}`.trim()

  return {
    ok: true,
    data: {
      servicioNombre,
      fianza: Number(servicio.fianza) || 0,
      total, participantes, fecha, hora, observaciones,
      clienteNombre: cliente.nombre.trim(),
      email: cliente.email.trim(),
      telefono: cliente.telefono.trim(),
    },
  }
}

/**
 * Inicio de pago ONLINE (Redsys) para los widgets de Ocio (cumpleaños, campamentos, eventos).
 * Cobra la FIANZA del servicio como señal si está configurada (>0); si no, el total.
 */
export async function iniciarPagoReserva(p: PagoReservaPayload): Promise<IniciarResult> {
  const c = await comprobarReserva(p)
  if (!c.ok) return c
  const { servicioNombre, fianza, total, participantes, fecha, hora, observaciones, clienteNombre, email, telefono } = c.data
  const esSenal = fianza > 0
  const senal = esSenal ? fianza : total
  return emitirPago({ servicioNombre, clienteNombre, email, telefono, fecha, hora, participantes, total, senal, esSenal, observaciones })
}

/**
 * Reserva con PAGO EN LA INSTALACIÓN (sin pasarela). Registra la reserva pendiente
 * de cobro con método "En la instalación". Se usa en campamentos.
 */
export async function reservarEnInstalacion(p: PagoReservaPayload): Promise<ReservaResult> {
  const c = await comprobarReserva(p)
  if (!c.ok) return c
  const { servicioNombre, total, participantes, fecha, hora, observaciones, clienteNombre, email, telefono } = c.data
  const r = await emitirReservaInstalacion({ servicioNombre, clienteNombre, email, telefono, fecha, hora, participantes, total, observaciones })
  if (r.ok) {
    await enviarConfirmacionReserva({
      servicio: servicioNombre, clienteNombre, clienteEmail: email,
      fecha, hora, participantes, numero: r.numero,
      total, pagado: 0, pendiente: total,
    })
  }
  return r
}
