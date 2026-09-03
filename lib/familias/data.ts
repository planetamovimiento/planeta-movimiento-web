import { createAdminClient } from '@/lib/supabase/admin'
import { TEMPORADA_ACTUAL } from '@/lib/club/constants'
import type { AlumnoFamilia } from './tipos'

type Row = Record<string, unknown>
const str = (v: unknown): string => (typeof v === 'string' ? v : '')

/** Expone solo el importe de cada mes (nunca la observación interna). */
function soloImportes(v: unknown): Record<string, { importe_cents?: number }> {
  const out: Record<string, { importe_cents?: number }> = {}
  if (v && typeof v === 'object') {
    for (const [mes, det] of Object.entries(v as Record<string, unknown>)) {
      const c = (det as { importe_cents?: unknown })?.importe_cents
      if (typeof c === 'number' && c > 0) out[mes] = { importe_cents: c }
    }
  }
  return out
}

/** submission_id de los alumnos vinculados a una familia. */
export async function idsDeFamilia(familiaId: string): Promise<string[]> {
  const db = createAdminClient()
  try {
    const { data } = await db.from('club_familia_alumnos').select('submission_id').eq('familia_id', familiaId)
    return (data ?? []).map(r => (r as Row).submission_id as string).filter(Boolean)
  } catch {
    return []
  }
}

/** Valor por defecto del grupo (prioriza el grupo de la misma actividad, luego global). */
function valorDeGrupo(grupos: Row[], nombreGrupo: string, actividad: string, key: string): string {
  if (!nombreGrupo) return ''
  const match =
    grupos.find(g => str(g.nombre) === nombreGrupo && str(g.actividad) === actividad) ??
    grupos.find(g => str(g.nombre) === nombreGrupo && !g.actividad) ??
    grupos.find(g => str(g.nombre) === nombreGrupo)
  return str(match?.[key])
}

function construir(s: Row, g: Row | undefined, grupos: Row[]): AlumnoFamilia {
  const d = (s.datos ?? {}) as Record<string, unknown>
  const completo = str(s.nombre)
  const nombre = str(d.nombre) || completo.split(' ')[0] || ''
  const apellidos = str(d.apellidos) || completo.split(' ').slice(1).join(' ')
  const actividad = str(d.actividad)
  // El grupo del admin = grupo guardado, o el nivel de la inscripción como respaldo.
  const grupo = str(g?.grupo) || str(d.nivel)
  // Horario y WhatsApp = el manual del alumno, o el por defecto de su grupo.
  return {
    id: String(s.id),
    nombre,
    apellidos,
    actividad,
    grupo,
    horario: str(g?.horario) || valorDeGrupo(grupos, grupo, actividad, 'horario'),
    temporada: str(g?.temporada) || TEMPORADA_ACTUAL,
    estado_general: str(g?.estado_general) || 'pendiente',
    pagos: (g?.pagos as Record<string, string>) ?? {},
    pagos_meta: soloImportes(g?.pagos_meta),
    observaciones_familia: str(g?.observaciones_familia),
    foto_url: str(g?.foto_url),
    whatsapp_url: str(g?.whatsapp_url) || valorDeGrupo(grupos, grupo, actividad, 'whatsapp_url'),
    numero_socio: str(g?.numero_socio),
    talla: str(g?.talla),
    cuota_estado: str(g?.cuota_estado),
    cuota_fecha_pago: g?.cuota_fecha_pago ? str(g.cuota_fecha_pago).slice(0, 10) : '',
  }
}

// ── Fusión de perfiles duplicados ────────────────────────────────────────────
// Un mismo niño puede tener DOS inscripciones (p. ej. el formulario del servicio
// y el de socio), y la familia veía su ficha repetida. Aquí se fusionan para la
// vista: se queda el perfil más completo y se rellenan los huecos con el otro.
// No borra nada en la base de datos.

const normTxt = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').trim().toLowerCase().replace(/\s+/g, ' ')

/** Clave de identidad. Con fecha de nacimiento + nombre no fusiona a gemelos. */
function claveAlumno(a: AlumnoFamilia, fechaNac: string): string {
  return fechaNac ? `${fechaNac}|${normTxt(a.nombre)}` : normTxt(`${a.nombre} ${a.apellidos}`)
}

function fusionar(x: AlumnoFamilia, y: AlumnoFamilia): AlumnoFamilia {
  // Base = el que tiene grupo asignado (trae horario y es el más útil para la familia).
  const base = x.grupo ? x : y.grupo ? y : x
  const otro = base === x ? y : x
  const pick = (a: string, b: string) => a || b
  return {
    ...base,
    actividad: pick(base.actividad, otro.actividad),
    grupo: pick(base.grupo, otro.grupo),
    horario: pick(base.horario, otro.horario),
    foto_url: pick(base.foto_url, otro.foto_url),
    talla: pick(base.talla, otro.talla),
    whatsapp_url: pick(base.whatsapp_url, otro.whatsapp_url),
    numero_socio: pick(base.numero_socio, otro.numero_socio),
    observaciones_familia: pick(base.observaciones_familia, otro.observaciones_familia),
    // Estados: gana lo "mejor" de los dos.
    estado_general: base.estado_general === 'activo' || otro.estado_general === 'activo' ? 'activo' : pick(base.estado_general, otro.estado_general),
    cuota_estado: base.cuota_estado === 'pagada' || otro.cuota_estado === 'pagada' ? 'pagada' : pick(base.cuota_estado, otro.cuota_estado),
    cuota_fecha_pago: pick(base.cuota_fecha_pago, otro.cuota_fecha_pago),
    pagos: Object.keys(base.pagos).length ? base.pagos : otro.pagos,
    pagos_meta: Object.keys(base.pagos_meta).length ? base.pagos_meta : otro.pagos_meta,
  }
}

function fusionarDuplicados(items: { a: AlumnoFamilia; fechaNac: string }[]): AlumnoFamilia[] {
  const mapa = new Map<string, AlumnoFamilia>()
  for (const { a, fechaNac } of items) {
    const k = claveAlumno(a, fechaNac)
    const ex = mapa.get(k)
    mapa.set(k, ex ? fusionar(ex, a) : a)
  }
  return [...mapa.values()]
}

/** Todos los alumnos vinculados a la familia (datos seguros, sin duplicados). */
export async function getAlumnosDeFamilia(familiaId: string): Promise<AlumnoFamilia[]> {
  const ids = await idsDeFamilia(familiaId)
  if (ids.length === 0) return []
  const db = createAdminClient()
  try {
    const [subs, gest, grup] = await Promise.all([
      db.from('form_submissions').select('id, nombre, datos').in('id', ids),
      db.from('club_gestion').select('*').in('submission_id', ids),
      db.from('club_grupos').select('nombre, actividad, horario, whatsapp_url'),
    ])
    const gMap = new Map((gest.data ?? []).map(g => [String((g as Row).submission_id), g as Row]))
    const grupos = (grup.data ?? []) as Row[]
    const construidos = ((subs.data ?? []) as Row[]).map(s => ({
      a: construir(s, gMap.get(String(s.id)), grupos),
      fechaNac: str((s.datos as Record<string, unknown> | null)?.fechaNacimiento).slice(0, 10),
    }))
    return fusionarDuplicados(construidos)
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
      db.from('club_grupos').select('nombre, actividad, horario, whatsapp_url'),
    ])
    if (!subRes.data) return null
    return construir(subRes.data as Row, (gRes.data as Row) ?? undefined, (grupRes.data ?? []) as Row[])
  } catch {
    return null
  }
}
