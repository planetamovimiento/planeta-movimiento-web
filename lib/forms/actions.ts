'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { enviarEmail, NOTIF_TO } from '@/lib/emails/enviar'
import { enviarConfirmacionReserva } from '@/lib/emails/confirmacion'
import { comprobarEnvioForm } from '@/lib/seguridad/guard'
import { limpiarCabecera, limpiarTexto, escHtml } from '@/lib/seguridad/sanitize'

/** Datos de la capa antibots que envía el cliente (honeypot, tiempo, captcha). */
export type Seguridad = { hp?: string; renderedAt?: number; turnstileToken?: string }

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

// ── Aviso interno al negocio (la confirmación al cliente la envía el módulo
//    lib/emails/confirmacion con un mensaje específico por servicio). ──────────
async function avisarNegocio(asuntoAdmin: string, resumen: { label: string; valor: string }[]) {
  const filas = resumen
    .filter(r => r.valor)
    .map(r => `<tr><td style="padding:6px 12px;color:#64748b">${escHtml(r.label)}</td><td style="padding:6px 12px;color:#0F1A3D;font-weight:600">${escHtml(r.valor)}</td></tr>`)
    .join('')
  const tabla = `<table style="border-collapse:collapse;font-family:sans-serif;font-size:14px">${filas}</table>`
  await enviarEmail({
    to: NOTIF_TO,
    subject: limpiarCabecera(asuntoAdmin),
    html: `<div style="font-family:sans-serif"><h2 style="color:#0F1A3D">${escHtml(asuntoAdmin)}</h2>${tabla}<p style="color:#94a3b8;font-size:12px;margin-top:16px">Gestiónalo en el panel de administración.</p></div>`,
    tipo: 'aviso-interno',
  })
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
  seguridad?: Seguridad
}) {
  // Capa antibots/antispam (honeypot, tiempo, rate-limit, spam, captcha).
  const g = await comprobarEnvioForm({
    formTipo: input.tipo || 'formulario',
    honeypot: input.seguridad?.hp,
    renderedAt: input.seguridad?.renderedAt,
    turnstileToken: input.seguridad?.turnstileToken,
    email: input.email,
    contenido: [input.asunto, input.mensaje].filter(Boolean).join(' '),
  })
  if (!g.ok) return { ok: false, error: g.error }

  try {
    const db = createAdminClient()
    // Saneado de datos de usuario.
    const nombre = limpiarCabecera(input.nombre)
    const email = limpiarCabecera(input.email).toLowerCase()
    const telefono = limpiarCabecera(input.telefono)
    const asunto = limpiarCabecera(input.asunto)
    const mensaje = limpiarTexto(input.mensaje)

    await upsertCustomer(db, { nombre, email, telefono })
    const { error } = await db.from('form_submissions').insert({
      tipo: input.tipo,
      nombre: nombre || null,
      email: email || null,
      telefono: telefono || null,
      asunto: asunto || null,
      mensaje: mensaje || null,
      datos: input.datos ?? null,
      estado: 'nueva',
    })
    if (error) return { ok: false, error: error.message }

    const resumen = [
      { label: 'Tipo', valor: input.tipo },
      { label: 'Nombre', valor: nombre },
      { label: 'Email', valor: email },
      { label: 'Teléfono', valor: telefono },
      { label: 'Asunto', valor: asunto },
      { label: 'Mensaje', valor: mensaje },
      ...Object.entries(input.datos ?? {}).map(([k, v]) => ({ label: k, valor: String(v ?? '') })),
    ]
    await avisarNegocio(`Nueva solicitud · ${input.tipo}`, resumen)
    await enviarConfirmacionReserva({
      servicio: asunto || input.tipo,
      clienteNombre: nombre, clienteEmail: email,
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
  seguridad?: Seguridad
}) {
  const g = await comprobarEnvioForm({
    formTipo: 'reserva',
    honeypot: input.seguridad?.hp,
    renderedAt: input.seguridad?.renderedAt,
    turnstileToken: input.seguridad?.turnstileToken,
    email: input.cliente_email,
    contenido: input.observaciones,
  })
  if (!g.ok) return { ok: false, error: g.error }

  try {
    const db = createAdminClient()
    const cliente_nombre = limpiarCabecera(input.cliente_nombre)
    const cliente_email = limpiarCabecera(input.cliente_email).toLowerCase()
    const cliente_telefono = limpiarCabecera(input.cliente_telefono)
    const observaciones = limpiarTexto(input.observaciones)
    const cliente_id = await upsertCustomer(db, {
      nombre: cliente_nombre, email: cliente_email, telefono: cliente_telefono,
    })
    const numero = 'PM-' + Date.now().toString(36).toUpperCase()
    const { error } = await db.from('bookings').insert({
      numero,
      servicio: input.servicio,
      cliente_id,
      cliente_nombre: cliente_nombre || null,
      cliente_email: cliente_email || null,
      cliente_telefono: cliente_telefono || null,
      fecha: input.fecha ?? null,
      hora: input.hora ?? null,
      participantes: input.participantes ?? null,
      precio: input.precio ?? null,
      observaciones: observaciones
        ? observaciones + (input.datos ? '\n\n' + JSON.stringify(input.datos) : '')
        : (input.datos ? JSON.stringify(input.datos) : null),
      estado_reserva: 'pendiente',
      estado_pago: 'pendiente',
    })
    if (error) return { ok: false, error: error.message }

    await avisarNegocio(`Nueva reserva · ${input.servicio} (${numero})`, [
      { label: 'Servicio', valor: input.servicio },
      { label: 'Nº', valor: numero },
      { label: 'Cliente', valor: cliente_nombre },
      { label: 'Email', valor: cliente_email },
      { label: 'Teléfono', valor: cliente_telefono },
      { label: 'Fecha', valor: input.fecha ?? '' },
      { label: 'Horario', valor: input.hora ?? '' },
      { label: 'Participantes', valor: input.participantes != null ? String(input.participantes) : '' },
      { label: 'Precio estimado', valor: input.precio != null ? `${input.precio} €` : '' },
      { label: 'Observaciones', valor: observaciones },
    ])
    await enviarConfirmacionReserva({
      servicio: input.servicio,
      clienteNombre: cliente_nombre, clienteEmail: cliente_email,
      fecha: input.fecha, hora: input.hora,
      participantes: input.participantes ?? null, numero, total: input.precio ?? null,
    })
    return { ok: true, numero }
  } catch (e) {
    return { ok: false, error: 'No se pudo enviar. Inténtalo de nuevo.' }
  }
}
