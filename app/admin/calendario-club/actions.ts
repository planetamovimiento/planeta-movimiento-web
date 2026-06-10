'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { getAdminUser, logActivity } from '@/lib/admin/auth'
import { puedeVerSeccion } from '@/lib/admin/secciones'
import type { Recurrencia } from '@/lib/calendario-club/tipos'

async function exigir(nivel: 'principal' | 'editar') {
  const admin = await getAdminUser()
  if (!admin) return { admin: null, error: 'Sin sesión' }
  if (!puedeVerSeccion(admin.role, admin.secciones, 'calendario-club')) return { admin: null, error: 'Sin acceso al Calendario Club' }
  if (nivel === 'principal' && admin.role !== 'principal') return { admin: null, error: 'Solo el administrador principal puede hacer esto' }
  if (nivel === 'editar' && admin.role === 'lectura') return { admin: null, error: 'No tienes permisos de edición' }
  return { admin, error: null as string | null }
}

const txt = (v?: string | null) => (typeof v === 'string' && v.trim() ? v.trim() : null)
const revalidar = () => revalidatePath('/admin/calendario-club')

export type EventoInput = {
  id?: string
  tipo: string
  titulo: string
  actividad?: string | null
  grupo?: string | null
  monitor?: string | null
  ubicacion?: string | null
  temporada?: string | null
  fecha: string
  fecha_fin?: string | null
  hora_inicio?: string | null
  hora_fin?: string | null
  todo_el_dia?: boolean
  recurrencia?: Recurrencia | null
  color?: string | null
  publico?: boolean
  descripcion?: string | null
  observaciones?: string | null
}

export async function guardarEvento(input: EventoInput) {
  const { admin, error: permErr } = await exigir('editar')
  if (!admin) return { ok: false, error: permErr }
  if (!input.titulo?.trim()) return { ok: false, error: 'El título es obligatorio' }
  if (!input.fecha) return { ok: false, error: 'La fecha es obligatoria' }

  const db = createAdminClient()
  const row = {
    tipo: input.tipo || 'evento',
    titulo: input.titulo.trim(),
    actividad: txt(input.actividad),
    grupo: txt(input.grupo),
    monitor: txt(input.monitor),
    ubicacion: txt(input.ubicacion),
    temporada: txt(input.temporada),
    fecha: input.fecha,
    fecha_fin: input.fecha_fin || null,
    hora_inicio: input.todo_el_dia ? null : (input.hora_inicio || null),
    hora_fin: input.todo_el_dia ? null : (input.hora_fin || null),
    todo_el_dia: !!input.todo_el_dia,
    recurrencia: input.recurrencia && input.recurrencia.dias?.length ? input.recurrencia : null,
    color: txt(input.color),
    publico: input.publico ?? true,
    descripcion: txt(input.descripcion),
    observaciones: txt(input.observaciones),
    updated_at: new Date().toISOString(),
    updated_by: admin.email,
  }

  const { error } = input.id
    ? await db.from('cc_eventos').update(row).eq('id', input.id)
    : await db.from('cc_eventos').insert({ ...row, estado: 'activo' })
  if (error) return { ok: false, error: error.message }

  await logActivity({ actorEmail: admin.email, accion: input.id ? 'Editó evento (Calendario Club)' : 'Creó evento (Calendario Club)', entidad: 'cc_evento', entidadId: input.id, detalle: row.titulo })
  revalidar()
  return { ok: true }
}

export async function eliminarEvento(id: string) {
  const { admin, error: permErr } = await exigir('editar')
  if (!admin) return { ok: false, error: permErr }
  const db = createAdminClient()
  const { error } = await db.from('cc_eventos').delete().eq('id', id)
  if (error) return { ok: false, error: error.message }
  await logActivity({ actorEmail: admin.email, accion: 'Eliminó evento (Calendario Club)', entidad: 'cc_evento', entidadId: id })
  revalidar()
  return { ok: true }
}

export async function duplicarEvento(id: string) {
  const { admin, error: permErr } = await exigir('editar')
  if (!admin) return { ok: false, error: permErr }
  const db = createAdminClient()
  const { data } = await db.from('cc_eventos').select('*').eq('id', id).maybeSingle()
  if (!data) return { ok: false, error: 'Evento no encontrado' }
  const copia = { ...(data as Record<string, unknown>) }
  delete copia.id; delete copia.created_at; delete copia.updated_at
  copia.titulo = `${data.titulo} (copia)`
  copia.updated_by = admin.email
  const { error } = await db.from('cc_eventos').insert(copia)
  if (error) return { ok: false, error: error.message }
  await logActivity({ actorEmail: admin.email, accion: 'Duplicó evento (Calendario Club)', entidad: 'cc_evento', entidadId: id })
  revalidar()
  return { ok: true }
}

export async function cambiarEstadoEvento(id: string, estado: 'activo' | 'cancelado') {
  const { admin, error: permErr } = await exigir('editar')
  if (!admin) return { ok: false, error: permErr }
  const db = createAdminClient()
  const { error } = await db.from('cc_eventos').update({ estado, updated_at: new Date().toISOString(), updated_by: admin.email }).eq('id', id)
  if (error) return { ok: false, error: error.message }
  await logActivity({ actorEmail: admin.email, accion: estado === 'cancelado' ? 'Canceló evento (Calendario Club)' : 'Reactivó evento (Calendario Club)', entidad: 'cc_evento', entidadId: id })
  revalidar()
  return { ok: true }
}

// ── Excepciones de una sesión recurrente ─────────────────────────────────────
export async function guardarExcepcion(input: { evento_id: string; fecha: string; accion: 'cancelar' | 'modificar'; cambios?: Record<string, unknown> | null }) {
  const { admin, error: permErr } = await exigir('editar')
  if (!admin) return { ok: false, error: permErr }
  const db = createAdminClient()
  const { error } = await db.from('cc_excepciones').upsert(
    { evento_id: input.evento_id, fecha: input.fecha, accion: input.accion, cambios: input.cambios ?? null },
    { onConflict: 'evento_id,fecha' },
  )
  if (error) return { ok: false, error: error.message }
  await logActivity({ actorEmail: admin.email, accion: `Sesión ${input.accion === 'cancelar' ? 'cancelada' : 'modificada'} (Calendario Club)`, entidad: 'cc_excepcion', entidadId: input.evento_id, detalle: input.fecha })
  revalidar()
  return { ok: true }
}

export async function quitarExcepcion(eventoId: string, fecha: string) {
  const { admin, error: permErr } = await exigir('editar')
  if (!admin) return { ok: false, error: permErr }
  const db = createAdminClient()
  const { error } = await db.from('cc_excepciones').delete().eq('evento_id', eventoId).eq('fecha', fecha)
  if (error) return { ok: false, error: error.message }
  revalidar()
  return { ok: true }
}

// ── Tipos / colores (solo principal) ─────────────────────────────────────────
export async function guardarTipos(tipos: { id: string; label: string; color: string; orden: number }[]) {
  const { admin, error: permErr } = await exigir('principal')
  if (!admin) return { ok: false, error: permErr }
  const db = createAdminClient()
  const { error } = await db.from('cc_tipos').upsert(tipos, { onConflict: 'id' })
  if (error) return { ok: false, error: error.message }
  await logActivity({ actorEmail: admin.email, accion: 'Actualizó colores/tipos (Calendario Club)', entidad: 'cc_tipos' })
  revalidar()
  return { ok: true }
}
