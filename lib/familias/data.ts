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

/** Horario por defecto del grupo (prioriza el grupo de la misma actividad, luego global). */
function horarioDeGrupo(grupos: Row[], nombreGrupo: string, actividad: string): string {
  if (!nombreGrupo) return ''
  const match =
    grupos.find(g => str(g.nombre) === nombreGrupo && str(g.actividad) === actividad) ??
    grupos.find(g => str(g.nombre) === nombreGrupo && !g.actividad) ??
    grupos.find(g => str(g.nombre) === nombreGrupo)
  return str(match?.horario)
}

function construir(s: Row, g: Row | undefined, grupos: Row[]): AlumnoFamilia {
  const d = (s.datos ?? {}) as Record<string, unknown>
  const completo = str(s.nombre)
  const nombre = str(d.nombre) || completo.split(' ')[0] || ''
  const apellidos = str(d.apellidos) || completo.split(' ').slice(1).join(' ')
  // El grupo del admin = grupo guardado, o el nivel de la inscripción como respaldo.
  const grupo = str(g?.grupo) || str(d.nivel)
  // El horario = el manual del alumno, o el horario por defecto de su grupo.
  const horario = str(g?.horario) || horarioDeGrupo(grupos, grupo, str(d.actividad))
  return {
    id: String(s.id),
    nombre,
    apellidos,
    actividad: str(d.actividad),
    grupo,
    horario,
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
    const [subs, gest, grup] = await Promise.all([
      db.from('form_submissions').select('id, nombre, datos').in('id', ids),
      db.from('club_gestion').select('*').in('submission_id', ids),
      db.from('club_grupos').select('nombre, actividad, horario'),
    ])
    const gMap = new Map((gest.data ?? []).map(g => [String((g as Row).submission_id), g as Row]))
    const grupos = (grup.data ?? []) as Row[]
    return ((subs.data ?? []) as Row[])
      .map(s => construir(s, gMap.get(String(s.id)), grupos))
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
    const [subRes, gRes, grupRes] = await Promise.all([
      db.from('form_submissions').select('id, nombre, datos').eq('id', submissionId).maybeSingle(),
      db.from('club_gestion').select('*').eq('submission_id', submissionId).maybeSingle(),
      db.from('club_grupos').select('nombre, actividad, horario'),
    ])
    if (!subRes.data) return null
    return construir(subRes.data as Row, (gRes.data as Row) ?? undefined, (grupRes.data ?? []) as Row[])
  } catch {
    return null
  }
}
