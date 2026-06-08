'use client'

import { eur, MESES } from '@/lib/balance/constants'

// ── Barras mensuales agrupadas (ingresos vs gastos) + línea de beneficio ──────
export function MonthlyBars({ serie }: { serie: { ingresos: number; gastos: number; beneficio: number }[] }) {
  const W = 760, H = 240, padL = 8, padR = 8, padT = 16, padB = 28
  const innerW = W - padL - padR
  const innerH = H - padT - padB
  const n = serie.length || 12
  const groupW = innerW / n
  const barW = Math.min(16, groupW / 3)
  const max = Math.max(1, ...serie.map(s => Math.max(s.ingresos, s.gastos)))
  const y = (v: number) => padT + innerH - (v / max) * innerH
  const benMax = Math.max(1, ...serie.map(s => Math.abs(s.beneficio)))
  const yBen = (v: number) => padT + innerH / 2 - (v / benMax) * (innerH / 2)

  return (
    <div className="overflow-x-auto">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full min-w-[600px]" role="img" aria-label="Ingresos y gastos por mes">
        {/* baseline */}
        <line x1={padL} y1={padT + innerH} x2={W - padR} y2={padT + innerH} stroke="#e5e7eb" />
        {serie.map((s, i) => {
          const gx = padL + i * groupW + groupW / 2
          return (
            <g key={i}>
              <rect x={gx - barW - 1} y={y(s.ingresos)} width={barW} height={padT + innerH - y(s.ingresos)} rx={2} fill="#22c55e">
                <title>{MESES[i]} · Ingresos {eur(s.ingresos)}</title>
              </rect>
              <rect x={gx + 1} y={y(s.gastos)} width={barW} height={padT + innerH - y(s.gastos)} rx={2} fill="#ef4444">
                <title>{MESES[i]} · Gastos {eur(s.gastos)}</title>
              </rect>
              <text x={gx} y={H - 8} textAnchor="middle" fontSize="11" fill="#9ca3af">{MESES[i]}</text>
            </g>
          )
        })}
        {/* línea de beneficio */}
        <polyline
          fill="none" stroke="#0F1A3D" strokeWidth={2}
          points={serie.map((s, i) => `${padL + i * groupW + groupW / 2},${yBen(s.beneficio)}`).join(' ')}
        />
        {serie.map((s, i) => (
          <circle key={i} cx={padL + i * groupW + groupW / 2} cy={yBen(s.beneficio)} r={2.5} fill="#0F1A3D">
            <title>{MESES[i]} · Beneficio {eur(s.beneficio)}</title>
          </circle>
        ))}
      </svg>
      <div className="flex items-center justify-center gap-4 text-xs text-gray-500 mt-1">
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-green-500 inline-block" />Ingresos</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-red-500 inline-block" />Gastos</span>
        <span className="flex items-center gap-1.5"><span className="w-4 h-0.5 bg-pm-navy inline-block" />Beneficio</span>
      </div>
    </div>
  )
}

// ── Barras horizontales (categorías / servicios) ──────────────────────────────
export function HBars({ items }: { items: { label: string; valor: number; color?: string; sub?: string }[] }) {
  const max = Math.max(1, ...items.map(i => i.valor))
  if (!items.length) return <p className="text-sm text-gray-400 italic py-4 text-center">Sin datos en el periodo seleccionado.</p>
  return (
    <div className="space-y-2.5">
      {items.map((it, i) => (
        <div key={i}>
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="font-semibold text-pm-navy truncate pr-2">{it.label}{it.sub && <span className="text-gray-400 font-normal"> · {it.sub}</span>}</span>
            <span className="font-black text-pm-navy whitespace-nowrap">{eur(it.valor)}</span>
          </div>
          <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all" style={{ width: `${(it.valor / max) * 100}%`, backgroundColor: it.color || '#D42B2B' }} />
          </div>
        </div>
      ))}
    </div>
  )
}
