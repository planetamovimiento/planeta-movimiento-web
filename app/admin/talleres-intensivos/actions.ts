'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { getAdminUser, can, logActivity } from '@/lib/admin/auth'
import { TALLERES } from '@/app/club/talleres-intensivos/config'
import { slugify } from '@/lib/talleres/store'

type Res = { ok: boolean; error?: string | null }
type ResId = Res & { id?: string }

async function exigir() {
  const admin = await getAdminUser()
  if (!admin || !can.edit(admin.role)) return { admin: null, error: 'Sin permisos' as string | null }
  return { admin, error: null as string | null }
}

function revalidar() {
  revalidatePath('/admin/talleres-intensivos')
  revalidatePath('/admin/servicios/talleres-intensivos')
  revalidatePath('/club/talleres-intensivos')
}

/** Metadatos dinámicos (opcionales) que acompañan a contenido+estado. */
export type TallerMeta = {
  slug?: string; disciplina?: string; profesor?: string
  prioridad?: number; orden?: number; destacado?: boolean; publicadoAt?: string | null
}

/** Crea un intensivo en blanco (borrador). Devuelve su id para abrir el editor. */
export async function crearTaller(): Promise<ResId> {
  try {
    const { admin, error } = await exigir()
    if (!admin) return { ok: false, error }
    const db = createAdminClient()
    const id = crypto.randomUUID()
    const { error: e } = await db.from('talleres_intensivos').insert({
      id, titulo: 'Nuevo intensivo', slug: `intensivo-${id.slice(0, 8)}`, estado: 'borrador',
      prioridad: 50, orden: 0, destacado: false, archivado: false, contenido: {},
      updated_at: new Date().toISOString(), updated_by: admin.email,
    })
    if (e) return { ok: false, error: e.message }
    await logActivity({ actorEmail: admin.email, accion: 'Creó un taller intensivo', entidad: 'taller_intensivo', entidadId: id })
    revalidar()
    return { ok: true, id }
  } catch (e) { return { ok: false, error: e instanceof Error ? e.message : 'Error al crear' } }
}

/**
 * Guarda un intensivo. `contenido` son los campos ricos; `estado` la columna;
 * `meta` los campos dinámicos (slug, prioridad, destacado…). Compatible con el
 * editor actual (3 args) y con el ampliado (con meta). Valida unicidad del slug.
 */
export async function guardarTaller(id: string, contenido: Record<string, unknown>, estado: string, meta: TallerMeta = {}): Promise<Res> {
  try {
    const { admin, error } = await exigir()
    if (!admin) return { ok: false, error }
    const db = createAdminClient()

    const titulo = String(contenido.nombre ?? '').trim() || 'Sin título'
    const slug = slugify(meta.slug || titulo) || `intensivo-${id.slice(0, 8)}`
    const { data: dup } = await db.from('talleres_intensivos').select('id').eq('slug', slug).neq('id', id).limit(1)
    if (dup && dup.length) return { ok: false, error: `Ya existe otro intensivo con la URL «${slug}».` }

    const fila: Record<string, unknown> = {
      id, titulo, slug, estado, contenido,
      disciplina: meta.disciplina ?? null,
      profesor: (contenido.profesor as string) ?? meta.profesor ?? null,
      prioridad: meta.prioridad ?? 50,
      orden: meta.orden ?? 0,
      destacado: meta.destacado === true,
      updated_at: new Date().toISOString(), updated_by: admin.email,
    }
    if (meta.publicadoAt !== undefined) fila.publicado_at = meta.publicadoAt

    const { error: e } = await db.from('talleres_intensivos').upsert(fila)
    if (e) return { ok: false, error: e.message }
    await logActivity({ actorEmail: admin.email, accion: `Editó el intensivo "${titulo}" (${estado})`, entidad: 'taller_intensivo', entidadId: id })
    revalidar()
    return { ok: true }
  } catch (e) { return { ok: false, error: e instanceof Error ? e.message : 'Error al guardar' } }
}

/** Duplica un intensivo (textos/config/precios), SIN inscripciones. */
export async function duplicarTaller(id: string): Promise<ResId> {
  try {
    const { admin, error } = await exigir()
    if (!admin) return { ok: false, error }
    const db = createAdminClient()
    const { data } = await db.from('talleres_intensivos').select('*').eq('id', id).maybeSingle()
    let r = data as Record<string, unknown> | null
    // Si es uno del config aún sin fila, se duplica desde el config.
    if (!r) {
      const base = TALLERES.find(t => t.id === id)
      if (!base) return { ok: false, error: 'No encontrado' }
      r = { id, titulo: base.nombre, estado: base.estado, contenido: base, disciplina: null, profesor: base.profesor, prioridad: 50, orden: 0 }
    }
    const nuevoId = crypto.randomUUID()
    const titulo = `${(r.titulo as string) || 'Intensivo'} (copia)`
    const { error: e } = await db.from('talleres_intensivos').insert({
      ...r, id: nuevoId, titulo, slug: `${slugify(titulo)}-${nuevoId.slice(0, 6)}`,
      estado: 'borrador', destacado: false, archivado: false, publicado_at: null,
      created_at: new Date().toISOString(), updated_at: new Date().toISOString(), updated_by: admin.email,
    })
    if (e) return { ok: false, error: e.message }
    await logActivity({ actorEmail: admin.email, accion: 'Duplicó un taller intensivo', entidad: 'taller_intensivo', entidadId: nuevoId })
    revalidar()
    return { ok: true, id: nuevoId }
  } catch (e) { return { ok: false, error: e instanceof Error ? e.message : 'Error al duplicar' } }
}

