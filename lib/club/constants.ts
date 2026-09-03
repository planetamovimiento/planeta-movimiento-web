// ─────────────────────────────────────────────────────────────────────────────
// Constantes y tipos de la gestión del Club Deportivo Origen
// (compartidas entre el servidor y el cliente del panel)
// ─────────────────────────────────────────────────────────────────────────────

// Temporada por defecto del código (fallback). La temporada ACTIVA real se
// guarda en global_config('temporada_activa') y es editable desde el admin
// (ver lib/config/store.ts → getTemporadaActiva). Formato interno: 'AAAA/AA'.
export const TEMPORADA_ACTUAL = '2026/27'

/** Temporadas seleccionables en el filtro (de más reciente a más antigua). */
export const TEMPORADAS = ['2026/27', '2025/26', '2024/25']

/** '2026/27' → '2026-2027' (formato largo para mostrar al público). */
export function temporadaDisplay(t: string): string {
  const y = parseInt(String(t).slice(0, 4), 10)
  return Number.isNaN(y) ? t : `${y}-${y + 1}`
}

/** Meses de la temporada del club (septiembre → junio). */
export const MESES_TEMPORADA = [
  { key: 'sep', label: 'Sep', nombre: 'Septiembre', mes: 9 },
  { key: 'oct', label: 'Oct', nombre: 'Octubre', mes: 10 },
  { key: 'nov', label: 'Nov', nombre: 'Noviembre', mes: 11 },
  { key: 'dic', label: 'Dic', nombre: 'Diciembre', mes: 12 },
  { key: 'ene', label: 'Ene', nombre: 'Enero', mes: 1 },
  { key: 'feb', label: 'Feb', nombre: 'Febrero', mes: 2 },
  { key: 'mar', label: 'Mar', nombre: 'Marzo', mes: 3 },
  { key: 'abr', label: 'Abr', nombre: 'Abril', mes: 4 },
  { key: 'may', label: 'May', nombre: 'Mayo', mes: 5 },
  { key: 'jun', label: 'Jun', nombre: 'Junio', mes: 6 },
] as const

export type MesKey = (typeof MESES_TEMPORADA)[number]['key']

export type EstadoPago = 'pagado' | 'pendiente' | 'baja'

/** Detalle económico de un mes (junto al estado de color que va en `pagos`). */
export type PagoMes = { importe_cents?: number; fecha?: string; obs?: string }

export const ESTADO_PAGO_META: Record<EstadoPago, { label: string; dot: string; anillo: string; texto: string }> = {
  pagado:    { label: 'Pagado',    dot: 'bg-green-500', anillo: 'ring-green-500', texto: 'text-green-700' },
  pendiente: { label: 'Pendiente', dot: 'bg-amber-500', anillo: 'ring-amber-500', texto: 'text-amber-700' },
  baja:      { label: 'Baja',      dot: 'bg-red-500',   anillo: 'ring-red-500',   texto: 'text-red-700' },
}

/** Ciclo al hacer clic en un mes: sin estado → pagado → pendiente → baja → sin estado. */
export const CICLO_PAGO: (EstadoPago | '')[] = ['', 'pagado', 'pendiente', 'baja']

export type EstadoGeneral = 'activo' | 'pendiente' | 'baja' | 'espera' | 'archivado'

export const ESTADOS_GENERAL: { id: EstadoGeneral; label: string; badge: string; dot: string }[] = [
  { id: 'activo',    label: 'Activo',                 badge: 'bg-green-100 text-green-700',   dot: 'bg-green-500' },
  { id: 'pendiente', label: 'Pendiente de confirmar', badge: 'bg-amber-100 text-amber-700',   dot: 'bg-amber-500' },
  { id: 'espera',    label: 'Lista de espera',        badge: 'bg-purple-100 text-purple-700', dot: 'bg-purple-500' },
  { id: 'baja',      label: 'En baja',                badge: 'bg-red-100 text-red-700',       dot: 'bg-red-500' },
]

export function labelEstadoGeneral(id: string): string {
  return ESTADOS_GENERAL.find(e => e.id === id)?.label ?? id
}

/** Grupos base por defecto (también se siembran en la BD). */
export const GRUPOS_BASE = ['Iniciación 1', 'Iniciación 2', 'Iniciación 3', 'Medio 1', 'Medio 2', 'Medio 3', 'Avanzado']

/** Grupos que SIEMPRE están disponibles en el desplegable de cualquier actividad. */
export const GRUPOS_EXTRA = ['Rítmica 1', 'Isaac Albéniz', 'Bienestar 1', 'JJB 1']

