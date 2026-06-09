import { createAdminClient } from '@/lib/supabase/admin'
import type { Participante, Grupo, Actividad, Evaluacion } from './tipos'

/** Ejecuta una consulta y devuelve [] si la tabla aún no existe o hay error. */
async function safe<T>(fn: () => Promise<{ data: T[] | null; error: unknown }>): Promise<T[]> {
  try {
    const { data, error } = await fn()
    if (error) return []
    return data ?? []
  } catch {
    return []
  }
}

export async function getGrupos(): Promise<Grupo[]> {
  const db = createAdminClient()
  return safe<Grupo>(() => db.from('ci_grupos').select('*').order('nombre') as never)
}

export async function getActividades(): Promise<Actividad[]> {
  const db = createAdminClient()
  return safe<Actividad>(() => db.from('ci_actividades').select('*').order('orden') as never)
}

export async function getParticipantes(): Promise<Participante[]> {
  const db = createAdminClient()
  return safe<Participante>(() => db.from('ci_participantes').select('*').order('created_at', { ascending: false }) as never)
}

export async function getParticipante(id: string): Promise<Participante | null> {
  try {
    const db = createAdminClient()
    const { data } = await db.from('ci_participantes').select('*').eq('id', id).maybeSingle()
    return (data as Participante) ?? null
  } catch {
    return null
  }
}

export async function getEvaluaciones(): Promise<Evaluacion[]> {
  const db = createAdminClient()
  return safe<Evaluacion>(() => db.from('ci_evaluaciones').select('*').order('fecha', { ascending: false }) as never)
}

export async function getEvaluacionesDe(participanteId: string): Promise<Evaluacion[]> {
  const db = createAdminClient()
  return safe<Evaluacion>(() =>
    db.from('ci_evaluaciones').select('*').eq('participante_id', participanteId).order('fecha', { ascending: false }) as never,
  )
}

export async function getEvaluacion(id: string): Promise<Evaluacion | null> {
  try {
    const db = createAdminClient()
    const { data } = await db.from('ci_evaluaciones').select('*').eq('id', id).maybeSingle()
    return (data as Evaluacion) ?? null
  } catch {
    return null
  }
}
