import { createAdminClient } from '@/lib/supabase/admin'
import { TALLERES, type Taller } from '@/app/club/talleres-intensivos/config'

// Fuente de verdad: tabla talleres_intensivos (dinámica). Para los 4 del config
// se fusiona la base con lo guardado (así no se pierden los campos no editados).
// Antes de sembrar, los que no tienen fila salen del config (la web no se rompe).

const MAP = new Map(TALLERES.map(t => [t.id, t]))
type Row = Record<string, unknown>
const str = (v: unknown) => (typeof v === 'string' ? v : v == null ? '' : String(v))
const numOr = (v: unknown, d: number) => { const n = Number(v); return Number.isFinite(n) ? n : d }

/** "Intensivo de Telas Aéreas" → "intensivo-de-telas-aereas". */
export function slugify(texto: string): string {
  return (texto || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80)
}

/** Peso de estado para ordenar la web: abiertas arriba, histórico abajo. */
const PESO: Record<string, number> = { abierto: 5, ultimas: 4, completo: 3, proximamente: 2, cerrado: 1, finalizado: 1, borrador: 0 }

/** Orden: estado → destacado → prioridad → orden manual → título. */
export function comparar(a: Taller, b: Taller): number {
  return (PESO[b.estado] ?? 0) - (PESO[a.estado] ?? 0)
    || Number(b.destacado ?? false) - Number(a.destacado ?? false)
    || (b.prioridad ?? 50) - (a.prioridad ?? 50)
    || (a.orden ?? 0) - (b.orden ?? 0)
    || a.nombre.localeCompare(b.nombre, 'es')
}

function normaliza(t: Taller): Taller {
  return {
    ...t,
    slug: t.slug || slugify(t.nombre) || t.id,
    prioridad: t.prioridad ?? (t.estado === 'abierto' ? 100 : 50),
    orden: t.orden ?? 0,
    destacado: t.destacado ?? false,
    archivado: t.archivado ?? false,
  }
}

function filaATaller(r: Row): Taller {
  const base = MAP.get(str(r.id))
  const c = (r.contenido ?? {}) as Partial<Taller>
  const merged = { ...(base ?? {}), ...c } as Taller
  return normaliza({
    ...merged,
    id: str(r.id),
    nombre: str(r.titulo) || merged.nombre || 'Intensivo',
    estado: (str(r.estado) || merged.estado || 'borrador') as Taller['estado'],
    icon: merged.icon || '🎯',
    grad: merged.grad || 'from-pm-navy to-pm-navy-md',
    colorLight: merged.colorLight || 'bg-pm-bg',
    colorText: merged.colorText || 'text-pm-navy',
    colorBorder: merged.colorBorder || 'border-gray-200',
    objetivos: Array.isArray(merged.objetivos) ? merged.objetivos : [],
    precio: merged.precio || 'Consultar',
    plazasTotal: merged.plazasTotal ?? 0,
    plazasLibres: merged.plazasLibres ?? 0,
    slug: str(r.slug) || slugify(str(r.titulo) || merged.nombre || '') || str(r.id),
    disciplina: str(r.disciplina) || merged.disciplina,
    profesor: str(r.profesor) || merged.profesor || '',
    prioridad: numOr(r.prioridad, merged.prioridad ?? 50),
    orden: numOr(r.orden, 0),
    destacado: r.destacado === true,
    archivado: r.archivado === true,
    publicadoAt: (r.publicado_at as string) ?? null,
    updatedAt: (r.updated_at as string) ?? null,
    updatedBy: (r.updated_by as string) ?? null,
  })
}

async function cargar(): Promise<{ rows: Row[]; byId: Map<string, Row> }> {
  const db = createAdminClient()
  const { data, error } = await db.from('talleres_intensivos').select('*')
  if (error) throw error
  const rows = (data ?? []) as Row[]
  return { rows, byId: new Map(rows.map(r => [str(r.id), r])) }
}

/** Todos los talleres para el ADMIN (incluye archivados). BD + config no sembrado. */
export async function getTalleresAdmin(): Promise<Taller[]> {
  try {
    const { rows, byId } = await cargar()
    const deBD = rows.map(filaATaller)
    const faltan = TALLERES.filter(t => !byId.has(t.id)).map(normaliza)
    return [...deBD, ...faltan].sort(comparar)
  } catch {
    return TALLERES.map(normaliza).sort(comparar)
  }
}

/** Talleres visibles (NO archivados) para la web pública y listados. */
export async function getTalleres(): Promise<Taller[]> {
  return (await getTalleresAdmin()).filter(t => !t.archivado)
}

export async function getTaller(id: string): Promise<Taller | null> {
  try {
    const db = createAdminClient()
    const { data } = await db.from('talleres_intensivos').select('*').eq('id', id).maybeSingle()
    if (data) return filaATaller(data as Row)
  } catch { /* fallback */ }
  const base = MAP.get(id)
  return base ? normaliza(base) : null
}

export async function getTallerBySlug(slug: string): Promise<Taller | null> {
  return (await getTalleresAdmin()).find(t => t.slug === slug) ?? null
}

// ── Inscripciones por taller (admin) ────────────────────────────────────────
export type InscripcionTaller = {
  id: string; nombre: string; apellidos: string; edad: string; tutor: string
  telefono: string; email: string; experiencia: string; modalidad: string; fechas: string; observaciones: string
  estado: string; pagoEstado: string; pagoImporteCents: number; pagoFecha: string; pagoObs: string; createdAt: string
}

export async function getInscripcionesTaller(tallerId: string): Promise<InscripcionTaller[]> {
  try {
    const db = createAdminClient()
    const { data } = await db.from('taller_inscripciones').select('*').eq('taller_id', tallerId).order('created_at', { ascending: false })
    return ((data ?? []) as Row[]).map(r => ({
      id: str(r.id), nombre: str(r.nombre), apellidos: str(r.apellidos), edad: str(r.edad), tutor: str(r.tutor),
      telefono: str(r.telefono), email: str(r.email), experiencia: str(r.experiencia), modalidad: str(r.modalidad),
      fechas: str(r.fechas), observaciones: str(r.observaciones),
      estado: str(r.estado) || 'nueva', pagoEstado: str(r.pago_estado) || 'pendiente',
      pagoImporteCents: Number(r.pago_importe_cents ?? 0) || 0,
      pagoFecha: r.pago_fecha ? str(r.pago_fecha).slice(0, 10) : '', pagoObs: str(r.pago_obs),
      createdAt: str(r.created_at),
    }))
  } catch { return [] }
}
