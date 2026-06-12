// ─────────────────────────────────────────────────────────────────────────────
// Configuración editable de "Mañanas Mágicas" (servicio de eventos en el centro).
// El PERSONAJE/temática cambia cada mes y se edita desde el panel de administración.
// Este archivo es "puro" (sin imports de servidor) para poder usarlo en cliente.
// ─────────────────────────────────────────────────────────────────────────────

export type EstadoMM = 'proximo' | 'abierto' | 'completo'

export type MananaMagica = {
  personaje: string          // p. ej. "Las Guerreras K-POP"
  tematica: string           // etiqueta corta, p. ej. "K-POP"
  emoji: string
  fecha: string              // ISO 'YYYY-MM-DD' (para el selector de reserva) o ''
  fechaTexto: string         // texto visible, p. ej. "Domingo 19 de abril"
  horario: string            // "11:00 – 13:00"
  precio: number             // € por niño
  descuentoHermanos: number  // % de descuento para hermanos
  aforo: number              // plazas (niños) para la fecha única; 0 = sin límite
  edades: string
  descripcion: string
  actividades: string[]
  estado: EstadoMM
  updatedAt?: string | null
  updatedBy?: string | null
}

export const MANANA_MAGICA_DEFAULT: MananaMagica = {
  personaje: 'Las Guerreras K-POP',
  tematica: 'K-POP',
  emoji: '✨',
  fecha: '',
  fechaTexto: 'Próxima fecha por confirmar',
  horario: '11:00 – 13:00',
  precio: 30,
  descuentoHermanos: 20,
  aforo: 0,
  edades: 'Infantil y primaria',
  descripcion:
    'Una mañana mágica llena de juego, creatividad y diversión sin pantallas. Una jornada temática con un personaje invitado distinto cada mes, pensada para que los peques disfruten de un montón de actividades en nuestras instalaciones.',
  actividades: [
    'Show de animación del personaje del mes',
    'Manualidades temáticas para llevar a casa',
    'Actividades deportivas y psicomotrices guiadas',
    'Pintacaras',
    'Photocall temático',
    'Circuitos de agilidad y juegos cooperativos',
  ],
  estado: 'proximo',
}

export const ESTADOS_MM: { id: EstadoMM; label: string; badge: string }[] = [
  { id: 'proximo', label: 'Próximamente', badge: 'bg-blue-100 text-blue-700' },
  { id: 'abierto', label: 'Reservas abiertas', badge: 'bg-green-100 text-green-700' },
  { id: 'completo', label: 'Completo', badge: 'bg-rose-100 text-rose-700' },
]
