// ─────────────────────────────────────────────────────────────────────────────
// Configuración editable de los EVENTOS EN EL CENTRO (Días Sin Cole, Domingos,
// Noche de Halloween). Archivo puro (sin imports de servidor) → usable en cliente.
// Se edita desde el panel (Servicios) y se guarda en la tabla eventos_config.
// ─────────────────────────────────────────────────────────────────────────────

import type { EstadoMM } from './manana-magica'

/**
 * Bloque de contenido editable del evento (lo que se ve en la web bajo la
 * cabecera): el programa de la noche, lo que incluye, el ambiente…
 * - 'programa': cada línea es  (la hora sale destacada a la izquierda).
 * - 'lista': una línea por punto, con su ✓.
 * - 'chips': una línea por etiqueta redonda.
 */
export type SeccionEvento = { titulo: string; tipo: 'programa' | 'lista' | 'chips'; items: string[] }

/** 'hora = texto' → { hora, texto }. Sin '=', todo va al texto. */
export function parteDePrograma(linea: string): { hora: string; texto: string } {
  const i = linea.indexOf('=')
  return i < 0 ? { hora: '', texto: linea.trim() } : { hora: linea.slice(0, i).trim(), texto: linea.slice(i + 1).trim() }
}

/** Config unificada (cada evento usa los campos que le aplican). */
export type EventoCentroCfg = {
  precio: number          // € por niño
  ivaIncluido: boolean    // true = precio final; false = + IVA
  horario: string
  edad: string
  nota: string
  fechas: string          // texto: una línea por fecha. DSC: "YYYY-MM-DD = Etiqueta"
  evento: string          // Halloween: nombre temático del año
  plazas: number          // Halloween: plazas máximas
  aforo: number           // Días Sin Cole / Domingos: plazas (niños) por fecha; 0 = sin límite
  /** Foto de portada del evento (URL). Vacío = la imagen por defecto del código. */
  imagen: string
  /** Título grande en la web. */
  titulo: string
  /** Línea pequeña sobre el título (Halloween: «Evento anual especial»). */
  subtitulo: string
  /** Párrafo de presentación. */
  descripcion: string
  /** Etiquetas extra de la cabecera (una por línea). Las de horario y precio salen solas. */
  chips: string
  /** Bloques de contenido que se ven debajo (programa, actividades…). */
  secciones: SeccionEvento[]
  /** Práctica libre: precio del bono y nº de sesiones que incluye. */
  precioBono: number
  sesionesBono: number
  /** % de descuento para socios del club (0 = sin descuento). */
  descuentoSocio: number
  estado: EstadoMM
  updatedAt?: string | null
  updatedBy?: string | null
}

export const EVENTOS_CENTRO_IDS = ['dias-sin-cole', 'domingos', 'halloween', 'practica-libre', 'talleres-infantiles'] as const
export type EventoCentroId = (typeof EVENTOS_CENTRO_IDS)[number]