export async function archivarTaller(id: string, archivado: boolean): Promise<Res> {
  try {
    const { admin, error } = await exigir()
    if (!admin) return { ok: false, error }
    const db = createAdminClient()
    // Puede no existir fila aún (taller del config): upsert mínimo.
    const base = TALLERES.find(t => t.id === id)
    const fila: Record<string, unknown> = { id, archivado, updated_at: new Date().toISOString(), updated_by: admin.email }
    if (base) { fila.titulo = base.nombre; fila.estado = base.estado; fila.contenido = base }
    const { error: e } = await db.from('talleres_intensivos').upsert(fila)
    if (e) return { ok: false, error: e.message }
    revalidar()
    return { ok: true }
  } catch (e) { return { ok: false, error: e instanceof Error ? e.message : 'Error' } }
}

/** Elimina un intensivo SOLO si no tiene inscripciones. */
export async function eliminarTaller(id: string): Promise<Res> {
  try {
    const { admin, error } = await exigir()
    if (!admin) return { ok: false, error }
    const db = createAdminClient()
    try {
      const { count } = await db.from('taller_inscripciones').select('id', { count: 'exact', head: true }).eq('taller_id', id)
      if ((count ?? 0) > 0) return { ok: false, error: 'No se puede eliminar: tiene inscripciones. Archívalo en su lugar.' }
    } catch { /* tabla sin migrar: permitir borrar */ }
    const { error: e } = await db.from('talleres_intensivos').delete().eq('id', id)
    if (e) return { ok: false, error: e.message }
    await logActivity({ actorEmail: admin.email, accion: 'Eliminó un taller intensivo', entidad: 'taller_intensivo', entidadId: id })
    revalidar()
    return { ok: true }
  } catch (e) { return { ok: false, error: e instanceof Error ? e.message : 'Error al eliminar' } }
}

/** Edita una inscripción de un taller (estado y pago manual). */
export async function guardarInscripcionTaller(id: string, patch: {
  estado?: string; pago_estado?: string; pago_importe_cents?: number; pago_fecha?: string | null; pago_obs?: string | null
}): Promise<Res> {
  try {
    const { admin, error } = await exigir()
    if (!admin) return { ok: false, error }
    const db = createAdminClient()
    const limpio: Record<string, unknown> = {}
    if (patch.estado !== undefined) limpio.estado = patch.estado
    if (patch.pago_estado !== undefined) limpio.pago_estado = patch.pago_estado
    if (patch.pago_importe_cents !== undefined) limpio.pago_importe_cents = patch.pago_importe_cents
    if (patch.pago_fecha !== undefined) limpio.pago_fecha = patch.pago_fecha || null
    if (patch.pago_obs !== undefined) limpio.pago_obs = patch.pago_obs || null
    const { error: e } = await db.from('taller_inscripciones').update(limpio).eq('id', id)
    if (e) return { ok: false, error: e.message }
    revalidar()
    return { ok: true }
  } catch (e) { return { ok: false, error: e instanceof Error ? e.message : 'Error' } }
}

export async function eliminarInscripcionTaller(id: string): Promise<Res> {
  try {
    const { admin, error } = await exigir()
    if (!admin) return { ok: false, error }
    const db = createAdminClient()
    const { error: e } = await db.from('taller_inscripciones').delete().eq('id', id)
    if (e) return { ok: false, error: e.message }
    revalidar()
    return { ok: true }
  } catch (e) { return { ok: false, error: e instanceof Error ? e.message : 'Error' } }
}

/** Importa los 4 intensivos del config a la BD como registros dinámicos. Idempotente. */
export async function sembrarTalleresIniciales(): Promise<Res & { creados?: number }> {
  try {
    const { admin, error } = await exigir()
    if (!admin) return { ok: false, error }
    const db = createAdminClient()
    const { data: existentes } = await db.from('talleres_intensivos').select('id')
    const ids = new Set(((existentes ?? []) as { id: string }[]).map(r => r.id))
    const filas = TALLERES.filter(t => !ids.has(t.id)).map(t => ({
      id: t.id, titulo: t.nombre, slug: slugify(t.nombre) || t.id, disciplina: null, profesor: t.profesor,
      estado: t.estado, prioridad: t.estado === 'abierto' ? 100 : 50, orden: 0, destacado: false, archivado: false,
      contenido: t, updated_at: new Date().toISOString(), updated_by: admin.email,
    }))
    if (filas.length === 0) return { ok: true, creados: 0 }
    const { error: e } = await db.from('talleres_intensivos').insert(filas)
    if (e) return { ok: false, error: e.message }
    await logActivity({ actorEmail: admin.email, accion: `Importó ${filas.length} intensivos iniciales`, entidad: 'taller_intensivo' })
    revalidar()
    return { ok: true, creados: filas.length }
  } catch (e) { return { ok: false, error: e instanceof Error ? e.message : 'Error al importar' } }
}
