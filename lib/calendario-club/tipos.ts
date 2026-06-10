// ─────────────────────────────────────────────────────────────────────────────
// Tipos, paleta de colores y constantes del módulo "Calendario Club".
// Archivo PURO (sin imports de servidor): se usa en servidor y cliente.
// La paleta usa clases Tailwind ESTÁTICAS (Tailwind v4 exige que estén en el
// código fuente; por eso no se construyen dinámicamente desde la BD).
// ─────────────────────────────────────────────────────────────────────────────

export type ColorKey = 'azul' | 'rojo' | 'gris' | 'naranja' | 'morado' | 'verde' | 'amarillo' | 'negro' | 'teal' | 'rosa'

export type PaletaItem = { label: string; chip: string; solid: string; dot: string; border: string }

export const PALETA: Record<ColorKey, PaletaItem> = {
  azul:     { label: 'Azul',     chip: 'bg-blue-100 text-blue-800',     solid: 'bg-blue-600 text-white',   dot: 'bg-blue-500',   border: 'border-blue-300' },
  rojo:     { label: 'Rojo',     chip: 'bg-red-100 text-red-800',       solid: 'bg-red-600 text-white',    dot: 'bg-red-500',    border: 'border-red-300' },
  gris:     { label: 'Gris',     chip: 'bg-gray-200 text-gray-700',     solid: 'bg-gray-500 text-white',   dot: 'bg-gray-400',   border: 'border-gray-300' },
  naranja:  { label: 'Naranja',  chip: 'bg-orange-100 text-orange-800', solid: 'bg-orange-500 text-white', dot: 'bg-orange-500', border: 'border-orange-300' },
  morado:   { label: 'Morado',   chip: 'bg-purple-100 text-purple-800', solid: 'bg-purple-600 text-white', dot: 'bg-purple-500', border: 'border-purple-300' },
  verde:    { label: 'Verde',    chip: 'bg-green-100 text-green-800',   solid: 'bg-green-600 text-white',  dot: 'bg-green-500',  border: 'border-green-300' },
  amarillo: { label: 'Amarillo', chip: 'bg-amber-100 text-amber-800',   solid: 'bg-amber-500 text-white',  dot: 'bg-amber-500',  border: 'border-amber-300' },
  negro:    { label: 'Negro',    chip: 'bg-gray-800 text-white',        solid: 'bg-gray-900 text-white',   dot: 'bg-gray-800',   border: 'border-gray-700' },
  teal:     { label: 'Verde azulado', chip: 'bg-teal-100 text-teal-800', solid: 'bg-teal-600 text-white',  dot: 'bg-teal-500',   border: 'border-teal-300' },
  rosa:     { label: 'Rosa',     chip: 'bg-pink-100 text-pink-800',     solid: 'bg-pink-600 text-white',   dot: 'bg-pink-500',   border: 'border-pink-300' },
}

export const COLORES: ColorKey[] = ['azul', 'rojo', 'gris', 'naranja', 'morado', 'verde', 'amarillo', 'negro', 'teal', 'rosa']

export function paleta(color: string | null | undefined): PaletaItem {
  return PALETA[(color as ColorKey)] ?? PALETA.azul
}

export type TipoEvento = { id: string; label: string; color: string; orden: number }

export const TIPOS_DEFAULT: TipoEvento[] = [
  { id: 'clase',      label: 'Clase regular',     color: 'azul',     orden: 1 },
  { id: 'festivo',    label: 'Día festivo',       color: 'rojo',     orden: 2 },
  { id: 'sin_clase',  label: 'Día sin clase',     color: 'gris',     orden: 3 },
  { id: 'sin_cole',   label: 'Día sin cole',      color: 'naranja',  orden: 4 },
  { id: 'evento',     label: 'Evento especial',   color: 'teal',     orden: 5 },
  { id: 'gala',       label: 'Gala',              color: 'morado',   orden: 6 },
  { id: 'campamento', label: 'Campamento',        color: 'verde',    orden: 7 },
  { id: 'taller',     label: 'Taller intensivo',  color: 'amarillo', orden: 8 },
  { id: 'puntual',    label: 'Actividad puntual', color: 'rosa',     orden: 9 },
  { id: 'empresa',    label: 'Servicio empresa',  color: 'negro',    orden: 10 },
]

export type Recurrencia = {
  dias: number[]            // 1=Lun … 7=Dom
  hasta: string             // YYYY-MM-DD
  excluir_festivos?: boolean
  excluir_sin_clase?: boolean
}

export type EventoClub = {
  id: string
  tipo: string
  titulo: string
  actividad: string | null
  grupo: string | null
  monitor: string | null
  ubicacion: string | null
  temporada: string | null
  fecha: string
  fecha_fin: string | null
  hora_inicio: string | null
  hora_fin: string | null
  todo_el_dia: boolean
  recurrencia: Recurrencia | null
  color: string | null
  estado: string            // activo | cancelado
  publico: boolean
  descripcion: string | null
  observaciones: string | null
  created_at?: string
  updated_at?: string
  updated_by?: string
}

export type Excepcion = {
  id: string
  evento_id: string
  fecha: string
  accion: 'cancelar' | 'modificar'
  cambios: Record<string, unknown> | null
}

/** Una sesión concreta (un día) ya resuelta para pintar/exportar. */
export type Ocurrencia = {
  eventoId: string
  fecha: string
  tipo: string
  titulo: string
  actividad: string | null
  grupo: string | null
  monitor: string | null
  ubicacion: string | null
  temporada: string | null
  hora_inicio: string | null
  hora_fin: string | null
  todo_el_dia: boolean
  color: string | null
  publico: boolean
  descripcion: string | null
  observaciones: string | null
  cancelado: boolean
  esRecurrente: boolean
}

export const DIAS_SEMANA: { n: number; corto: string; label: string }[] = [
  { n: 1, corto: 'Lun', label: 'Lunes' },
  { n: 2, corto: 'Mar', label: 'Martes' },
  { n: 3, corto: 'Mié', label: 'Miércoles' },
  { n: 4, corto: 'Jue', label: 'Jueves' },
  { n: 5, corto: 'Vie', label: 'Viernes' },
  { n: 6, corto: 'Sáb', label: 'Sábado' },
  { n: 7, corto: 'Dom', label: 'Domingo' },
]

export const pad = (n: number) => String(n).padStart(2, '0')
export const iso = (y: number, m0: number, d: number) => `${y}-${pad(m0 + 1)}-${pad(d)}`
/** 1=Lun … 7=Dom para una fecha YYYY-MM-DD. */
export function diaSemana(fechaISO: string): number {
  const d = new Date(fechaISO + 'T12:00:00')
  return ((d.getDay() + 6) % 7) + 1
}

/** Color resuelto (override del evento o el del tipo). */
export function colorOcurrencia(o: { tipo: string; color: string | null }, tipos: TipoEvento[]): string {
  if (o.color) return o.color
  return tipos.find(t => t.id === o.tipo)?.color ?? 'azul'
}

export function labelTipo(tipoId: string, tipos: TipoEvento[]): string {
  return tipos.find(t => t.id === tipoId)?.label ?? tipoId
}