export const EVENTOS_CENTRO_DEFAULT: Record<EventoCentroId, EventoCentroCfg> = {
  'dias-sin-cole': {
    precio: 30, ivaIncluido: false, horario: '9:00 – 14:00', edad: 'Desde 4 años', nota: '',
    fechas: [
      '2026-09-11 = Fiesta Nacional (sept)',
      '2026-10-12 = Día de la Hispanidad',
      '2026-11-02 = Puente de Todos los Santos',
      '2026-12-07 = Puente Constitución',
      '2026-12-26 = Día siguiente Navidad',
      '2027-01-02 = Inicio de año escolar',
      '2027-01-07 = Post-Reyes',
    ].join('\n'),
    evento: '', plazas: 0, aforo: 0, imagen: '', estado: 'abierto',
    precioBono: 0, sesionesBono: 0, descuentoSocio: 0,
    titulo: 'Días Sin Cole', subtitulo: '',
    descripcion: 'En los festivos escolares abrimos nuestras instalaciones para que los niños vivan una mañana épica de la Escuela de Superhéroes mientras las familias concilian.',
    chips: 'Hermanos −20%\nFestivos escolares',
    secciones: [
      {
        titulo: '🦸 Habilidades de superhéroe', tipo: 'chips',
        items: ['⚡ Agilidad', '💪 Fuerza', '🎯 Coordinación', '⚖️ Equilibrio', '🔋 Resistencia', '🤹 Destreza', '🤝 Equipo'],
      },
      {
        titulo: '🏃 Actividades incluidas', tipo: 'lista',
        items: ['Gimnasia acrobática', 'Parkour', 'Telas aéreas', 'Equilibrios', 'Circuitos', 'Juegos cooperativos', 'Retos físicos', 'Práctica libre'],
      },
    ],
  },
  domingos: {
    precio: 15, ivaIncluido: true, horario: '11:00 – 13:00', edad: 'Desde 2 años',
    nota: 'Adultos gratis · Menores de 2 años gratis', fechas: '', evento: '', plazas: 0, aforo: 0, imagen: '', estado: 'abierto',
    precioBono: 0, sesionesBono: 0, descuentoSocio: 0,
    titulo: 'Domingos en Familia', subtitulo: '',
    descripcion: 'Práctica libre dentro de nuestras instalaciones. Sin clases, sin presión — solo movimiento, juego y tiempo de calidad en familia.',
    chips: 'Todos los domingos\nAdultos gratis',
    secciones: [
      {
        titulo: '🌿 El ambiente', tipo: 'lista',
        items: ['🎵 Música de fondo', '🤸 Todo el material disponible', '🛡 Supervisión de monitores', '💬 Monitores resuelven dudas', '🏆 Espacios de juego libre'],
      },
      {
        titulo: '👶 Edades y precios', tipo: 'programa',
        items: [
          'Desde 2 años = 15 € por niño',
          'Menores de 2 años = Entrada gratuita acompañados',
          'Adultos = Siempre gratis · deben permanecer en la instalación',
          '⚠ Aviso = No es servicio de guardería',
        ],
      },
    ],
  },
  halloween: {
    precio: 0, ivaIncluido: true, horario: '22:00 – 09:00', edad: 'Mín. 10 años',
    nota: 'Plazas muy limitadas · El precio se confirma al contactar',
    fechas: '31 oct → 1 nov', evento: 'Apocalipsis Zombie', plazas: 20, aforo: 0, imagen: '', estado: 'proximo',
    precioBono: 0, sesionesBono: 0, descuentoSocio: 15,
    titulo: 'Noche de Halloween', subtitulo: 'Evento anual especial',
    descripcion: 'Una noche épica e inolvidable. Fiesta de pijamas temática, gymkana zombie, actividades nocturnas, película de terror y desayuno con churros al amanecer.',
    chips: '',
    secciones: [
      {
        titulo: 'Programa de la noche', tipo: 'programa',
        items: [
          '22:00 = 🧟 Inicio del apocalipsis',
          '22:00 – 23:00 = Gymkana temática zombie',
          '23:00 – 00:00 = Actividades y retos especiales',
          '00:00+ = Práctica libre',
          'Madrugada = 🎬 Película de terror (apta +10 años)',
          '08:00 – 09:00 = 🍫 Desayuno: churros con chocolate',
          '09:00 = 🏠 Recogida por las familias',
        ],
      },
    ],
  },

  // ───────────────────────────────────────────────────────────────────────────
  // Talleres infantiles (va cambiando de temática: Halloween, otoño, invierno…)
  'talleres-infantiles': {
    precio: 20, ivaIncluido: true, horario: '11:30 – 13:30', edad: 'De 2 a 5 años',
    nota: 'Pueden venir disfrazados, pero sin maquillaje: mancha el material de la sala.',
    fechas: 'Sábado 31 de octubre', evento: 'Halloween Infantil', plazas: 0, aforo: 0, imagen: '', estado: 'abierto',
    precioBono: 0, sesionesBono: 0, descuentoSocio: 15,
    titulo: 'Halloween Infantil', subtitulo: 'Taller infantil',
    descripcion: 'Dos horas de manualidades y juegos en la sala de colchonetas para los más pequeños de la casa. Papás y mamás son bienvenidos y entran gratis.',
    chips: 'Papás y mamás gratis\nManualidades y juegos\nSala de colchonetas',
    secciones: [
      {
        titulo: 'Qué vamos a hacer', tipo: 'lista',
        items: ['Manualidades temáticas', 'Juegos en la sala de colchonetas', 'Circuito de psicomotricidad', 'Photocall para las fotos'],
      },
      {
        titulo: 'Antes de venir', tipo: 'programa',
        items: [
          'Edad = De 2 a 5 años',
          'Disfraces = Pueden venir disfrazados',
          'Maquillaje = Mejor sin pintar la cara, porque mancha el material',
          'Acompañantes = Papás y mamás pueden quedarse, sin coste',
        ],
      },
    ],
  },

  'practica-libre': {
    precio: 15, ivaIncluido: true, horario: 'Martes y jueves · 20:00 – 21:30', edad: 'Desde 14 años',
    nota: 'Sesiones de hora y media. El bono se usa cuando quieras dentro de la temporada.',
    fechas: 'Martes y jueves', evento: '', plazas: 0, aforo: 0, imagen: '', estado: 'abierto',
    precioBono: 95, sesionesBono: 8, descuentoSocio: 15,
    titulo: 'Práctica Libre', subtitulo: 'Entrena por tu cuenta',
    descripcion: 'Abrimos la instalación para entrenar por tu cuenta: acrobacia, telas aéreas, parkour y preparación física, con un monitor de sala para resolver dudas y velar por la seguridad.',
    chips: 'Hora y media por sesión\nMonitor de sala',
    secciones: [
      {
        titulo: 'Cómo funciona', tipo: 'programa',
        items: [
          'Bono de 8 sesiones = 95 €, se usa cuando quieras dentro de la temporada',
          'Clase suelta = 15 €, se paga el mismo día',
          'Socios del club = 15 % de descuento en cualquiera de las dos opciones',
          'Horario = Martes y jueves, de 20:00 a 21:30',
        ],
      },
      {
        titulo: 'Qué puedes trabajar', tipo: 'lista',
        items: ['Acrobacia y suelo', 'Telas aéreas', 'Parkour', 'Preparación física', 'Trampolín', 'Material libre de la sala'],
      },
    ],
  },
}

export type FechaDSC = { fecha: string; label: string }

/** Parsea el texto de fechas de Días Sin Cole en una lista. */
export function parseFechasDSC(texto: string): FechaDSC[] {
  return texto.split('\n').map(l => l.trim()).filter(Boolean).map(l => {
    const m = l.match(/(\d{4}-\d{2}-\d{2})\s*[=|·-]?\s*(.*)/)
    if (m) return { fecha: m[1], label: m[2].trim() || m[1] }
    return { fecha: '', label: l }
  }).filter(f => f.fecha)
}
