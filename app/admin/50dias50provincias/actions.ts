'use server'

// ─────────────────────────────────────────────────────────────────────────────
// 50 días, 50 provincias · Escrituras del panel.
//
// Todas las actions devuelven { ok, error } y NUNCA lanzan.
// Revalidan el panel Y la web pública para que los cambios se vean al momento.
// ─────────────────────────────────────────────────────────────────────────────

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { getAdminUser, logActivity } from '@/lib/admin/auth'
import { puedeVerSeccion } from '@/lib/admin/secciones'
import { CLAVES_CONFIG, ESTADOS_ETAPA, NIVELES_PATROCINIO, type EstadoEtapa } from '@/lib/reto50/constants'

type Res = { ok: boolean; error?: string | null }

/** Sesión + acceso a la sección + permiso de edición. */
async function exigir() {
  const admin = await getAdminUser()
  if (!admin) return { admin: null, error: 'Sin sesión' }
  if (!puedeVerSeccion(admin.role, admin.secciones, '50dias50provincias')) {
    return { admin: null, error: 'Sin acceso a «50 días, 50 provincias»' }
  }
  if (admin.role === 'lectura') return { admin: null, error: 'No tienes permisos de edición' }
  return { admin, error: null as string | null }
}

/** El panel y la web pública. */
function revalidar() {
  revalidatePath('/admin/50dias50provincias')
  revalidatePath('/50dias50provincias')
}

const txt = (v?: string | null) => (typeof v === 'string' && v.trim() ? v.trim() : null)

/** '' → null. Nunca convierte la ausencia de dato en un 0. */
function numONull(v: unknown): number | null {
  if (v == null) return null
  if (typeof v === 'string' && !v.trim()) return null
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}
const entONull = (v: unknown) => {
  const n = numONull(v)
  return n == null ? null : Math.round(n)
}

const MSG_SEED =
  'Esta es la ruta oficial de respaldo, todavía no está en la base de datos. ' +
  'Ejecuta supabase/migration_reto50.sql en Supabase para poder guardar cambios.'

/** Las filas de respaldo (id 'seed-…') no existen en la base de datos. */
const esSeed = (id: string) => !id || id.startsWith('seed-')

// ── Etapas ───────────────────────────────────────────────────────────────────

export type EtapaInput = {
  id: string
  dia?: number | string
  provincia?: string
  ciudad?: string
  ciudadConfirmada?: boolean
  fecha?: string
  hora?: string
  puntoEncuentro?: string
  lat?: number | string | null
  lng?: number | string | null
  burflips?: number | string
  descripcion?: string
  estado?: EstadoEtapa
  recaudado?: number | string | null
  asistentes?: number | string | null
  resumen?: string
  galeria?: string[]
  videoUrl?: string
  enlaceRedes?: string
  testimonios?: string
  notasInternas?: string
}

