// ─────────────────────────────────────────────────────────────────────────────
// CATÁLOGO CANÓNICO DE SERVICIOS
// Define todos los servicios de la web con sus campos editables por defecto.
// El panel guarda los cambios en la tabla `services` (columna `contenido`).
// getServicio() fusiona: valores por defecto (aquí) + cambios guardados (BD).
// ─────────────────────────────────────────────────────────────────────────────

export type Entidad = 'club' | 'empresa'
export type Estado = 'activo' | 'inactivo' | 'proximamente' | 'completo' | 'pausado' | 'oculto' | 'borrador'
export type BotonAccion = 'formulario' | 'reserva' | 'carrito' | 'presupuesto' | 'externo' | 'proximamente' | 'espera'
export type TipoServicio = 'clase' | 'reserva' | 'evento' | 'taller' | 'campamento' | 'producto' | 'curso' | 'excursion' | 'extraescolar'

export type ServicioContenido = {
  nombre: string
  entidad: Entidad
  categoria: string
  tipo: TipoServicio
  descripcionCorta: string
  descripcionLarga: string
  precio: number | null
  precioDesde: number | null
  iva: number | null            // % (ej. 21) o null si no aplica
  fianza: number | null
  edad: string
  plazas: number | null
  horarios: string
  fechas: string
  estado: Estado
  destacado: boolean
  botonTexto: string
  botonAccion: BotonAccion
  enlace: string                // ruta interna o URL externa
  imagen: string
  galeria: string[]
  profesores: string            // club
  niveles: string               // club
  faqs: { q: string; a: string }[]
  condiciones: string
  notasInternas: string
}

export type ServicioCatalogo = { id: string; icon: string } & ServicioContenido

const D = {
  precio: null, precioDesde: null, iva: null, fianza: null, plazas: null,
  fechas: '', destacado: false, imagen: '', galeria: [] as string[],
  profesores: '', niveles: '', faqs: [] as { q: string; a: string }[],
  condiciones: '', notasInternas: '',
}

