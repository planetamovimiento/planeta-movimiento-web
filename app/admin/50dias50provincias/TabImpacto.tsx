'use client'

// ─────────────────────────────────────────────────────────────────────────────
// Recaudación del reto. DOS magnitudes distintas que NO se mezclan:
//
//   · Kilos de monedas de céntimos (peso; sin valor en euros hasta el recuento).
//   · Dinero en billetes (euros; sí suma al total confirmado).
//
// Más las donaciones por la web. Vacío = sin dato (null): nunca un 0 inventado.
// Solo los datos con estado != «pendiente» salen a la web pública.
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from 'react'
import { euros, eurosDec, kilos, labelEstadoEtapa, badgeEstadoEtapa, ESTADOS_RECAUDACION, AVISO_CENTIMOS } from '@/lib/reto50/constants'
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
      <div className="mt-1 text-2xl font-black text-pm-navy">{valor ?? <SinDato />}</div>
      {sub && <div className="text-xs text-gray-400 mt-0.5">{sub}</div>}
    </div>
  )
}

/** Donaciones por la web (euros; se suman al total confirmado). */
function BloqueOnline({ config, resumen, pending, correr, editable }: {
  config: ConfigReto; resumen: ResumenReto; pending: boolean; correr: Correr; editable: boolean
}) {
  const inicial = { recaudado: config.online_recaudado ?? '', actualizado: config.online_actualizado ?? '', nota: config.online_nota ?? '' }
  const [draft, setDraft] = useState(inicial)
  const set = (k: keyof typeof inicial, v: string) => setDraft(d => ({ ...d, [k]: v }))
  const cambiadas = (Object.keys(inicial) as (keyof typeof inicial)[]).filter(k => draft[k] !== inicial[k])
  const valor = draft.recaudado.trim() === '' ? null : Number(draft.recaudado)
  const valido = valor == null || (Number.isFinite(valor) && valor >= 0)

  function guardar() {
    correr(async () => {
      for (const k of cambiadas) { const r = await guardarConfig(`online_${k}`, draft[k]); if (!r.ok) return r }
      return { ok: true }
    })
  }

  return (
    <Bloque titulo="Donaciones por la web" desc="Lo donado online desde que arrancó la campaña. Euros: se suman al total confirmado de la portada.">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Campo label="Total donado por la web (€)" hint="El acumulado, no cada donación. Vacío = aún sin datos.">
          <input type="number" min="0" step="0.01" inputMode="decimal" placeholder="Aún sin datos"
            className={inputCls} disabled={!editable} value={draft.recaudado} onChange={e => set('recaudado', e.target.value)} />
        </Campo>
        <Campo label="Actualizado el"><input type="date" className={inputCls} disabled={!editable} value={draft.actualizado} onChange={e => set('actualizado', e.target.value)} /></Campo>
        <Campo label="Nota interna" hint="No se publica."><input className={inputCls} disabled={!editable} placeholder="Ej.: panel de la AECC" value={draft.nota} onChange={e => set('nota', e.target.value)} /></Campo>
      </div>
      {!valido && <p className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mt-3">Escribe un número igual o mayor que cero, o déjalo vacío.</p>}
      <div className="bg-pm-bg border border-gray-200 rounded-xl p-3 mt-4 text-sm">
        <div className="text-[11px] font-black uppercase tracking-widest text-gray-400">Total confirmado en euros</div>
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1 mt-1.5 text-pm-navy">
          <span>{resumen.recaudadoProvincias == null ? 'Sin datos' : eurosDec(resumen.recaudadoProvincias)} en billetes</span>
          <span className="text-gray-400">+</span>
          <span>{resumen.recaudadoOnline == null ? 'Sin datos' : euros(resumen.recaudadoOnline)} por la web</span>
          <span className="text-gray-400">=</span>
          <strong className="font-black">{resumen.recaudadoTotal == null ? 'Aún sin datos' : eurosDec(resumen.recaudadoTotal)}</strong>
        </div>
      </div>
      {editable && cambiadas.length > 0 && (
        <div className="flex gap-2 mt-3">
          <BotonGuardar onClick={guardar} pending={pending} disabled={!valido}>Guardar donaciones web</BotonGuardar>
          <button type="button" onClick={() => setDraft(inicial)} className="text-sm font-bold text-gray-400 hover:text-pm-navy px-3 py-2">Descartar</button>
        </div>
      )}
    </Bloque>
  )
}

type Fila = { kg: string; billetes: string; estado: string }
const filaDe = (e: Etapa): Fila => ({
  kg: e.centimosKg == null ? '' : String(e.centimosKg),
  billetes: e.billetesCents == null ? '' : String(e.billetesCents / 100),
  estado: e.recaudacionEstado || 'registrado',
})

export default function TabImpacto({ etapas, resumen, config, pending, correr, editable }: Props) {
  const [drafts, setDrafts] = useState<Record<string, Fila>>({})
  const draftDe = (e: Etapa): Fila => drafts[e.id] ?? filaDe(e)
  const set = (id: string, k: keyof Fila, v: string) => setDrafts(d => ({ ...d, [id]: { ...(d[id] ?? filaDe(etapas.find(x => x.id === id)!)), [k]: v } }))
  const sucia = (e: Etapa) => { const d = drafts[e.id]; if (!d) return false; const o = filaDe(e); return d.kg !== o.kg || d.billetes !== o.billetes || d.estado !== o.estado }

  function guardar(e: Etapa) {
    const d = draftDe(e)
    correr(async () => {
      const r = await guardarEtapa({
        id: e.id,
        centimosKg: d.kg.trim() === '' ? null : d.kg.trim(),
        billetesEur: d.billetes.trim() === '' ? null : d.billetes.trim(),
        recaudacionEstado: d.estado,
        recaudacionActualizado: new Date().toISOString().slice(0, 10),
      })
      if (r.ok) setDrafts(prev => { const { [e.id]: _q, ...resto } = prev; return resto })
      return r
    })
  }

  const conBilletes = etapas.filter(e => e.billetesCents != null).length
  const conKg = etapas.filter(e => e.centimosKg != null).length

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Metrica label="Total confirmado (€)" valor={resumen.recaudadoTotal == null ? null : eurosDec(resumen.recaudadoTotal)} sub="Billetes + web" />
        <Metrica label="Billetes (provincias)" valor={resumen.recaudadoProvincias == null ? null : eurosDec(resumen.recaudadoProvincias)} sub={`${conBilletes} de ${etapas.length} con dato`} />
        <Metrica label="Kilos de céntimos" valor={resumen.centimosKg == null ? null : kilos(resumen.centimosKg)} sub={`${conKg} de ${etapas.length} con dato · sin valor € aún`} />
        <Metrica label="Provincias completadas" valor={`${resumen.provinciasCompletadas} / ${resumen.totalProvincias}`} />
      </div>

      <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">{AVISO_CENTIMOS}</p>

      <BloqueOnline config={config} resumen={resumen} pending={pending} correr={correr} editable={editable} />

      <Bloque titulo="Recaudación por provincia"
        desc="Kilos de céntimos (peso) y billetes (euros) de cada etapa. Deja vacío lo que no tengas. Solo lo que NO esté «pendiente» sale a la web.">
        <div className="overflow-x-auto -mx-5 px-5">
          <table className="w-full text-sm min-w-[640px]">
            <thead>
              <tr className="text-left text-xs font-bold text-gray-400 uppercase tracking-wide border-b border-gray-100">
                <th className="py-2 pr-2 w-12">Día</th>
                <th className="py-2 pr-2">Provincia</th>
                <th className="py-2 pr-2 w-28">Kilos (kg)</th>
                <th className="py-2 pr-2 w-32">Billetes (€)</th>
                <th className="py-2 pr-2 w-36">Estado</th>
                <th className="py-2 w-20"></th>
              </tr>
            </thead>
            <tbody>
              {etapas.map(e => {
                const d = draftDe(e)
                return (
                  <tr key={e.id} className="border-b border-gray-50 last:border-0">
                    <td className="py-2 pr-2 font-black text-pm-navy">{e.dia}</td>
                    <td className="py-2 pr-2">
                      <div className="font-semibold text-pm-navy">{e.provincia}</div>
                      <span className={`inline-block text-[10px] font-bold px-1.5 py-0.5 rounded-full mt-0.5 ${badgeEstadoEtapa(e.estado)}`}>{labelEstadoEtapa(e.estado)}</span>
                    </td>
                    <td className="py-2 pr-2">
                      <input type="number" min="0" step="0.001" inputMode="decimal" placeholder="Sin dato"
                        className={inputCls} disabled={!editable} value={d.kg} onChange={ev => set(e.id, 'kg', ev.target.value)} />
                    </td>
                    <td className="py-2 pr-2">
                      <input type="number" min="0" step="0.01" inputMode="decimal" placeholder="Sin dato"
                        className={inputCls} disabled={!editable} value={d.billetes} onChange={ev => set(e.id, 'billetes', ev.target.value)} />
                    </td>
                    <td className="py-2 pr-2">
                      <select className={inputCls} disabled={!editable} value={d.estado} onChange={ev => set(e.id, 'estado', ev.target.value)}>
                        {ESTADOS_RECAUDACION.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                      </select>
                    </td>
                    <td className="py-2">
                      {sucia(e) && <BotonGuardar onClick={() => guardar(e)} pending={pending} disabled={!editable}>Guardar</BotonGuardar>}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Bloque>
    </div>
  )
}
