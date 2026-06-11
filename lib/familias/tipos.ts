// ─────────────────────────────────────────────────────────────────────────────
// Tipos del Portal de Familias. Archivo puro (sin imports de servidor).
// ─────────────────────────────────────────────────────────────────────────────

export type EstadoFamilia = 'activo' | 'pendiente' | 'bloqueado' | 'desactivado'

export type Familia = {
  id: string
  email: string
  nombre: string | null
  telefono: string | null
  estado: EstadoFamilia
  created_at?: string
  ultimo_acceso?: string | null
}

export const ESTADOS_FAMILIA: { valor: EstadoFamilia; label: string; color: string }[] = [
  { valor: 'activo',      label: 'Activo',               color: 'bg-green-100 text-green-700 border-green-300' },
  { valor: 'pendiente',   label: 'Pendiente de activar', color: 'bg-amber-100 text-amber-700 border-amber-300' },
  { valor: 'bloqueado',   label: 'Bloqueado',            color: 'bg-red-100 text-red-700 border-red-300' },
  { valor: 'desactivado', label: 'Desactivado',          color: 'bg-gray-100 text-gray-500 border-gray-300' },
]

export function labelEstadoFamilia(e: EstadoFamilia): string {
  return ESTADOS_FAMILIA.find(x => x.valor === e)?.label ?? e
}

/** Subconjunto SEGURO del alumno que ve la familia (nunca datos internos). */
export type AlumnoFamilia = {
  id: string
  nombre: string
  apellidos: string
  actividad: string
  grupo: string
  horario: string
  temporada: string
  estado_general: string
  pagos: Record<string, string>
  observaciones_familia: string
  foto_url: string
}
