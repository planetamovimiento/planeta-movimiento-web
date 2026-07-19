// ─────────────────────────────────────────────────────────────────────────────
// 50 días, 50 provincias · Tipos del módulo.
// ─────────────────────────────────────────────────────────────────────────────

import type { CategoriaApoyo, EstadoEtapa } from './constants'

export type Etapa = {
  id: string
  dia: number
  fecha: string
  provincia: string
  ciudad: string
  hora: string
  puntoEncuentro: string
  lat: number | null
  lng: number | null
  burflips: number
  /** Ruta del día. Solo el panel: el del día 14 nombra una parada privada. */
  trayecto: string
  kmAprox: string
  tiempoAprox: string
  descripcion: string
  estado: EstadoEtapa
  /** null = todavía sin dato. Nunca se muestra como 0 €. */
  recaudado: number | null
  /** null = todavía sin dato. */
  asistentes: number | null
  resumen: string
  galeria: string[]
  /** Vídeo resumen del día. Enlace de YouTube en cualquiera de sus formatos. */
  videoUrl: string
  videoTitulo: string
  videoDescripcion: string
  /** Carátula propia. Si está vacía se usa la que sirve YouTube. */
  videoMiniatura: string
  videoFecha: string
  /** Bandera de la provincia/territorio. La sube el admin; '' = sin bandera. */
  banderaUrl: string
  banderaAlt: string
  enlaceRedes: string
  testimonios: string
  /** Planificación interna. Solo el panel; jamás la web pública. */
  notasInternas: string
  orden: number
}

/**
 * Etapa sin la planificación interna: es lo único que puede salir a la web.
 * Se excluye también el trayecto porque no se publica en ninguna parte y el del
 * día 14 nombra Villalpardo, una parada logística privada que no es provincia.
 */
export type EtapaPublica = Omit<Etapa, 'notasInternas' | 'trayecto'>

export type Patrocinador = {
  id: string
  nombre: string
  descripcion: string
  logoUrl: string
  webUrl: string
  /** patrocinador | colaborador. Nunca se mezclan en la web. */
  categoria: CategoriaApoyo
  nivel: string
  orden: number
  activo: boolean
  destacado: boolean
}

/**
 * Apoyo de ámbito local: solo nombre y logo. Se asocia a una o varias
 * provincias del reto y sale en el detalle de esas etapas. Es una categoría
 * aparte de patrocinadores y colaboradores; no se mezclan nunca.
 */
export type ColaboradorLocal = {
  id: string
  nombre: string
  logoUrl: string
  /** Opcional: si está vacío, el logo no enlaza a ninguna parte. */
  webUrl: string
  /** Provincias donde colabora. Un mismo registro puede estar en varias. */
  provincias: string[]
  orden: number
  activo: boolean
}

export type FaqItem = {
  id: string
  pregunta: string
  respuesta: string
  orden: number
  activo: boolean
}

export type QrDonacion = {
  id: string
  titulo: string
  descripcion: string
  imagenUrl: string
  enlaceUrl: string
  activo: boolean
  orden: number
}

export type Donante = {
  id: string
  /** Nombre o alias autorizado. Nunca datos personales sensibles. */
  nombre: string
  importe: number
  avatarUrl: string
  fecha: string
  /** Opt-in explícito: si es false no aparece en el ranking público. */
  publico: boolean
  activo: boolean
}

export type ConfigReto = Record<string, string>

export type ResumenReto = {
  /** Suma de lo recaudado por etapa. null si todavía no hay ni un dato. */
  recaudadoTotal: number | null
  /** Suma de asistentes. null si todavía no hay ni un dato. */
  participantes: number | null
  provinciasCompletadas: number
  totalProvincias: number
}
