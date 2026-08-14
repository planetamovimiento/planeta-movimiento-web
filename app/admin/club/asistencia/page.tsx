import Link from 'next/link'
import { requireSeccion } from '@/lib/admin/auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { getEventos } from '@/lib/calendario-club/data'
import { diaSemana } from '@/lib/calendario-club/tipos'
import { temporadaDisplay } from '@/lib/club/constants'
import BarraAsistencia from './BarraAsistencia'

export const dynamic = 'force-dynamic'

// Hoja de asistencia imprimible (patrón: HTML con estilos print + window.print()).
// No incluye NINGÚN dato económico (punto 32): solo lo necesario para pasar lista.

const PRINT_CSS = `
@page { size: A4 landscape; margin: 10mm; }
@media print {
  .no-print { display: none !important; }
  body { background: #fff !important; }
  .asis-hoja { box-shadow: none !important; border: none !important; margin: 0 !important; max-width: 100% !important; padding: 0 !important; }
  thead { display: table-header-group; }
  tr { break-inside: avoid; }
  .asis-bloque { break-before: page; }
}
`
const LETRA = ['L', 'M', 'X', 'J', 'V', 'S', 'D']       // 1=Lun … 7=Dom
const COLUMNAS_POR_BLOQUE = 16                           // corte para paginar sesiones anchas
const str = (v: unknown): string => (typeof v === 'string' ? v : '')

/** Fechas YYYY-MM-DD entre dos (inclusive). */
function eachDate(desde: string, hasta: string): string[] {
  const out: string[] = []
  if (!desde || !hasta || desde > hasta) return out
  const d = new Date(desde + 'T12:00:00'), f = new Date(hasta + 'T12:00:00')
  while (d <= f) { out.push(d.toISOString().slice(0, 10)); d.setDate(d.getDate() + 1) }
  return out
}

/** 'YYYY-MM-DD' → 'L 05/10'. */
function etiquetaFecha(f: string): string {
  const [, m, dd] = f.split('-')
  return `${LETRA[diaSemana(f) - 1]} ${dd}/${m}`
}

function slug(s: string): string {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'grupo'
}

function chunk<T>(arr: T[], n: number): T[][] {
  const out: T[][] = []
  for (let i = 0; i < arr.length; i += n) out.push(arr.slice(i, i + n))
  return out.length ? out : [[]]
}

type SP = { actividad?: string; grupo?: string; desde?: string; hasta?: string; dias?: string; temporada?: string; monitor?: string; periodo?: string }

