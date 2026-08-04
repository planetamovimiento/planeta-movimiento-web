'use client'

// ─────────────────────────────────────────────────────────────────────────────
// Resumen de facturación: indicadores calculados en el cliente a partir de los
// documentos ya cargados (sin nuevas consultas ni migración). Solo cuentan como
// «facturado» las facturas en estado emitido (ESTADOS_EMITIDOS): ni borradores
// ni anuladas. El pendiente de cobro es facturado − cobrado.
// ─────────────────────────────────────────────────────────────────────────────

import { useMemo, useState } from 'react'
import { eur } from '@/lib/facturacion/dinero'
import { ESTADOS_EMITIDOS, estadoMeta } from '@/lib/facturacion/constants'
import type { Documento } from '@/lib/facturacion/tipos'

const MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

function Tarjeta({ label, valor, tono = 'navy' }: { label: string; valor: string; tono?: 'navy' | 'red' | 'green' | 'amber' }) {
  const color = tono === 'red' ? 'text-pm-red' : tono === 'green' ? 'text-emerald-600' : tono === 'amber' ? 'text-amber-600' : 'text-pm-navy'
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
      <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">{label}</div>
      <div className={`text-xl font-black mt-1 ${color}`}>{valor}</div>
    </div>
  )
}

export default function TabResumen({ documentos }: { documentos: Documento[] }) {
  const facturas = useMemo(() => documentos.filter(d => d.tipo === 'factura'), [documentos])

  const años = useMemo(() => {
    const set = new Set<string>()
    for (const f of facturas) if (f.fecha) set.add(f.fecha.slice(0, 4))
    set.add(String(new Date().getFullYear()))
    return [...set].sort((a, b) => b.localeCompare(a))
  }, [facturas])

  const [año, setAño] = useState<string>(años[0] ?? String(new Date().getFullYear()))

  const r = useMemo(() => {
    const delAño = año === 'todos' ? facturas : facturas.filter(f => f.fecha.slice(0, 4) === año)
    const contadas = delAño.filter(f => ESTADOS_EMITIDOS.includes(f.estado))
    const suma = (sel: (d: Documento) => number) => contadas.reduce((a, d) => a + sel(d), 0)
    const facturado = suma(d => d.totalCents)
    const cobrado = suma(d => d.pagadoCents)

    // Desglose por estado (todos los estados presentes, contados o no).
    const porEstado = new Map<string, { n: number; total: number }>()
    for (const f of delAño) {
      const e = porEstado.get(f.estado) ?? { n: 0, total: 0 }
      e.n += 1; e.total += f.totalCents
      porEstado.set(f.estado, e)
    }

    // Facturado por mes (solo con año concreto).
    const porMes = MESES.map((_, i) => contadas
      .filter(d => Number(d.fecha.slice(5, 7)) === i + 1)
      .reduce((a, d) => a + d.totalCents, 0))

    return {
      facturado, cobrado, pendiente: facturado - cobrado,
      base: suma(d => d.baseCents), iva: suma(d => d.ivaCents), irpf: suma(d => d.irpfCents),
      nEmitidas: contadas.length,
      nBorradores: delAño.filter(f => f.estado === 'borrador').length,
      nAnuladas: delAño.filter(f => f.estado === 'anulada').length,
      porEstado: [...porEstado.entries()].sort((a, b) => b[1].total - a[1].total),
      porMes,
    }
  }, [facturas, año])

  const maxMes = Math.max(1, ...r.porMes)

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-wrap items-center gap-3">
        <span className="text-sm font-bold text-pm-navy">Ejercicio</span>
        <select className="border border-gray-200 rounded-lg px-2.5 py-2 text-sm" value={año} onChange={e => setAño(e.target.value)}>
          {años.map(a => <option key={a} value={a}>{a}</option>)}
          <option value="todos">Todos</option>
        </select>
        <span className="text-xs text-gray-400 ml-auto">Solo facturas. Los borradores y las anuladas no cuentan como facturado.</span>
      </div>

      {facturas.length === 0 ? (
        <p className="text-sm text-gray-400 py-10 text-center bg-white rounded-2xl border border-gray-100 shadow-sm">Todavía no hay facturas emitidas.</p>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <Tarjeta label="Facturado" valor={eur(r.facturado)} />
            <Tarjeta label="Cobrado" valor={eur(r.cobrado)} tono="green" />
            <Tarjeta label="Pendiente de cobro" valor={eur(r.pendiente)} tono={r.pendiente > 0 ? 'amber' : 'navy'} />
            <Tarjeta label="Facturas emitidas" valor={String(r.nEmitidas)} />
            <Tarjeta label="Base imponible" valor={eur(r.base)} />
            <Tarjeta label="IVA repercutido" valor={eur(r.iva)} />
            {r.irpf > 0 && <Tarjeta label="IRPF retenido" valor={eur(r.irpf)} tono="red" />}
            {(r.nBorradores > 0 || r.nAnuladas > 0) && (
              <Tarjeta label="Borradores · anuladas" valor={`${r.nBorradores} · ${r.nAnuladas}`} />
            )}
          </div>

          <div className="grid lg:grid-cols-2 gap-5">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="text-xs font-black text-pm-red uppercase tracking-widest mb-3">Por estado</h3>
              <table className="w-full text-sm">
                <tbody>
                  {r.porEstado.map(([estado, v]) => (
                    <tr key={estado} className="border-b border-gray-50 last:border-0">
                      <td className="py-1.5">
                        <span className={`inline-block text-xs font-bold px-2 py-0.5 rounded-full ${estadoMeta('factura', estado).badge}`}>{estadoMeta('factura', estado).label}</span>
                      </td>
                      <td className="py-1.5 text-right text-gray-500">{v.n}</td>
                      <td className="py-1.5 text-right font-bold text-pm-navy whitespace-nowrap">{eur(v.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="text-xs font-black text-pm-red uppercase tracking-widest mb-3">Facturado por mes {año !== 'todos' && `· ${año}`}</h3>
              {año === 'todos' ? (
                <p className="text-xs text-gray-400">Elige un ejercicio concreto para ver el desglose mensual.</p>
              ) : (
                <div className="space-y-1.5">
                  {r.porMes.map((cents, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs">
                      <span className="w-8 text-gray-400 font-bold">{MESES[i]}</span>
                      <div className="flex-1 bg-pm-bg rounded-full h-4 overflow-hidden">
                        <div className="bg-pm-red/70 h-full rounded-full" style={{ width: `${(cents / maxMes) * 100}%` }} />
                      </div>
                      <span className="w-20 text-right text-gray-500 whitespace-nowrap">{cents ? eur(cents) : '—'}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
