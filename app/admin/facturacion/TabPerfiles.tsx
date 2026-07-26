'use client'

// ─────────────────────────────────────────────────────────────────────────────
// Perfiles emisores. Cada uno = una empresa/entidad desde la que se factura.
// Datos fiscales, marca (logo/sello/firma/color) y sus series de numeración.
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from 'react'
import { SubirImagen } from '@/components/admin/SubirImagen'
import { FORMAS_PAGO, numeroPreview } from '@/lib/facturacion/constants'
import type { PerfilFacturacion, SerieFacturacion } from '@/lib/facturacion/tipos'
import {
  activarPerfil, archivarPerfil, duplicarPerfil, eliminarPerfil, eliminarSerie,
  guardarPerfil, guardarSerie, marcarPerfilPredeterminado, type PerfilInput,
} from './actions'
import { Bloque, BotonGuardar, BotonMini, Campo, inputCls, type Correr } from '../50dias50provincias/piezas'

const AÑO = 2026 // ponytail: año de vista previa; el número real lo pone la BD al emitir.

type Draft = PerfilInput & { color: string; moneda: string; pais: string }

const vacio = (): Draft => ({
  nombreComercial: '', razonSocial: '', nif: '', direccion: '', cp: '', localidad: '', provincia: '',
  pais: 'España', telefono: '', email: '', web: '', datosRegistrales: '', textoLegal: '',
  iban: '', bic: '', formaPago: '', condicionesPago: '', notas: '', pieFactura: '',
  color: '#0F1A3D', moneda: 'EUR', irpfPct: 0, logoUrl: '', selloUrl: '', firmaUrl: '',
})
const aDraft = (p: PerfilFacturacion): Draft => ({
  id: p.id, nombreComercial: p.nombreComercial, razonSocial: p.razonSocial, nif: p.nif,
  direccion: p.direccion, cp: p.cp, localidad: p.localidad, provincia: p.provincia, pais: p.pais,
  telefono: p.telefono, email: p.email, web: p.web, datosRegistrales: p.datosRegistrales, textoLegal: p.textoLegal,
  iban: p.iban, bic: p.bic, formaPago: p.formaPago, condicionesPago: p.condicionesPago, notas: p.notas,
  pieFactura: p.pieFactura, color: p.color, moneda: p.moneda, irpfPct: p.irpfPct,
  logoUrl: p.logoUrl, selloUrl: p.selloUrl, firmaUrl: p.firmaUrl, activo: p.activo,
})

function SubBloque({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div className="border-t border-gray-100 pt-4">
      <h3 className="text-xs font-black text-pm-red uppercase tracking-widest mb-3">{titulo}</h3>
      {children}
    </div>
  )
}

