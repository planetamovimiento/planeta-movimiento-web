'use client'

// ─────────────────────────────────────────────────────────────────────────────
// Recaudación del reto. Son DOS vías que se suman en el total público:
//
//   · Lo de cada provincia, provincia a provincia (la tabla de abajo).
//   · Lo donado por la web desde que arrancó la campaña, el 1 de enero.
//
// Regla: vacío = sin dato (null). Nunca se guarda ni se muestra un 0 inventado,
// porque un 0 € haría creer que no se ha recaudado nada.
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from 'react'
import { euros, labelEstadoEtapa, badgeEstadoEtapa } from '@/lib/reto50/constants'
import type { ConfigReto, Etapa, ResumenReto } from '@/lib/reto50/tipos'
import { guardarConfig, guardarEtapa } from './actions'
import { Bloque, BotonGuardar, Campo, SinDato, inputCls, type Correr } from './piezas'

type Props = {
  etapas: Etapa[]
  resumen: ResumenReto
  config: ConfigReto
  pending: boolean
  correr: Correr
  editable: boolean
}

function Metrica({ label, valor, sub }: { label: string; valor: string | null; sub?: string }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
      <div className="text-xs font-bold text-gray-400 uppercase tracking-wide">{label}</div>
      <div className="mt-1 text-2xl font-black text-pm-navy">
        {valor ?? <SinDato />}
      </div>
      {sub && <div className="text-xs text-gray-400 mt-0.5">{sub}</div>}
    </div>
  )
}

/**
 * Donaciones que llegan por la web, al margen de las paradas de la ruta.
 * Se introduce el ACUMULADO, no cada donación: es la cifra que se suma al total.
 */
function BloqueOnline({ config, resumen, pending, correr, editable }: {
  config: ConfigReto
  resumen: ResumenReto
  pending: boolean
  correr: Correr
  editable: boolean
}) {
  const inicial = {
    recaudado: config.online_recaudado ?? '',
    actualizado: config.online_actualizado ?? '',
    nota: config.online_nota ?? '',
  }
  const [draft, setDraft] = useState(inicial)
  const set = (k: keyof typeof inicial, v: string) => setDraft(d => ({ ...d, [k]: v }))

  const cambiadas = (Object.keys(inicial) as (keyof typeof inicial)[]).filter(k => draft[k] !== inicial[k])

  function guardar() {
    correr(async () => {
      for (const k of cambiadas) {
        const r = await guardarConfig(`online_${k}`, draft[k])
        if (!r.ok) return r
      }
      return { ok: true }
    })
  }

  const valor = draft.recaudado.trim() === '' ? null : Number(draft.recaudado)
  const valido = valor == null || (Number.isFinite(valor) && valor >= 0)

  return (
    <Bloque
      titulo="Donaciones por la web"
      desc="Lo que se ha donado online desde que arrancó la campaña, el 1 de enero, al margen de las paradas de la ruta. Se suma al total que ve la gente en la portada."
    >
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Campo
          label="Total donado por la web (€)"
          hint="El acumulado, no cada donación. Vacío = aún sin datos."
        >
          <input
            type="number" min="0" step="0.01" inputMode="decimal" placeholder="Aún sin datos"
            className={inputCls} disabled={!editable}
            value={draft.recaudado}
            onChange={e => set('recaudado', e.target.value)}
          />
        </Campo>
        <Campo label="Actualizado el" hint="Para saber a qué fecha corresponde la cifra.">
          <input type="date" className={inputCls} disabled={!editable}
            value={draft.actualizado} onChange={e => set('actualizado', e.target.value)} />
        </Campo>
        <Campo label="Nota interna" hint="De dónde sale la cifra. No se publica.">
          <input className={inputCls} disabled={!editable} placeholder="Ej.: panel de la AECC"
            value={draft.nota} onChange={e => set('nota', e.target.value)} />
        </Campo>
      </div>

      {!valido && (
        <p className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mt-3">
          El importe no es válido. Escribe un número igual o mayor que cero, o déjalo vacío.
        </p>
      )}

      {/* Cómo se compone el total: así se ve de dónde sale cada euro */}
      <div className="bg-pm-bg border border-gray-200 rounded-xl p-3 mt-4 text-sm">
        <div className="text-[11px] font-black uppercase tracking-widest text-gray-400">Total que se publica</div>
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1 mt-1.5 text-pm-navy">
          <span>{resumen.recaudadoProvincias == null ? 'Sin datos' : euros(resumen.recaudadoProvincias)} de las provincias</span>
          <span className="text-gray-400">+</span>
          <span>{resumen.recaudadoOnline == null ? 'Sin datos' : euros(resumen.recaudadoOnline)} por la web</span>
          <span className="text-gray-400">=</span>
          <strong className="font-black">
            {resumen.recaudadoTotal == null ? 'Aún sin datos' : euros(resumen.recaudadoTotal)}
          </strong>
        </div>
        <p className="text-xs text-gray-500 mt-2 leading-relaxed">
          Al guardar, la portada se actualiza sola.
        </p>
      </div>

      {editable && cambiadas.length > 0 && (
        <div className="flex gap-2 mt-3">
          <BotonGuardar onClick={guardar} pending={pending} disabled={!valido}>
            Guardar donaciones web
          </BotonGuardar>
          <button type="button" onClick={() => setDraft(inicial)}
            className="text-sm font-bold text-gray-400 hover:text-pm-navy px-3 py-2">
            Descartar
          </button>
        </div>
      )}
    </Bloque>
  )
}

