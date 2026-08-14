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

// ── Cuotas mensuales por actividad (punto 22) ──────────────────────────────────
// Fuente ÚNICA: la usa el default de la config del club (sugerencia en el CRM) y
// los formularios públicos de inscripción (precio por modalidad). Céntimos.
export type CuotaMensualActividad = { actividad: string; opciones: { label: string; cents: number }[] }

export const CUOTAS_MENSUALES: CuotaMensualActividad[] = [
  { actividad: 'Gimnasia Acrobática', opciones: [{ label: '1 hora', cents: 4500 }, { label: '2 horas', cents: 7000 }, { label: '3 horas', cents: 10000 }] },
  { actividad: 'Escuela de aéreos', opciones: [{ label: '1 hora', cents: 4500 }, { label: '2 horas', cents: 7000 }, { label: '3 horas', cents: 10000 }] },
  { actividad: 'Escuela infantil', opciones: [{ label: '1 día', cents: 4000 }, { label: '2 días', cents: 6500 }, { label: '3 días', cents: 9000 }] },
  { actividad: 'Jiu-Jitsu Brasileño', opciones: [{ label: 'Cuota', cents: 6000 }] },
  { actividad: 'Escuela de Bienestar', opciones: [{ label: '1 hora', cents: 3000 }, { label: '2 horas', cents: 4000 }] },
]

/** Céntimos de la cuota mensual de una actividad para el nivel N (1,2,3…). null si no hay tarifa. */
export function cuotaMensualCents(actividad: string, tier: number): number | null {
  const a = CUOTAS_MENSUALES.find(c => c.actividad.trim().toLowerCase() === actividad.trim().toLowerCase())
  return a?.opciones[tier - 1]?.cents ?? null
}

/** Texto de precio mensual para la modalidad N ("45 € / mes") o "Consultar precio" si no hay tarifa. */
export function cuotaMensualTexto(actividad: string, tier: number): string {
  const c = cuotaMensualCents(actividad, tier)
  return c != null ? `${eurosCuota(c)} / mes` : 'Consultar precio'
}

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

/** ISO (yyyy-mm-dd) → "27 de septiembre de 2026". UTC para no depender del huso. */
export function fechaLarga(iso: string): string {
  const d = new Date(iso + 'T00:00:00Z')
  return isNaN(d.getTime()) ? iso : d.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })
}

/** ISO → ISO del día siguiente (cálculo en UTC: no se desplaza por el huso). */
export function diaSiguiente(iso: string): string {
  const d = new Date(iso + 'T00:00:00Z')
  if (isNaN(d.getTime())) return iso
  d.setUTCDate(d.getUTCDate() + 1)
  return d.toISOString().slice(0, 10)
}