/** Grupos por defecto propios de una actividad concreta (clave normalizada a minúsculas). */
export const GRUPOS_POR_ACTIVIDAD: Record<string, string[]> = {
  'escuela infantil': ['Infantil 1', 'Infantil 2', 'Infantil 3', 'Infantil 4', 'Infantil 5', 'Infantil 6'],
  // Telas Aéreas · temporada 2026/27 (sin Iniciación 3 esta temporada).
  'escuela de aéreos': ['Iniciación 1', 'Iniciación 2', 'Medio 1', 'Medio 2', 'Medio 3', 'Avanzado 1', 'Adultos / P. libre'],
}

/** Grupos propios de la actividad (independiente de mayúsculas/espacios). */
export function gruposDeActividad(actividad: string): string[] {
  return GRUPOS_POR_ACTIVIDAD[actividad.trim().toLowerCase()] ?? []
}

/**
 * Actividades del Club (nombres canónicos cortos para el panel).
 * Siempre aparecen en el filtro aunque todavía no tengan alumnos
 * (p. ej. «Circo Inclusivo» para la temporada 26/27 en adelante).
 * Privadas (solo panel, nunca web pública): Gimnasia Rítmica y Colegio Isaac Albéniz.
 */
export const ACTIVIDADES_CLUB = [
  'Escuela de aéreos',
  'Escuela de Bienestar',
  'Escuela infantil',
  'Gimnasia Acrobática',
  'Gimnasia Rítmica',
  'Jiu-Jitsu Brasileño',
  'Colegio Isaac Albéniz',
  'Circo Inclusivo',
]

// ── Tipos de datos ────────────────────────────────────────────────────────────

export type Grupo = { id: string; actividad: string | null; nombre: string; orden: number; horario?: string | null; whatsapp_url?: string | null }

export type Alumno = {
  id: string
  nombre: string
  apellidos: string
  nombreCompleto: string
  actividad: string
  fechaNacimiento: string
  tutorLegal: string
  nivel: string
  telefono: string
  email: string
  mensaje: string
  created_at: string
  // gestión manual
  grupo: string
  estado_general: EstadoGeneral
  temporada: string
  /** "Septiembre 2026" / "Octubre 2026" (lo elige la familia en la inscripción). '' si no aplica. */
  periodoInicio: string
  // Cuota de socio (temporada 2026/27+). Snake_case = columnas de club_gestion.
  cuota_estado: string
  cuota_importe_cents: number
  cuota_fecha_pago: string
  cuota_forma_pago: string
  talla: string
  numero_socio: string
  /** Alta realizada desde el formulario "Hazte socio". */
  esSocio: boolean
  /** Datos del tutor capturados en el alta de socio (solo lectura). */
  dniTutor: string
  direccionTutor: string
  /** true si la inscripción llegó pero no tiene fila en club_gestion (sin sincronizar). */
  pendienteSync: boolean
  pagos: Record<string, EstadoPago>
  /** Importe/fecha/obs por mes (requiere migration_club_pagos_meta.sql). */
  pagos_meta: Record<string, PagoMes>
  observaciones: string
  // campos visibles para la familia (Portal de Familias)
  observaciones_familia: string
  foto_url: string
  horario: string
  whatsapp_url: string
  fecha_alta: string | null
  fecha_baja: string | null
}

// ── Helpers ─────────────────────────────────────────────────────────────────

/** Devuelve la clave de mes de temporada para la fecha indicada (o null si fuera). */
export function mesActualKey(d = new Date()): MesKey | null {
  const m = d.getMonth() + 1
  return (MESES_TEMPORADA.find(x => x.mes === m)?.key as MesKey) ?? null
}

/** Calcula la edad a partir de una fecha de nacimiento (YYYY-MM-DD). */
export function edadDe(fechaNacimiento: string): number | null {
  if (!fechaNacimiento) return null
  const f = new Date(fechaNacimiento)
  if (isNaN(f.getTime())) return null
  const hoy = new Date()
  let edad = hoy.getFullYear() - f.getFullYear()
  const m = hoy.getMonth() - f.getMonth()
  if (m < 0 || (m === 0 && hoy.getDate() < f.getDate())) edad--
  return edad
}

/** Formatea una fecha ISO a DD/MM/AAAA. */
export function fechaCorta(iso: string | null): string {
  if (!iso) return '—'
  const d = new Date(iso)
  return isNaN(d.getTime()) ? '—' : d.toLocaleDateString('es-ES')
}
