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
import { CLAVES_CONFIG, ESTADOS_ETAPA, NIVELES_PATROCINIO, esYoutubeValido, type EstadoEtapa } from '@/lib/reto50/constants'

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
  'Estos son los datos oficiales de respaldo, todavía no están en la base de datos. ' +
  'Ejecuta supabase/migration_reto50.sql y supabase/migration_reto50_donaciones.sql ' +
  'en Supabase para poder guardar cambios.'

/** Las filas de respaldo (id 'seed-…') no existen en la base de datos. */
const esSeed = (id: string) => !id || id.startsWith('seed-')

// ── Etapas ───────────────────────────────────────────────────────────────────

export type EtapaInput = {
  id: string
  dia?: number | string
  provincia?: string
  ciudad?: string
  fecha?: string
  hora?: string
  puntoEncuentro?: string
  burflips?: number | string
  estado?: EstadoEtapa
  recaudado?: number | string | null
  asistentes?: number | string | null
  galeria?: string[]
  videoUrl?: string
  videoTitulo?: string
  videoDescripcion?: string
  videoMiniatura?: string
  videoFecha?: string
  enlaceRedes?: string
  testimonios?: string
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
    if (input.hora !== undefined) patch.hora = txt(input.hora)
    if (input.puntoEncuentro !== undefined) patch.punto_encuentro = txt(input.puntoEncuentro)
    if (input.burflips !== undefined) patch.burflips = entONull(input.burflips)
    // Sin dato ⇒ null. Un 0 aquí sería un dato inventado.
    if (input.recaudado !== undefined) patch.recaudado = numONull(input.recaudado)
    if (input.asistentes !== undefined) patch.asistentes = entONull(input.asistentes)
    if (input.galeria !== undefined) {
      patch.galeria = Array.isArray(input.galeria)
        ? input.galeria.map(u => String(u).trim()).filter(Boolean)
        : []
    }
    if (input.videoUrl !== undefined) {
      const url = txt(input.videoUrl)
      // Se rechaza aquí también, no solo en el formulario: si no se puede
      // reproducir, mejor no guardarlo que dejar un vídeo roto en la web.
      if (url && !esYoutubeValido(url)) {
        return { ok: false, error: 'El enlace de vídeo no es de YouTube o no tiene un formato reconocible.' }
      }
      patch.video_url = url
    }
    if (input.videoTitulo !== undefined) patch.video_titulo = txt(input.videoTitulo)
    if (input.videoDescripcion !== undefined) patch.video_descripcion = txt(input.videoDescripcion)
    if (input.videoMiniatura !== undefined) patch.video_miniatura = txt(input.videoMiniatura)
    if (input.videoFecha !== undefined) patch.video_fecha = input.videoFecha || null
    if (input.enlaceRedes !== undefined) patch.enlace_redes = txt(input.enlaceRedes)
    if (input.testimonios !== undefined) patch.testimonios = txt(input.testimonios)

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

/**
 * Marca dónde está Brosjaca ahora. Solo puede haber una etapa actual, así que
 * la que lo estuviera deja de serlo: pasa a completada si se confirma y, si no,
 * vuelve a pendiente. Nada se completa solo por que la fecha haya pasado.
 */
export async function marcarEtapaActual(id: string, completarAnterior = false): Promise<Res> {
  try {
    const { admin, error } = await exigir()
    if (!admin) return { ok: false, error }
    if (esSeed(id)) return { ok: false, error: MSG_SEED }

    const db = createAdminClient()
    const ahora = new Date().toISOString()

    // La anterior deja de ser la actual: completada solo si se ha confirmado.
    const { error: e1 } = await db
      .from('reto50_etapas')
      .update({ estado: completarAnterior ? 'finalizada' : 'proximamente', updated_at: ahora })
      .eq('estado', 'en-curso')
      .neq('id', id)
    if (e1) return { ok: false, error: e1.message }

    const { error: e2 } = await db
      .from('reto50_etapas')
      .update({ estado: 'en-curso', updated_at: ahora })
      .eq('id', id)
    if (e2) return { ok: false, error: e2.message }

    await logActivity({
      actorEmail: admin.email,
      accion: 'Marcó la etapa actual (50 días, 50 provincias)',
      entidad: 'reto50_etapa',
      entidadId: id,
      detalle: completarAnterior ? 'La etapa anterior pasa a completada' : undefined,
    })
    revalidar()
    return { ok: true }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Error al marcar la etapa actual' }
  }
}

// ── Patrocinadores ───────────────────────────────────────────────────────────

export type PatrocinadorInput = {
  id?: string
  nombre: string
  descripcion?: string
  logoUrl?: string
  webUrl?: string
  /** patrocinador | colaborador */
  categoria?: string
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

    const nivel = input.nivel && NIVELES_PATROCINIO.some(n => n.id === input.nivel) ? input.nivel : 'apoyo'
    const categoria = input.categoria === 'colaborador' ? 'colaborador' : 'patrocinador'
    const row = {
      nombre: input.nombre.trim(),
      descripcion: txt(input.descripcion),
      logo_url: txt(input.logoUrl),
      web_url: txt(input.webUrl),
      categoria,
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
    const { data, error: eSel } = await db.from('reto50_patrocinadores').select('id, nombre, orden, categoria')
    if (eSel) return { ok: false, error: eSel.message }

    const todos = (data ?? []) as { id: string; nombre: string; orden: number | null; categoria: string | null }[]
    const cat = todos.find(p => p.id === id)?.categoria ?? 'patrocinador'

    // Se ordena solo dentro de su categoría: patrocinadores y colaboradores
    // son listas independientes y no deben pisarse entre ellas.
    const lista = todos
      .filter(p => (p.categoria ?? 'patrocinador') === cat)
      .sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0) || String(a.nombre).localeCompare(String(b.nombre), 'es'))

    const i = lista.findIndex(p => p.id === id)
    if (i === -1) return { ok: false, error: 'No se encuentra ese elemento' }
    const j = direccion === 'subir' ? i - 1 : i + 1
    if (j < 0 || j >= lista.length) return { ok: true } // ya está en el extremo

    ;[lista[i], lista[j]] = [lista[j], lista[i]]

    for (let k = 0; k < lista.length; k++) {
      const { error: eUpd } = await db.from('reto50_patrocinadores').update({ orden: k + 1 }).eq('id', lista[k].id)
      if (eUpd) return { ok: false, error: eUpd.message }
    }

    await logActivity({
      actorEmail: admin.email,
      accion: `Reordenó ${cat === 'colaborador' ? 'colaboradores' : 'patrocinadores'} (50 días, 50 provincias)`,
      entidad: 'reto50_patrocinador',
      entidadId: id,
    })
    revalidar()
    return { ok: true }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Error al reordenar' }
  }
}

