'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { getTemporadaActiva } from '@/lib/config/store'
import { importeCuotaSugeridoCents } from '@/lib/club/cuota'
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
    const { data: subRow, error } = await db.from('form_submissions').insert({
      tipo: input.tipo,
      nombre: nombre || null,
      email: email || null,
      telefono: telefono || null,
      asunto: asunto || null,
      mensaje: mensaje || null,
      datos: input.datos ?? null,
      estado: 'nueva',
    }).select('id').single()
    if (error) return { ok: false, error: error.message }

    // Inscripción del Club → queda registrada de inmediato en el CRM con la
    // temporada ACTIVA (2026/27 por defecto, editable desde el admin).
    if (input.tipo === 'inscripcion_club' && (subRow as { id?: string } | null)?.id) {
      try {
        const temporada = await getTemporadaActiva()
        await db.from('club_gestion').upsert(
          { submission_id: (subRow as { id: string }).id, temporada, estado_general: 'pendiente' },
          { onConflict: 'submission_id' },
        )
      } catch { /* si falla, el CRM usará la temporada activa como fallback igualmente */ }
    }

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
// ALTA DE SOCIO (Club Deportivo Origen) — un tutor + 1..N participantes.
// Crea/actualiza una inscripción por hijo (tipo inscripcion_club, esSocio:true)
// → aparecen en el CRM y en el Portal de Familias (por el email del tutor).
// Dedup por email + nombre del participante. NUNCA reescribe una cuota ya
// registrada (respeta pagos existentes). Pago siempre manual (sin cobro online).
// ═══════════════════════════════════════════════════════════════════════════
// ── Identificar al mismo participante entre inscripciones ────────────────────
// Se usa para que el alta de socio se enganche a la inscripción que ya existe en
// vez de duplicarla. Tolera acentos, mayúsculas y palabras de más en el nombre.
const normPart = (s: unknown) => String(s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').trim().toLowerCase().replace(/\s+/g, ' ')

function mismoParticipante(
  prev: { nombre: string | null; datos: Record<string, unknown> | null },
  nuevo: { nombreP: string; apellidosP: string; fechaNac: string },
): boolean {
  const d = (prev.datos ?? {}) as Record<string, unknown>
  const pNombre = normPart(d.nombre) || normPart(prev.nombre).split(' ')[0] || ''
  const pApellidos = normPart(d.apellidos) || normPart(prev.nombre).split(' ').slice(1).join(' ')
  const pFecha = String(d.fechaNacimiento ?? '').slice(0, 10)

  // 1) Misma fecha de nacimiento (lo más fiable).
  if (nuevo.fechaNac && pFecha && nuevo.fechaNac === pFecha) return true
  // 2) Mismo nombre completo normalizado.
  const full = normPart(`${nuevo.nombreP} ${nuevo.apellidosP}`)
  if (full && `${pNombre} ${pApellidos}`.trim() === full) return true
  // 3) Mismo nombre + mismo primer apellido (p. ej. "Martina Semprun culebras").
  const n = normPart(nuevo.nombreP).split(' ')[0]
  const ap = normPart(nuevo.apellidosP).split(' ')[0]
  const pn = pNombre.split(' ')[0]
  const pap = pApellidos.split(' ')[0]
  return !!(n && ap && pn && pap && n === pn && ap === pap)
}

export async function submitSocio(input: {
  tutor: { nombre?: string; apellidos?: string; dni?: string; telefono?: string; email?: string; direccion?: string; observaciones?: string }
  participantes: { nombre?: string; apellidos?: string; fechaNacimiento?: string; actividades?: string; talla?: string; observaciones?: string }[]
  seguridad?: Seguridad
}) {
  const g = await comprobarEnvioForm({
    formTipo: 'alta_socio',
    honeypot: input.seguridad?.hp,
    renderedAt: input.seguridad?.renderedAt,
    turnstileToken: input.seguridad?.turnstileToken,
    email: input.tutor?.email,
    contenido: input.tutor?.observaciones,
  })
  if (!g.ok) return { ok: false, error: g.error }

  try {
    const db = createAdminClient()
    const t = input.tutor || {}
    const nombreT = limpiarCabecera(t.nombre)
    const apellidosT = limpiarCabecera(t.apellidos)
    const email = limpiarCabecera(t.email).toLowerCase()
    const telefono = limpiarCabecera(t.telefono)
    const dni = limpiarCabecera(t.dni)
    const direccion = limpiarCabecera(t.direccion)
    const obsT = limpiarTexto(t.observaciones)
    const tutorNombre = `${nombreT} ${apellidosT}`.trim()

    if (!tutorNombre) return { ok: false, error: 'Escribe el nombre y apellidos del tutor.' }
    if (!email) return { ok: false, error: 'El correo del tutor es obligatorio.' }
    if (!telefono) return { ok: false, error: 'El teléfono del tutor es obligatorio.' }
    const parts = (input.participantes || []).filter(p => (p.nombre || '').trim())
    if (parts.length === 0) return { ok: false, error: 'Añade al menos un participante.' }

    await upsertCustomer(db, { nombre: tutorNombre, email, telefono })

    const temporada = await getTemporadaActiva()
    const importeSugerido = importeCuotaSugeridoCents()
    const now = new Date().toISOString()
    const creados: string[] = []

    // LA INSCRIPCIÓN MANDA: se cargan una vez todas las inscripciones del club de
    // esta familia. Si el niño ya está inscrito, el alta de socio NO crea otro
    // registro: marca esa inscripción como socio (sin pisar su nombre ni su
    // actividad). Solo se crea una nueva si el niño no estaba inscrito.
    const { data: previasRaw } = await db.from('form_submissions')
      .select('id, nombre, datos').eq('tipo', 'inscripcion_club').eq('email', email).limit(100)
    const previas = (previasRaw ?? []) as { id: string; nombre: string | null; datos: Record<string, unknown> | null }[]
    const usadas = new Set<string>()

    for (const p of parts) {
      const nombreP = limpiarCabecera(p.nombre)
      const apellidosP = limpiarCabecera(p.apellidos)
      const full = `${nombreP} ${apellidosP}`.trim()
      const fechaNac = (p.fechaNacimiento || '').slice(0, 10)
      const talla = limpiarCabecera(p.talla)

      // Busca la inscripción de ESTE niño: por fecha de nacimiento, por nombre
      // completo, o por nombre + primer apellido (tolera acentos y palabras de más).
      const prev = previas.find(x => !usadas.has(x.id) && mismoParticipante(x, { nombreP, apellidosP, fechaNac }))
      let subId = prev?.id

      if (prev && subId) {
        usadas.add(subId)
        // Se AÑADEN los datos de socio a la inscripción existente; no se pisan
        // nombre, apellidos, actividad ni fecha de nacimiento originales.
        const datosPrev = (prev.datos ?? {}) as Record<string, unknown>
        const datosMerge: Record<string, unknown> = { ...datosPrev, esSocio: true, tutorLegal: tutorNombre }
        if (talla) datosMerge.talla = talla
        if (dni) datosMerge.dniTutor = dni
        if (direccion) datosMerge.direccionTutor = direccion
        if (!datosPrev.fechaNacimiento && fechaNac) datosMerge.fechaNacimiento = fechaNac
        await db.from('form_submissions').update({
          telefono: telefono || null, datos: datosMerge,
        }).eq('id', subId)
      } else {
        const datos: Record<string, unknown> = {
          actividad: limpiarCabecera(p.actividades),
          nombre: nombreP, apellidos: apellidosP,
          fechaNacimiento: fechaNac,
          tutorLegal: tutorNombre, talla, esSocio: true,
        }
        if (dni) datos.dniTutor = dni
        if (direccion) datos.direccionTutor = direccion
        const { data: ins, error } = await db.from('form_submissions').insert({
          tipo: 'inscripcion_club', nombre: full, email: email || null, telefono: telefono || null,
          asunto: `Alta socio · ${full}`, mensaje: limpiarTexto(p.observaciones) || null, datos, estado: 'nueva',
        }).select('id').single()
        if (error) return { ok: false, error: error.message }
        subId = (ins as { id?: string } | null)?.id
        if (subId) usadas.add(subId)
      }
      if (!subId) continue

      // Gestión/cuota: si ya existe fila, solo actualiza la talla (no toca una
      // cuota ya registrada). Si es nueva, crea la cuota pendiente sugerida.
      const { data: gexist } = await db.from('club_gestion').select('submission_id').eq('submission_id', subId).maybeSingle()
      if (gexist) {
        await db.from('club_gestion').update({ talla: talla || null, updated_at: now }).eq('submission_id', subId)
      } else {
        await db.from('club_gestion').insert({
          submission_id: subId, temporada, estado_general: 'pendiente',
          cuota_estado: 'pendiente', cuota_importe_cents: importeSugerido, talla: talla || null, updated_at: now,
        })
      }
      creados.push(full)
    }

    await avisarNegocio(`Nueva alta de socio · ${tutorNombre}`, [
      { label: 'Tutor', valor: tutorNombre },
      { label: 'Email', valor: email },
      { label: 'Teléfono', valor: telefono },
      { label: 'DNI/NIE', valor: dni },
      { label: 'Dirección', valor: direccion },
      { label: 'Participantes', valor: creados.join(', ') },
      { label: 'Temporada', valor: temporada },
      { label: 'Observaciones', valor: obsT },
    ])
    await enviarConfirmacionReserva({ servicio: 'Alta de socio · Club Deportivo Origen', clienteNombre: tutorNombre, clienteEmail: email })
    return { ok: true }
  } catch {
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
