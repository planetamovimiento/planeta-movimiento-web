// ─────────────────────────────────────────────────────────────────────────────
// Medias automáticas de Circo Inclusivo: sesión → mes → trimestre.
//
// Regla: solo cuentan las evaluaciones VÁLIDAS (asiste + completada + con media).
// La ausencia no puntúa (no es un 0). Las medias son SIEMPRE automáticas: la
// media mensual = suma de medias válidas / nº de sesiones válidas.
//
// Fichero puro (sin imports de servidor): se usa en la ficha y se puede ejecutar
// solo para el self-test del final.
// ─────────────────────────────────────────────────────────────────────────────

import { CRITERIOS_SESION, evalCuenta, type EvalSesion, type Sesion } from './tipos'

const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']

function redondea2(n: number): number { return Math.round(n * 100) / 100 }
function media(vals: number[]): number | null { return vals.length ? redondea2(vals.reduce((s, v) => s + v, 0) / vals.length) : null }

export type ResumenMes = {
  clave: string          // '2026-07'
  anio: number
  mes: number            // 1–12
  label: string          // 'julio 2026'
  total: number          // evaluaciones registradas ese mes
  validas: number        // que cuentan para la media
  asistencias: number
  ausencias: number
  mediaGeneral: number | null
  porCriterio: Record<string, number | null>
  provisional: boolean   // auto y no cerrada
}

export type ResumenTrimestre = {
  clave: string          // '2026-T3'
  anio: number
  trimestre: number      // 1–4
  label: string          // 'Trimestre 3 · 2026'
  meses: ResumenMes[]
  mesesConDatos: number
  mediaGeneral: number | null
  porCriterio: Record<string, number | null>
  provisional: boolean
}

/** Fecha de la sesión de cada evaluación (para agrupar por mes). */
function fechaDeEval(e: EvalSesion, sesionPorId: Map<string, Sesion>): string | null {
  return sesionPorId.get(e.sesion_id)?.fecha ?? null
}

/** Resúmenes mensuales de un participante, de más reciente a más antiguo. */
export function resumenMensual(evals: EvalSesion[], sesiones: Sesion[]): ResumenMes[] {
  const sesionPorId = new Map(sesiones.map(s => [s.id, s]))
  const porMes = new Map<string, EvalSesion[]>()
  for (const e of evals) {
    const f = fechaDeEval(e, sesionPorId)
    if (!f) continue
    const clave = f.slice(0, 7)
    const arr = porMes.get(clave) ?? []
    arr.push(e)
    porMes.set(clave, arr)
  }

  const out: ResumenMes[] = []
  for (const [clave, lista] of porMes) {
    const validas = lista.filter(evalCuenta)
    const anio = Number(clave.slice(0, 4))
    const mes = Number(clave.slice(5, 7))
    const porCriterio: Record<string, number | null> = {}
    for (const c of CRITERIOS_SESION) {
      porCriterio[c.key] = media(validas.map(e => e.items[c.key]).filter(v => typeof v === 'number' && v >= 1 && v <= 4))
    }
    out.push({
      clave, anio, mes,
      label: `${MESES[mes - 1]} ${anio}`,
      total: lista.length,
      validas: validas.length,
      asistencias: lista.filter(e => e.asistencia === 'asiste').length,
      ausencias: lista.filter(e => e.asistencia === 'justificada' || e.asistencia === 'no_justificada').length,
      mediaGeneral: media(validas.map(e => e.media!).filter(v => typeof v === 'number')),
      porCriterio,
      provisional: true, // auto: se marca definitiva solo al cerrar (fase posterior)
    })
  }
  return out.sort((a, b) => b.clave.localeCompare(a.clave))
}

/** Resúmenes trimestrales (trimestres naturales) a partir de los mensuales. */
export function resumenTrimestral(meses: ResumenMes[]): ResumenTrimestre[] {
  const porTri = new Map<string, ResumenMes[]>()
  for (const m of meses) {
    const tri = Math.floor((m.mes - 1) / 3) + 1
    const clave = `${m.anio}-T${tri}`
    const arr = porTri.get(clave) ?? []
    arr.push(m)
    porTri.set(clave, arr)
  }

  const out: ResumenTrimestre[] = []
  for (const [clave, lista] of porTri) {
    const conDatos = lista.filter(m => m.mediaGeneral != null)
    const anio = Number(clave.slice(0, 4))
    const trimestre = Number(clave.slice(clave.indexOf('T') + 1))
    const porCriterio: Record<string, number | null> = {}
    for (const c of CRITERIOS_SESION) {
      porCriterio[c.key] = media(conDatos.map(m => m.porCriterio[c.key]).filter((v): v is number => typeof v === 'number'))
    }
    out.push({
      clave, anio, trimestre,
      label: `Trimestre ${trimestre} · ${anio}`,
      meses: lista.sort((a, b) => a.clave.localeCompare(b.clave)),
      mesesConDatos: conDatos.length,
      mediaGeneral: media(conDatos.map(m => m.mediaGeneral!)),
      porCriterio,
      // Provisional si el trimestre no tiene aún sus 3 meses con datos.
      provisional: conDatos.length < 3,
    })
  }
  return out.sort((a, b) => b.clave.localeCompare(a.clave))
}