export default function TabImpacto({ etapas, resumen, config, pending, correr, editable }: Props) {
  // Solo el importe de cada provincia: es lo único editable en esta tabla.
  const [drafts, setDrafts] = useState<Record<string, string>>({})

  const draftDe = (e: Etapa) => drafts[e.id] ?? (e.recaudado == null ? '' : String(e.recaudado))
  const set = (id: string, valor: string) => setDrafts(d => ({ ...d, [id]: valor }))
  const sucia = (e: Etapa) => {
    const d = drafts[e.id]
    return d !== undefined && d !== (e.recaudado == null ? '' : String(e.recaudado))
  }

  function guardar(e: Etapa) {
    const d = draftDe(e)
    correr(async () => {
      const r = await guardarEtapa({
        id: e.id,
        // '' viaja como null: es "sin dato", no un cero.
        recaudado: d.trim() === '' ? null : d.trim(),
      })
      if (r.ok) setDrafts(prev => { const { [e.id]: _quitada, ...resto } = prev; return resto })
      return r
    })
  }

  const conDato = etapas.filter(e => e.recaudado != null).length

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Metrica
          label="Recaudado (total)"
          valor={resumen.recaudadoTotal == null ? null : euros(resumen.recaudadoTotal)}
          sub="Provincias + web"
        />
        <Metrica
          label="En las provincias"
          valor={resumen.recaudadoProvincias == null ? null : euros(resumen.recaudadoProvincias)}
          sub={`${conDato} de ${etapas.length} con dato`}
        />
        <Metrica
          label="Por la web"
          valor={resumen.recaudadoOnline == null ? null : euros(resumen.recaudadoOnline)}
          sub={config.online_actualizado ? `Al ${config.online_actualizado}` : undefined}
        />
        <Metrica label="Provincias completadas" valor={`${resumen.provinciasCompletadas} / ${resumen.totalProvincias}`} />
      </div>

      <BloqueOnline config={config} resumen={resumen} pending={pending} correr={correr} editable={editable} />

      <Bloque
        titulo="Recaudación por provincia"
        desc="Deja el campo vacío mientras no tengas el dato: la web mostrará “aún sin datos” en vez de un 0. El objetivo global se configura en la pestaña General."
      >
        <div className="overflow-x-auto -mx-5 px-5">
          <table className="w-full text-sm min-w-[520px]">
            <thead>
              <tr className="text-left text-xs font-bold text-gray-400 uppercase tracking-wide border-b border-gray-100">
                <th className="py-2 pr-2 w-12">Día</th>
                <th className="py-2 pr-2">Provincia</th>
                <th className="py-2 pr-2 w-32">Estado</th>
                <th className="py-2 pr-2 w-36">Recaudado (€)</th>
                <th className="py-2 w-24"></th>
              </tr>
            </thead>
            <tbody>
              {etapas.map(e => (
                <tr key={e.id} className="border-b border-gray-50 last:border-0">
                  <td className="py-2 pr-2 font-black text-pm-navy">{e.dia}</td>
                  <td className="py-2 pr-2">
                    <div className="font-semibold text-pm-navy">{e.provincia}</div>
                    {e.ciudad && <div className="text-xs text-gray-400">{e.ciudad}</div>}
                  </td>
                  <td className="py-2 pr-2">
                    <span className={`inline-block text-xs font-bold px-2 py-0.5 rounded-full ${badgeEstadoEtapa(e.estado)}`}>
                      {labelEstadoEtapa(e.estado)}
                    </span>
                  </td>
                  <td className="py-2 pr-2">
                    <input
                      type="number" min="0" step="0.01" inputMode="decimal" placeholder="Sin dato"
                      className={inputCls} disabled={!editable}
                      value={draftDe(e)}
                      onChange={ev => set(e.id, ev.target.value)}
                    />
                  </td>
                  <td className="py-2">
                    {sucia(e) && (
                      <BotonGuardar onClick={() => guardar(e)} pending={pending} disabled={!editable}>
                        Guardar
                      </BotonGuardar>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Bloque>
    </div>
  )
}
