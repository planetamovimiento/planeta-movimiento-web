// ─────────────────────────────────────────────────────────────────────────────
// Objetivo de gasolina: depósito que se llena + ranking de colaboradores.
//
// El oleaje es CSS puro (posición de fondo animada), así que no hay JavaScript
// ni repintados de layout: es un server component.
// ─────────────────────────────────────────────────────────────────────────────

import { euros, litros } from '@/lib/reto50/constants'
import type { ResumenGasolina } from '@/lib/reto50/constants'
import type { Donante } from '@/lib/reto50/tipos'

type Props = {
  gasolina: ResumenGasolina & { actualizado: string; nota: string }
  ranking: Donante[]
}

/** 2026-07-19 → 19 jul 2026 */
function fechaBreve(iso: string): string {
  const d = new Date(iso + 'T12:00:00Z')
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })
}

function Deposito({ g }: { g: Props['gasolina'] }) {
  const sinDatos = g.recaudado == null
  const pct = g.porcentajeVisual

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5 sm:p-6">
      <div className="relative mx-auto w-full max-w-[220px]">
        {/* Depósito */}
        <div className="relative h-64 sm:h-72 rounded-3xl border-4 border-pm-navy/15 bg-pm-navy/[0.04] overflow-hidden">
          {/* Líquido: solo si hay algo que enseñar */}
          {!sinDatos && pct > 0 && (
            <div className="absolute inset-x-0 bottom-0 transition-[height] duration-700 ease-out" style={{ height: `${pct}%` }}>
              <div className="absolute inset-0 bg-gradient-to-t from-amber-500 via-amber-400 to-amber-300" />
              {/* Las dos olas van justo encima de la superficie del líquido */}
              <div className="pm-ola absolute inset-x-0 -top-[9px] h-[10px]" aria-hidden="true" />
              <div className="pm-ola-2 absolute inset-x-0 -top-[7px] h-[10px]" aria-hidden="true" />
            </div>
          )}

          {/* Marcas de nivel */}
          <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
            {[25, 50, 75].map(m => (
              <div key={m} className="absolute left-0 right-0 flex items-center gap-1" style={{ bottom: `${m}%` }}>
                <div className="w-2.5 h-px bg-pm-navy/20" />
                <span className="text-[9px] font-bold text-pm-navy/25">{m}%</span>
              </div>
            ))}
          </div>

          {/* Indicador: sobre pastilla, así se lee con el depósito vacío o lleno */}
          <div className="absolute inset-0 flex items-center justify-center">
            {sinDatos ? (
              <div className="bg-white/90 rounded-2xl px-3 py-2 border border-gray-100 mx-3">
                <span className="text-gray-400 font-bold text-xs text-center block leading-relaxed">Aún sin datos</span>
              </div>
            ) : (
              <div className="bg-pm-navy/85 rounded-2xl px-4 py-2.5 border border-white/10">
                <span className="text-white font-black text-3xl leading-none">{Math.round(g.porcentaje)}%</span>
              </div>
            )}
          </div>
        </div>

        {/* Boquilla del depósito */}
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-10 h-3 rounded-t-lg bg-pm-navy/15" aria-hidden="true" />
      </div>

      {/* Cifras */}
      <dl className="mt-6 space-y-2.5">
        {[
          ['Recaudado', sinDatos ? null : euros(g.recaudado ?? 0)],
          ['Litros equivalentes', sinDatos ? null : litros(g.litros)],
          ['Falta', sinDatos ? null : g.completado ? '¡Objetivo cubierto!' : euros(g.restanteEur)],
          ['Objetivo', `${euros(g.objetivoEur)} · ${litros(g.objetivoLitros)}`],
        ].map(([k, v]) => (
          <div key={k} className="flex justify-between items-baseline gap-3 border-b border-gray-50 last:border-0 pb-2 last:pb-0">
            <dt className="text-gray-400 text-xs">{k}</dt>
            <dd className="font-black text-pm-navy text-sm text-right break-words min-w-0">
              {v ?? <span className="text-gray-300 font-normal italic">Sin datos</span>}
            </dd>
          </div>
        ))}
      </dl>

      {g.nota && <p className="text-gray-500 text-xs mt-4 leading-relaxed">{g.nota}</p>}
      {g.actualizado && (
        <p className="text-gray-300 text-xs mt-3">Actualizado el {fechaBreve(g.actualizado)}</p>
      )}
    </div>
  )
}

function Ranking({ ranking }: { ranking: Donante[] }) {
  const medalla = ['bg-amber-400 text-amber-900', 'bg-gray-300 text-gray-700', 'bg-amber-700 text-amber-50']

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5 sm:p-7">
      <h3 className="font-black text-pm-navy text-lg">Top 10 colaboradores de gasolina</h3>
      <p className="text-gray-400 text-xs mt-1 leading-relaxed">
        Quienes han empujado para que el depósito no se quede vacío. Gracias.
      </p>

      {ranking.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-400 text-sm leading-relaxed max-w-sm mx-auto">
            Todavía no hay colaboradores publicados. Según vayan sumándose irán apareciendo aquí.
          </p>
        </div>
      ) : (
        <ol className="mt-5 space-y-1.5">
          {ranking.map((d, i) => (
            <li
              key={d.id}
              className={`flex items-center gap-3 rounded-xl p-2.5 min-w-0 ${i < 3 ? 'bg-pm-bg' : ''}`}
            >
              <span
                className={`w-7 h-7 shrink-0 rounded-full grid place-items-center text-xs font-black ${
                  medalla[i] ?? 'bg-gray-100 text-gray-400'
                }`}
              >
                {i + 1}
              </span>

              <span className="w-9 h-9 shrink-0 rounded-full bg-pm-bg border border-gray-100 overflow-hidden grid place-items-center">
                {d.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={d.avatarUrl} alt="" loading="lazy" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-[10px] font-black text-gray-300">{d.nombre.slice(0, 2).toUpperCase()}</span>
                )}
              </span>

              <span className="min-w-0 flex-1">
                <span className="block font-bold text-pm-navy text-sm truncate">{d.nombre}</span>
                {d.fecha && <span className="block text-xs text-gray-400">{fechaBreve(d.fecha)}</span>}
              </span>

              <span className="font-black text-pm-navy text-sm shrink-0">{euros(d.importe)}</span>
            </li>
          ))}
        </ol>
      )}

      <p className="text-gray-300 text-xs mt-5 leading-relaxed border-t border-gray-50 pt-4">
        Solo aparecen las personas que han autorizado que se publique su nombre o alias. Hay más gente que colabora sin
        salir en la lista, y también cuentan.
      </p>
    </div>
  )
}

export default function Gasolina({ gasolina, ranking }: Props) {
  return (
    <div className="grid lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)] gap-5 lg:gap-6 items-start">
      <Deposito g={gasolina} />
      <Ranking ranking={ranking} />
    </div>
  )
}
