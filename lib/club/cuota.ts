// ─────────────────────────────────────────────────────────────────────────────
// Cuota de socio del Club Deportivo Origen. Importes SIEMPRE en céntimos.
// Datos centralizados aquí para moverlos a la config editable del admin en la
// Fase D (punto 23: fecha límite reducida, precio reducido/normal) sin tocar UI.
// ponytail: constantes fijas por ahora; pasar a global_config cuando se pida.
// ─────────────────────────────────────────────────────────────────────────────

export type CuotaEstado = 'pendiente' | 'pagada' | 'exenta' | 'no_aplica'

export const CUOTA_ESTADOS: { id: CuotaEstado; label: string; badge: string; dot: string }[] = [
  { id: 'pendiente', label: 'Pendiente', badge: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500' },
  { id: 'pagada',    label: 'Pagada',    badge: 'bg-green-100 text-green-700', dot: 'bg-green-500' },
  { id: 'exenta',    label: 'Exenta',    badge: 'bg-blue-100 text-blue-700',   dot: 'bg-blue-500' },
  { id: 'no_aplica', label: 'No aplica', badge: 'bg-gray-100 text-gray-500',   dot: 'bg-gray-400' },
]

export function cuotaEstadoMeta(id: string) {
  return CUOTA_ESTADOS.find(e => e.id === id) ?? null
}

/** Tallas de equipación (selector estándar: infantil por edad + adulto por letra). */
export const TALLAS_EQUIPACION = ['4', '6', '8', '10', '12', '14', 'XS', 'S', 'M', 'L', 'XL'] as const

/** Configuración de la cuota de la temporada activa (Fase D la moverá a config). */
export const CUOTA = {
  temporada: '2026-2027',
  fechaLimiteReducida: '2026-09-27', // hasta esta fecha inclusive
  reducidaCents: 4000, // 40 €
  normalCents: 6000,   // 60 €
  incluye: [
    'Equipación del participante',
    'Reserva de plaza para la temporada',
    'Número de socio',
    'Acceso al Portal de Familias del Club Deportivo Origen',
  ],
} as const

/** Importe SUGERIDO según la fecha de pago (o hoy). El admin confirma el real. */
export function importeCuotaSugeridoCents(fechaISO?: string): number {
  const f = (fechaISO && fechaISO.slice(0, 10)) || new Date().toISOString().slice(0, 10)
  return f <= CUOTA.fechaLimiteReducida ? CUOTA.reducidaCents : CUOTA.normalCents
}

/** Céntimos → "40 €" / "40,50 €". */
export function eurosCuota(cents: number): string {
  return (cents / 100).toLocaleString('es-ES', { minimumFractionDigits: 0, maximumFractionDigits: 2 }) + ' €'
}

/** "40" / "40,50" → céntimos. '' → 0. */
export function eurosACents(v: string): number {
  const n = parseFloat(String(v).replace(/[^\d,.-]/g, '').replace(',', '.'))
  return Number.isFinite(n) ? Math.round(n * 100) : 0
}
