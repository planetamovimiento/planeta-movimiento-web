// ─────────────────────────────────────────────────────────────────────────────
// 50 días, 50 provincias · Lecturas (solo servidor, service-role).
//
// Las escrituras viven en app/admin/50dias50provincias/actions.ts.
// Si la migración todavía no se ha ejecutado, se sirve la ruta oficial de
// respaldo (RUTA_SEED) para que la página pública nunca salga vacía.
// ─────────────────────────────────────────────────────────────────────────────

import { createAdminClient } from '@/lib/supabase/admin'
import { COORDS_PROVINCIA, ESTADOS_CERRADOS, ESTADO_ACTUAL, RUTA_SEED, TOTAL_PROVINCIAS, calcGasolina } from './constants'
import type { CategoriaApoyo, EstadoEtapa, ResumenGasolina } from './constants'
import type { ConfigReto, Donante, Etapa, EtapaPublica, FaqItem, Patrocinador, QrDonacion, ResumenReto } from './tipos'

type Row = Record<string, unknown>

const str = (v: unknown) => (typeof v === 'string' ? v : v == null ? '' : String(v))
const num = (v: unknown) => { const n = Number(v); return Number.isFinite(n) ? n : 0 }
/** Devuelve null si no hay dato: Number(null) === 0 y aquí un 0 mentiría. */
const numONull = (v: unknown) => {
  if (v == null || v === '') return null
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}

/** Ejecuta una consulta y devuelve [] si la tabla aún no existe o falla. */
async function safe<T>(fn: () => Promise<{ data: T[] | null; error: unknown }>): Promise<T[]> {
  try {
    const { data, error } = await fn()
    return error ? [] : (data ?? [])
  } catch {
    return []
  }
}

function aEtapa(r: Row): Etapa {
  const provincia = str(r.provincia)
  const coords = COORDS_PROVINCIA[provincia]
  return {
    id: str(r.id),
    dia: num(r.dia),
    fecha: r.fecha ? str(r.fecha).slice(0, 10) : '',
    provincia,
    ciudad: str(r.ciudad),
    hora: str(r.hora),
    puntoEncuentro: str(r.punto_encuentro),
    lat: numONull(r.lat) ?? coords?.lat ?? null,
    lng: numONull(r.lng) ?? coords?.lng ?? null,
    burflips: num(r.burflips),
    trayecto: str(r.trayecto),
    kmAprox: str(r.km_aprox),
    tiempoAprox: str(r.tiempo_aprox),
    descripcion: str(r.descripcion),
    estado: (str(r.estado) || 'proximamente') as EstadoEtapa,
    recaudado: numONull(r.recaudado),
    asistentes: numONull(r.asistentes),
    resumen: str(r.resumen),
    galeria: Array.isArray(r.galeria) ? (r.galeria as unknown[]).map(str).filter(Boolean) : [],
    videoUrl: str(r.video_url),
    videoTitulo: str(r.video_titulo),
    videoDescripcion: str(r.video_descripcion),
    videoMiniatura: str(r.video_miniatura),
    videoFecha: r.video_fecha ? str(r.video_fecha).slice(0, 10) : '',
    enlaceRedes: str(r.enlace_redes),
    testimonios: str(r.testimonios),
    notasInternas: str(r.notas_internas),
    orden: num(r.orden),
  }
}

/** Ruta oficial de respaldo mientras no exista la tabla. */
function etapasDeSeed(): Etapa[] {
  return RUTA_SEED.map(e => {
    const coords = COORDS_PROVINCIA[e.provincia]
    return {
      id: `seed-${e.dia}`,
      dia: e.dia,
      fecha: e.fecha,
      provincia: e.provincia,
      ciudad: e.ciudad,
      hora: '',
      puntoEncuentro: '',
      lat: coords?.lat ?? null,
      lng: coords?.lng ?? null,
      burflips: e.burflips,
      // El respaldo no lleva trayecto: vive solo en la base de datos, para el panel.
      trayecto: '',
      kmAprox: e.kmAprox,
      tiempoAprox: e.tiempoAprox,
      descripcion: '',
      estado: 'proximamente' as EstadoEtapa,
      recaudado: null,
      asistentes: null,
      resumen: '',
      galeria: [],
      videoUrl: '',
      videoTitulo: '',
      videoDescripcion: '',
      videoMiniatura: '',
      videoFecha: '',
      enlaceRedes: '',
      testimonios: '',
      notasInternas: '',
      orden: e.dia,
    }
  })
}

/** Las 50 etapas ordenadas por día. Incluye notas internas: solo para el panel. */
export async function getEtapas(): Promise<Etapa[]> {
  const db = createAdminClient()
  const rows = await safe<Row>(() => db.from('reto50_etapas').select('*') as never)
  if (rows.length === 0) return etapasDeSeed()
  return rows.map(aEtapa).sort((a, b) => a.dia - b.dia)
}

