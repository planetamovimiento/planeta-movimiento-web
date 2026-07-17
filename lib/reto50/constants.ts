// ─────────────────────────────────────────────────────────────────────────────
// 50 días, 50 provincias · Constantes y helpers puros (servidor + cliente).
//
// Fuente: dossier oficial y PDF de rutas (versión 3 revisada) del reto de
// Brosjaca a beneficio de la Asociación Española Contra el Cáncer.
//
// IMPORTANTE: este fichero lo importan componentes de cliente. No añadas aquí
// las notas internas de planificación de la ruta: viven solo en la columna
// reto50_etapas.notas_internas y no salen nunca del panel.
// ─────────────────────────────────────────────────────────────────────────────

export const TOTAL_DIAS = 50
export const TOTAL_PROVINCIAS = 50

/** Datos oficiales del reto. Cualquier cifra de aquí sale del dossier. */
export const RETO = {
  nombre: '50 días, 50 provincias',
  protagonista: 'Brosjaca',
  protagonistaNombre: 'Josué Jaime',
  organiza: 'Planeta Movimiento',
  causa: 'Asociación Española Contra el Cáncer',
  ejercicio: 'burflip',
  /** El reto anual: un burflip más cada día durante los 365 días del año. */
  diasRetoAnual: 365,
  fechaInicio: '2026-07-19',
  fechaFin: '2026-09-06',
  /** El 19/07 es el día 200 del reto anual: ese día toca 200 repeticiones. */
  burflipsInicio: 200,
  burflipsFin: 249,
  ciudadInicio: 'Cuenca',
  ciudadFin: 'Madrid',
} as const

/** Cifras de impacto publicadas en el dossier. */
export const IMPACTO = [
  { valor: '+117.000', label: 'Seguidores en redes' },
  { valor: '+5 M', label: 'Visualizaciones' },
  { valor: '+981.000', label: 'Cuentas alcanzadas' },
  { valor: '+123.500', label: 'Interacciones' },
] as const

/**
 * Estado de cada etapa. Se marca a mano desde el panel: que una fecha haya
 * pasado no significa que la etapa se hiciera (puede haber retrasos, cambios
 * de ruta o cancelaciones), así que nada se completa solo.
 */
export type EstadoEtapa = 'proximamente' | 'en-curso' | 'finalizada' | 'modificada' | 'cancelada'

