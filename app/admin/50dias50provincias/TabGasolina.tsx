'use client'

// ─────────────────────────────────────────────────────────────────────────────
// Objetivo de gasolina + ranking de colaboradores.
//
// Dos cosas SEPARADAS a propósito: el total de la barra es una cifra general
// que se escribe a mano, y el ranking es otra lista. No se suma el ranking para
// sacar el total, porque hay aportaciones anónimas o de quien no quiere salir.
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from 'react'
import { SubirImagen } from '@/components/admin/SubirImagen'
import { calcGasolina, euros, litros } from '@/lib/reto50/constants'
import type { ConfigReto, Donante } from '@/lib/reto50/tipos'
import { eliminarDonante, guardarConfig, guardarDonante } from './actions'
import { Bloque, BotonGuardar, BotonMini, Campo, SinDato, inputCls, type Correr } from './piezas'

type Props = {
  config: ConfigReto
  donantes: Donante[]
  pending: boolean
  correr: Correr
  editable: boolean
}

type DraftDonante = {
  id?: string
  nombre: string
  importe: string
  avatarUrl: string
  fecha: string
  publico: boolean
  activo: boolean
}

const VACIO: DraftDonante = { nombre: '', importe: '', avatarUrl: '', fecha: '', publico: false, activo: true }

const aDraft = (d: Donante): DraftDonante => ({
  id: d.id, nombre: d.nombre, importe: String(d.importe),
  avatarUrl: d.avatarUrl, fecha: d.fecha, publico: d.publico, activo: d.activo,
})

const numONull = (v: string) => {
  if (!v.trim()) return null
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}

// ── Objetivo y recaudación ───────────────────────────────────────────────────

