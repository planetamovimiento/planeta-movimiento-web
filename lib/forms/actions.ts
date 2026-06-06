'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { resend } from '@/lib/resend'

const FROM = `Planeta Movimiento <${process.env.RESEND_FROM_EMAIL || 'hola@planetamovimiento.com'}>`
// Bandeja del negocio donde llegan los avisos de nuevas solicitudes/reservas
const NOTIF_TO = process.env.NOTIF_EMAIL || 'administracion@planetamovimiento.com'

type Persona = { nombre?: string; email?: string; telefono?: string }

// ── Sube/actualiza el cliente en la base de datos ────────────────────────────
async function upsertCustomer(db: ReturnType<typeof createAdminClient>, p: Persona) {
  if (!p.email) return null
  const { data } = await db
    .from('customers')
    .upsert(
      { nombre: p.nombre ?? null, email: p.email.trim().toLowerCase(), telefono: p.telefono ?? null, ultimo_contacto: new Date().toISOString() },
      { onConflict: 'email' }
    )
    .select('id')
    .maybeSingle()
  return data?.id ?? null
}

// ── Email de aviso al negocio + confirmación al cliente ──────────────────────
async function enviarEmails(opts: {
  asuntoAdmin: string
  resumen: { label: string; valor: string }[]
  clienteEmail?: string
  tituloCliente: string
}) {
  const filas = opts.resumen
    .filter(r => r.valor)
    .map(r => `<tr><td style="padding:6px 12px;color:#64748b">${r.label}</td><td style="padding:6px 12px;color:#0F1A3D;font-weight:600">${r.valor}</td></tr>`)
    .join('')
  const tabla = `<table style="border-collapse:collapse;font-family:sans-serif;font-size:14px">${filas}</table>`

  // Aviso interno
  try {
    await resend.emails.send({
      from: FROM, to: NOTIF_TO,
      subject: opts.asuntoAdmin,
      html: `<div style="font-family:sans-serif"><h2 style="color:#0F1A3D">${opts.asuntoAdmin}</h2>${tabla}<p style="color:#94a3b8;font-size:12px;margin-top:16px">Gestiónalo en el panel de administración.</p></div>`,
    })
  } catch {}

  // Confirmación al cliente
  if (opts.clienteEmail) {
    try {
      await resend.emails.send({
        from: FROM, to: opts.clienteEmail,
        subject: opts.tituloCliente,
        html: `<div style="font-family:sans-serif"><h2 style="color:#0F1A3D">${opts.tituloCliente}</h2><p style="color:#334155">¡Gracias por contactar con Planeta Movimiento! Hemos recibido tu solicitud y te responderemos lo antes posible.</p>${tabla}<p style="color:#94a3b8;font-size:12px;margin-top:16px">Planeta Movimiento · Cuenca</p></div>`,
      })
    } catch {}
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// FORMULARIO / SOLICITUD (información, presupuesto, inscripción, contacto...)
// ═══════════════════════════════════════════════════════════════════════════
export async function submitForm(input: {
  tipo: string
  nombre?: string
  email?: string
  telefono?: string
  asunto?: string
  mensaje?: string
  datos?: Record<string, unknown>
}) {
  try {
    const db = createAdminClient()
    await upsertCustomer(db, input)
    const { error } = await db.from('form_submissions').insert({
      tipo: input.tipo,
      nombre: input.nombre ?? null,
      email: input.email ?? null,
      telefono: input.telefono ?? null,
      asunto: input.asunto ?? null,
      mensaje: input.mensaje ?? null,
      datos: input.datos ?? null,
      estado: 'nueva',
    })
    if (error) return { ok: false, error: error.message }

    const resumen = [
      { label: 'Tipo', valor: input.tipo },
      { label: 'Nombre', valor: input.nombre ?? '' },
      { label: 'Email', valor: input.email ?? '' },
      { label: 'Teléfono', valor: input.telefono ?? '' },
      { label: 'Asunto', valor: input.asunto ?? '' },
      { label: 'Mensaje', valor: input.mensaje ?? '' },
      ...Object.entries(input.datos ?? {}).map(([k, v]) => ({ label: k, valor: String(v ?? '') })),
    ]
    await enviarEmails({
      asuntoAdmin: `Nueva solicitud · ${input.tipo}`,
      resumen,
      clienteEmail: input.email,
      tituloCliente: 'Hemos recibido tu solicitud',
    })
    return { ok: true }
  } catch (e) {
    return { ok: false, error: 'No se pudo enviar. Inténtalo de nuevo.' }
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// RESERVA (cumpleaños, campamentos, eventos, días sin cole, domingos...)
// ═══════════════════════════════════════════════════════════════════════════
export async function submitBooking(input: {
  servicio: string
  cliente_nombre?: string
  cliente_email?: string
  cliente_telefono?: string
  fecha?: string
  hora?: string
  participantes?: number
  precio?: number
  observaciones?: string
  datos?: Record<string, unknown>
}) {
  try {
    const db = createAdminClient()
    const cliente_id = await upsertCustomer(db, {
      nombre: input.cliente_nombre, email: input.cliente_email, telefono: input.cliente_telefono,
    })
    const numero = 'PM-' + Date.now().toString(36).toUpperCase()
    const { error } = await db.from('bookings').insert({
      numero,
      servicio: input.servicio,
      cliente_id,
      cliente_nombre: input.cliente_nombre ?? null,
      cliente_email: input.cliente_email ?? null,
      cliente_telefono: input.cliente_telefono ?? null,
      fecha: input.fecha ?? null,
      hora: input.hora ?? null,
      participantes: input.participantes ?? null,
      precio: input.precio ?? null,
      observaciones: input.observaciones
        ? input.observaciones + (input.datos ? '\n\n' + JSON.stringify(input.datos) : '')
        : (input.datos ? JSON.stringify(input.datos) : null),
      estado_reserva: 'pendiente',
      estado_pago: 'pendiente',
    })
    if (error) return { ok: false, error: error.message }

    await enviarEmails({
      asuntoAdmin: `Nueva reserva · ${input.servicio} (${numero})`,
      resumen: [
        { label: 'Servicio', valor: input.servicio },
        { label: 'Nº', valor: numero },
        { label: 'Cliente', valor: input.cliente_nombre ?? '' },
        { label: 'Email', valor: input.cliente_email ?? '' },
        { label: 'Teléfono', valor: input.cliente_telefono ?? '' },
        { label: 'Fecha', valor: input.fecha ?? '' },
        { label: 'Horario', valor: input.hora ?? '' },
        { label: 'Participantes', valor: input.participantes != null ? String(input.participantes) : '' },
        { label: 'Precio estimado', valor: input.precio != null ? `${input.precio} €` : '' },
        { label: 'Observaciones', valor: input.observaciones ?? '' },
      ],
      clienteEmail: input.cliente_email,
      tituloCliente: 'Hemos recibido tu solicitud de reserva',
    })
    return { ok: true, numero }
  } catch (e) {
    return { ok: false, error: 'No se pudo enviar. Inténtalo de nuevo.' }
  }
}
