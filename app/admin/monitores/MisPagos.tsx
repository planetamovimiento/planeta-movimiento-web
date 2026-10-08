'use client'

import { useMemo, useState } from 'react'
import { METODOS, ESTADOS, totales, type Sueldo } from '@/lib/sueldos/data'

// ─────────────────────────────────────────────────────────────────────────────
// Portal del monitor: lo que va a cobrar. Solo lectura; lo registra el club
// desde Balance → Sueldos y aparece aquí al momento.
// ─────────────────────────────────────────────────────────────────────────────

const eur = (n: number) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(n || 0)
const fechaCorta = (f: string) => (f ? f.split('-').reverse().join('/') : '—')
const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
const nombreMes = (m: string) => `${MESES[Number(m.slice(5, 7)) - 1]} ${m.slice(0, 4)}`

export default function MisPagos({ sueldos }: { sueldos: Sueldo[] }) {
  const meses = useMemo(() => [...new Set(sueldos.map(s => s.fecha.slice(0, 7)))].sort().reverse(), [sueldos])
  const [mes, setMes] = useState(meses[0] ?? '')

  const delMes = useMemo(() => sueldos.filter(s => s.fecha.startsWith(mes)), [sueldos, mes])
  const T = useMemo(() => totales(delMes), [delMes])
  const pendienteTotal = useMemo(() => totales(sueldos.filter(s => s.estado === 'pendiente')).pendiente, [sueldos])

  if (sueldos.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-sm text-gray-400">
        Todavía no hay trabajos registrados. Cuando el club apunte lo que haces, aparecerá aquí con su importe.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Dato label={`Total de ${mes ? nombreMes(mes).toLowerCase() : 'el mes'}`} valor={eur(T.neto)} tono="navy" />
        <Dato label="Ya cobrado" valor={eur(T.pagado)} tono="green" />
        <Dato label="Pendiente de ese mes" valor={eur(T.pendiente)} tono="red" />
        <Dato label="Pendiente en total" valor={eur(pendienteTotal)} tono="amber" />
      </div>

      <div className="flex items-center gap-2">
        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Mes</label>
        <select value={mes} onChange={e => setMes(e.target.value)}
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:border-pm-red">
          {meses.map(m => <option key={m} value={m}>{nombreMes(m)}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-pm-bg text-xs uppercase tracking-wider text-gray-400">
              <tr>
                <th className="text-left font-bold px-4 py-3">Fecha</th>
                <th className="text-left font-bold px-3 py-3">Trabajo</th>
                <th className="text-right font-bold px-3 py-3">Importe</th>
                <th className="text-left font-bold px-3 py-3">Cómo se paga</th>
                <th className="text-left font-bold px-3 py-3">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {delMes.map(s => {
                const met = METODOS.find(m => m.id === s.metodo)!
                const est = ESTADOS.find(e => e.id === s.estado)!
                return (
                  <tr key={s.id}>
                    <td className="px-4 py-2.5 whitespace-nowrap text-gray-600">{fechaCorta(s.fecha)}</td>
                    <td className="px-3 py-2.5">
                      <div className="text-pm-navy font-semibold">{s.concepto}</div>
                      {s.detalle && <div className="text-xs text-gray-400">{s.detalle}</div>}
                    </td>
                    <td className="px-3 py-2.5 text-right font-black text-pm-navy whitespace-nowrap">{eur(s.neto)}</td>
                    <td className="px-3 py-2.5"><span className={`text-[11px] font-bold px-2 py-1 rounded-full ${met.badge}`}>{met.label}</span></td>
                    <td className="px-3 py-2.5">
                      <span className={`text-[11px] font-bold px-2 py-1 rounded-full ${est.badge}`}>{est.label}</span>
                      {s.estado === 'pagado' && s.fecha_pago && <div className="text-[11px] text-gray-400 mt-0.5">{fechaCorta(s.fecha_pago)}</div>}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-xs text-gray-400">
        Si echas en falta algún trabajo o ves algo que no cuadra, dínoslo y lo revisamos.
      </p>
    </div>
  )
}

function Dato({ label, valor, tono }: { label: string; valor: string; tono: string }) {
  const color = tono === 'green' ? 'text-green-600' : tono === 'red' ? 'text-red-600' : tono === 'amber' ? 'text-amber-600' : 'text-pm-navy'
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
      <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">{label}</div>
      <div className={`text-xl font-black ${color}`}>{valor}</div>
    </div>
  )
}
