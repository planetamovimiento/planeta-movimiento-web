'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { comprobarEnvioForm } from '@/lib/seguridad/guard'
import { limpiarCabecera, limpiarTexto, escHtml } from '@/lib/seguridad/sanitize'
import { enviarEmail, NOTIF_TO } from '@/lib/emails/enviar'
import type { Seguridad } from '@/lib/forms/actions'

// Inscripción a un taller intensivo (Club Origen: por formulario, pago manual).
// Guarda en taller_inscripciones. Sin pago online.
export async function submitInscripcionTaller(input: {
  tallerId: string
  tallerNombre?: string
  nombre?: string; apellidos?: string; edad?: string; tutor?: string
  telefono?: string; email?: string; experiencia?: string
  modalidad?: string; fechas?: string; observaciones?: string
  estado?: 'nueva' | 'espera'
  seguridad?: Seguridad
}): Promise<{ ok: boolean; error?: string }> {
  const g = await comprobarEnvioForm({
    formTipo: 'inscripcion_taller',
    honeypot: input.seguridad?.hp,
    renderedAt: input.seguridad?.renderedAt,
    turnstileToken: input.seguridad?.turnstileToken,
    email: input.email,
    contenido: input.observaciones,
  })
  if (!g.ok) return { ok: false, error: g.error }

  if (!input.tallerId) return { ok: false, error: 'Taller no válido.' }

  try {
    const db = createAdminClient()
    const nombre = limpiarCabecera(input.nombre)
    const apellidos = limpiarCabecera(input.apellidos)
    const email = limpiarCabecera(input.email).toLowerCase()
    const telefono = limpiarCabecera(input.telefono)
    if (!nombre) return { ok: false, error: 'Escribe el nombre del participante.' }

    const { error } = await db.from('taller_inscripciones').insert({
      taller_id: input.tallerId,
      nombre, apellidos: apellidos || null,
      edad: limpiarCabecera(input.edad) || null,
      tutor: limpiarCabecera(input.tutor) || null,
      telefono: telefono || null, email: email || null,
      experiencia: limpiarCabecera(input.experiencia) || null,
      modalidad: limpiarCabecera(input.modalidad) || null,
      fechas: limpiarCabecera(input.fechas) || null,
      observaciones: limpiarTexto(input.observaciones) || null,
      estado: input.estado === 'espera' ? 'espera' : 'nueva',
      pago_estado: 'pendiente',
    })
    if (error) return { ok: false, error: error.message }

    // Aviso interno (best-effort).
    try {
      const filas = [
        ['Taller', input.tallerNombre ?? ''], ['Participante', `${nombre} ${apellidos}`.trim()],
        ['Edad', input.edad ?? ''], ['Tutor', input.tutor ?? ''], ['Teléfono', telefono], ['Email', email],
        ['Modalidad', input.modalidad ?? ''], ['Fechas', input.fechas ?? ''],
        ['Estado', input.estado === 'espera' ? 'Lista de espera' : 'Nueva'],
      ].filter(([, v]) => v)
        .map(([k, v]) => `<tr><td style="padding:6px 12px;color:#64748b">${escHtml(k)}</td><td style="padding:6px 12px;color:#0F1A3D;font-weight:600">${escHtml(v)}</td></tr>`).join('')
      await enviarEmail({
        to: NOTIF_TO,
        subject: `Inscripción taller · ${input.tallerNombre ?? ''}`.slice(0, 120),
        html: `<div style="font-family:sans-serif"><h2 style="color:#0F1A3D">Nueva inscripción a taller intensivo</h2><table style="border-collapse:collapse;font-size:14px">${filas}</table></div>`,
        tipo: 'aviso-interno',
      })
    } catch { /* no bloquea la inscripción */ }

    return { ok: true }
  } catch {
    return { ok: false, error: 'No se pudo enviar. Inténtalo de nuevo.' }
  }
}