/** Quita la planificación interna: lo que queda es lo único que llega a la web. */
export function aPublica(e: Etapa): EtapaPublica {
  const { notasInternas: _notasInternas, trayecto: _trayecto, ...publica } = e
  return publica
}

/** Las 50 etapas sin notas internas, para la página pública. */
export async function getEtapasPublicas(): Promise<EtapaPublica[]> {
  return (await getEtapas()).map(aPublica)
}

/** ¿Existe ya la tabla? Sirve para avisar en el panel de la migración pendiente. */
export async function hayTablaEtapas(): Promise<boolean> {
  const db = createAdminClient()
  try {
    const { error } = await db.from('reto50_etapas').select('id').limit(1)
    return !error
  } catch {
    return false
  }
}

/** La etapa donde está Brosjaca ahora. Se marca a mano; solo puede haber una. */
export function etapaActual<T extends { estado: EstadoEtapa }>(etapas: T[]): T | null {
  return etapas.find(e => e.estado === ESTADO_ACTUAL) ?? null
}


/** Totales del reto. Devuelve null en lo que todavía no tiene ningún dato. */
export function resumenReto(etapas: { estado: EstadoEtapa; recaudado: number | null; asistentes: number | null }[]): ResumenReto {
  const conRecaudacion = etapas.filter(e => e.recaudado != null)
  const conAsistentes = etapas.filter(e => e.asistentes != null)
  return {
    recaudadoTotal: conRecaudacion.length ? conRecaudacion.reduce((s, e) => s + (e.recaudado ?? 0), 0) : null,
    participantes: conAsistentes.length ? conAsistentes.reduce((s, e) => s + (e.asistentes ?? 0), 0) : null,
    provinciasCompletadas: etapas.filter(e => e.estado === 'finalizada').length,
    totalProvincias: TOTAL_PROVINCIAS,
  }
}

function aPatrocinador(r: Row): Patrocinador {
  return {
    id: str(r.id),
    nombre: str(r.nombre),
    descripcion: str(r.descripcion),
    logoUrl: str(r.logo_url),
    webUrl: str(r.web_url),
    // Si la columna aún no existe (migración de categorías sin ejecutar), es patrocinador.
    categoria: str(r.categoria) === 'colaborador' ? 'colaborador' : 'patrocinador',
    nivel: str(r.nivel) || 'apoyo',
    orden: num(r.orden),
    activo: r.activo !== false,
    destacado: r.destacado === true,
  }
}

/** Patrocinadores de respaldo mientras no exista la tabla (los del dossier). */
const PATROCINADORES_SEED: Patrocinador[] = [
  {
    id: 'seed-planeta-movimiento',
    nombre: 'Planeta Movimiento',
    descripcion: 'Escuela conquense de deporte, ocio saludable y educación física. Organiza y coordina el reto: logística de la ruta, patrocinadores y comunicación diaria.',
    logoUrl: '', webUrl: '/', categoria: 'patrocinador', nivel: 'organizador', orden: 1, activo: true, destacado: true,
  },
  {
    id: 'seed-kgm',
    nombre: 'KGM',
    descripcion: 'Aporta el vehículo todoterreno oficial que hace posible el recorrido por las 50 provincias.',
    logoUrl: '', webUrl: '', categoria: 'patrocinador', nivel: 'principal', orden: 2, activo: true, destacado: true,
  },
]

/** Todos, de las dos categorías (incluidos los desactivados): para el panel. */
export async function getPatrocinadores(): Promise<Patrocinador[]> {
  const db = createAdminClient()
  const rows = await safe<Row>(() => db.from('reto50_patrocinadores').select('*') as never)
  if (rows.length === 0) return PATROCINADORES_SEED
  return rows
    .map(aPatrocinador)
    // Destacados primero dentro de cada categoría, luego el orden manual.
    .sort((a, b) =>
      Number(b.destacado) - Number(a.destacado) ||
      a.orden - b.orden ||
      a.nombre.localeCompare(b.nombre, 'es'),
    )
}

/** Solo los activos de una categoría: para la web pública. */
export async function getApoyosActivos(categoria: CategoriaApoyo): Promise<Patrocinador[]> {
  return (await getPatrocinadores()).filter(p => p.activo && p.categoria === categoria)
}