// ── Códigos QR de donación ───────────────────────────────────────────────────

export type QrInput = {
  id?: string
  titulo: string
  descripcion?: string
  imagenUrl?: string
  enlaceUrl?: string
  activo?: boolean
  orden?: number | string
}

export async function guardarQr(input: QrInput): Promise<Res> {
  try {
    const { admin, error } = await exigir()
    if (!admin) return { ok: false, error }
    if (input.id && esSeed(input.id)) return { ok: false, error: MSG_SEED }
    if (!input.titulo?.trim()) return { ok: false, error: 'El título es obligatorio' }

    const row = {
      titulo: input.titulo.trim(),
      descripcion: txt(input.descripcion),
      imagen_url: txt(input.imagenUrl),
      enlace_url: txt(input.enlaceUrl),
      activo: input.activo !== false,
      orden: entONull(input.orden) ?? 0,
      updated_at: new Date().toISOString(),
    }

    const db = createAdminClient()
    const { error: e } = input.id
      ? await db.from('reto50_qr').update(row).eq('id', input.id)
      : await db.from('reto50_qr').insert(row)
    if (e) return { ok: false, error: e.message }

    await logActivity({
      actorEmail: admin.email,
      accion: input.id ? 'Editó un QR de donación (50 días)' : 'Añadió un QR de donación (50 días)',
      entidad: 'reto50_qr',
      entidadId: input.id,
      detalle: row.titulo,
    })
    revalidar()
    return { ok: true }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Error al guardar el QR' }
  }
}

