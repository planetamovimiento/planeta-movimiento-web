'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { getAdminUser, logActivity } from '@/lib/admin/auth'
import { puedeVerSeccion } from '@/lib/admin/secciones'
import { siguienteNumeroSocio, normalizarNumeroSocio } from '@/lib/familias/socio'

type Res = { ok: true; numero?: string } | { ok: false; error: string }

const revalidar = () => { revalidatePath('/admin/socios'); revalidatePath('/admin/familias') }

async function exigir() {
  const admin = await getAdminUser()
  if (!admin) return { admin: null, error: 'Sin sesión' }
  if (!puedeVerSeccion(admin.role, admin.secciones, 'socios')) return { admin: null, error: 'Sin acceso a Socios' }
  if (admin.role === 'lectura') return { admin: null, error: 'No tienes permisos de edición' }
  return { admin, error: null as string | null }
}

/**
 * Marca (o desmarca) la equipación entregada de un participante. Se guarda en la
 * propia inscripción, así que sirve tanto para los que están apuntados a una
 * disciplina como para los que solo existen por el alta de socio.
 */
export async function marcarEquipacion(submissionId: string, entregada: boolean): Promise<Res> {
  const { admin, error } = await exigir()
  if (!admin) return { ok: false, error: error! }
  const db = createAdminClient()

  const { data } = await db.from('form_submissions').select('datos, nombre').eq('id', submissionId).maybeSingle()
  if (!data) return { ok: false, error: 'No se encuentra a ese participante' }
  const datos = ((data.datos ?? {}) as Record<string, unknown>)
  const nuevos = { ...datos }
  if (entregada) nuevos.equipacionEntregada = new Date().toISOString().slice(0, 10)
  else delete nuevos.equipacionEntregada

  const { error: e } = await db.from('form_submissions').update({ datos: nuevos }).eq('id', submissionId)
  if (e) return { ok: false, error: e.message }
  await logActivity({
    actorEmail: admin.email,
    accion: `${entregada ? 'Entregó' : 'Anuló la entrega de'} la equipación · ${String(data.nombre ?? '')}`,
    entidad: 'socio', entidadId: submissionId,
  })
  revalidar()
  return { ok: true }
}

/**
 * Asigna el nº de socio a ese correo. Si aún no tiene cuenta en el Portal de
 * Familias, se crea con el mismo correo: es la credencial con la que la familia
 * entra al portal (correo + nº de socio).
 */
export async function asignarNumeroSocio(email: string, numero?: string): Promise<Res> {
  const { admin, error } = await exigir()
  if (!admin) return { ok: false, error: error! }
  const e = (email || '').trim().toLowerCase()
  if (!e) return { ok: false, error: 'Correo no válido' }
  const db = createAdminClient()

  // Cuenta del portal para ese correo (se crea si no existe).
  let { data: fam } = await db.from('club_familias').select('id, numero_socio').eq('email', e).maybeSingle()
  if (!fam) {
    const { data: creada, error: eCrear } = await db.from('club_familias')
      .insert({ email: e, estado: 'activo' }).select('id, numero_socio').single()
    if (eCrear) {
      const { data: reintento } = await db.from('club_familias').select('id, numero_socio').eq('email', e).maybeSingle()
      if (!reintento) return { ok: false, error: eCrear.message }
      fam = reintento
    } else {
      fam = creada
    }
  }

  const manual = normalizarNumeroSocio(numero || '')
  if (manual) {
    const { error: e2 } = await db.from('club_familias').update({ numero_socio: manual, estado: 'activo' }).eq('id', fam.id)
    if (e2) return { ok: false, error: e2.message.toLowerCase().includes('duplicate') ? 'Ese número de socio ya está en uso.' : e2.message }
    await logActivity({ actorEmail: admin.email, accion: `Nº de socio ${manual} · ${e}`, entidad: 'socio', entidadId: e })
    revalidar()
    return { ok: true, numero: manual }
  }

  if (fam.numero_socio) { revalidar(); return { ok: true, numero: fam.numero_socio as string } }

  // Correlativo: el índice único de la BD atrapa las colisiones, se reintenta.
  for (let i = 0; i < 4; i++) {
    const cand = await siguienteNumeroSocio()
    const { error: e3 } = await db.from('club_familias').update({ numero_socio: cand, estado: 'activo' }).eq('id', fam.id)
    if (!e3) {
      await logActivity({ actorEmail: admin.email, accion: `Nº de socio ${cand} · ${e}`, entidad: 'socio', entidadId: e })
      revalidar()
      return { ok: true, numero: cand }
    }
    if (!e3.message.toLowerCase().includes('duplicate')) return { ok: false, error: e3.message }
  }
  return { ok: false, error: 'No se pudo generar el número. Inténtalo de nuevo.' }
}

/** Quita el nº de socio (la familia deja de poder entrar al portal). */
export async function quitarNumeroSocio(email: string): Promise<Res> {
  const { admin, error } = await exigir()
  if (!admin) return { ok: false, error: error! }
  const db = createAdminClient()
  const { error: e } = await db.from('club_familias').update({ numero_socio: null }).eq('email', (email || '').trim().toLowerCase())
  if (e) return { ok: false, error: e.message }
  await logActivity({ actorEmail: admin.email, accion: `Quitó el nº de socio · ${email}`, entidad: 'socio', entidadId: email })
  revalidar()
  return { ok: true }
}
