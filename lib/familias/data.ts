import { createAdminClient } from '@/lib/supabase/admin'
import { TEMPORADA_ACTUAL } from '@/lib/club/constants'
import type { AlumnoFamilia } from './tipos'

type Row = Record<string, unknown>
const str = (v: unknown): string => (typeof v === 'string' ? v : '')

/** submission_id de los alumnos vinculados a una familia. */
async function idsDeFamilia(familiaId: string): Promise<string[]> {
  const db = createAdminClient()
  try {
    const { data } = await db.from('club_familia_alumnos').select('submission_id').eq('familia_id', familiaId)
    return (data ?? []).map(r => (r as Row).submission_id as string).filter(Boolean)
  } catch {
    return []
  }
}

function construir(s: Row, g: Row | undefined): AlumnoFamilia {
  const d = (s.datos ?? {}) as Record<string, unknown>
  const completo = str(s.nombre)
  const nombre = str(d.nombre) || completo.split(' ')[0] || ''
  const apellidos = str(d.apellidos) || completo.split(' ').slice(1).join(' ')
  return {
    id: String(s.id),
    nombre,
    apellidos,
    actividad: str(d.actividad),
    grupo: str(g?.grupo),
    horario: str(g?.horario),
    temporada: str(g?.temporada) || TEMPORADA_ACTUAL,
    estado_general: str(g?.estado_general) || 'pendiente',
    pagos: (g?.pagos as Record<string, string>) ?? {},
    observaciones_familia: str(g?.observaciones_familia),
    foto_url: str(g?.foto_url),
  }
}

/** Todos los alumnos vinculados a la familia (datos seguros). */
export async function getAlumnosDeFamilia(familiaId: string): Promise<AlumnoFamilia[]> {
  const ids = await idsDeFamilia(familiaId)
  if (ids.length === 0) return []
  const db = createAdminClient()
  try {
    const [subs, gest] = await Promise.all([
      db.from('form_submissions').select('id, nombre, datos').in('id', ids),
      db.from('club_gestion').select('*').in('submission_id', ids),
    ])
    const gMap = new Map((gest.data ?? []).map(g => [String((g as Row).submission_id), g as Row]))
    return ((subs.data ?? []) as Row[])
      .map(s => construir(s, gMap.get(String(s.id))))
      .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'))
  } catch {
    return []
  }
}

/** Un alumno concreto, SOLO si pertenece a la familia (comprueba pertenencia). */
export async function getAlumnoDeFamilia(familiaId: string, submissionId: string): Promise<AlumnoFamilia | null> {
  const ids = await idsDeFamilia(familiaId)
  if (!ids.includes(submissionId)) return null
  const db = createAdminClient()
  try {
    const [subRes, gRes] = await Promise.all([
      db.from('form_submissions').select('id, nombre, datos').eq('id', submissionId).maybeSingle(),
      db.from('club_gestion').select('*').eq('submission_id', submissionId).maybeSingle(),
    ])
    if (!subRes.data) return null
    return construir(subRes.data as Row, (gRes.data as Row) ?? undefined)
  } catch {
    return null
  }
}