export const CATALOGO_SERVICIOS: ServicioCatalogo[] = [
  // ── CLUB DEPORTIVO ORIGEN (siempre formulario, nunca compra) ──────────────
  {
    id: 'gimnasia-acrobatica', icon: '🤸', ...D,
    nombre: 'Gimnasia acrobática y trampolín', entidad: 'club', categoria: 'Club', tipo: 'clase',
    descripcionCorta: 'Acrobacias, saltos y trampolín desde los 6 años.',
    descripcionLarga: 'Disciplina de suelo y trampolín: volteos, figuras, fuerza y control corporal con progresión por niveles.',
    edad: 'Desde 6 años', horarios: 'Consultar horarios', estado: 'activo',
    botonTexto: 'Solicitar inscripción', botonAccion: 'formulario', enlace: '/servicios/gimnasia-acrobatica',
    profesores: 'Equipo técnico del club', niveles: 'Iniciación · Intermedio · Avanzado',
  },
  {
    id: 'telas-aereas', icon: '🎪', ...D,
    nombre: 'Telas Aéreas', entidad: 'club', categoria: 'Club', tipo: 'clase',
    descripcionCorta: 'Disciplina aérea en telas de circo.',
    descripcionLarga: 'Técnica aérea en tela: figuras, envolturas, fuerza y trabajo en altura con seguridad.',
    edad: 'Desde 6 años', horarios: 'Consultar horarios', estado: 'activo',
    botonTexto: 'Solicitar inscripción', botonAccion: 'formulario', enlace: '/servicios/telas-aereas',
    niveles: 'Iniciación · Intermedio · Avanzado',
  },
  {
    id: 'escuela-infantil', icon: '🧒', ...D,
    nombre: 'Escuela Infantil', entidad: 'club', categoria: 'Club', tipo: 'clase',
    descripcionCorta: 'Movimiento y circo para los más pequeños.',
    descripcionLarga: 'Psicomotricidad, juego y primeras habilidades circenses adaptadas a la etapa infantil.',
    edad: '3 a 5 años', horarios: 'Consultar horarios', estado: 'activo',
    botonTexto: 'Solicitar inscripción', botonAccion: 'formulario', enlace: '/servicios/escuela-infantil',
  },
  {
    id: 'jiu-jitsu', icon: '🥋', ...D,
    nombre: 'Jiu-Jitsu Brasileño', entidad: 'club', categoria: 'Club', tipo: 'clase',
    descripcionCorta: 'Arte marcial de agarre y suelo. Con Academia Adamas (Madrid).',
    descripcionLarga: 'Fundamentos y práctica de BJJ con instructores de Academia Adamas. Sábados 11:30-13:30.',
    edad: '+16 años', precio: 60, horarios: 'Sábados 11:30 – 13:30', estado: 'activo',
    botonTexto: 'Solicitar inscripción', botonAccion: 'formulario', enlace: '/servicios/jiu-jitsu',
    profesores: 'Academia Adamas · Madrid',
  },
  {
    id: 'escuela-bienestar', icon: '🧘', ...D,
    nombre: 'Escuela de Bienestar', entidad: 'club', categoria: 'Club', tipo: 'clase',
    descripcionCorta: 'Pilates, Yoga y Baile para adultos.',
    descripcionLarga: 'Actividad física para adultos centrada en bienestar, movilidad y relajación.',
    edad: 'Adultos', horarios: 'L, X, V · 09:30 – 10:30', estado: 'activo',
    botonTexto: 'Solicitar inscripción', botonAccion: 'formulario', enlace: '/servicios/escuela-bienestar',
  },
  {
    id: 'circo-inclusivo', icon: '♿', ...D,
    nombre: 'Circo Inclusivo', entidad: 'club', categoria: 'Club', tipo: 'clase',
    descripcionCorta: 'Circo adaptado y psicomotricidad. Con CADIG Crisol.',
    descripcionLarga: 'Programa de circo adaptado para personas con discapacidad intelectual, en colaboración con CADIG Crisol.',
    edad: 'Adultos', horarios: 'Miércoles', estado: 'activo',
    botonTexto: 'Pide más información', botonAccion: 'formulario', enlace: '/servicios/circo-inclusivo',
  },
  {
    id: 'talleres-intensivos', icon: '🎯', ...D,
    nombre: 'Talleres Intensivos', entidad: 'club', categoria: 'Club', tipo: 'taller',
    descripcionCorta: 'Formación específica de fin de semana (telas, backflip, verticales, BJJ).',
    descripcionLarga: 'Talleres monográficos de alta intensidad en disciplinas concretas. Fines de semana.',
    edad: 'Todos los niveles', horarios: 'Fines de semana', estado: 'proximamente',
    botonTexto: 'Avísame cuando se abra', botonAccion: 'espera', enlace: '/club/talleres-intensivos',
  },

  // ── EMPRESA (reservas, ecommerce, presupuestos) ───────────────────────────
  {
    id: 'cumpleanos', icon: '🎂', ...D,
    nombre: 'Cumpleaños', entidad: 'empresa', categoria: 'Ocio', tipo: 'reserva',
    descripcionCorta: '2 horas de actividad guiada, juegos y merienda incluida.',
    descripcionLarga: 'Celebración de cumpleaños con monitor, actividad guiada y merienda. Reserva online con fianza.',
    edad: 'Todas las edades', precioDesde: 11, fianza: 50, horarios: 'L-V 18:15 · Sáb-Dom 16:45 y 18:15', estado: 'activo',
    botonTexto: 'Reservar ahora', botonAccion: 'reserva', enlace: '/servicios/cumpleanos',
  },
  {
    id: 'campamentos', icon: '🏕️', ...D,
    nombre: 'Campamentos', entidad: 'empresa', categoria: 'Ocio', tipo: 'campamento',
    descripcionCorta: 'Escuela de Superhéroes en Navidad, Semana Santa y verano.',
    descripcionLarga: 'Campamentos por días sueltos o semanas completas. Cupón hermanos y horario ampliado disponibles.',
    edad: 'Desde 4 años', precioDesde: 25, horarios: '9:00 – 14:00 (ampliable)', estado: 'activo',
    botonTexto: 'Reservar', botonAccion: 'reserva', enlace: '/servicios/campamentos',
  },
  {
    id: 'eventos', icon: '🎉', ...D,
    nombre: 'Eventos y celebraciones', entidad: 'empresa', categoria: 'Eventos', tipo: 'evento',
    descripcionCorta: 'Animación para bodas, comuniones y fiestas. Y eventos en el centro.',
    descripcionLarga: 'Animación infantil a domicilio (packs) y eventos en instalaciones (días sin cole, domingos, Halloween).',
    edad: 'Todas las edades', precioDesde: 150, iva: 21, fianza: 50, horarios: 'A convenir', estado: 'activo',
    botonTexto: 'Solicitar presupuesto', botonAccion: 'presupuesto', enlace: '/servicios/eventos',
  },
  {
    id: 'manana-magica', icon: '✨', ...D,
    nombre: 'Mañanas Mágicas', entidad: 'empresa', categoria: 'Eventos', tipo: 'evento',
    descripcionCorta: 'Jornada temática con un personaje invitado distinto cada mes.',
    descripcionLarga: 'Mañana temática en nuestras instalaciones: show del personaje del mes, manualidades, actividades deportivas, pintacaras y photocall. El personaje cambia cada mes.',
    edad: 'Infantil y primaria', precioDesde: 30, horarios: '11:00 – 13:00', estado: 'activo',
    botonTexto: 'Editar personaje del mes', botonAccion: 'reserva', enlace: '/servicios/eventos',
  },
  {
    id: 'dias-sin-cole', icon: '⚡', ...D,
    nombre: 'Días Sin Cole', entidad: 'empresa', categoria: 'Eventos', tipo: 'evento',
    descripcionCorta: 'Mañanas de la Escuela de Superhéroes en los festivos escolares.',
    descripcionLarga: 'Días sin cole: actividades en nuestras instalaciones los festivos escolares. Fechas y precio editables.',
    edad: 'Desde 4 años', precioDesde: 30, iva: 21, horarios: '9:00 – 14:00', estado: 'activo',
    botonTexto: 'Editar fechas y precio', botonAccion: 'reserva', enlace: '/servicios/eventos',
  },
  {
    id: 'domingos', icon: '👨‍👩‍👧‍👦', ...D,
    nombre: 'Domingos en Familia', entidad: 'empresa', categoria: 'Eventos', tipo: 'evento',
    descripcionCorta: 'Práctica libre en familia todos los domingos. Adultos gratis.',
    descripcionLarga: 'Dos horas de juego libre en familia los domingos. Precio y horario editables.',
    edad: 'Desde 2 años', precioDesde: 15, horarios: '11:00 – 13:00', estado: 'activo',
    botonTexto: 'Editar precio y horario', botonAccion: 'reserva', enlace: '/servicios/eventos',
  },
  {
    id: 'halloween', icon: '🧟', ...D,
    nombre: 'Noche de Halloween', entidad: 'empresa', categoria: 'Eventos', tipo: 'evento',
    descripcionCorta: 'Evento anual especial: fiesta de pijamas temática nocturna.',
    descripcionLarga: 'Noche temática anual con gymkana, actividades y desayuno. Temática, fechas y plazas editables.',
    edad: 'Mín. 10 años', horarios: '22:00 – 09:00', estado: 'proximamente',
    botonTexto: 'Editar evento', botonAccion: 'reserva', enlace: '/servicios/eventos',
  },
  {
    id: 'talleres', icon: '🎪', ...D,
    nombre: 'Talleres de Circo', entidad: 'empresa', categoria: 'Eventos', tipo: 'taller',
    descripcionCorta: 'Talleres a medida para ayuntamientos, empresas y AMPAs.',
    descripcionLarga: 'Configurador de talleres con módulos (airtrack, pórtico, circo...) y cálculo de monitores y presupuesto.',
    edad: 'Todas las edades', horarios: 'A convenir', estado: 'activo',
    botonTexto: 'Configurar y pedir presupuesto', botonAccion: 'presupuesto', enlace: '/servicios/talleres',
  },
  {
    id: 'excursiones', icon: '🎒', ...D,
    nombre: 'Excursiones Escolares', entidad: 'empresa', categoria: 'Educación', tipo: 'excursion',
    descripcionCorta: '4 horas de actividad por estaciones para grupos escolares.',
    descripcionLarga: 'Jornada de circo, acrobacia, aéreos y expresión por rotaciones. 09:00-13:00 en nuestras instalaciones.',
    edad: 'Infantil · Primaria · Secundaria', horarios: '09:00 – 13:00', estado: 'activo',
    botonTexto: 'Solicitar presupuesto', botonAccion: 'presupuesto', enlace: '/servicios/excursiones',
  },
  {
    id: 'extraescolares', icon: '🏃', ...D,
    nombre: 'Actividades Extraescolares', entidad: 'empresa', categoria: 'Educación', tipo: 'extraescolar',
    descripcionCorta: 'Multideporte en el propio colegio. Para AMPAs y centros.',
    descripcionLarga: 'Nos desplazamos al centro. 1 hora/sesión, 1-2 días por semana, infantil y primaria.',
    edad: 'Infantil (3-5) · Primaria (6-12)', horarios: '1 hora/sesión', estado: 'activo',
    botonTexto: 'Solicitar información', botonAccion: 'presupuesto', enlace: '/servicios/extraescolares',
  },
  {
    id: 'monitor-juvenil', icon: '🎓', ...D,
    nombre: 'Curso Monitor de Actividades Juveniles', entidad: 'empresa', categoria: 'Educación', tipo: 'curso',
    descripcionCorta: 'Titulación oficial. En colaboración con ARKHE.',
    descripcionLarga: 'Curso homologado Junta CLM. Julio 2026 en Cuenca, Tarancón y Motilla. Inscripción vía ARKHE.',
    edad: '+16 años', horarios: 'Jul 2026 · L-V 10:00-14:00', estado: 'activo',
    botonTexto: 'Descubre e inscríbete', botonAccion: 'externo', enlace: 'https://www.arkhe.com',
  },
  {
    id: 'piea', icon: '🌿', ...D,
    nombre: 'PIEA · Envejecimiento Activo', entidad: 'empresa', categoria: 'Ocio', tipo: 'taller',
    descripcionCorta: 'Programas de movimiento en residencias y talleres para mayores.',
    descripcionLarga: 'Programa de Integración y Envejecimiento Activo: actividad física y dinamización en residencias y talleres (bingo musical, arte, estimulación cognitiva, ergonomía) para ayuntamientos y entidades.',
    edad: 'Personas mayores', precioDesde: 200, horarios: '1 h/sesión', estado: 'activo',
    botonTexto: 'Solicitar información', botonAccion: 'presupuesto', enlace: '/servicios/piea',
  },
  {
    id: 'licitaciones', icon: '🏛️', ...D,
    nombre: 'Licitaciones y contratos públicos', entidad: 'empresa', categoria: 'Ocio', tipo: 'taller',
    descripcionCorta: 'Programas deportivos, educativos y sociales para administraciones mediante contratos y licitaciones.',
    descripcionLarga: 'Diseño, gestión y ejecución de programas para ayuntamientos, diputaciones, residencias y entidades: envejecimiento activo, ocio municipal, ludotecas y programas deportivos, mediante contratos menores, de servicios, anuales, plurianuales y licitaciones.',
    edad: 'Administraciones y entidades', horarios: 'Proyectos a medida', estado: 'activo',
    botonTexto: 'Hablemos de tu proyecto', botonAccion: 'formulario', enlace: '/servicios/licitaciones',
  },
  {
    id: 'colchonetas', icon: '🛒', ...D,
    nombre: 'Colchonetas', entidad: 'empresa', categoria: 'Tienda', tipo: 'producto',
    descripcionCorta: 'Colchonetas profesionales: Nube Portátil, Dual Impact y Quitamiedos.',
    descripcionLarga: 'Colchonetas deportivas fabricadas a medida. Compra online o solicita personalización.',
    edad: '—', precioDesde: 349, horarios: '—', estado: 'activo',
    botonTexto: 'Ver y comprar', botonAccion: 'carrito', enlace: '/colchonetas',
  },
]

export const CATALOGO_MAP = new Map(CATALOGO_SERVICIOS.map(s => [s.id, s]))