/** Guarda una etapa. Solo toca los campos presentes en el input. */
export async function guardarEtapa(input: EtapaInput): Promise<Res> {
  try {
    const { admin, error } = await exigir()
    if (!admin) return { ok: false, error }
    if (esSeed(input.id)) return { ok: false, error: MSG_SEED }

    const patch: Record<string, unknown> = {}

    if (input.dia !== undefined) {
      const dia = entONull(input.dia)
      if (dia == null || dia < 1) return { ok: false, error: 'El día debe ser un número válido' }
      patch.dia = dia
    }
    if (input.provincia !== undefined) {
      const provincia = txt(input.provincia)
      if (!provincia) return { ok: false, error: 'La provincia es obligatoria' }
      patch.provincia = provincia
    }
    if (input.fecha !== undefined) {
      const fecha = txt(input.fecha)
      if (!fecha) return { ok: false, error: 'La fecha es obligatoria' }
      patch.fecha = fecha
    }
    if (input.estado !== undefined) {
      if (!ESTADOS_ETAPA.some(e => e.id === input.estado)) return { ok: false, error: 'Estado no válido' }
      patch.estado = input.estado
    }

    if (input.ciudad !== undefined) patch.ciudad = txt(input.ciudad)
    if (input.ciudadConfirmada !== undefined) patch.ciudad_confirmada = input.ciudadConfirmada === true
    if (input.hora !== undefined) patch.hora = txt(input.hora)
    if (input.puntoEncuentro !== undefined) patch.punto_encuentro = txt(input.puntoEncuentro)
    if (input.lat !== undefined) patch.lat = numONull(input.lat)
    if (input.lng !== undefined) patch.lng = numONull(input.lng)
    if (input.burflips !== undefined) patch.burflips = entONull(input.burflips)
    if (input.descripcion !== undefined) patch.descripcion = txt(input.descripcion)
    // Sin dato ⇒ null. Un 0 aquí sería un dato inventado.
    if (input.recaudado !== undefined) patch.recaudado = numONull(input.recaudado)
    if (input.asistentes !== undefined) patch.asistentes = entONull(input.asistentes)
    if (input.resumen !== undefined) patch.resumen = txt(input.resumen)
    if (input.galeria !== undefined) {
      patch.galeria = Array.isArray(input.galeria)
        ? input.galeria.map(u => String(u).trim()).filter(Boolean)
        : []
    }
    if (input.videoUrl !== undefined) patch.video_url = txt(input.videoUrl)
    if (input.enlaceRedes !== undefined) patch.enlace_redes = txt(input.enlaceRedes)
    if (input.testimonios !== undefined) patch.testimonios = txt(input.testimonios)
    if (input.notasInternas !== undefined) patch.notas_internas = txt(input.notasInternas)

    if (Object.keys(patch).length === 0) return { ok: true }
    patch.updated_at = new Date().toISOString()

    const db = createAdminClient()
    const { error: e } = await db.from('reto50_etapas').update(patch).eq('id', input.id)
    if (e) {
      return {
        ok: false,
        error: e.message.includes('duplicate') ? 'Ya existe otra etapa con ese día.' : e.message,
      }
    }

    await logActivity({
      actorEmail: admin.email,
      accion: 'Editó etapa (50 días, 50 provincias)',
      entidad: 'reto50_etapa',
      entidadId: input.id,
      detalle: txt(input.provincia) ?? undefined,
    })
    revalidar()
    return { ok: true }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Error al guardar la etapa' }
  }
}

/** Marca esta etapa como próxima parada y quita el distintivo de las demás. */
export async function marcarProximaParada(id: string): Promise<Res> {
  try {
    const { admin, error } = await exigir()
    if (!admin) return { ok: false, error }
    if (esSeed(id)) return { ok: false, error: MSG_SEED }

    const db = createAdminClient()
    // Las demás que estuvieran marcadas vuelven a "Próximamente".
    const { error: e1 } = await db
      .from('reto50_etapas')
      .update({ estado: 'proximamente', updated_at: new Date().toISOString() })
      .eq('estado', 'proxima')
      .neq('id', id)
    if (e1) return { ok: false, error: e1.message }

    const { error: e2 } = await db
      .from('reto50_etapas')
      .update({ estado: 'proxima', updated_at: new Date().toISOString() })
      .eq('id', id)
    if (e2) return { ok: false, error: e2.message }

    await logActivity({
      actorEmail: admin.email,
      accion: 'Marcó la próxima parada (50 días, 50 provincias)',
      entidad: 'reto50_etapa',
      entidadId: id,
    })
    revalidar()
    return { ok: true }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Error al marcar la próxima parada' }
  }
}

// ── Patrocinadores ───────────────────────────────────────────────────────────

export type PatrocinadorInput = {
  id?: string
  nombre: string
  descripcion?: string
  logoUrl?: string
  webUrl?: string
  nivel?: string
  orden?: number | string
  activo?: boolean
  destacado?: boolean
}

