// ─────────────────────────────────────────────────────────────────────────────
// Tipos y estructura de evaluación del módulo "Circo Inclusivo".
// Fuente ÚNICA de la estructura de evaluación: alimenta los formularios y los
// informes imprimibles. Archivo puro (sin imports de servidor).
// ─────────────────────────────────────────────────────────────────────────────

export type EstadoParticipante = 'activo' | 'baja' | 'pausado' | 'archivado'
export type TipoEvaluacion = 'mensual' | 'trimestral'
export type ValoracionGlobal = 'muy_positiva' | 'positiva' | 'estable' | 'necesita_apoyo'

export type Grupo = {
  id: string
  nombre: string
  entidad: string | null
  horario: string | null
  lugar: string | null
  monitor: string | null
  observaciones: string | null
  created_at?: string
  updated_at?: string
}

export type Actividad = {
  id: string
  nombre: string
  descripcion: string | null
  orden: number
  created_at?: string
}

export type Participante = {
  id: string
  nombre: string
  apellidos: string | null
  fecha_nacimiento: string | null
  entidad: string | null
  grupo_id: string | null
  actividad: string | null
  observaciones: string | null
  necesidades_apoyo: string | null
  info_monitor: string | null
  estado: EstadoParticipante
  created_at?: string
  updated_at?: string
}

export type Evaluacion = {
  id: string
  participante_id: string
  tipo: TipoEvaluacion
  fecha: string
  periodo: string | null
  profesional: string | null
  items: Record<string, number>
  textos: Record<string, string>
  valoracion_global: ValoracionGlobal | null
  created_at?: string
  updated_at?: string
}

// ── Escala de valoración 1–4 ─────────────────────────────────────────────────
export const ESCALA: { valor: number; corto: string; label: string }[] = [
  { valor: 1, corto: 'No lo realiza',     label: 'No lo realiza' },
  { valor: 2, corto: 'Con ayuda física',  label: 'Lo realiza con ayuda física' },
  { valor: 3, corto: 'Con supervisión',   label: 'Lo realiza con ayuda verbal o supervisión' },
  { valor: 4, corto: 'Autónomo',          label: 'Lo realiza de forma autónoma' },
]

export const VALORACIONES: { valor: ValoracionGlobal; label: string; color: string }[] = [
  { valor: 'muy_positiva',   label: 'Muy positiva',              color: 'bg-green-100 text-green-700 border-green-300' },
  { valor: 'positiva',       label: 'Positiva',                  color: 'bg-emerald-100 text-emerald-700 border-emerald-300' },
  { valor: 'estable',        label: 'Estable',                   color: 'bg-blue-100 text-blue-700 border-blue-300' },
  { valor: 'necesita_apoyo', label: 'Necesita apoyo adicional',  color: 'bg-amber-100 text-amber-700 border-amber-300' },
]

export const ESTADOS: { valor: EstadoParticipante; label: string; color: string }[] = [
  { valor: 'activo',    label: 'Activo',    color: 'bg-green-100 text-green-700 border-green-300' },
  { valor: 'pausado',   label: 'Pausado',   color: 'bg-amber-100 text-amber-700 border-amber-300' },
  { valor: 'baja',      label: 'Baja',      color: 'bg-gray-100 text-gray-500 border-gray-300' },
  { valor: 'archivado', label: 'Archivado', color: 'bg-gray-100 text-gray-400 border-gray-200' },
]

export function labelValoracion(v: ValoracionGlobal | null): string {
  return VALORACIONES.find(x => x.valor === v)?.label ?? '—'
}
export function labelEstado(e: EstadoParticipante): string {
  return ESTADOS.find(x => x.valor === e)?.label ?? e
}

// ── Esquema de evaluación ────────────────────────────────────────────────────
export type AreaEval = { area: string; items: { key: string; label: string }[] }
export type CampoTexto = { key: string; label: string }
export type EsquemaEval = { areas: AreaEval[]; campos: CampoTexto[] }