export async function eliminarQr(id: string): Promise<Res> {
  try {
    const { admin, error } = await exigir()
    if (!admin) return { ok: false, error }
    if (esSeed(id)) return { ok: false, error: MSG_SEED }

    const db = createAdminClient()
    const { error: e } = await db.from('reto50_qr').delete().eq('id', id)
    if (e) return { ok: false, error: e.message }

    await logActivity({ actorEmail: admin.email, accion: 'Eliminó un QR de donación (50 días)', entidad: 'reto50_qr', entidadId: id })
    revalidar()
    return { ok: true }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Error al eliminar el QR' }
  }
}

export async function reordenarQr(id: string, direccion: 'subir' | 'bajar'): Promise<Res> {
  try {
    const { admin, error } = await exigir()
    if (!admin) return { ok: false, error }
    if (esSeed(id)) return { ok: false, error: MSG_SEED }

    const db = createAdminClient()
    const { data, error: e } = await db.from('reto50_qr').select('id, orden').order('orden', { ascending: true })
    if (e) return { ok: false, error: e.message }

    const lista = (data ?? []) as { id: string; orden: number }[]
    const i = lista.findIndex(q => q.id === id)
    if (i === -1) return { ok: false, error: 'No se encuentra ese QR' }
    const j = direccion === 'subir' ? i - 1 : i + 1
    if (j < 0 || j >= lista.length) return { ok: true }

    // Se reescribe el orden entero: así queda consistente aunque hubiera empates.
    const reordenada = [...lista]
    ;[reordenada[i], reordenada[j]] = [reordenada[j], reordenada[i]]
    for (let k = 0; k < reordenada.length; k++) {
      await db.from('reto50_qr').update({ orden: k + 1 }).eq('id', reordenada[k].id)
    }

    revalidar()
    return { ok: true }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Error al reordenar' }
  }
}

// ── Ranking de colaboradores de gasolina ─────────────────────────────────────

export type DonanteInput = {
  id?: string
  nombre: string
  importe?: number | string
  avatarUrl?: string
  fecha?: string
  /** Opt-in: si no está marcado, no sale en el ranking público. */
  publico?: boolean
  activo?: boolean
}

export async function guardarDonante(input: DonanteInput): Promise<Res> {
  try {
    const { admin, error } = await exigir()
    if (!admin) return { ok: false, error }
    if (input.id && esSeed(input.id)) return { ok: false, error: MSG_SEED }
    if (!input.nombre?.trim()) return { ok: false, error: 'El nombre o alias es obligatorio' }

    const importe = numONull(input.importe)
    if (importe == null) return { ok: false, error: 'El importe es obligatorio' }
    if (importe < 0) return { ok: false, error: 'El importe no puede ser negativo' }

    const row = {
      nombre: input.nombre.trim(),
      importe,
      avatar_url: txt(input.avatarUrl),
      fecha: input.fecha || null,
      publico: input.publico === true,
      activo: input.activo !== false,
      updated_at: new Date().toISOString(),
    }

    const db = createAdminClient()
    const { error: e } = input.id
      ? await db.from('reto50_donantes').update(row).eq('id', input.id)
      : await db.from('reto50_donantes').insert(row)
    if (e) return { ok: false, error: e.message }

    await logActivity({
      actorEmail: admin.email,
      accion: input.id ? 'Editó un colaborador de gasolina (50 días)' : 'Añadió un colaborador de gasolina (50 días)',
      entidad: 'reto50_donante',
      entidadId: input.id,
      detalle: `${row.nombre} · ${importe} €${row.publico ? '' : ' (no publicado)'}`,
    })
    revalidar()
    return { ok: true }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Error al guardar el colaborador' }
  }
}

export async function eliminarDonante(id: string): Promise<Res> {
  try {
    const { admin, error } = await exigir()
    if (!admin) return { ok: false, error }
    if (esSeed(id)) return { ok: false, error: MSG_SEED }

    const db = createAdminClient()
    const { error: e } = await db.from('reto50_donantes').delete().eq('id', id)
    if (e) return { ok: false, error: e.message }

    await logActivity({ actorEmail: admin.email, accion: 'Eliminó un colaborador de gasolina (50 días)', entidad: 'reto50_donante', entidadId: id })
    revalidar()
    return { ok: true }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Error al eliminar' }
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