export async function guardarPatrocinador(input: PatrocinadorInput): Promise<Res> {
  try {
    const { admin, error } = await exigir()
    if (!admin) return { ok: false, error }
    if (input.id && esSeed(input.id)) return { ok: false, error: MSG_SEED }
    if (!input.nombre?.trim()) return { ok: false, error: 'El nombre es obligatorio' }

    const nivel = input.nivel && NIVELES_PATROCINIO.some(n => n.id === input.nivel) ? input.nivel : 'colaborador'
    const row = {
      nombre: input.nombre.trim(),
      descripcion: txt(input.descripcion),
      logo_url: txt(input.logoUrl),
      web_url: txt(input.webUrl),
      nivel,
      orden: entONull(input.orden) ?? 0,
      activo: input.activo !== false,
      destacado: input.destacado === true,
      updated_at: new Date().toISOString(),
    }

    const db = createAdminClient()
    const { error: e } = input.id
      ? await db.from('reto50_patrocinadores').update(row).eq('id', input.id)
      : await db.from('reto50_patrocinadores').insert(row)
    if (e) return { ok: false, error: e.message }

    await logActivity({
      actorEmail: admin.email,
      accion: input.id ? 'Editó patrocinador (50 días, 50 provincias)' : 'Añadió patrocinador (50 días, 50 provincias)',
      entidad: 'reto50_patrocinador',
      entidadId: input.id,
      detalle: row.nombre,
    })
    revalidar()
    return { ok: true }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Error al guardar el patrocinador' }
  }
}

export async function eliminarPatrocinador(id: string): Promise<Res> {
  try {
    const { admin, error } = await exigir()
    if (!admin) return { ok: false, error }
    if (esSeed(id)) return { ok: false, error: MSG_SEED }

    const db = createAdminClient()
    const { error: e } = await db.from('reto50_patrocinadores').delete().eq('id', id)
    if (e) return { ok: false, error: e.message }

    await logActivity({
      actorEmail: admin.email,
      accion: 'Eliminó patrocinador (50 días, 50 provincias)',
      entidad: 'reto50_patrocinador',
      entidadId: id,
    })
    revalidar()
    return { ok: true }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Error al eliminar el patrocinador' }
  }
}

/**
 * Sube o baja un patrocinador una posición.
 * Reasigna `orden` a toda la lista (1..n): así queda coherente aunque los
 * valores vinieran duplicados o a 0.
 */
export async function reordenarPatrocinador(id: string, direccion: 'subir' | 'bajar'): Promise<Res> {
  try {
    const { admin, error } = await exigir()
    if (!admin) return { ok: false, error }
    if (esSeed(id)) return { ok: false, error: MSG_SEED }

    const db = createAdminClient()
    const { data, error: eSel } = await db.from('reto50_patrocinadores').select('id, nombre, orden')
    if (eSel) return { ok: false, error: eSel.message }

    const lista = ((data ?? []) as { id: string; nombre: string; orden: number | null }[])
      .slice()
      .sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0) || String(a.nombre).localeCompare(String(b.nombre), 'es'))

    const i = lista.findIndex(p => p.id === id)
    if (i === -1) return { ok: false, error: 'Patrocinador no encontrado' }
    const j = direccion === 'subir' ? i - 1 : i + 1
    if (j < 0 || j >= lista.length) return { ok: true } // ya está en el extremo

    ;[lista[i], lista[j]] = [lista[j], lista[i]]

    for (let k = 0; k < lista.length; k++) {
      const { error: eUpd } = await db.from('reto50_patrocinadores').update({ orden: k + 1 }).eq('id', lista[k].id)
      if (eUpd) return { ok: false, error: eUpd.message }
    }

    await logActivity({
      actorEmail: admin.email,
      accion: 'Reordenó patrocinadores (50 días, 50 provincias)',
      entidad: 'reto50_patrocinador',
      entidadId: id,
    })
    revalidar()
    return { ok: true }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Error al reordenar' }
  }
}

// ── Preguntas frecuentes ─────────────────────────────────────────────────────

export type FaqInput = {
  id?: string
  pregunta: string
  respuesta: string
  orden?: number | string
  activo?: boolean
}

