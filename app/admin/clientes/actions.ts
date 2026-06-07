'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { getAdminUser, can, logActivity } from '@/lib/admin/auth'

type Patch = { participante: string; tutor: string; email: string; telefono: string }

function revalidar() {
  revalidatePath('/admin/clientes'); revalidatePath('/admin/club'); revalidatePath('/admin/reservas')
}

/** Edita los datos de un cliente en su tabla de origen. */
export async function editarCliente(origen: string, id: string, p: Patch) {
  const admin = await getAdminUser()
  if (!admin || !can.edit(admin.role)) return { ok: false, error: 'Sin permisos' }
  const db = createAdminClient()

  if (origen === 'reserva') {
    const { error } = await db.from('bookings').update({ cliente_nombre: p.participante || null, cliente_email: p.email || null, cliente_telefono: p.telefono || null }).eq('id', id)
    if (error) return { ok: false, error: error.message }
  } else {
    // form_submissions (club o empresa)
    const { data } = await db.from('form_submissions').select('datos, tipo').eq('id', id).maybeSingle()
    const datos = (data?.datos as Record<string, unknown>) || {}
    const partes = p.participante.trim().split(/\s+/)
    const nuevoDatos = data?.tipo === 'inscripcion_club'
      ? { ...datos, nombre: partes[0] ?? '', apellidos: partes.slice(1).join(' '), tutorLegal: p.tutor }
      : { ...datos, tutorLegal: p.tutor }
    const { error } = await db.from('form_submissions').update({ nombre: p.participante || null, email: p.email || null, telefono: p.telefono || null, datos: nuevoDatos }).eq('id', id)
    if (error) return { ok: false, error: error.message }
  }

  await logActivity({ actorEmail: admin.email, accion: `Cliente editado: ${p.participante}`, entidad: 'cliente', entidadId: `${origen}:${id}` })
  revalidar()
  return { ok: true }
}

/** Elimina un cliente y sus datos asociados (overlays del CRM). */
export async function eliminarCliente(origen: string, id: string) {
  const admin = await getAdminUser()
  if (!admin || !can.edit(admin.role)) return { ok: false, error: 'Sin permisos' }
  const db = createAdminClient()

  if (origen === 'reserva') {
    await db.from('crm_gestion').delete().eq('origen', 'booking').eq('origen_id', id)
    const { error } = await db.from('bookings').delete().eq('id', id)
    if (error) return { ok: false, error: error.message }
  } else {
    await db.from('club_gestion').delete().eq('submission_id', id)
    await db.from('crm_gestion').delete().eq('origen', 'form').eq('origen_id', id)
    const { error } = await db.from('form_submissions').delete().eq('id', id)
    if (error) return { ok: false, error: error.message }
  }

  await logActivity({ actorEmail: admin.email, accion: 'Cliente eliminado', entidad: 'cliente', entidadId: `${origen}:${id}` })
  revalidar()
  return { ok: true }
}
