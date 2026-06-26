// ─────────────────────────────────────────────────────────────────────────────
// Tipos y colores del calendario de administración (compartido server/cliente)
// ─────────────────────────────────────────────────────────────────────────────

export type TipoEvento = 'reserva' | 'programado' | 'manual'

export type EventoCalendario = {
  id: string
  fecha: string        // 'YYYY-MM-DD'
  titulo: string
  servicio: string
  categoria: string
  tipo: TipoEvento
  hora?: string        // 'HH:MM' o rango '18:15 – 20:15' (opcional)
  detalle?: string
}

/** Color (chip) por categoría de servicio. */
export const COLOR_CATEGORIA: Record<string, string> = {
  'Cumpleaños':   'bg-pm-red-light text-pm-red',
  'Campamentos':  'bg-amber-100 text-amber-700',
  'Eventos':      'bg-violet-100 text-violet-700',
  'Talleres':     'bg-blue-100 text-blue-700',
  'Educación':    'bg-emerald-100 text-emerald-700',
  'PIEA':         'bg-teal-100 text-teal-700',
  'Licitaciones': 'bg-slate-100 text-slate-700',
  'Colchonetas':  'bg-orange-100 text-orange-700',
  'Manual':       'bg-green-100 text-green-700',
  'Otros':        'bg-gray-100 text-gray-600',
}

export function colorDe(categoria: string): string {
  return COLOR_CATEGORIA[categoria] ?? COLOR_CATEGORIA['Otros']
}

export const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
export const DIAS_SEMANA = ['L', 'M', 'X', 'J', 'V', 'S', 'D']
