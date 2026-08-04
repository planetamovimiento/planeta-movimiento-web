'use client'

// ─────────────────────────────────────────────────────────────────────────────
// Configuración del módulo: centro de numeración (próximo número de cada serie,
// reinicio anual, activa/inactiva) y estado general. Los datos fiscales, textos
// y marca se editan en «Perfiles»; los datos de cobro por documento, al emitir.
// Reutiliza guardarSerie: no añade lógica nueva de escritura.
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from 'react'
import { numeroPreview } from '@/lib/facturacion/constants'
import type { PerfilFacturacion, SerieFacturacion } from '@/lib/facturacion/tipos'
import { guardarSerie } from './actions'
import { Bloque, BotonMini, inputCls, type Correr } from '../50dias50provincias/piezas'

const AÑO = new Date().getFullYear()

function SerieFila({ serie, pending, correr, editable }: {
  serie: SerieFacturacion; pending: boolean; correr: Correr; editable: boolean
}) {
  const [proximo, setProximo] = useState(String(serie.proximo))
  const cambiado = Number(proximo) !== serie.proximo && Number(proximo) >= 1

  const guardar = (patch: Partial<{ proximo: number; reiniciaAnual: boolean; activa: boolean }>) =>
    correr(() => guardarSerie({
      id: serie.id, profileId: serie.profileId, tipo: serie.tipo, prefijo: serie.prefijo,
      proximo: patch.proximo ?? serie.proximo,
      reiniciaAnual: patch.reiniciaAnual ?? serie.reiniciaAnual,
      activa: patch.activa ?? serie.activa,
    }))

  return (
    <div className="flex flex-wrap items-center gap-3 bg-pm-bg rounded-lg px-3 py-2.5 text-sm">
      <span className="font-bold text-pm-navy">{serie.prefijo}</span>
      <span className="text-xs font-bold text-gray-400 bg-white rounded-full px-2 py-0.5">{serie.tipo}</span>
      {!serie.activa && <span className="text-xs font-bold text-gray-400 bg-gray-100 rounded-full px-2 py-0.5">Inactiva</span>}
      <span className="text-xs text-gray-500">Siguiente: <strong className="text-pm-navy">{numeroPreview(serie.prefijo, serie.ejercicio || AÑO, serie.proximo)}</strong></span>
      <div className="flex items-center gap-1.5 ml-auto">
        <label className="text-xs font-bold text-gray-500">Próximo nº</label>
        <input type="number" min="1" className={`${inputCls} w-20`} value={proximo} disabled={!editable}
          onChange={e => setProximo(e.target.value)} />
        <BotonMini onClick={() => guardar({ proximo: Math.max(1, Math.round(Number(proximo) || 1)) })} disabled={!editable || pending || !cambiado}>Aplicar</BotonMini>
        <BotonMini onClick={() => guardar({ reiniciaAnual: !serie.reiniciaAnual })} disabled={!editable || pending}
          titulo="Reinicia la numeración cada año natural">{serie.reiniciaAnual ? '↻ Reinicio anual: sí' : '↻ Reinicio anual: no'}</BotonMini>
        <BotonMini onClick={() => guardar({ activa: !serie.activa })} disabled={!editable || pending}>{serie.activa ? 'Desactivar' : 'Activar'}</BotonMini>
      </div>
    </div>
  )
}

export default function TabConfig({ perfiles, series, clientes, pending, correr, editable, irAPerfiles }: {
  perfiles: PerfilFacturacion[]
  series: SerieFacturacion[]
  clientes: number
  pending: boolean
  correr: Correr
  editable: boolean
  irAPerfiles?: () => void
}) {
  const predeterminado = perfiles.find(p => p.predeterminado && p.activo && !p.archivado) ?? perfiles.find(p => p.activo && !p.archivado)

  return (
    <div className="space-y-5">
      <Bloque titulo="Numeración" desc="Ajusta el próximo número de cada serie (p. ej. para retomar una numeración externa) y su reinicio anual. Cambiar el próximo número no toca las facturas ya emitidas.">
        {!editable && <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-4">Solo el administrador principal ajusta la numeración.</p>}
        {series.length === 0 ? (
          <p className="text-sm text-gray-400 py-2">No hay series todavía. Créalas dentro de cada perfil en «Perfiles de facturación».</p>
        ) : (
          <div className="space-y-4">
            {perfiles.map(p => {
              const mias = series.filter(s => s.profileId === p.id)
              if (mias.length === 0) return null
              return (
                <div key={p.id}>
                  <div className="text-xs font-black text-pm-red uppercase tracking-widest mb-2">{p.nombreComercial}</div>
                  <div className="space-y-2">
                    {mias.map(s => <SerieFila key={s.id} serie={s} pending={pending} correr={correr} editable={editable} />)}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </Bloque>

      <Bloque titulo="Estado del módulo" desc="Resumen rápido. Los datos fiscales, textos y marca se editan en «Perfiles»; los clientes, en su pestaña.">
        <div className="grid sm:grid-cols-3 gap-3 text-sm">
          <div className="bg-pm-bg rounded-lg px-3 py-2.5">
            <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">Emisor predeterminado</div>
            <div className="font-bold text-pm-navy mt-0.5">{predeterminado?.nombreComercial ?? '— sin definir —'}</div>
          </div>
          <div className="bg-pm-bg rounded-lg px-3 py-2.5">
            <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">Perfiles emisores</div>
            <div className="font-bold text-pm-navy mt-0.5">{perfiles.filter(p => !p.archivado).length} activos · {perfiles.length} en total</div>
          </div>
          <div className="bg-pm-bg rounded-lg px-3 py-2.5">
            <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">Clientes</div>
            <div className="font-bold text-pm-navy mt-0.5">{clientes}</div>
          </div>
        </div>
        {irAPerfiles && (
          <button type="button" onClick={irAPerfiles} className="mt-4 text-sm font-bold text-pm-red hover:underline">Ir a Perfiles de facturación →</button>
        )}
      </Bloque>
    </div>
  )
}
