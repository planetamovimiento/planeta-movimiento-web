import { createAdminClient } from '@/lib/supabase/admin'
import type { Participante, Grupo, Actividad, Evaluacion, Sesion, EvalSesion } from './tipos'

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

// ── Sesiones y evaluación por sesión ─────────────────────────────────────────

export async function getSesiones(): Promise<Sesion[]> {
  const db = createAdminClient()
  return safe<Sesion>(() => db.from('ci_sesiones').select('*').order('fecha', { ascending: false }) as never)
}

export async function getSesion(id: string): Promise<Sesion | null> {
  try {
    const db = createAdminClient()
    const { data } = await db.from('ci_sesiones').select('*').eq('id', id).maybeSingle()
    return (data as Sesion) ?? null
  } catch { return null }
}

export async function getEvalsDeSesion(sesionId: string): Promise<EvalSesion[]> {
  const db = createAdminClient()
  return safe<EvalSesion>(() => db.from('ci_eval_sesion').select('*').eq('sesion_id', sesionId) as never)
}

export async function getEvalsSesionDe(participanteId: string): Promise<EvalSesion[]> {
  const db = createAdminClient()
  return safe<EvalSesion>(() => db.from('ci_eval_sesion').select('*').eq('participante_id', participanteId) as never)
}

/** ¿Se ha ejecutado migration_circo_sesiones.sql? Avisa en el panel si falta. */
export async function haySesiones(): Promise<boolean> {
  const db = createAdminClient()
  try {
    const { error } = await db.from('ci_sesiones').select('id').limit(1)
    return !error
  } catch { return false }
}

/** Nº de evaluaciones (cualquier estado) por sesión: para el listado. */
export async function getEvaluacionesConteo(): Promise<Record<string, number>> {
  const db = createAdminClient()
  const filas = await safe<{ sesion_id: string }>(() => db.from('ci_eval_sesion').select('sesion_id') as never)
  const out: Record<string, number> = {}
  for (const f of filas) out[f.sesion_id] = (out[f.sesion_id] ?? 0) + 1
  return out
}