function BloqueGasolina({ config, pending, correr, editable }: Omit<Props, 'donantes'>) {
  const [f, setF] = useState({
    recaudado: config.gasolina_recaudado ?? '',
    actualizado: config.gasolina_actualizado ?? '',
    nota: config.gasolina_nota ?? '',
    objetivoEur: config.gasolina_objetivo_eur ?? '1500',
    objetivoLitros: config.gasolina_objetivo_litros ?? '750',
  })
  const set = <K extends keyof typeof f>(k: K, v: string) => setF({ ...f, [k]: v })

  // Vista previa en vivo: las mismas cuentas que hace la web.
  const g = calcGasolina(numONull(f.recaudado), numONull(f.objetivoEur), numONull(f.objetivoLitros))

  function guardar() {
    correr(async () => {
      const pares: [string, string][] = [
        ['gasolina_recaudado', f.recaudado.trim()],
        ['gasolina_actualizado', f.actualizado.trim()],
        ['gasolina_nota', f.nota.trim()],
        ['gasolina_objetivo_eur', f.objetivoEur.trim()],
        ['gasolina_objetivo_litros', f.objetivoLitros.trim()],
      ]
      for (const [clave, valor] of pares) {
        const r = await guardarConfig(clave, valor)
        if (!r.ok) return r
      }
      return { ok: true }
    })
  }

  return (
    <Bloque
      titulo="Objetivo de gasolina"
      desc="Se actualiza a mano: no hay conexión automática con pagos ni pasarelas. Al guardar, el depósito de la web se rellena solo."
    >
      <div className="grid lg:grid-cols-[1fr_260px] gap-5">
        <div className="space-y-3">
          <div className="grid sm:grid-cols-2 gap-3">
            <Campo label="Recaudado (€)" hint="Déjalo vacío mientras no haya nada: la web dirá «aún sin datos», no 0 €.">
              <input type="number" min="0" step="0.01" inputMode="decimal" className={inputCls} value={f.recaudado}
                disabled={!editable} onChange={e => set('recaudado', e.target.value)} placeholder="Sin dato" />
            </Campo>
            <Campo label="Última actualización">
              <input type="date" className={inputCls} value={f.actualizado} disabled={!editable}
                onChange={e => set('actualizado', e.target.value)} />
            </Campo>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <Campo label="Objetivo (€)">
              <input type="number" min="1" step="1" inputMode="numeric" className={inputCls} value={f.objetivoEur}
                disabled={!editable} onChange={e => set('objetivoEur', e.target.value)} />
            </Campo>
            <Campo label="Objetivo (litros)" hint="De estas dos cifras sale la equivalencia: 750 L / 1.500 € = medio litro por euro.">
              <input type="number" min="1" step="1" inputMode="numeric" className={inputCls} value={f.objetivoLitros}
                disabled={!editable} onChange={e => set('objetivoLitros', e.target.value)} />
            </Campo>
          </div>

          <Campo label="Texto informativo (opcional)" hint="Se muestra bajo el depósito.">
            <textarea className={`${inputCls} min-h-[60px]`} value={f.nota} disabled={!editable}
              onChange={e => set('nota', e.target.value)} />
          </Campo>

          <BotonGuardar onClick={guardar} pending={pending} disabled={!editable} />
        </div>

        {/* Vista previa de las cuentas */}
        <div className="bg-pm-bg rounded-xl p-4">
          <div className="text-xs font-black text-gray-400 uppercase tracking-wide mb-3">Así quedará</div>
          {g.recaudado == null ? (
            <SinDato>Sin cifra: el depósito se verá vacío y con el aviso de «aún sin datos».</SinDato>
          ) : (
            <dl className="space-y-2 text-sm">
              {[
                ['Recaudado', euros(g.recaudado)],
                ['Litros equivalentes', litros(g.litros)],
                ['Progreso', `${Math.round(g.porcentaje)} %${g.porcentaje > 100 ? ' (el depósito se ve lleno)' : ''}`],
                ['Falta', g.completado ? '¡Objetivo cubierto!' : euros(g.restanteEur)],
                ['Objetivo', `${euros(g.objetivoEur)} · ${litros(g.objetivoLitros)}`],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-3">
                  <dt className="text-gray-400">{k}</dt>
                  <dd className="font-bold text-pm-navy text-right">{v}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      </div>
    </Bloque>
  )
}

// ── Ranking ──────────────────────────────────────────────────────────────────

function FormularioDonante({ draft, setDraft, onGuardar, onCancelar, pending, editable }: {
  draft: DraftDonante
  setDraft: (d: DraftDonante) => void
  onGuardar: () => void
  onCancelar: () => void
  pending: boolean
  editable: boolean
}) {
  const set = <K extends keyof DraftDonante>(k: K, v: DraftDonante[K]) => setDraft({ ...draft, [k]: v })

  return (
    <div className="bg-pm-bg rounded-xl p-4 space-y-3">
      <div className="grid sm:grid-cols-3 gap-3">
        <Campo label="Nombre o alias" hint="Solo lo que la persona haya autorizado. Nada de datos personales.">
          <input className={inputCls} value={draft.nombre} disabled={!editable}
            onChange={e => set('nombre', e.target.value)} placeholder="Alias" />
        </Campo>
        <Campo label="Importe (€)">
          <input type="number" min="0" step="0.01" inputMode="decimal" className={inputCls} value={draft.importe}
            disabled={!editable} onChange={e => set('importe', e.target.value)} />
        </Campo>
        <Campo label="Fecha (opcional)">
          <input type="date" className={inputCls} value={draft.fecha} disabled={!editable}
            onChange={e => set('fecha', e.target.value)} />
        </Campo>
      </div>

      <Campo label="Avatar (opcional)">
        <SubirImagen carpeta="reto50-donantes" value={draft.avatarUrl} onChange={url => set('avatarUrl', url)} />
      </Campo>

      {/* El consentimiento es lo importante de esta ficha */}
      <label className="flex items-start gap-2.5 text-sm text-pm-navy bg-white border border-gray-200 rounded-xl p-3">
        <input type="checkbox" className="mt-0.5" checked={draft.publico} disabled={!editable}
          onChange={e => set('publico', e.target.checked)} />
        <span>
          <strong>Mostrar públicamente en el ranking</strong>
          <span className="block text-xs text-gray-400 leading-relaxed mt-0.5">
            Si no lo marcas, la aportación no aparece en la web. Márcalo solo si la persona ha autorizado que se publique
            su nombre o alias.
          </span>
        </span>
      </label>

      <label className="flex items-center gap-2 text-sm text-pm-navy">
        <input type="checkbox" checked={draft.activo} disabled={!editable}
          onChange={e => set('activo', e.target.checked)} />
        Activo <span className="text-xs text-gray-400">(desactívalo para archivarlo sin borrarlo)</span>
      </label>

      <div className="flex gap-2 pt-1">
        <BotonGuardar onClick={onGuardar} pending={pending}
          disabled={!editable || !draft.nombre.trim() || !draft.importe.trim()} />
        <button type="button" onClick={onCancelar} className="text-sm font-bold text-gray-400 hover:text-pm-navy px-3 py-2">
          Cancelar
        </button>
      </div>
    </div>
  )
}

function BloqueRanking({ donantes, pending, correr, editable }: Omit<Props, 'config'>) {
  const [editando, setEditando] = useState<string | null>(null)
  const [creando, setCreando] = useState(false)
  const [draft, setDraft] = useState<DraftDonante>(VACIO)

  // Igual que la web: activos + autorizados, de mayor a menor, los 10 primeros.
  const publicos = donantes.filter(d => d.activo && d.publico)
  const enRanking = new Set(publicos.slice(0, 10).map(d => d.id))
  const suma = donantes.filter(d => d.activo).reduce((s, d) => s + d.importe, 0)

  function cerrar() {
    setCreando(false)
    setEditando(null)
  }

  function guardar() {
    correr(async () => {
      const r = await guardarDonante({
        id: draft.id,
        nombre: draft.nombre,
        importe: draft.importe,
        avatarUrl: draft.avatarUrl,
        fecha: draft.fecha,
        publico: draft.publico,
        activo: draft.activo,
      })
      if (r.ok) cerrar()
      return r
    })
  }

  return (
    <Bloque
      titulo="Ranking de colaboradores de gasolina"
      desc="Se ordena solo por importe. En la web salen los 10 más altos que estén activos y hayan autorizado aparecer."
    >
      <div className="space-y-3">
        <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-gray-400">
          <span>{donantes.length} {donantes.length === 1 ? 'registro' : 'registros'}</span>
          <span>{publicos.length} en el ranking público</span>
          <span>Suma de los registros: <strong className="text-pm-navy">{euros(suma) || '—'}</strong></span>
        </div>
        <p className="text-xs text-gray-400 bg-pm-bg rounded-lg p-2.5 leading-relaxed">
          Esta suma es solo informativa: <strong className="text-pm-navy">no es</strong> el total del depósito. El total se
          escribe a mano arriba, porque puede incluir donaciones anónimas.
        </p>

        {donantes.length === 0 && !creando && (
          <p className="text-sm text-gray-400 py-4 text-center">Todavía no hay colaboradores.</p>
        )}

        {donantes.map(d => {
          const pos = publicos.findIndex(p => p.id === d.id)
          return (
            <div key={d.id} className="border border-gray-100 rounded-xl overflow-hidden">
              <div className="flex items-center gap-3 p-3">
                <div className="w-8 shrink-0 text-center">
                  {enRanking.has(d.id) ? (
                    <span className="font-black text-pm-navy">{pos + 1}</span>
                  ) : (
                    <span className="text-gray-300">—</span>
                  )}
                </div>

                <div className="w-10 h-10 shrink-0 rounded-full bg-pm-bg border border-gray-100 overflow-hidden flex items-center justify-center">
                  {d.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={d.avatarUrl} alt={d.nombre} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xs font-black text-gray-300">{d.nombre.slice(0, 2).toUpperCase()}</span>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-pm-navy truncate">{d.nombre}</span>
                    <span className="font-black text-pm-navy">{euros(d.importe)}</span>
                    {!d.publico && <span className="text-xs font-bold text-amber-700 bg-amber-50 rounded-full px-2 py-0.5">No se publica</span>}
                    {!d.activo && <span className="text-xs font-bold text-gray-400 bg-gray-100 rounded-full px-2 py-0.5">Archivado</span>}
                  </div>
                  {d.fecha && <p className="text-xs text-gray-400 mt-0.5">{d.fecha}</p>}
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <BotonMini onClick={() => correr(() => guardarDonante({ ...aDraft(d), publico: !d.publico }))} disabled={!editable}
                    titulo={d.publico ? 'Dejar de publicar en el ranking' : 'Publicar en el ranking'}>
                    {d.publico ? 'Ocultar' : 'Publicar'}
                  </BotonMini>
                  <BotonMini onClick={() => (editando === d.id ? cerrar() : (setDraft(aDraft(d)), setEditando(d.id), setCreando(false)))} disabled={!editable}>
                    {editando === d.id ? 'Cerrar' : 'Editar'}
                  </BotonMini>
                  <BotonMini onClick={() => { if (confirm(`¿Eliminar a ${d.nombre}?`)) correr(() => eliminarDonante(d.id)) }} disabled={!editable} titulo="Eliminar">
                    ✕
                  </BotonMini>
                </div>
              </div>

              {editando === d.id && (
                <div className="p-3 pt-0">
                  <FormularioDonante draft={draft} setDraft={setDraft} onGuardar={guardar} onCancelar={cerrar} pending={pending} editable={editable} />
                </div>
              )}
            </div>
          )
        })}

        {creando ? (
          <FormularioDonante draft={draft} setDraft={setDraft} onGuardar={guardar} onCancelar={cerrar} pending={pending} editable={editable} />
        ) : (
          <button
            type="button"
            onClick={() => { setDraft({ ...VACIO }); setCreando(true); setEditando(null) }}
            disabled={!editable}
            className="w-full border-2 border-dashed border-gray-200 hover:border-pm-red text-sm font-bold text-gray-400 hover:text-pm-red rounded-xl py-3 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-gray-200 disabled:hover:text-gray-400"
          >
            + Añadir colaborador
          </button>
        )}
      </div>
    </Bloque>
  )
}

export default function TabGasolina({ config, donantes, pending, correr, editable }: Props) {
  return (
    <div className="space-y-5">
      <BloqueGasolina config={config} pending={pending} correr={correr} editable={editable} />
      <BloqueRanking donantes={donantes} pending={pending} correr={correr} editable={editable} />
    </div>
  )
}