export const ESTADOS_ETAPA: {
  id: EstadoEtapa
  label: string
  badge: string
  dot: string
  /** Color del punto en el mapa (SVG, necesita el valor, no la clase). */
  color: string
}[] = [
  { id: 'proximamente', label: 'Pendiente',    badge: 'bg-gray-100 text-gray-500',       dot: 'bg-gray-300',    color: '#CBD5E1' },
  { id: 'en-curso',     label: 'Etapa actual', badge: 'bg-pm-red text-white',            dot: 'bg-pm-red',      color: '#D42B2B' },
  { id: 'finalizada',   label: 'Completada',   badge: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500', color: '#10B981' },
  { id: 'modificada',   label: 'Modificada',   badge: 'bg-blue-100 text-blue-700',       dot: 'bg-blue-500',    color: '#3B82F6' },
  { id: 'cancelada',    label: 'Cancelada',    badge: 'bg-gray-200 text-gray-600',       dot: 'bg-gray-500',    color: '#6B7280' },
]

export const labelEstadoEtapa = (id: string) => ESTADOS_ETAPA.find(e => e.id === id)?.label ?? 'Pendiente'
export const badgeEstadoEtapa = (id: string) => ESTADOS_ETAPA.find(e => e.id === id)?.badge ?? 'bg-gray-100 text-gray-500'
export const dotEstadoEtapa = (id: string) => ESTADOS_ETAPA.find(e => e.id === id)?.dot ?? 'bg-gray-300'
export const colorEstadoEtapa = (id: string) => ESTADOS_ETAPA.find(e => e.id === id)?.color ?? '#CBD5E1'

/** La etapa donde está Brosjaca ahora mismo. Solo puede haber una. */
export const ESTADO_ACTUAL: EstadoEtapa = 'en-curso'
/** Etiqueta corta para el mapa y el calendario. */
export const AQUI = 'Estamos aquí'

/** Etapas ya hechas. */
export const ESTADOS_HECHOS: EstadoEtapa[] = ['finalizada']
/** Estados que sacan a la etapa de la carrera por ser "próxima parada". */
export const ESTADOS_CERRADOS: EstadoEtapa[] = ['finalizada', 'cancelada']

// ── Patrocinadores y colaboradores ───────────────────────────────────────────

/** Dos categorías distintas, nunca mezcladas en la web. */
export type CategoriaApoyo = 'patrocinador' | 'colaborador'

export const CATEGORIAS_APOYO: { id: CategoriaApoyo; label: string; singular: string; desc: string }[] = [
  {
    id: 'patrocinador',
    label: 'Patrocinadores',
    singular: 'Patrocinador',
    desc: 'Empresas y entidades que aportan al proyecto de forma económica, material o principal.',
  },
  {
    id: 'colaborador',
    label: 'Colaboradores',
    singular: 'Colaborador',
    desc: 'Asociaciones, entidades, personas y proyectos que ayudan en la organización, la difusión o el desarrollo del reto.',
  },
]

export const labelCategoria = (id: string) => CATEGORIAS_APOYO.find(c => c.id === id)?.label ?? id

export const NIVELES_PATROCINIO: { id: string; label: string }[] = [
  { id: 'organizador',   label: 'Organizador' },
  { id: 'principal',     label: 'Principal' },
  { id: 'oficial',       label: 'Oficial' },
  { id: 'institucional', label: 'Institucional' },
  { id: 'medios',        label: 'Medios' },
  { id: 'apoyo',         label: 'Apoyo' },
]

export const labelNivel = (id: string) => NIVELES_PATROCINIO.find(n => n.id === id)?.label ?? id

/** Claves de texto/enlace editables desde el panel. */
export const CLAVES_CONFIG = [
  'hero_titulo', 'hero_subtitulo', 'hero_imagen', 'hero_video',
  'intro_texto', 'quien_es_texto', 'dossier_url', 'donacion_url',
  'objetivo_global', 'instagram_url', 'tiktok_url', 'youtube_url',
  'facebook_url', 'web_brosjaca', 'contacto_email', 'contacto_telefono',
  'qr_titulo', 'qr_texto',
  'gasolina_recaudado', 'gasolina_actualizado', 'gasolina_nota',
  'gasolina_objetivo_eur', 'gasolina_objetivo_litros',
] as const

export type ClaveConfig = (typeof CLAVES_CONFIG)[number]

/** Fecha larga en español: 2026-07-19 → "domingo, 19 de julio" */
export function fechaLarga(iso: string): string {
  const d = new Date(iso + 'T12:00:00Z')
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' })
}

/** Fecha corta: 2026-07-19 → "19 jul" */
export function fechaCorta(iso: string): string {
  const d = new Date(iso + 'T12:00:00Z')
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', timeZone: 'UTC' })
}

// ── Vídeos de YouTube ────────────────────────────────────────────────────────

/**
 * Saca el identificador de un enlace de YouTube. Admite los formatos que se
 * copian de verdad desde el navegador o el móvil: watch, enlace corto, embed,
 * shorts, directos y la variante sin cookies. Devuelve '' si no es válido.
 */
export function youtubeId(url: string): string {
  const s = (url || '').trim()
  if (!s) return ''
  const patrones = [
    /youtube\.com\/watch\?(?:[^#]*&)?v=([A-Za-z0-9_-]{11})/,
    /youtu\.be\/([A-Za-z0-9_-]{11})/,
    /youtube(?:-nocookie)?\.com\/embed\/([A-Za-z0-9_-]{11})/,
    /youtube\.com\/shorts\/([A-Za-z0-9_-]{11})/,
    /youtube\.com\/live\/([A-Za-z0-9_-]{11})/,
    /youtube\.com\/v\/([A-Za-z0-9_-]{11})/,
  ]
  for (const p of patrones) {
    const m = s.match(p)
    if (m) return m[1]
  }
  // Alguien puede pegar solo el identificador.
  return /^[A-Za-z0-9_-]{11}$/.test(s) ? s : ''
}

/** ¿Es un enlace de YouTube que sabemos reproducir? */
export const esYoutubeValido = (url: string) => youtubeId(url) !== ''

/** Reproductor. Se usa nocookie: no rastrea hasta que se le da al play. */
export const youtubeEmbed = (id: string) => `https://www.youtube-nocookie.com/embed/${id}`
export const youtubeWatch = (id: string) => `https://www.youtube.com/watch?v=${id}`
/** Carátula que sirve el propio YouTube. */
export const youtubeMiniatura = (id: string) => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`

// ── Objetivo de gasolina ─────────────────────────────────────────────────────

/** Objetivo de partida: 750 litros ≈ 1.500 €. Editable desde el panel. */
export const GASOLINA_DEFAULT = { objetivoEur: 1500, objetivoLitros: 750 }

export type ResumenGasolina = {
  /** null = todavía no se ha introducido ninguna cifra. */
  recaudado: number | null
  objetivoEur: number
  objetivoLitros: number
  /** Porcentaje real: puede pasar del 100 %. */
  porcentaje: number
  /** Porcentaje para pintar el depósito: nunca pasa del 100 %. */
  porcentajeVisual: number
  /** Litros equivalentes a lo recaudado. */
  litros: number
  restanteEur: number
  restanteLitros: number
  completado: boolean
}

/**
 * Cuentas del depósito. La equivalencia litros/euro sale del propio objetivo
 * (750 L / 1.500 € = 0,5 L por euro → 500 € = 250 litros), así que si mañana
 * se cambia el objetivo los litros siguen cuadrando sin tocar el código.
 */
export function calcGasolina(
  recaudado: number | null,
  objetivoEur?: number | null,
  objetivoLitros?: number | null,
): ResumenGasolina {
  const eur = objetivoEur && objetivoEur > 0 ? objetivoEur : GASOLINA_DEFAULT.objetivoEur
  const litrosObjetivo = objetivoLitros && objetivoLitros > 0 ? objetivoLitros : GASOLINA_DEFAULT.objetivoLitros
  const r = recaudado ?? 0
  const porcentaje = (r / eur) * 100
  const litros = r * (litrosObjetivo / eur)
  return {
    recaudado,
    objetivoEur: eur,
    objetivoLitros: litrosObjetivo,
    porcentaje,
    porcentajeVisual: Math.max(0, Math.min(100, porcentaje)),
    litros,
    restanteEur: Math.max(0, eur - r),
    restanteLitros: Math.max(0, litrosObjetivo - litros),
    completado: r >= eur,
  }
}

/** Litros con como mucho un decimal: 250 L, 12,5 L. */
export function litros(v: number): string {
  return `${new Intl.NumberFormat('es-ES', { maximumFractionDigits: 1 }).format(v)} L`
}

/** Importe en euros. Devuelve '' si no hay dato (nunca inventa un 0 €). */
export function euros(v: number | null | undefined): string {
  if (v == null || !Number.isFinite(v)) return ''
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(v)
}

/** Coordenadas aproximadas de la capital de cada provincia (para el mapa). */
export const COORDS_PROVINCIA: Record<string, { lat: number; lng: number }> = {
  'Cuenca': { lat: 40.07, lng: -2.13 },
  'Albacete': { lat: 38.99, lng: -1.86 },
  'Murcia': { lat: 37.99, lng: -1.13 },
  'Alicante': { lat: 38.35, lng: -0.48 },
  'Castellón': { lat: 39.99, lng: -0.04 },
  'Tarragona': { lat: 41.12, lng: 1.25 },
  'Barcelona': { lat: 41.39, lng: 2.17 },
  'Girona': { lat: 41.98, lng: 2.82 },
  'Lleida': { lat: 41.62, lng: 0.62 },
  'Huesca': { lat: 42.13, lng: -0.41 },
  'Zaragoza': { lat: 41.65, lng: -0.89 },
  'Soria': { lat: 41.76, lng: -2.47 },
  'Guadalajara': { lat: 40.63, lng: -3.16 },
  'Teruel': { lat: 40.34, lng: -1.11 },
  'La Rioja': { lat: 42.47, lng: -2.45 },
  'Navarra': { lat: 42.81, lng: -1.64 },
  'Gipuzkoa': { lat: 43.32, lng: -1.98 },
  'Bizkaia': { lat: 43.26, lng: -2.93 },
  'Álava': { lat: 42.85, lng: -2.67 },
  'Cantabria': { lat: 43.46, lng: -3.8 },
  'Asturias': { lat: 43.36, lng: -5.85 },
  'Lugo': { lat: 43.01, lng: -7.56 },
  'A Coruña': { lat: 43.36, lng: -8.41 },
  'Pontevedra': { lat: 42.43, lng: -8.64 },
  'Ourense': { lat: 42.34, lng: -7.86 },
  'León': { lat: 42.6, lng: -5.57 },
  'Zamora': { lat: 41.5, lng: -5.75 },
  'Salamanca': { lat: 40.97, lng: -5.66 },
  'Cáceres': { lat: 39.47, lng: -6.37 },
  'Badajoz': { lat: 38.88, lng: -6.97 },
  'Huelva': { lat: 37.26, lng: -6.95 },
  'Sevilla': { lat: 37.39, lng: -5.98 },
  'Cádiz': { lat: 36.53, lng: -6.29 },
  'Málaga': { lat: 36.72, lng: -4.42 },
  'Granada': { lat: 37.18, lng: -3.6 },
  'Almería': { lat: 36.84, lng: -2.46 },
  'Jaén': { lat: 37.77, lng: -3.79 },
  'Córdoba': { lat: 37.89, lng: -4.78 },
  'Ciudad Real': { lat: 38.99, lng: -3.93 },
  'Valencia': { lat: 39.47, lng: -0.38 },
  'Toledo': { lat: 39.86, lng: -4.03 },
  'Ávila': { lat: 40.66, lng: -4.7 },
  'Segovia': { lat: 40.95, lng: -4.12 },
  'Valladolid': { lat: 41.65, lng: -4.72 },
  'Palencia': { lat: 42.01, lng: -4.53 },
  'Burgos': { lat: 42.34, lng: -3.7 },
  'Illes Balears': { lat: 39.57, lng: 2.65 },
  'Las Palmas': { lat: 28.12, lng: -15.43 },
  'Santa Cruz de Tenerife': { lat: 28.47, lng: -16.25 },
  'Madrid': { lat: 40.42, lng: -3.7 },
}

/**
 * Ruta oficial de respaldo. Se usa si la tabla reto50_etapas todavía no existe
 * (migración sin ejecutar), para que la página pública nunca salga vacía.
 */
export const RUTA_SEED: {
  dia: number; fecha: string; provincia: string; ciudad: string
  burflips: number; kmAprox: string; tiempoAprox: string
}[] = [
  { dia: 1, fecha: '2026-07-19', provincia: 'Cuenca', ciudad: 'Cuenca / Planeta Movimiento', burflips: 200, kmAprox: '0', tiempoAprox: '0h' },
  { dia: 2, fecha: '2026-07-20', provincia: 'Albacete', ciudad: 'Albacete', burflips: 201, kmAprox: '170', tiempoAprox: '2h' },
  { dia: 3, fecha: '2026-07-21', provincia: 'Murcia', ciudad: 'Murcia / Cartagena', burflips: 202, kmAprox: '150', tiempoAprox: '1h45-2h' },
  { dia: 4, fecha: '2026-07-22', provincia: 'Alicante', ciudad: 'Torrevieja / Alicante', burflips: 203, kmAprox: '85', tiempoAprox: '1h-1h15' },
  { dia: 5, fecha: '2026-07-23', provincia: 'Castellón', ciudad: 'Castellón', burflips: 204, kmAprox: '260', tiempoAprox: '3h' },
  { dia: 6, fecha: '2026-07-24', provincia: 'Tarragona', ciudad: 'Tarragona', burflips: 205, kmAprox: '190', tiempoAprox: '2h15' },
  { dia: 7, fecha: '2026-07-25', provincia: 'Barcelona', ciudad: 'Barcelona', burflips: 206, kmAprox: '100', tiempoAprox: '1h15' },
  { dia: 8, fecha: '2026-07-26', provincia: 'Girona', ciudad: 'Girona / Costa Brava', burflips: 207, kmAprox: '105', tiempoAprox: '1h20' },
  { dia: 9, fecha: '2026-07-27', provincia: 'Lleida', ciudad: 'Lleida', burflips: 208, kmAprox: '250', tiempoAprox: '2h40-2h50' },
  { dia: 10, fecha: '2026-07-28', provincia: 'Huesca', ciudad: 'Huesca / Pirineo', burflips: 209, kmAprox: '150', tiempoAprox: '1h45' },
  { dia: 11, fecha: '2026-07-29', provincia: 'Zaragoza', ciudad: 'Zaragoza', burflips: 210, kmAprox: '75', tiempoAprox: '1h' },
  { dia: 12, fecha: '2026-07-30', provincia: 'Soria', ciudad: 'Soria', burflips: 211, kmAprox: '160', tiempoAprox: '2h-2h15' },
  { dia: 13, fecha: '2026-07-31', provincia: 'Guadalajara', ciudad: 'Guadalajara', burflips: 212, kmAprox: '350-370', tiempoAprox: '4h-4h30 total' },
  { dia: 14, fecha: '2026-08-01', provincia: 'Teruel', ciudad: 'Teruel / Albarracín', burflips: 213, kmAprox: '170-180', tiempoAprox: '2h' },
  { dia: 15, fecha: '2026-08-02', provincia: 'La Rioja', ciudad: 'Logroño', burflips: 214, kmAprox: '230', tiempoAprox: '2h45' },
  { dia: 16, fecha: '2026-08-03', provincia: 'Navarra', ciudad: 'Pamplona', burflips: 215, kmAprox: '95', tiempoAprox: '1h15' },
  { dia: 17, fecha: '2026-08-04', provincia: 'Gipuzkoa', ciudad: 'San Sebastián', burflips: 216, kmAprox: '90', tiempoAprox: '1h15' },
  { dia: 18, fecha: '2026-08-05', provincia: 'Bizkaia', ciudad: 'Bilbao', burflips: 217, kmAprox: '100', tiempoAprox: '1h15' },
  { dia: 19, fecha: '2026-08-06', provincia: 'Álava', ciudad: 'Vitoria-Gasteiz', burflips: 218, kmAprox: '70', tiempoAprox: '1h' },
  { dia: 20, fecha: '2026-08-07', provincia: 'Cantabria', ciudad: 'Santander / Laredo', burflips: 219, kmAprox: '160', tiempoAprox: '2h' },
  { dia: 21, fecha: '2026-08-08', provincia: 'Asturias', ciudad: 'Ribadesella / Oviedo', burflips: 220, kmAprox: '200', tiempoAprox: '2h30' },
  { dia: 22, fecha: '2026-08-09', provincia: 'Lugo', ciudad: 'Lugo', burflips: 221, kmAprox: '230', tiempoAprox: '2h45' },
  { dia: 23, fecha: '2026-08-10', provincia: 'A Coruña', ciudad: 'A Coruña', burflips: 222, kmAprox: '100', tiempoAprox: '1h15' },
  { dia: 24, fecha: '2026-08-11', provincia: 'Pontevedra', ciudad: 'Pontevedra / Vigo', burflips: 223, kmAprox: '140', tiempoAprox: '1h30' },
  { dia: 25, fecha: '2026-08-12', provincia: 'Ourense', ciudad: 'Ourense', burflips: 224, kmAprox: '115', tiempoAprox: '1h20' },
  { dia: 26, fecha: '2026-08-13', provincia: 'León', ciudad: 'León', burflips: 225, kmAprox: '210', tiempoAprox: '3h' },
  { dia: 27, fecha: '2026-08-14', provincia: 'Zamora', ciudad: 'Zamora', burflips: 226, kmAprox: '140', tiempoAprox: '1h45' },
  { dia: 28, fecha: '2026-08-15', provincia: 'Salamanca', ciudad: 'Salamanca', burflips: 227, kmAprox: '65', tiempoAprox: '1h' },
  { dia: 29, fecha: '2026-08-16', provincia: 'Cáceres', ciudad: 'Cáceres', burflips: 228, kmAprox: '210', tiempoAprox: '2h30' },
  { dia: 30, fecha: '2026-08-17', provincia: 'Badajoz', ciudad: 'Badajoz', burflips: 229, kmAprox: '95', tiempoAprox: '1h15' },
  { dia: 31, fecha: '2026-08-18', provincia: 'Huelva', ciudad: 'Huelva / entorno Doñana', burflips: 230, kmAprox: '215', tiempoAprox: '2h45' },
  { dia: 32, fecha: '2026-08-19', provincia: 'Sevilla', ciudad: 'Sevilla', burflips: 231, kmAprox: '95', tiempoAprox: '1h15' },
  { dia: 33, fecha: '2026-08-20', provincia: 'Cádiz', ciudad: 'Cádiz / Sanlúcar', burflips: 232, kmAprox: '125', tiempoAprox: '1h30' },
  { dia: 34, fecha: '2026-08-21', provincia: 'Málaga', ciudad: 'Málaga', burflips: 233, kmAprox: '235', tiempoAprox: '2h45' },
  { dia: 35, fecha: '2026-08-22', provincia: 'Granada', ciudad: 'Granada', burflips: 234, kmAprox: '130', tiempoAprox: '1h40' },
  { dia: 36, fecha: '2026-08-23', provincia: 'Almería', ciudad: 'Almería / Tabernas', burflips: 235, kmAprox: '170', tiempoAprox: '2h' },
  { dia: 37, fecha: '2026-08-24', provincia: 'Jaén', ciudad: 'Jaén', burflips: 236, kmAprox: '205', tiempoAprox: '2h30' },
  { dia: 38, fecha: '2026-08-25', provincia: 'Córdoba', ciudad: 'Córdoba', burflips: 237, kmAprox: '115', tiempoAprox: '1h30' },
  { dia: 39, fecha: '2026-08-26', provincia: 'Ciudad Real', ciudad: 'Ciudad Real', burflips: 238, kmAprox: '205', tiempoAprox: '2h30' },
  { dia: 40, fecha: '2026-08-27', provincia: 'Valencia', ciudad: 'Valencia / Buñol', burflips: 239, kmAprox: '350', tiempoAprox: '3h45-4h' },
  { dia: 41, fecha: '2026-08-28', provincia: 'Toledo', ciudad: 'Toledo', burflips: 240, kmAprox: '350', tiempoAprox: '3h45-4h' },
  { dia: 42, fecha: '2026-08-29', provincia: 'Ávila', ciudad: 'Ávila', burflips: 241, kmAprox: '155', tiempoAprox: '2h' },
  { dia: 43, fecha: '2026-08-30', provincia: 'Segovia', ciudad: 'Segovia', burflips: 242, kmAprox: '70', tiempoAprox: '1h' },
  { dia: 44, fecha: '2026-08-31', provincia: 'Valladolid', ciudad: 'Valladolid', burflips: 243, kmAprox: '120', tiempoAprox: '1h30' },
  { dia: 45, fecha: '2026-09-01', provincia: 'Palencia', ciudad: 'Palencia', burflips: 244, kmAprox: '50', tiempoAprox: '45m' },
  { dia: 46, fecha: '2026-09-02', provincia: 'Burgos', ciudad: 'Burgos', burflips: 245, kmAprox: '95', tiempoAprox: '1h' },
  { dia: 47, fecha: '2026-09-03', provincia: 'Illes Balears', ciudad: 'Palma', burflips: 246, kmAprox: '245 km + vuelo', tiempoAprox: '2h45 coche + 1h30 vuelo' },
  { dia: 48, fecha: '2026-09-04', provincia: 'Las Palmas', ciudad: 'Gran Canaria', burflips: 247, kmAprox: 'Vuelo', tiempoAprox: '3h-5h con escala' },
  { dia: 49, fecha: '2026-09-05', provincia: 'Santa Cruz de Tenerife', ciudad: 'Tenerife', burflips: 248, kmAprox: 'Vuelo/ferry', tiempoAprox: '40m-1h30' },
  { dia: 50, fecha: '2026-09-06', provincia: 'Madrid', ciudad: 'Madrid', burflips: 249, kmAprox: 'Vuelo', tiempoAprox: '2h45-3h' },
]
