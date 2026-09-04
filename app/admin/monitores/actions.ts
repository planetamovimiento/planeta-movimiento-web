'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { getAdminUser, can, logActivity } from '@/lib/admin/auth'
import { getMonitorPorEmail, getFichajeAbierto } from '@/lib/monitores/data'
import { tipoDocumento, CARPETAS_DEFAULT } from '@/lib/monitores/constants'

type Res = { ok: true } | { ok: false; error: string }

/**
 * Garantiza que el correo tenga acceso de MONITOR (rol monitor + solo sección
 * "monitores"). Si no existe en admin_users lo crea; si existía como "lectura" (u
 * otro) lo corrige a monitor. No toca a un principal/gestor (no se le degrada).
 */
async function asegurarAccesoMonitor(db: ReturnType<typeof createAdminClient>, email: string, nombre: string, invitedBy: string) {
  const e = email.trim().toLowerCase()
  if (!e) return
  const { data: existe } = await db.from('admin_users').select('id, role').eq('email', e).maybeSingle()
  if (!existe) {
    await db.from('admin_users').insert({ email: e, nombre: nombre || null, role: 'monitor', secciones: ['monitores'], invited_by: invitedBy, activo: true })
  } else if (existe.role !== 'principal' && existe.role !== 'gestor') {
    await db.from('admin_users').update({ role: 'monitor', secciones: ['monitores'], activo: true }).eq('email', e)
  }
}

// ── Monitores (alta/edición/baja) ──────────────────────────────────────────────
export async function crearMonitor(p: {
  email: string; nombre: string; apellidos?: string; telefono?: string; fecha_alta?: string | null
  especialidades?: string[]; estado?: string; observaciones?: string
  fecha_nacimiento?: string | null; num_seguridad_social?: string; dni_numero?: string
}): Promise<Res> {
  const admin = await getAdminUser()
  if (!admin || !can.manageUsers(admin.role)) return { ok: false, error: 'Solo el administrador principal puede dar de alta monitores' }
  const email = p.email.trim().toLowerCase()
  if (!email) return { ok: false, error: 'El correo es obligatorio' }

  const db = createAdminClient()
  const { data: creado, error } = await db.from('monitores').insert({
    email, nombre: p.nombre.trim(), apellidos: (p.apellidos || '').trim(), telefono: (p.telefono || '').trim() || null,
    fecha_alta: p.fecha_alta || null, especialidades: p.especialidades ?? [], estado: p.estado || 'activo',
    observaciones: (p.observaciones || '').trim() || null,
    fecha_nacimiento: p.fecha_nacimiento || null,
    num_seguridad_social: (p.num_seguridad_social || '').trim() || null,
    dni_numero: (p.dni_numero || '').trim() || null,
  }).select('id').maybeSingle()
  if (error) return { ok: false, error: error.message.includes('duplicate') ? 'Ya existe un monitor con ese correo.' : error.message }

  // El alta inicial queda también en el historial de altas y bajas.
  if (creado?.id && p.fecha_alta) {
    await db.from('monitor_movimientos').insert({
      monitor_id: creado.id, tipo: 'alta', fecha: p.fecha_alta, motivo: 'Alta inicial', registrado_por: admin.email,
    })
  }

  // Acceso al portal: queda con rol monitor (aunque el correo ya existiera como lectura).
  await asegurarAccesoMonitor(db, email, p.nombre.trim(), admin.email)
  await logActivity({ actorEmail: admin.email, accion: 'Alta de monitor', entidad: 'monitor', entidadId: email })
  revalidatePath('/admin/monitores')
  return { ok: true }
}

export async function editarMonitor(id: string, patch: Record<string, unknown>): Promise<Res> {
  const admin = await getAdminUser()
  if (!admin || !can.edit(admin.role)) return { ok: false, error: 'Sin permisos' }
  const db = createAdminClient()
  const { error } = await db.from('monitores').update({ ...patch, updated_at: new Date().toISOString() }).eq('id', id)
  if (error) return { ok: false, error: error.message }
  // Reasegura el acceso de monitor (repara fichas que quedaron como "lectura").
  const { data: mon } = await db.from('monitores').select('email, nombre').eq('id', id).maybeSingle()
  if (mon?.email) await asegurarAccesoMonitor(db, String(mon.email), String(mon.nombre ?? ''), admin.email)
  revalidatePath('/admin/monitores')
  return { ok: true }
}

