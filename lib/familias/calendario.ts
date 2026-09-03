import type { Ocurrencia } from '@/lib/calendario-club/tipos'

// ─────────────────────────────────────────────────────────────────────────────
// Filtra el Calendario del Club para una familia: solo ve las CLASES de los
// grupos donde están sus hijos, pero los eventos genéricos (festivos, días sin
// clase, galas, eventos…) los ve TODO el mundo (los ponen los administradores).
// ─────────────────────────────────────────────────────────────────────────────

const norm = (s?: string | null) => (s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').trim().toLowerCase()

export function ocurrenciasDeFamilia(ocurrencias: Ocurrencia[], alumnos: { actividad: string; grupo: string }[]): Ocurrencia[] {
  const misGrupos = new Set(alumnos.filter(a => a.grupo).map(a => `${norm(a.actividad)}|${norm(a.grupo)}`))
  return ocurrencias.filter(o => {
    if (o.cancelado || !o.publico) return false
    if (o.tipo !== 'clase') return true                             // festivos/eventos: para todos
    return misGrupos.has(`${norm(o.actividad)}|${norm(o.grupo)}`)   // clases: solo los grupos de sus hijos
  })
}