/** Las mismas que siembra la migración, para que la web no salga vacía antes de ejecutarla. */
const FAQ_SEED: FaqItem[] = [
  {
    id: 'seed-faq-1',
    pregunta: '¿Qué es un burflip?',
    respuesta: 'Es el ejercicio que Brosjaca repite cada día de su reto anual: una repetición más cada jornada. Cuando arranca «50 días, 50 provincias» ya va por 200 repeticiones diarias, y al llegar a Madrid serán 249.',
    orden: 1, activo: true,
  },
  {
    id: 'seed-faq-2',
    pregunta: '¿Hay que pagar para participar?',
    respuesta: 'No. Las quedadas en cada provincia son gratuitas y abiertas a todo el mundo. La recaudación se destina a la lucha contra el cáncer a través de la Asociación Española Contra el Cáncer.',
    orden: 2, activo: true,
  },
  {
    id: 'seed-faq-3',
    pregunta: '¿Puedo ir aunque no entrene?',
    respuesta: 'Sí. La idea es reunir al mayor número posible de personas en cada provincia: se puede acompañar, animar o hacer las repeticiones que cada uno quiera.',
    orden: 3, activo: true,
  },
  {
    id: 'seed-faq-4',
    pregunta: '¿Cómo sé la hora y el punto exacto de mi provincia?',
    respuesta: 'Cada etapa se confirma con antelación. Consulta el calendario de esta página y las redes oficiales de Brosjaca los días previos a la parada.',
    orden: 4, activo: true,
  },
  {
    id: 'seed-faq-5',
    pregunta: '¿Cómo puede colaborar mi ayuntamiento o mi empresa?',
    respuesta: 'Escríbenos y lo hablamos. Buscamos un espacio público céntrico para el vehículo del reto, difusión institucional y apoyo logístico puntual.',
    orden: 5, activo: true,
  },
]

/** Preguntas frecuentes (todas): para el panel. */
export async function getFaq(): Promise<FaqItem[]> {
  const db = createAdminClient()
  const rows = await safe<Row>(() => db.from('reto50_faq').select('*') as never)
  if (rows.length === 0) return FAQ_SEED
  return rows
    .map(r => ({
      id: str(r.id),
      pregunta: str(r.pregunta),
      respuesta: str(r.respuesta),
      orden: num(r.orden),
      activo: r.activo !== false,
    }))
    .sort((a, b) => a.orden - b.orden)
}

/** Solo las activas: para la web pública. */
export async function getFaqActivas(): Promise<FaqItem[]> {
  return (await getFaq()).filter(f => f.activo)
}

// ── Códigos QR de donación ───────────────────────────────────────────────────

/** Todos los QR (incluidos los desactivados): para el panel. */
export async function getQrs(): Promise<QrDonacion[]> {
  const db = createAdminClient()
  const rows = await safe<Row>(() => db.from('reto50_qr').select('*') as never)
  return rows
    .map(r => ({
      id: str(r.id),
      titulo: str(r.titulo),
      descripcion: str(r.descripcion),
      imagenUrl: str(r.imagen_url),
      enlaceUrl: str(r.enlace_url),
      activo: r.activo !== false,
      orden: num(r.orden),
    }))
    .sort((a, b) => a.orden - b.orden || a.titulo.localeCompare(b.titulo, 'es'))
}

/** Solo los activos: para la web pública. */
export async function getQrsActivos(): Promise<QrDonacion[]> {
  return (await getQrs()).filter(q => q.activo)
}

// ── Ranking de colaboradores de gasolina ─────────────────────────────────────

function aDonante(r: Row): Donante {
  return {
    id: str(r.id),
    nombre: str(r.nombre),
    importe: num(r.importe),
    avatarUrl: str(r.avatar_url),
    fecha: r.fecha ? str(r.fecha).slice(0, 10) : '',
    publico: r.publico === true,
    activo: r.activo !== false,
  }
}

/** Todos los donantes, de mayor a menor importe: para el panel. */
export async function getDonantes(): Promise<Donante[]> {
  const db = createAdminClient()
  const rows = await safe<Row>(() => db.from('reto50_donantes').select('*') as never)
  return rows.map(aDonante).sort((a, b) => b.importe - a.importe)
}

/**
 * Ranking público: solo quien está activo Y ha autorizado aparecer, ordenado
 * por importe y recortado a 10. Si hay menos, salen los que haya.
 */
export async function getRankingPublico(limite = 10): Promise<Donante[]> {
  const todos = await getDonantes()
  return todos.filter(d => d.activo && d.publico).slice(0, limite)
}

// ── Objetivo de gasolina ─────────────────────────────────────────────────────

/**
 * Cifras del depósito. Se introducen a mano desde el panel: no hay conexión
 * automática con pagos. El total NO se calcula sumando el ranking, porque
 * puede haber aportaciones anónimas o de quien no quiere aparecer.
 */
export function gasolinaDeConfig(config: ConfigReto): ResumenGasolina & { actualizado: string; nota: string } {
  const recaudado = numONull(config.gasolina_recaudado)
  const resumen = calcGasolina(
    recaudado,
    numONull(config.gasolina_objetivo_eur),
    numONull(config.gasolina_objetivo_litros),
  )
  return {
    ...resumen,
    actualizado: config.gasolina_actualizado || '',
    nota: config.gasolina_nota || '',
  }
}

/** Textos, imágenes y enlaces editables. {} si no hay nada configurado. */
export async function getConfigReto(): Promise<ConfigReto> {
  const db = createAdminClient()
  const rows = await safe<Row>(() => db.from('reto50_config').select('*') as never)
  const out: ConfigReto = {}
  for (const r of rows) {
    const clave = str(r.clave)
    if (clave) out[clave] = str(r.valor)
  }
  return out
}