export async function eliminarMonitor(id: string, email: string): Promise<Res> {
  const admin = await getAdminUser()
  if (!admin || !can.manageUsers(admin.role)) return { ok: false, error: 'Solo el administrador principal puede eliminar monitores' }
  const db = createAdminClient()
  await db.from('monitores').delete().eq('id', id)            // cascade: actividades + fichajes
  await db.from('admin_users').delete().eq('email', email.trim().toLowerCase()).eq('role', 'monitor')
  await logActivity({ actorEmail: admin.email, accion: 'Eliminó monitor', entidad: 'monitor', entidadId: email })
  revalidatePath('/admin/monitores')
  return { ok: true }
}

// ── Historial de altas y bajas ─────────────────────────────────────────────────

/**
 * Registra un alta o una baja del monitor. Guarda la fila del historial y deja
 * la ficha al día: fecha_alta/fecha_baja y el estado (activo tras un alta,
 * inactivo tras una baja).
 */
export async function registrarMovimiento(p: {
  monitor_id: string; tipo: 'alta' | 'baja'; fecha: string; motivo?: string
}): Promise<Res> {
  const admin = await getAdminUser()
  if (!admin || !can.edit(admin.role)) return { ok: false, error: 'Sin permisos' }
  if (!p.monitor_id || !p.fecha) return { ok: false, error: 'Faltan el monitor y la fecha' }
  if (p.tipo !== 'alta' && p.tipo !== 'baja') return { ok: false, error: 'Tipo no válido' }

  const db = createAdminClient()
  const { error } = await db.from('monitor_movimientos').insert({
    monitor_id: p.monitor_id, tipo: p.tipo, fecha: p.fecha,
    motivo: (p.motivo || '').trim() || null, registrado_por: admin.email,
  })
  if (error) return { ok: false, error: error.message }

  await db.from('monitores').update(
    p.tipo === 'alta'
      ? { fecha_alta: p.fecha, estado: 'activo', updated_at: new Date().toISOString() }
      : { fecha_baja: p.fecha, estado: 'inactivo', updated_at: new Date().toISOString() },
  ).eq('id', p.monitor_id)

  await logActivity({
    actorEmail: admin.email,
    accion: p.tipo === 'alta' ? 'Registró alta de monitor' : 'Registró baja de monitor',
    entidad: 'monitor', entidadId: p.monitor_id,
  })
  revalidatePath('/admin/monitores')
  return { ok: true }
}

/** Borra una línea del historial (solo para corregir errores de registro). */
export async function eliminarMovimiento(id: string): Promise<Res> {
  const admin = await getAdminUser()
  if (!admin || !can.edit(admin.role)) return { ok: false, error: 'Sin permisos' }
  const db = createAdminClient()
  const { error } = await db.from('monitor_movimientos').delete().eq('id', id)
  if (error) return { ok: false, error: error.message }
  revalidatePath('/admin/monitores')
  return { ok: true }
}

// ── Documentación del monitor (DNI) · bucket PRIVADO "monitores-docs" ──────────
// Nunca se guarda una URL pública: en la BD va la ruta del archivo y se ve o se
// descarga con un enlace firmado de 60 segundos que genera el servidor.
const BUCKET_DOCS = 'monitores-docs'
const CARAS_DNI = { frente: 'dni_frente_path', reverso: 'dni_reverso_path' } as const
export type CaraDni = keyof typeof CARAS_DNI

