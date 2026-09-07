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

const norm = (v: unknown) => String(v ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').trim().toLowerCase().replace(/s+/g, ' ')

/**
 * Las OTRAS filas del mismo participante (su inscripción y su línea del alta de
 * socio). La cuota de socio se paga UNA vez por niño, así que al cobrarla hay que
 * dejar limpias las demás para no contarla dos veces en el balance.
 */
async function otrasFilasDelParticipante(db: ReturnType<typeof createAdminClient>, submissionId: string): Promise<string[]> {
  const { data: base } = await db.from('form_submissions').select('id, email, nombre, datos').eq('id', submissionId).maybeSingle()
  if (!base?.email) return []
  const d = (base.datos ?? {}) as Record<string, unknown>
  const nac = String(d.fechaNacimiento ?? '').slice(0, 10)
  const nom = norm(d.nombre) || norm(base.nombre).split(' ')[0]
  const ape = norm(d.apellidos) || norm(base.nombre).split(' ').slice(1).join(' ')

  const { data: otras } = await db.from('form_submissions')
    .select('id, nombre, datos').eq('tipo', 'inscripcion_club').eq('email', base.email)
  return ((otras ?? []) as { id: string; nombre: string | null; datos: Record<string, unknown> | null }[])
    .filter(o => {
      if (o.id === submissionId) return false
      const od = (o.datos ?? {}) as Record<string, unknown>
      const oNac = String(od.fechaNacimiento ?? '').slice(0, 10)
      if (nac && oNac) return nac === oNac
      const oNom = norm(od.nombre) || norm(o.nombre).split(' ')[0]
      const oApe = norm(od.apellidos) || norm(o.nombre).split(' ').slice(1).join(' ')
      return !!nom && oNom.split(' ')[0] === nom.split(' ')[0] && oApe.split(' ')[0] === ape.split(' ')[0]
    })
    .map(o => o.id)
}

/**
 * Registra (o deshace) el cobro de la cuota de socio de un participante.
 * Guarda importe, fecha y forma de pago en su ficha de gestión, que es de donde
 * salen las cuotas cobradas del Balance del Club.
 */
export async function registrarPagoSocio(p: {
  submissionId: string; importeCents: number; fecha: string; formaPago?: string
}): Promise<Res> {
  const { admin, error } = await exigir()
  if (!admin) return { ok: false, error: error! }
  if (!p.submissionId) return { ok: false, error: 'Participante no válido' }
  if (!p.fecha) return { ok: false, error: 'Indica la fecha del pago' }
  if (!Number.isFinite(p.importeCents) || p.importeCents <= 0) return { ok: false, error: 'Indica el importe cobrado' }

  const db = createAdminClient()
  const { error: e } = await db.from('club_gestion').upsert({
    submission_id: p.submissionId,
    cuota_estado: 'pagada',
    cuota_importe_cents: Math.round(p.importeCents),
    cuota_fecha_pago: p.fecha,
    cuota_forma_pago: (p.formaPago || '').trim() || null,
    updated_at: new Date().toISOString(),
    updated_by: admin.email,
  }, { onConflict: 'submission_id' })
  if (e) return { ok: false, error: e.message }

  // Un mismo niño puede tener dos filas: la cuota de socio queda solo en esta.
  for (const otro of await otrasFilasDelParticipante(db, p.submissionId)) {
    await db.from('club_gestion').update({ cuota_estado: 'pendiente', cuota_fecha_pago: null, cuota_forma_pago: null })
      .eq('submission_id', otro).eq('cuota_estado', 'pagada')
  }

  await logActivity({ actorEmail: admin.email, accion: 'Cobró la cuota de socio', entidad: 'socio', entidadId: p.submissionId })
  revalidatePath('/admin/socios')
  revalidatePath('/admin/club')
  return { ok: true }
}

/** Deshace el cobro: la cuota vuelve a pendiente y se borra fecha e importe. */
export async function anularPagoSocio(submissionId: string): Promise<Res> {
  const { admin, error } = await exigir()
  if (!admin) return { ok: false, error: error! }
  const db = createAdminClient()
  const { error: e } = await db.from('club_gestion').upsert({
    submission_id: submissionId,
    cuota_estado: 'pendiente',
    cuota_fecha_pago: null,
    cuota_forma_pago: null,
    updated_at: new Date().toISOString(),
    updated_by: admin.email,
  }, { onConflict: 'submission_id' })
  if (e) return { ok: false, error: e.message }
  for (const otro of await otrasFilasDelParticipante(db, submissionId)) {
    await db.from('club_gestion').update({ cuota_estado: 'pendiente', cuota_fecha_pago: null, cuota_forma_pago: null })
      .eq('submission_id', otro).eq('cuota_estado', 'pagada')
  }
  await logActivity({ actorEmail: admin.email, accion: 'Anuló el cobro de la cuota de socio', entidad: 'socio', entidadId: submissionId })
  revalidatePath('/admin/socios')
  revalidatePath('/admin/club')
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