export async function guardarFaq(input: FaqInput): Promise<Res> {
  try {
    const { admin, error } = await exigir()
    if (!admin) return { ok: false, error }
    if (input.id && esSeed(input.id)) return { ok: false, error: MSG_SEED }
    if (!input.pregunta?.trim()) return { ok: false, error: 'La pregunta es obligatoria' }
    if (!input.respuesta?.trim()) return { ok: false, error: 'La respuesta es obligatoria' }

    const row = {
      pregunta: input.pregunta.trim(),
      respuesta: input.respuesta.trim(),
      orden: entONull(input.orden) ?? 0,
      activo: input.activo !== false,
      updated_at: new Date().toISOString(),
    }

    const db = createAdminClient()
    const { error: e } = input.id
      ? await db.from('reto50_faq').update(row).eq('id', input.id)
      : await db.from('reto50_faq').insert(row)
    if (e) return { ok: false, error: e.message }

    await logActivity({
      actorEmail: admin.email,
      accion: input.id ? 'Editó una FAQ (50 días, 50 provincias)' : 'Añadió una FAQ (50 días, 50 provincias)',
      entidad: 'reto50_faq',
      entidadId: input.id,
      detalle: row.pregunta,
    })
    revalidar()
    return { ok: true }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Error al guardar la pregunta' }
  }
}

export async function eliminarFaq(id: string): Promise<Res> {
  try {
    const { admin, error } = await exigir()
    if (!admin) return { ok: false, error }
    if (esSeed(id)) return { ok: false, error: MSG_SEED }

    const db = createAdminClient()
    const { error: e } = await db.from('reto50_faq').delete().eq('id', id)
    if (e) return { ok: false, error: e.message }

    await logActivity({
      actorEmail: admin.email,
      accion: 'Eliminó una FAQ (50 días, 50 provincias)',
      entidad: 'reto50_faq',
      entidadId: id,
    })
    revalidar()
    return { ok: true }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Error al eliminar la pregunta' }
  }
}

/** Sube o baja una pregunta una posición (reasigna `orden` a toda la lista). */
export async function reordenarFaq(id: string, direccion: 'subir' | 'bajar'): Promise<Res> {
  try {
    const { admin, error } = await exigir()
    if (!admin) return { ok: false, error }
    if (esSeed(id)) return { ok: false, error: MSG_SEED }

    const db = createAdminClient()
    const { data, error: eSel } = await db.from('reto50_faq').select('id, orden')
    if (eSel) return { ok: false, error: eSel.message }

    const lista = ((data ?? []) as { id: string; orden: number | null }[])
      .slice()
      .sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0))

    const i = lista.findIndex(f => f.id === id)
    if (i === -1) return { ok: false, error: 'Pregunta no encontrada' }
    const j = direccion === 'subir' ? i - 1 : i + 1
    if (j < 0 || j >= lista.length) return { ok: true }

    ;[lista[i], lista[j]] = [lista[j], lista[i]]

    for (let k = 0; k < lista.length; k++) {
      const { error: eUpd } = await db.from('reto50_faq').update({ orden: k + 1 }).eq('id', lista[k].id)
      if (eUpd) return { ok: false, error: eUpd.message }
    }

    revalidar()
    return { ok: true }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Error al reordenar' }
  }
}

// ── Configuración (textos, imágenes y enlaces) ────────────────────────────────

/** Upsert de una clave de reto50_config. Solo acepta claves de CLAVES_CONFIG. */
export async function guardarConfig(clave: string, valor: string): Promise<Res> {
  try {
    const { admin, error } = await exigir()
    if (!admin) return { ok: false, error }
    if (!(CLAVES_CONFIG as readonly string[]).includes(clave)) {
      return { ok: false, error: `Clave de configuración no válida: ${clave}` }
    }

    const db = createAdminClient()
    const { error: e } = await db.from('reto50_config').upsert(
      { clave, valor: valor ?? '', updated_at: new Date().toISOString(), updated_by: admin.email },
      { onConflict: 'clave' },
    )
    if (e) return { ok: false, error: e.message }

    await logActivity({
      actorEmail: admin.email,
      accion: 'Editó la configuración (50 días, 50 provincias)',
      entidad: 'reto50_config',
      entidadId: clave,
      detalle: clave,
    })
    revalidar()
    return { ok: true }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Error al guardar la configuración' }
  }
}