// ── Series de un perfil (dentro del editor) ────────────────────────────────
function Series({ series, perfilId, pending, correr, editable }: {
  series: SerieFacturacion[]; perfilId: string; pending: boolean; correr: Correr; editable: boolean
}) {
  const mias = series.filter(s => s.profileId === perfilId)
  const [prefijo, setPrefijo] = useState('')
  const [tipo, setTipo] = useState<'factura' | 'proforma'>('factura')
  const [proximo, setProximo] = useState('1')

  function anadir() {
    correr(async () => {
      const r = await guardarSerie({ profileId: perfilId, tipo, prefijo, proximo })
      if (r.ok) { setPrefijo(''); setProximo('1') }
      return r
    })
  }

  return (
    <SubBloque titulo="Series de numeración">
      {mias.length === 0 && <p className="text-sm text-gray-400 mb-2">Sin series. La numeración se asigna al emitir (p. ej. PM-{AÑO}-0001).</p>}
      <div className="space-y-2">
        {mias.map(s => (
          <div key={s.id} className="flex items-center gap-3 text-sm bg-pm-bg rounded-lg px-3 py-2">
            <span className="font-bold text-pm-navy">{s.prefijo}</span>
            <span className="text-xs font-bold text-gray-400 bg-white rounded-full px-2 py-0.5">{s.tipo}</span>
            <span className="text-xs text-gray-500">Próximo: {numeroPreview(s.prefijo, s.ejercicio || AÑO, s.proximo)}</span>
            <span className="ml-auto" />
            <BotonMini onClick={() => { if (confirm(`¿Borrar la serie ${s.prefijo}? Solo si no tiene documentos.`)) correr(() => eliminarSerie(s.id)) }} disabled={!editable} titulo="Borrar serie">✕</BotonMini>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap items-end gap-2 mt-3">
        <label className="block"><span className="block text-xs font-bold text-gray-500 mb-1">Prefijo</span>
          <input className={`${inputCls} w-24`} value={prefijo} disabled={!editable} placeholder="PM" onChange={e => setPrefijo(e.target.value.toUpperCase())} /></label>
        <label className="block"><span className="block text-xs font-bold text-gray-500 mb-1">Tipo</span>
          <select className={inputCls} value={tipo} disabled={!editable} onChange={e => setTipo(e.target.value as 'factura' | 'proforma')}>
            <option value="factura">Factura</option><option value="proforma">Proforma</option>
          </select></label>
        <label className="block"><span className="block text-xs font-bold text-gray-500 mb-1">Próximo nº</span>
          <input type="number" min="1" className={`${inputCls} w-24`} value={proximo} disabled={!editable} onChange={e => setProximo(e.target.value)} /></label>
        <BotonMini onClick={anadir} disabled={!editable || pending || !prefijo.trim()}>+ Añadir serie</BotonMini>
      </div>
    </SubBloque>
  )
}

function Formulario({ draft, setDraft, series, onGuardar, onCancelar, pending, correr, editable }: {
  draft: Draft; setDraft: (d: Draft) => void; series: SerieFacturacion[]
  onGuardar: () => void; onCancelar: () => void; pending: boolean; correr: Correr; editable: boolean
}) {
  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setDraft({ ...draft, [k]: v })
  const t = (k: keyof Draft, ph = '') => (
    <input className={inputCls} value={String(draft[k] ?? '')} disabled={!editable} placeholder={ph}
      onChange={e => set(k, e.target.value as Draft[typeof k])} />
  )
  const area = (k: keyof Draft, ph = '') => (
    <textarea className={`${inputCls} min-h-[60px]`} value={String(draft[k] ?? '')} disabled={!editable} placeholder={ph}
      onChange={e => set(k, e.target.value as Draft[typeof k])} />
  )

  return (
    <div className="bg-pm-bg rounded-xl p-4 space-y-5">
      <SubBloque titulo="Identificación fiscal">
        <div className="grid sm:grid-cols-2 gap-3">
          <Campo label="Nombre comercial" hint="Obligatorio.">{t('nombreComercial')}</Campo>
          <Campo label="Razón social">{t('razonSocial')}</Campo>
          <Campo label="NIF / CIF" hint="No lo inventes: déjalo vacío si aún no lo tienes confirmado.">{t('nif')}</Campo>
          <Campo label="Datos registrales (opcional)">{t('datosRegistrales', 'Registro Mercantil…')}</Campo>
        </div>
        <div className="grid sm:grid-cols-2 gap-3 mt-3">
          <Campo label="Dirección fiscal">{t('direccion', 'Polígono Los Palancares 8')}</Campo>
          <div className="grid grid-cols-3 gap-3">
            <Campo label="C.P.">{t('cp')}</Campo>
            <Campo label="Localidad">{t('localidad')}</Campo>
            <Campo label="Provincia">{t('provincia')}</Campo>
          </div>
          <Campo label="País">{t('pais')}</Campo>
        </div>
      </SubBloque>

      <SubBloque titulo="Contacto">
        <div className="grid sm:grid-cols-3 gap-3">
          <Campo label="Teléfono">{t('telefono')}</Campo>
          <Campo label="Correo">{t('email')}</Campo>
          <Campo label="Web">{t('web')}</Campo>
        </div>
      </SubBloque>

      <SubBloque titulo="Cobro y banca">
        <div className="grid sm:grid-cols-2 gap-3">
          <Campo label="IBAN" hint="No lo inventes: vacío si no está confirmado.">{t('iban')}</Campo>
          <Campo label="BIC / SWIFT (opcional)">{t('bic')}</Campo>
          <Campo label="Forma de pago predeterminada">
            <select className={inputCls} value={String(draft.formaPago ?? '')} disabled={!editable} onChange={e => set('formaPago', e.target.value)}>
              <option value="">—</option>{FORMAS_PAGO.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </Campo>
          <Campo label="Condiciones de pago">{t('condicionesPago', 'Pago a 30 días')}</Campo>
          <Campo label="IRPF por defecto (%)" hint="0 si no aplica retención.">
            <input type="number" min="0" step="0.01" className={inputCls} value={String(draft.irpfPct ?? 0)} disabled={!editable} onChange={e => set('irpfPct', e.target.value)} />
          </Campo>
          <Campo label="Moneda"><input className={inputCls} value={draft.moneda} disabled onChange={() => {}} /></Campo>
        </div>
      </SubBloque>

      <SubBloque titulo="Textos por defecto">
        <div className="grid sm:grid-cols-2 gap-3">
          <Campo label="Notas predeterminadas">{area('notas')}</Campo>
          <Campo label="Pie de factura">{area('pieFactura')}</Campo>
          <Campo label="Texto legal (opcional)" hint="LOPD, aviso de retención…">{area('textoLegal')}</Campo>
        </div>
      </SubBloque>

      <SubBloque titulo="Marca">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-xs font-bold text-gray-500">Color corporativo</span>
          <input type="color" value={draft.color} disabled={!editable} onChange={e => set('color', e.target.value)} className="w-10 h-8 rounded border border-gray-200 disabled:opacity-40" />
          <span className="text-xs text-gray-400">{draft.color}</span>
        </div>
        <div className="grid sm:grid-cols-3 gap-3">
          <Campo label="Logotipo"><SubirImagen carpeta="facturacion" value={draft.logoUrl || ''} onChange={u => set('logoUrl', u)} /></Campo>
          <Campo label="Sello (opcional)"><SubirImagen carpeta="facturacion" value={draft.selloUrl || ''} onChange={u => set('selloUrl', u)} /></Campo>
          <Campo label="Firma (opcional)"><SubirImagen carpeta="facturacion" value={draft.firmaUrl || ''} onChange={u => set('firmaUrl', u)} /></Campo>
        </div>
      </SubBloque>

      {draft.id
        ? <Series series={series} perfilId={draft.id} pending={pending} correr={correr} editable={editable} />
        : <SubBloque titulo="Series de numeración"><p className="text-sm text-gray-400">Guarda el perfil y podrás añadir sus series.</p></SubBloque>}

      <div className="flex gap-2 pt-1 border-t border-gray-100">
        <BotonGuardar onClick={onGuardar} pending={pending} disabled={!editable || !(draft.nombreComercial || '').trim()} />
        <button type="button" onClick={onCancelar} className="text-sm font-bold text-gray-400 hover:text-pm-navy px-3 py-2">Cancelar</button>
      </div>
    </div>
  )
}

export default function TabPerfiles({ perfiles, series, pending, correr, editable }: {
  perfiles: PerfilFacturacion[]; series: SerieFacturacion[]; pending: boolean; correr: Correr; editable: boolean
}) {
  const [editando, setEditando] = useState<string | null>(null)
  const [creando, setCreando] = useState(false)
  const [draft, setDraft] = useState<Draft>(vacio())

  function cerrar() { setCreando(false); setEditando(null) }
  function guardar() {
    correr(async () => {
      const r = await guardarPerfil(draft)
      if (r.ok) cerrar()
      return r
    })
  }

  return (
    <Bloque titulo="Perfiles de facturación" desc="Empresas o entidades desde las que emites. Al crear un documento eliges con cuál facturar.">
      {!editable && <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-4">Solo el administrador principal edita los datos fiscales del emisor.</p>}

      <div className="space-y-3">
        {perfiles.length === 0 && !creando && (
          <p className="text-sm text-gray-400 py-4 text-center">Todavía no hay perfiles. Crea el primero (p. ej. Planeta Movimiento).</p>
        )}

        {perfiles.map(p => (
          <div key={p.id} className={`border rounded-xl overflow-hidden ${p.archivado ? 'border-gray-100 bg-gray-50/60' : 'border-gray-100'}`}>
            <div className="flex items-center gap-3 p-3">
              <div className="w-12 h-12 shrink-0 rounded-lg bg-white border border-gray-100 grid place-items-center overflow-hidden">
                {p.logoUrl
                  ? // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.logoUrl} alt={p.nombreComercial} className="w-full h-full object-contain" />
                  : <span className="text-xs font-black" style={{ color: p.color }}>{p.nombreComercial.slice(0, 2).toUpperCase()}</span>}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-bold text-pm-navy truncate">{p.nombreComercial}</span>
                  {p.predeterminado && <span className="text-xs font-bold text-pm-red bg-pm-red/10 rounded-full px-2 py-0.5">Predeterminado</span>}
                  {!p.activo && <span className="text-xs font-bold text-gray-400 bg-gray-100 rounded-full px-2 py-0.5">Inactivo</span>}
                  {p.archivado && <span className="text-xs font-bold text-gray-400 bg-gray-100 rounded-full px-2 py-0.5">Archivado</span>}
                </div>
                <p className="text-xs text-gray-400 truncate mt-0.5">{[p.razonSocial, p.nif || 'NIF pendiente', p.localidad].filter(Boolean).join(' · ')}</p>
              </div>
              <div className="flex flex-wrap items-center gap-1.5 shrink-0 justify-end">
                {!p.predeterminado && !p.archivado && p.activo && (
                  <BotonMini onClick={() => correr(() => marcarPerfilPredeterminado(p.id))} disabled={!editable} titulo="Usar por defecto al facturar">Predeterminar</BotonMini>
                )}
                <BotonMini onClick={() => (editando === p.id ? cerrar() : (setDraft(aDraft(p)), setEditando(p.id), setCreando(false)))} disabled={!editable}>
                  {editando === p.id ? 'Cerrar' : 'Editar'}
                </BotonMini>
                <BotonMini onClick={() => correr(() => duplicarPerfil(p.id))} disabled={!editable} titulo="Duplicar">Duplicar</BotonMini>
                <BotonMini onClick={() => correr(() => activarPerfil(p.id, !p.activo))} disabled={!editable} titulo={p.activo ? 'Desactivar' : 'Activar'}>{p.activo ? 'Desactivar' : 'Activar'}</BotonMini>
                <BotonMini onClick={() => correr(() => archivarPerfil(p.id, !p.archivado))} disabled={!editable} titulo={p.archivado ? 'Restaurar' : 'Archivar'}>{p.archivado ? 'Restaurar' : 'Archivar'}</BotonMini>
                <BotonMini onClick={() => { if (confirm(`¿Eliminar ${p.nombreComercial}? Solo si no tiene documentos.`)) correr(() => eliminarPerfil(p.id)) }} disabled={!editable} titulo="Eliminar">✕</BotonMini>
              </div>
            </div>
            {editando === p.id && (
              <div className="p-3 pt-0">
                <Formulario draft={draft} setDraft={setDraft} series={series} onGuardar={guardar} onCancelar={cerrar} pending={pending} correr={correr} editable={editable} />
              </div>
            )}
          </div>
        ))}

        {creando ? (
          <Formulario draft={draft} setDraft={setDraft} series={series} onGuardar={guardar} onCancelar={cerrar} pending={pending} correr={correr} editable={editable} />
        ) : (
          <button type="button" onClick={() => { setDraft(vacio()); setCreando(true); setEditando(null) }} disabled={!editable}
            className="w-full border-2 border-dashed border-gray-200 hover:border-pm-red text-sm font-bold text-gray-400 hover:text-pm-red rounded-xl py-3 disabled:opacity-40 disabled:cursor-not-allowed">
            + Añadir perfil emisor
          </button>
        )}
      </div>
    </Bloque>
  )
}