export default async function AsistenciaPage({ searchParams }: { searchParams: Promise<SP> }) {
  await requireSeccion('club')
  const sp = await searchParams
  const actividad = sp.actividad ?? ''
  const grupo = sp.grupo ?? ''
  const desde = sp.desde ?? ''
  const hasta = sp.hasta ?? ''
  const temporada = sp.temporada ?? ''
  const monitor = sp.monitor ?? ''
  const periodoLabel = sp.periodo ?? (desde && hasta ? `${desde} – ${hasta}` : '')
  const dias = (sp.dias ?? '').split(',').map(Number).filter(n => n >= 1 && n <= 7)

  const db = createAdminClient()
  const [subsRes, gestRes, grupRes, eventos] = await Promise.all([
    db.from('form_submissions').select('id, nombre, datos').eq('tipo', 'inscripcion_club').limit(2000),
    db.from('club_gestion').select('submission_id, grupo, estado_general, temporada'),
    db.from('club_grupos').select('nombre, actividad, horario'),
    getEventos(),
  ])

  type Gest = { submission_id: string; grupo: string | null; estado_general: string | null; temporada: string | null }
  const gMap = new Map((gestRes.data ?? []).map(g => [(g as Gest).submission_id, g as Gest]))
  const EXCLUIR = new Set(['baja', 'archivado', 'espera'])

  // Alumnos del grupo (activos): filtra por actividad + grupo + temporada.
  const alumnos = ((subsRes.data ?? []) as { id: string; nombre: string | null; datos: Record<string, unknown> | null }[])
    .map(s => {
      const d = (s.datos ?? {}) as Record<string, unknown>
      const g = gMap.get(s.id)
      const completo = str(s.nombre)
      const nombre = str(d.nombre) || completo.split(' ')[0] || ''
      const apellidos = str(d.apellidos) || completo.split(' ').slice(1).join(' ')
      return {
        nombre, apellidos,
        actividad: str(d.actividad),
        grupo: str(g?.grupo) || str(d.nivel),
        estado: str(g?.estado_general) || 'pendiente',
        temporada: str(g?.temporada),
      }
    })
    .filter(a =>
      (!actividad || a.actividad === actividad) &&
      (!grupo || a.grupo === grupo) &&
      (!temporada || a.temporada === temporada || a.temporada === '') &&
      !EXCLUIR.has(a.estado))
    .sort((a, b) => (a.apellidos || a.nombre).localeCompare(b.apellidos || b.nombre, 'es') || a.nombre.localeCompare(b.nombre, 'es'))

  // Días bloqueados por el Calendario Club (festivos + días sin clase, con rangos).
  const bloqueados = new Set<string>()
  for (const e of eventos) {
    if (e.estado === 'cancelado') continue
    if (e.tipo === 'festivo' || e.tipo === 'sin_clase') {
      if (e.fecha_fin && e.fecha_fin >= e.fecha) eachDate(e.fecha, e.fecha_fin).forEach(x => bloqueados.add(x))
      else bloqueados.add(e.fecha)
    }
  }

  const sesiones = eachDate(desde, hasta).filter(f => dias.includes(diaSemana(f)) && !bloqueados.has(f))
  const bloques = chunk(sesiones, COLUMNAS_POR_BLOQUE)

  const horarioGrupo =
    str((grupRes.data ?? []).find(g => str((g as { nombre: string }).nombre) === grupo && str((g as { actividad: string | null }).actividad) === actividad)?.horario) ||
    str((grupRes.data ?? []).find(g => str((g as { nombre: string }).nombre) === grupo)?.horario)

  const nombreArchivo = `asistencia_${slug(grupo || actividad)}_${slug(periodoLabel)}`

  return (
    <div className="bg-gray-100 min-h-screen py-6">
      <style dangerouslySetInnerHTML={{ __html: PRINT_CSS }} />

      <div className="no-print max-w-5xl mx-auto px-4 mb-4 flex items-center justify-between gap-3 flex-wrap">
        <Link href="/admin/club" className="text-sm text-gray-500 hover:text-pm-red">← Volver a Inscripciones</Link>
        <BarraAsistencia nombreArchivo={nombreArchivo} />
      </div>

      <div className="asis-hoja max-w-5xl mx-auto bg-white shadow-sm rounded-lg p-8">
        {/* Cabecera */}
        <div className="flex items-center gap-4 border-b-2 border-pm-red pb-4 mb-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-origen.png" alt="Club Deportivo Origen" className="h-14 w-auto" />
          <div className="flex-1">
            <div className="font-black text-pm-navy text-lg leading-tight">Lista de asistencia</div>
            <div className="text-sm text-gray-600">
              {actividad || 'Club Deportivo Origen'}{grupo ? ` · ${grupo}` : ''}
            </div>
          </div>
          <div className="text-right text-xs text-gray-500 leading-relaxed">
            {temporada && <div>Temporada {temporadaDisplay(temporada)}</div>}
            {periodoLabel && <div className="font-semibold text-pm-navy">{periodoLabel}</div>}
            {horarioGrupo && <div>{horarioGrupo}</div>}
            {monitor && <div>Monitor/a: {monitor}</div>}
          </div>
        </div>

        {alumnos.length === 0 ? (
          <p className="text-gray-400 italic">No hay alumnos activos en este grupo para la temporada indicada.</p>
        ) : sesiones.length === 0 ? (
          <p className="text-gray-400 italic">No hay sesiones en el periodo con los días elegidos (revisa fechas, días de la semana y festivos).</p>
        ) : (
          bloques.map((bloque, bi) => (
            <div key={bi} className={bi > 0 ? 'asis-bloque mt-8' : ''}>
              {bloques.length > 1 && (
                <div className="text-xs font-bold text-gray-400 mb-1">Sesiones {bi * COLUMNAS_POR_BLOQUE + 1}–{bi * COLUMNAS_POR_BLOQUE + bloque.length}</div>
              )}
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-pm-bg">
                    <th className="border border-gray-300 px-1 py-1.5 text-[10px] font-black text-gray-400 w-8">#</th>
                    <th className="border border-gray-300 px-2 py-1.5 text-left text-xs font-black text-pm-navy min-w-[180px]">Alumno</th>
                    {bloque.map(f => (
                      <th key={f} className="border border-gray-300 px-1 py-1.5 text-[10px] font-bold text-pm-navy whitespace-nowrap min-w-[44px]">{etiquetaFecha(f)}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {alumnos.map((a, i) => (
                    <tr key={i} className={i % 2 ? 'bg-gray-50' : ''}>
                      <td className="border border-gray-300 px-1 py-1 text-center text-[10px] text-gray-400">{i + 1}</td>
                      <td className="border border-gray-300 px-2 py-1 text-[13px] text-pm-navy whitespace-nowrap">
                        <span className="font-semibold">{a.apellidos}</span>{a.apellidos ? ', ' : ''}{a.nombre}
                      </td>
                      {bloque.map(f => <td key={f} className="border border-gray-300 h-8 min-w-[44px]" />)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))
        )}

        <div className="mt-6 pt-3 border-t border-gray-200 flex items-center justify-between text-[11px] text-gray-400">
          <span>{alumnos.length} {alumnos.length === 1 ? 'alumno' : 'alumnos'} · {sesiones.length} {sesiones.length === 1 ? 'sesión' : 'sesiones'}</span>
          <span>Planeta Movimiento · Club Deportivo Origen</span>
        </div>
      </div>
    </div>
  )
}
