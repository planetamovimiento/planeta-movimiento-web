'use client'

import * as XLSX from 'xlsx'
import { labelTipo, type Ocurrencia, type TipoEvento } from '@/lib/calendario-club/tipos'

type Fila = Record<string, string>
const diaSemana = (f: string) => new Date(f + 'T12:00:00').toLocaleDateString('es-ES', { weekday: 'long' })

export default function BarraImprimir({ ocurrencias, tipos }: { ocurrencias: Ocurrencia[]; tipos: TipoEvento[] }) {
  const familias = (): Fila[] => ocurrencias.filter(o => o.publico && !o.cancelado).map(o => ({
    Fecha: o.fecha, Día: diaSemana(o.fecha),
    Inicio: o.hora_inicio ?? '', Fin: o.hora_fin ?? '',
    Título: o.titulo, Tipo: labelTipo(o.tipo, tipos),
    Actividad: o.actividad ?? '', Grupo: o.grupo ?? '',
  }))
  const interno = (): Fila[] => ocurrencias.map(o => ({
    Fecha: o.fecha, Día: diaSemana(o.fecha),
    Inicio: o.hora_inicio ?? '', Fin: o.hora_fin ?? '',
    Título: o.titulo, Tipo: labelTipo(o.tipo, tipos),
    Actividad: o.actividad ?? '', Grupo: o.grupo ?? '', Monitor: o.monitor ?? '',
    Ubicación: o.ubicacion ?? '', Temporada: o.temporada ?? '',
    Público: o.publico ? 'Sí' : 'No', Cancelado: o.cancelado ? 'Sí' : 'No',
    Observaciones: o.observaciones ?? '',
  }))

  function descargar(rows: Fila[], nombre: string, formato: 'xlsx' | 'csv') {
    if (rows.length === 0) { alert('No hay datos para exportar en este periodo.'); return }
    const ws = XLSX.utils.json_to_sheet(rows)
    if (formato === 'csv') {
      const csv = XLSX.utils.sheet_to_csv(ws)
      const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a'); a.href = url; a.download = `${nombre}.csv`; a.click(); URL.revokeObjectURL(url)
    } else {
      const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, 'Calendario'); XLSX.writeFile(wb, `${nombre}.xlsx`)
    }
  }

  const btn = 'text-xs font-bold px-3 py-2 rounded-lg border border-gray-200 text-pm-navy hover:border-pm-red bg-white'

  return (
    <div className="flex flex-wrap gap-2 items-center">
      <button onClick={() => window.print()} className="text-xs font-bold px-4 py-2 rounded-lg bg-pm-red text-white hover:bg-pm-red-dark">🖨️ Imprimir / PDF</button>
      <button onClick={() => descargar(familias(), 'calendario_familias', 'xlsx')} className={btn}>Excel (familias)</button>
      <button onClick={() => descargar(interno(), 'calendario_interno', 'xlsx')} className={btn}>Excel (interno)</button>
      <button onClick={() => descargar(familias(), 'calendario_familias', 'csv')} className={btn}>CSV</button>
    </div>
  )
}
