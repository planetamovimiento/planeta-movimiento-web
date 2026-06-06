// ─────────────────────────────────────────────────────────────────────────────
// CONFIGURACIÓN DE TALLERES INTENSIVOS
// Actualiza este archivo para cada nueva edición sin tocar el diseño.
// ─────────────────────────────────────────────────────────────────────────────

export type Estado = 'abierto' | 'ultimas' | 'completo' | 'proximamente'

export type Taller = {
  id: string
  nombre: string
  subtitulo: string
  descripcion: string
  objetivos: string[]
  nivel: string           // "Todos los niveles" | "Iniciación" | "Medio" | "Avanzado"
  profesor: string
  icon: string
  grad: string            // Tailwind gradient
  colorLight: string
  colorText: string
  colorBorder: string
  // ── Configuración por edición ──────────────────────────────────────────────
  fecha: string           // Texto libre: "Sábado 12 julio 2026" o "" si sin fecha
  horario: string         // "10:00 – 14:00" o ""
  duracion: string        // "4 horas"
  precio: string          // "60 €" o "Consultar"
  plazasTotal: number
  plazasLibres: number    // 0 = completo
  estado: Estado
}

export const TALLERES: Taller[] = [
  // ────────────────────────────────────────────────────────────────────────────
  // TELAS AÉREAS
  // ────────────────────────────────────────────────────────────────────────────
  {
    id: 'telas',
    nombre: 'Telas Aéreas',
    subtitulo: 'Técnica, fuerza y figuras en altura',
    descripcion:
      'Taller especializado para aprender y perfeccionar técnicas en telas aéreas. Una sesión intensiva con foco en la técnica de subida, figuras, transiciones y confianza en la altura.',
    objetivos: ['Técnica de subida y descenso', 'Fuerza de agarre', 'Figuras aéreas', 'Transiciones fluidas', 'Flexibilidad', 'Confianza en altura'],
    nivel: 'Todos los niveles',
    profesor: 'Por confirmar',
    icon: '🎪',
    grad: 'from-purple-700 to-indigo-900',
    colorLight: 'bg-purple-50',
    colorText: 'text-purple-700',
    colorBorder: 'border-purple-300',
    // ── Edición actual ────────────────────────────────────────────────────────
    fecha: '',             // ← sin fecha aún
    horario: '',
    duracion: '4 horas',
    precio: 'Consultar',
    plazasTotal: 10,
    plazasLibres: 10,
    estado: 'proximamente',
  },

  // ────────────────────────────────────────────────────────────────────────────
  // BACKFLIP
  // ────────────────────────────────────────────────────────────────────────────
  {
    id: 'backflip',
    nombre: 'Backflip',
    subtitulo: 'Mortal hacia atrás paso a paso',
    descripcion:
      'Taller específico para aprender y perfeccionar el mortal hacia atrás de forma progresiva y totalmente segura. Trabajo por fases con colchoneta y apoyo constante del monitor.',
    objetivos: ['Técnica de salto', 'Impulso y elevación', 'Coordinación cuerpo-brazos', 'Progresiones adaptadas', 'Seguridad en la caída', 'Confianza personal'],
    nivel: 'Iniciación / Intermedio',
    profesor: 'Por confirmar',
    icon: '🤸',
    grad: 'from-pm-red to-orange-700',
    colorLight: 'bg-pm-red-light',
    colorText: 'text-pm-red',
    colorBorder: 'border-pm-red/30',
    // ── Edición actual ────────────────────────────────────────────────────────
    fecha: '',
    horario: '',
    duracion: '4 horas',
    precio: 'Consultar',
    plazasTotal: 12,
    plazasLibres: 12,
    estado: 'proximamente',
  },

  // ────────────────────────────────────────────────────────────────────────────
  // VERTICALES
  // ────────────────────────────────────────────────────────────────────────────
  {
    id: 'verticales',
    nombre: 'Verticales',
    subtitulo: 'Control, alineación y equilibrio invertido',
    descripcion:
      'Taller enfocado en el aprendizaje y perfeccionamiento del pino y las inversiones. Trabajo de fuerza específica, alineación corporal y técnica de inversión desde cero o perfeccionamiento.',
    objetivos: ['Técnica de inversión', 'Equilibrio en pino', 'Control corporal', 'Alineación postural', 'Fuerza de hombros', 'Pino contra pared y libre'],
    nivel: 'Todos los niveles',
    profesor: 'Por confirmar',
    icon: '⬆️',
    grad: 'from-emerald-600 to-teal-800',
    colorLight: 'bg-emerald-50',
    colorText: 'text-emerald-700',
    colorBorder: 'border-emerald-300',
    // ── Edición actual ────────────────────────────────────────────────────────
    fecha: '',
    horario: '',
    duracion: '4 horas',
    precio: 'Consultar',
    plazasTotal: 10,
    plazasLibres: 10,
    estado: 'proximamente',
  },

  // ────────────────────────────────────────────────────────────────────────────
  // JIU-JITSU BRASILEÑO
  // ────────────────────────────────────────────────────────────────────────────
  {
    id: 'jiujitsu',
    nombre: 'Jiu-Jitsu Brasileño',
    subtitulo: 'Fundamentos técnicos y situaciones de combate',
    descripcion:
      'Taller dedicado al aprendizaje de fundamentos técnicos del BJJ. Posiciones, barridos, guardias y situaciones prácticas de combate. Impartido por instructores especializados de Academia Adamas.',
    objetivos: ['Posiciones básicas', 'Barridos y guardias', 'Técnica de control', 'Estrategia de combate', 'Defensa y protección', 'Confianza personal'],
    nivel: 'Sin experiencia previa',
    profesor: 'Academia Adamas · Madrid',
    icon: '🥋',
    grad: 'from-slate-800 to-pm-navy',
    colorLight: 'bg-slate-50',
    colorText: 'text-slate-700',
    colorBorder: 'border-slate-300',
    // ── Edición actual ────────────────────────────────────────────────────────
    fecha: '',
    horario: '',
    duracion: '4 horas',
    precio: 'Consultar',
    plazasTotal: 15,
    plazasLibres: 15,
    estado: 'proximamente',
  },
]