export async function subirDniMonitor(formData: FormData): Promise<{ ok: true; path: string } | { ok: false; error: string }> {
  const admin = await getAdminUser()
  if (!admin || !can.edit(admin.role)) return { ok: false, error: 'Sin permisos' }
  const monitorId = String(formData.get('monitorId') || '')
  const cara = String(formData.get('cara') || '') as CaraDni
  const file = formData.get('file') as File | null
  if (!monitorId) return { ok: false, error: 'Monitor no válido' }
  if (!CARAS_DNI[cara]) return { ok: false, error: 'Cara del DNI no válida' }
  if (!file || file.size === 0) return { ok: false, error: 'No se ha seleccionado ningún archivo' }
  if (file.size > 15 * 1024 * 1024) return { ok: false, error: 'El archivo supera los 15 MB' }
  if (!['image/jpeg', 'image/png', 'image/webp', 'application/pdf'].includes(file.type)) {
    return { ok: false, error: 'Formato no válido (usa JPG, PNG, WebP o PDF)' }
  }

  const db = createAdminClient()
  const ext = file.type === 'application/pdf' ? 'pdf' : (file.type.split('/')[1] || 'jpg')
  const path = `${monitorId}/dni-${cara}-${Date.now()}.${ext}`
  const buffer = Buffer.from(await file.arrayBuffer())
  const { error: upErr } = await db.storage.from(BUCKET_DOCS).upload(path, buffer, { contentType: file.type, upsert: true })
  if (upErr) return { ok: false, error: `No se pudo subir: ${upErr.message}` }

  // Se borra el archivo anterior de esa cara para no acumular copias del DNI.
  const { data: prev } = await db.from('monitores').select(CARAS_DNI[cara]).eq('id', monitorId).maybeSingle()
  const anterior = (prev as Record<string, unknown> | null)?.[CARAS_DNI[cara]]
  if (typeof anterior === 'string' && anterior && anterior !== path) {
    await db.storage.from(BUCKET_DOCS).remove([anterior])
  }

  const { error } = await db.from('monitores').update({ [CARAS_DNI[cara]]: path, updated_at: new Date().toISOString() }).eq('id', monitorId)
  if (error) return { ok: false, error: error.message }
  await logActivity({ actorEmail: admin.email, accion: `Subió el DNI (${cara}) de un monitor`, entidad: 'monitor', entidadId: monitorId })
  revalidatePath('/admin/monitores')
  return { ok: true, path }
}

/** Enlace firmado (60 s) para ver o descargar el DNI guardado. */
export async function urlDniMonitor(monitorId: string, cara: CaraDni, descargar = false): Promise<{ ok: true; url: string } | { ok: false; error: string }> {
  const admin = await getAdminUser()
  if (!admin || !can.edit(admin.role)) return { ok: false, error: 'Sin permisos' }
  if (!CARAS_DNI[cara]) return { ok: false, error: 'Cara del DNI no válida' }
  const db = createAdminClient()
  const { data } = await db.from('monitores').select(CARAS_DNI[cara]).eq('id', monitorId).maybeSingle()
  const path = (data as Record<string, unknown> | null)?.[CARAS_DNI[cara]]
  if (typeof path !== 'string' || !path) return { ok: false, error: 'Este monitor no tiene guardada esa cara del DNI' }
  const { data: firmada, error } = await db.storage.from(BUCKET_DOCS)
    .createSignedUrl(path, 60, descargar ? { download: `dni-${cara}.${path.split('.').pop()}` } : undefined)
  if (error || !firmada?.signedUrl) return { ok: false, error: error?.message || 'No se pudo generar el enlace' }
  return { ok: true, url: firmada.signedUrl }
}

export async function eliminarDniMonitor(monitorId: string, cara: CaraDni): Promise<Res> {
  const admin = await getAdminUser()
  if (!admin || !can.edit(admin.role)) return { ok: false, error: 'Sin permisos' }
  if (!CARAS_DNI[cara]) return { ok: false, error: 'Cara del DNI no válida' }
  const db = createAdminClient()
  const { data } = await db.from('monitores').select(CARAS_DNI[cara]).eq('id', monitorId).maybeSingle()
  const path = (data as Record<string, unknown> | null)?.[CARAS_DNI[cara]]
  if (typeof path === 'string' && path) await db.storage.from(BUCKET_DOCS).remove([path])
  const { error } = await db.from('monitores').update({ [CARAS_DNI[cara]]: null, updated_at: new Date().toISOString() }).eq('id', monitorId)
  if (error) return { ok: false, error: error.message }
  await logActivity({ actorEmail: admin.email, accion: `Eliminó el DNI (${cara}) de un monitor`, entidad: 'monitor', entidadId: monitorId })
  revalidatePath('/admin/monitores')
  return { ok: true }
}

// ── Actividades (calendario de trabajo) ────────────────────────────────────────

/** Fechas semanales desde `desde` hasta `hasta` (ambas incl.), máx. 60 repeticiones. */
function fechasSemanales(desde: string, hasta: string): string[] {
  const out: string[] = []
  let d = new Date(desde + 'T12:00:00Z')
  const fin = new Date(hasta + 'T12:00:00Z')
  let guard = 0
  while (d <= fin && guard < 60) {
    out.push(d.toISOString().slice(0, 10))
    d = new Date(d.getTime() + 7 * 86_400_000)
    guard++
  }
  return out
}

