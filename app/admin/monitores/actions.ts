'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { getAdminUser, can, logActivity } from '@/lib/admin/auth'
import { getMonitorPorEmail, getFichajeAbierto } from '@/lib/monitores/data'
import { tipoDocumento, CARPETAS_DEFAULT } from '@/lib/monitores/constants'

type Res = { ok: true } | { ok: false; error: string }

// ── Monitores (alta/edición/baja) ──────────────────────────────────────────────
export async function crearMonitor(p: {
  email: string; nombre: string; apellidos?: string; telefono?: string; fecha_alta?: string | null
  especialidades?: string[]; estado?: string; observaciones?: string
}): Promise<Res> {
  const admin = await getAdminUser()
  if (!admin || !can.manageUsers(admin.role)) return { ok: false, error: 'Solo el administrador principal puede dar de alta monitores' }
  const email = p.email.trim().toLowerCase()
  if (!email) return { ok: false, error: 'El correo es obligatorio' }

  const db = createAdminClient()
  const { error } = await db.from('monitores').insert({
    email, nombre: p.nombre.trim(), apellidos: (p.apellidos || '').trim(), telefono: (p.telefono || '').trim() || null,
    fecha_alta: p.fecha_alta || null, especialidades: p.especialidades ?? [], estado: p.estado || 'activo',
    observaciones: (p.observaciones || '').trim() || null,
  })
  if (error) return { ok: false, error: error.message.includes('duplicate') ? 'Ya existe un monitor con ese correo.' : error.message }

  // Acceso al portal: alta en admin_users con rol monitor (si no existe ya).
  const { data: existe } = await db.from('admin_users').select('id').eq('email', email).maybeSingle()
  if (!existe) {
    await db.from('admin_users').insert({ email, nombre: p.nombre.trim() || null, role: 'monitor', secciones: ['monitores'], invited_by: admin.email, activo: true })
  }
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
