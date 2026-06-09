'use client'

import { useMemo, type ReactNode } from 'react'
import * as XLSX from 'xlsx'
import { esquemaDe, labelValoracion, type Participante, type Grupo, type Evaluacion, type TipoEvaluacion } from '@/lib/circo-inclusivo/tipos'

type Fila = Record<string, string | number>

function edad(fecha?: string | null): number | '' {
  if (!fecha) return ''
  const f = new Date(fecha); if (isNaN(f.getTime())) return ''
  const h = new Date(); let e = h.getFullYear() - f.getFullYear()
  const m = h.getMonth() - f.getMonth()
  if (m < 0 || (m === 0 && h.getDate() < f.getDate())) e--
  return e
}
const hojaNombre = (s: string) => s.replace(/[:\\/?*[\]]/g, ' ').slice(0, 31) || 'Hoja'

type Props = { participantes: Participante[]; grupos: Grupo[]; evaluaciones: Evaluacion[] }

export default function ExportarClient({ participantes, grupos, evaluaciones }: Props) {
  const gMap = useMemo(() => new Map(grupos.map(g => [g.id, g.nombre])), [grupos])
  const pMap = useMemo(() => new Map(participantes.map(p => [p.id, p])), [participantes])

  const filaParticipante = (p: Participante): Fila => ({
    Nombre: p.nombre,
    Apellidos: p.apellidos ?? '',
    Edad: edad(p.fecha_nacimiento),
    'Fecha nacimiento': p.fecha_nacimiento ?? '',
    Entidad: p.entidad ?? '',
    Grupo: p.grupo_id ? gMap.get(p.grupo_id) ?? '' : '',
    Actividad: p.actividad ?? '',
    Estado: p.estado,
    'Necesidades de apoyo': p.necesidades_apoyo ?? '',
    'Info monitor': p.info_monitor ?? '',
    Observaciones: p.observaciones ?? '',
  })

  const filasEval = (tipo: TipoEvaluacion): Fila[] => {
    const esquema = esquemaDe(tipo)
    const items = esquema.areas.flatMap(a => a.items)
    return evaluaciones.filter(e => e.tipo === tipo).map(e => {
      const p = pMap.get(e.participante_id)
      const fila: Fila = {
        Participante: p ? `${p.nombre} ${p.apellidos ?? ''}`.trim() : '',
        Grupo: p?.grupo_id ? gMap.get(p.grupo_id) ?? '' : '',
        Fecha: e.fecha,
        Periodo: e.periodo ?? '',
        Profesional: e.profesional ?? '',
        'Valoración global': labelValoracion(e.valoracion_global),
      }
      items.forEach(it => { fila[it.label] = e.items?.[it.key] ?? '' })
      esquema.campos.forEach(c => { fila[c.label] = e.textos?.[c.key] ?? '' })
      return fila
    })
  }

  function descargar(rows: Fila[], nombre: string, formato: 'xlsx' | 'csv') {
    if (rows.length === 0) { alert('No hay datos para exportar.'); return }
    const ws = XLSX.utils.json_to_sheet(rows)
    if (formato === 'csv') {
      const csv = XLSX.utils.sheet_to_csv(ws)
      const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a'); a.href = url; a.download = `${nombre}.csv`; a.click()
      URL.revokeObjectURL(url)
    } else {
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'Datos')
      XLSX.writeFile(wb, `${nombre}.xlsx`)
    }
  }

  function porGrupo() {
    const wb = XLSX.utils.book_new()
    grupos.forEach(g => {
      const rows = participantes.filter(p => p.grupo_id === g.id).map(filaParticipante)
      if (rows.length) XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows), hojaNombre(g.nombre))
    })
    const sin = participantes.filter(p => !p.grupo_id).map(filaParticipante)
    if (sin.length) XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(sin), 'Sin grupo')
    if (wb.SheetNames.length === 0) { alert('No hay participantes para exportar.'); return }
    XLSX.writeFile(wb, 'participantes_por_grupo.xlsx')
  }

  const card = (titulo: string, desc: string, n: number, acciones: ReactNode) => (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className="font-black text-pm-navy">{titulo}</div>
      <div className="text-xs text-gray-400 mb-3">{desc} · {n} registro(s)</div>
      <div className="flex flex-wrap gap-2">{acciones}</div>
    </div>
  )
  const btn = (label: string, onClick: () => void, primary = false) => (
    <button onClick={onClick} className={`text-xs font-bold px-4 py-2 rounded-lg ${primary ? 'bg-pm-navy text-white hover:bg-pm-navy-md' : 'border border-gray-200 text-pm-navy hover:border-pm-red'}`}>{label}</button>
  )

  const nMensual = evaluaciones.filter(e => e.tipo === 'mensual').length
  const nTrim = evaluaciones.filter(e => e.tipo === 'trimestral').length

  return (
    <div className="p-4 lg:p-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
      {card('Listado de participantes', 'Datos de todos los participantes (incluye grupo y actividad)', participantes.length, (
        <>
          {btn('Excel', () => descargar(participantes.map(filaParticipante), 'participantes', 'xlsx'), true)}
          {btn('CSV', () => descargar(participantes.map(filaParticipante), 'participantes', 'csv'))}
        </>
      ))}

      {card('Participantes por grupo', 'Excel con una hoja por grupo', participantes.length, (
        <>{btn('Excel (por hojas)', porGrupo, true)}</>
      ))}

      {card('Evaluaciones mensuales', 'Todas las evaluaciones mensuales con sus ítems', nMensual, (
        <>
          {btn('Excel', () => descargar(filasEval('mensual'), 'evaluaciones_mensuales', 'xlsx'), true)}
          {btn('CSV', () => descargar(filasEval('mensual'), 'evaluaciones_mensuales', 'csv'))}
        </>
      ))}

      {card('Evaluaciones trimestrales', 'Todas las evaluaciones trimestrales con sus ítems', nTrim, (
        <>
          {btn('Excel', () => descargar(filasEval('trimestral'), 'evaluaciones_trimestrales', 'xlsx'), true)}
          {btn('CSV', () => descargar(filasEval('trimestral'), 'evaluaciones_trimestrales', 'csv'))}
        </>
      ))}
    </div>
  )
}