export async function asignarActividad(p: {
  monitor_id: string; fecha: string; hora_inicio?: string; hora_fin?: string
  actividad?: string; lugar?: string; grupo?: string; observaciones?: string
  /** Si se indica (YYYY-MM-DD > fecha), crea una copia semanal hasta esa fecha. */
  repetir_hasta?: string
}): Promise<{ ok: true; creadas: number } | { ok: false; error: string }> {
  const admin = await getAdminUser()
  if (!admin || !can.edit(admin.role)) return { ok: false, error: 'Sin permisos' }
  if (!p.monitor_id || !p.fecha) return { ok: false, error: 'Faltan monitor y fecha' }

  const fechas = p.repetir_hasta && p.repetir_hasta > p.fecha
    ? fechasSemanales(p.fecha, p.repetir_hasta)
    : [p.fecha]

  const base = {
    monitor_id: p.monitor_id, hora_inicio: p.hora_inicio || null, hora_fin: p.hora_fin || null,
    actividad: p.actividad || null, lugar: p.lugar || null, grupo: p.grupo || null, observaciones: p.observaciones || null,
  }
  const db = createAdminClient()
  const { error } = await db.from('monitor_actividades').insert(fechas.map(fecha => ({ ...base, fecha })))
  if (error) return { ok: false, error: error.message }
  revalidatePath('/admin/monitores')
  return { ok: true, creadas: fechas.length }
}

export async function editarActividad(id: string, patch: {
  fecha?: string; hora_inicio?: string; hora_fin?: string
  actividad?: string; lugar?: string; grupo?: string; observaciones?: string
}): Promise<Res> {
  const admin = await getAdminUser()
  if (!admin || !can.edit(admin.role)) return { ok: false, error: 'Sin permisos' }
  if (patch.fecha === '') return { ok: false, error: 'La fecha es obligatoria' }
  const db = createAdminClient()
  const { error } = await db.from('monitor_actividades').update({
    ...(patch.fecha !== undefined ? { fecha: patch.fecha } : {}),
    hora_inicio: patch.hora_inicio || null, hora_fin: patch.hora_fin || null,
    actividad: patch.actividad || null, lugar: patch.lugar || null,
    grupo: patch.grupo || null, observaciones: patch.observaciones || null,
  }).eq('id', id)
  if (error) return { ok: false, error: error.message }
  revalidatePath('/admin/monitores')
  return { ok: true }
}

export async function eliminarActividad(id: string): Promise<Res> {
  const admin = await getAdminUser()
  if (!admin || !can.edit(admin.role)) return { ok: false, error: 'Sin permisos' }
  const db = createAdminClient()
  const { error } = await db.from('monitor_actividades').delete().eq('id', id)
  if (error) return { ok: false, error: error.message }
  revalidatePath('/admin/monitores')
  return { ok: true }
}

// ── Fichaje (lo hace el propio monitor) ────────────────────────────────────────
export async function ficharEntrada(): Promise<Res> {
  const admin = await getAdminUser()
  if (!admin) return { ok: false, error: 'Sin sesión' }
  const mon = await getMonitorPorEmail(admin.email)
  if (!mon) return { ok: false, error: 'Tu cuenta no está vinculada a una ficha de monitor' }
  if (await getFichajeAbierto(mon.id)) return { ok: false, error: 'Ya tienes una jornada abierta' }
  const db = createAdminClient()
  const now = new Date()
  const { error } = await db.from('monitor_fichajes').insert({ monitor_id: mon.id, fecha: now.toISOString().slice(0, 10), entrada: now.toISOString() })
  if (error) return { ok: false, error: error.message }
  revalidatePath('/admin/monitores')
  return { ok: true }
}

export async function ficharSalida(): Promise<Res> {
  const admin = await getAdminUser()
  if (!admin) return { ok: false, error: 'Sin sesión' }
  const mon = await getMonitorPorEmail(admin.email)
  if (!mon) return { ok: false, error: 'Tu cuenta no está vinculada a una ficha de monitor' }
  const abierto = await getFichajeAbierto(mon.id)
  if (!abierto) return { ok: false, error: 'No tienes ninguna jornada abierta' }
  const db = createAdminClient()
  const { error } = await db.from('monitor_fichajes').update({ salida: new Date().toISOString() }).eq('id', abierto.id)
  if (error) return { ok: false, error: error.message }
  revalidatePath('/admin/monitores')
  return { ok: true }
}