// Evaluación MENSUAL
export const EVAL_MENSUAL: EsquemaEval = {
  areas: [
    { area: 'Participación', items: [
      { key: 'm_part_activa',    label: 'Participa activamente en las actividades' },
      { key: 'm_part_atencion',  label: 'Mantiene atención durante la sesión' },
    ] },
    { area: 'Motricidad', items: [
      { key: 'm_mot_equilibrio', label: 'Mantiene equilibrio en desplazamientos' },
      { key: 'm_mot_circuitos',  label: 'Participa en circuitos y actividades motrices' },
    ] },
    { area: 'Seguridad', items: [
      { key: 'm_seg_apoyos',     label: 'Utiliza apoyos corporales para protegerse' },
      { key: 'm_seg_conductas',  label: 'Mantiene conductas seguras durante la sesión' },
    ] },
    { area: 'Autonomía', items: [
      { key: 'm_aut_instrucciones', label: 'Sigue instrucciones sencillas' },
      { key: 'm_aut_turnos',        label: 'Respeta turnos y normas básicas' },
      { key: 'm_aut_recogida',      label: 'Participa en la recogida del material' },
    ] },
    { area: 'Social', items: [
      { key: 'm_soc_interaccion', label: 'Interactúa positivamente con el grupo' },
    ] },
  ],
  campos: [
    { key: 'participacion_actitud',     label: 'Participación y actitud' },
    { key: 'evolucion_motriz',          label: 'Evolución motriz y psicomotriz' },
    { key: 'seguridad_proteccion',      label: 'Seguridad y protección corporal' },
    { key: 'autonomia_rutinas',         label: 'Autonomía y seguimiento de rutinas' },
    { key: 'interaccion_social',        label: 'Interacción social y adaptación grupal' },
    { key: 'observaciones_generales',   label: 'Observaciones generales' },
    { key: 'aspectos_positivos',        label: 'Aspectos positivos observados' },
    { key: 'aspectos_trabajar',         label: 'Aspectos a seguir trabajando' },
    { key: 'incidencias',               label: 'Incidencias o situaciones relevantes' },
  ],
}

// Evaluación TRIMESTRAL
export const EVAL_TRIMESTRAL: EsquemaEval = {
  areas: [
    { area: 'Área motriz y psicomotriz', items: [
      { key: 't_mot_equilibrio',  label: 'Mantiene equilibrio en desplazamientos' },
      { key: 't_mot_circuitos',   label: 'Participa en circuitos motores adaptados' },
      { key: 't_mot_saltos',      label: 'Realiza saltos y apoyos con control corporal' },
      { key: 't_mot_coordina',    label: 'Coordina movimientos generales' },
      { key: 't_mot_superficies', label: 'Se adapta a diferentes superficies y materiales' },
      { key: 't_mot_postural',    label: 'Mantiene control postural durante las actividades' },
    ] },
    { area: 'Área de seguridad y protección corporal', items: [
      { key: 't_seg_apoyos',       label: 'Utiliza apoyos corporales para protegerse' },
      { key: 't_seg_desequilibrio', label: 'Reacciona ante situaciones de desequilibrio' },
      { key: 't_seg_conductas',    label: 'Mantiene conductas seguras durante la sesión' },
      { key: 't_seg_normas',       label: 'Respeta normas básicas de seguridad' },
      { key: 't_seg_estabilidad',  label: 'Mantiene estabilidad en actividades dinámicas' },
    ] },
    { area: 'Área funcional y de autonomía', items: [
      { key: 't_fun_instrucciones', label: 'Sigue instrucciones sencillas' },
      { key: 't_fun_rutinas',       label: 'Participa en rutinas de la sesión' },
      { key: 't_fun_turnos',        label: 'Respeta turnos y tiempos de espera' },
      { key: 't_fun_material',      label: 'Participa en la organización y recogida del material' },
      { key: 't_fun_autonomia',     label: 'Mantiene autonomía básica durante las actividades' },
    ] },
    { area: 'Área social, emocional y participativa', items: [
      { key: 't_soc_participa',   label: 'Participa activamente en las actividades' },
      { key: 't_soc_atencion',    label: 'Mantiene atención durante las sesiones' },
      { key: 't_soc_interactua',  label: 'Interactúa positivamente con compañeros' },
      { key: 't_soc_apoyo',       label: 'Acepta apoyo y acompañamiento profesional' },
      { key: 't_soc_motivacion',  label: 'Muestra motivación e interés por las actividades' },
      { key: 't_soc_dinamicas',   label: 'Se adapta adecuadamente a las dinámicas grupales' },
    ] },
  ],
  campos: [
    { key: 'evolucion_observada',     label: 'Evolución observada' },
    { key: 'aspectos_reforzados',     label: 'Aspectos reforzados' },
    { key: 'aspectos_trabajar',       label: 'Aspectos a seguir trabajando' },
    { key: 'adaptaciones_apoyos',     label: 'Adaptaciones o apoyos necesarios' },
    { key: 'propuestas_continuidad',  label: 'Propuestas de intervención y continuidad' },
    { key: 'observaciones_generales', label: 'Observaciones generales' },
    { key: 'aspectos_positivos',      label: 'Aspectos positivos observados' },
    { key: 'incidencias',             label: 'Incidencias o situaciones relevantes' },
  ],
}

export function esquemaDe(tipo: TipoEvaluacion): EsquemaEval {
  return tipo === 'trimestral' ? EVAL_TRIMESTRAL : EVAL_MENSUAL
}

/** Todos los ítems de un esquema en una lista plana (key → label). */
export function itemsPlano(tipo: TipoEvaluacion): { key: string; label: string }[] {
  return esquemaDe(tipo).areas.flatMap(a => a.items)
}

// Actividades sugeridas (los registros reales viven en ci_actividades).
export const ACTIVIDADES_SUGERIDAS = [
  'Circo inclusivo',
  'Circo adaptado y psicomotricidad',
  'Psicomotricidad',
  'Movimiento adaptado',
  'Actividades en residencia',
]