// ── Recursos (carpetas + documentos) ───────────────────────────────────────────
const EXT_OK = new Set(['pdf', 'doc', 'docx', 'xls', 'xlsx', 'csv', 'ppt', 'pptx', 'png', 'jpg', 'jpeg', 'webp', 'gif', 'avif', 'mp4', 'mov', 'webm'])

export async function sembrarCarpetasDefecto(): Promise<Res> {
  const admin = await getAdminUser()
  if (!admin || !can.edit(admin.role)) return { ok: false, error: 'Sin permisos' }
  const db = createAdminClient()
  const { data } = await db.from('recursos_carpetas').select('id').limit(1)
  if (data && data.length > 0) return { ok: false, error: 'Ya existen carpetas' }
  await db.from('recursos_carpetas').insert(CARPETAS_DEFAULT.map((nombre, i) => ({ nombre, orden: i })))
  revalidatePath('/admin/monitores')
  return { ok: true }
}

export async function crearCarpeta(nombre: string): Promise<Res> {
  const admin = await getAdminUser()
  if (!admin || !can.edit(admin.role)) return { ok: false, error: 'Sin permisos' }
  if (!nombre.trim()) return { ok: false, error: 'El nombre es obligatorio' }
  const db = createAdminClient()
  const { error } = await db.from('recursos_carpetas').insert({ nombre: nombre.trim(), orden: 99 })
  if (error) return { ok: false, error: error.message }
  revalidatePath('/admin/monitores')
  return { ok: true }
}

export async function eliminarCarpeta(id: string): Promise<Res> {
  const admin = await getAdminUser()
  if (!admin || !can.edit(admin.role)) return { ok: false, error: 'Sin permisos' }
  const db = createAdminClient()
  const { error } = await db.from('recursos_carpetas').delete().eq('id', id)  // cascade documentos
  if (error) return { ok: false, error: error.message }
  revalidatePath('/admin/monitores')
  return { ok: true }
}

export async function subirDocumento(formData: FormData): Promise<Res> {
  const admin = await getAdminUser()
  if (!admin || !can.edit(admin.role)) return { ok: false, error: 'Sin permisos' }
  const carpetaId = String(formData.get('carpetaId') || '')
  const file = formData.get('file') as File | null
  if (!carpetaId) return { ok: false, error: 'Carpeta no válida' }
  if (!file || file.size === 0) return { ok: false, error: 'No se ha seleccionado ningún archivo' }
  if (file.size > 50 * 1024 * 1024) return { ok: false, error: 'El archivo supera los 50 MB' }
  const ext = (file.name.split('.').pop() || '').toLowerCase()
  if (!EXT_OK.has(ext)) return { ok: false, error: 'Formato no permitido' }

  const db = createAdminClient()
  const base = file.name.replace(/\.[^.]+$/, '').toLowerCase().normalize('NFD').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 50)
  const path = `${carpetaId}/${base || 'doc'}-${Date.now()}.${ext}`
  const buffer = Buffer.from(await file.arrayBuffer())
  const { error: upErr } = await db.storage.from('recursos').upload(path, buffer, { contentType: file.type || 'application/octet-stream', upsert: true })
  if (upErr) return { ok: false, error: `No se pudo subir: ${upErr.message}` }
  const { data: pub } = db.storage.from('recursos').getPublicUrl(path)

  const { error } = await db.from('recursos_documentos').insert({
    carpeta_id: carpetaId, nombre: file.name, tipo: tipoDocumento(file.name, file.type),
    url: pub.publicUrl, tamano: file.size, subido_por: admin.email,
  })
  if (error) return { ok: false, error: error.message }
  await logActivity({ actorEmail: admin.email, accion: `Subió documento "${file.name}"`, entidad: 'recurso', entidadId: carpetaId })
  revalidatePath('/admin/monitores')
  return { ok: true }
}

export async function eliminarDocumento(id: string): Promise<Res> {
  const admin = await getAdminUser()
  if (!admin || !can.edit(admin.role)) return { ok: false, error: 'Sin permisos' }
  const db = createAdminClient()
  const { error } = await db.from('recursos_documentos').delete().eq('id', id)
  if (error) return { ok: false, error: error.message }
  revalidatePath('/admin/monitores')
  return { ok: true }
}
