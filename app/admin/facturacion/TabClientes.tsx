'use client'

// ─────────────────────────────────────────────────────────────────────────────
// Clientes de facturación. Guardados para reutilizar en facturas y proformas.
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from 'react'
import { TIPOS_CLIENTE, FORMAS_PAGO } from '@/lib/facturacion/constants'
import type { ClienteFactura } from '@/lib/facturacion/tipos'
import { archivarClienteFactura, eliminarClienteFactura, guardarClienteFactura } from './actions'
import { Bloque, BotonGuardar, BotonMini, Campo, inputCls, type Correr } from '../50dias50provincias/piezas'

type Draft = Omit<ClienteFactura, 'id' | 'archivado'> & { id?: string }

const vacio = (): Draft => ({
  tipo: 'empresa', nombre: '', nif: '', direccion: '', cp: '', localidad: '', provincia: '',
  pais: 'España', email: '', telefono: '', contacto: '', formaPago: '', iban: '', notas: '',
})
const aDraft = (c: ClienteFactura): Draft => ({ ...c })

const labelTipo = (id: string) => TIPOS_CLIENTE.find(t => t.id === id)?.label ?? id

function Formulario({ draft, setDraft, onGuardar, onCancelar, pending, editable }: {
  draft: Draft; setDraft: (d: Draft) => void; onGuardar: () => void; onCancelar: () => void; pending: boolean; editable: boolean
}) {
  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setDraft({ ...draft, [k]: v })
  const t = (k: keyof Draft, ph = '') => (
    <input className={inputCls} value={String(draft[k] ?? '')} disabled={!editable} placeholder={ph}
      onChange={e => set(k, e.target.value as Draft[typeof k])} />
  )
  return (
    <div className="bg-pm-bg rounded-xl p-4 space-y-3">
      <div className="grid sm:grid-cols-3 gap-3">
        <Campo label="Tipo">
          <select className={inputCls} value={draft.tipo} disabled={!editable} onChange={e => set('tipo', e.target.value)}>
            {TIPOS_CLIENTE.map(x => <option key={x.id} value={x.id}>{x.label}</option>)}
          </select>
        </Campo>
        <Campo label="Nombre o razón social"><span>{t('nombre', 'Obligatorio')}</span></Campo>
        <Campo label="NIF / CIF / NIE">{t('nif')}</Campo>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <Campo label="Dirección">{t('direccion')}</Campo>
        <div className="grid grid-cols-3 gap-3">
          <Campo label="C.P.">{t('cp')}</Campo>
          <Campo label="Localidad">{t('localidad')}</Campo>
          <Campo label="Provincia">{t('provincia')}</Campo>
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-3">
        <Campo label="País">{t('pais')}</Campo>
        <Campo label="Correo">{t('email')}</Campo>
        <Campo label="Teléfono">{t('telefono')}</Campo>
      </div>

      <div className="grid sm:grid-cols-3 gap-3">
        <Campo label="Persona de contacto">{t('contacto')}</Campo>
        <Campo label="Forma de pago habitual">
          <select className={inputCls} value={draft.formaPago} disabled={!editable} onChange={e => set('formaPago', e.target.value)}>
            <option value="">—</option>
            {FORMAS_PAGO.map(f => <option key={f} value={f}>{f}</option>)}
          </select>
        </Campo>
        <Campo label="IBAN (opcional)">{t('iban')}</Campo>
      </div>

      <Campo label="Notas internas" hint="No salen en los documentos.">
        <textarea className={`${inputCls} min-h-[60px]`} value={draft.notas} disabled={!editable} onChange={e => set('notas', e.target.value)} />
      </Campo>

      <div className="flex gap-2 pt-1">
        <BotonGuardar onClick={onGuardar} pending={pending} disabled={!editable || !draft.nombre.trim()} />
        <button type="button" onClick={onCancelar} className="text-sm font-bold text-gray-400 hover:text-pm-navy px-3 py-2">Cancelar</button>
      </div>
    </div>
  )
}

export default function TabClientes({ clientes, pending, correr, editable }: {
  clientes: ClienteFactura[]; pending: boolean; correr: Correr; editable: boolean
}) {
  const [editando, setEditando] = useState<string | null>(null)
  const [creando, setCreando] = useState(false)
  const [draft, setDraft] = useState<Draft>(vacio())
  const [busca, setBusca] = useState('')
  const [verArchivados, setVerArchivados] = useState(false)

  const q = busca.trim().toLowerCase()
  const lista = clientes
    .filter(c => verArchivados || !c.archivado)
    .filter(c => !q || `${c.nombre} ${c.nif} ${c.email} ${c.localidad}`.toLowerCase().includes(q))

  function cerrar() { setCreando(false); setEditando(null) }
  function guardar() {
    correr(async () => {
      const r = await guardarClienteFactura(draft)
      if (r.ok) cerrar()
      return r
    })
  }

  return (
    <Bloque titulo="Clientes" desc="Clientes frecuentes para reutilizar sus datos fiscales al facturar.">
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <input className={`${inputCls} max-w-xs`} placeholder="Buscar por nombre, NIF, correo…" value={busca} onChange={e => setBusca(e.target.value)} />
        <label className="flex items-center gap-2 text-sm text-gray-500">
          <input type="checkbox" checked={verArchivados} onChange={e => setVerArchivados(e.target.checked)} />
          Ver archivados
        </label>
      </div>

      <div className="space-y-3">
        {lista.length === 0 && !creando && (
          <p className="text-sm text-gray-400 py-4 text-center">{q ? 'Ningún cliente coincide.' : 'Todavía no hay clientes.'}</p>
        )}

        {lista.map(c => (
          <div key={c.id} className={`border rounded-xl overflow-hidden ${c.archivado ? 'border-gray-100 bg-gray-50/60' : 'border-gray-100'}`}>
            <div className="flex items-center gap-3 p-3">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-bold text-pm-navy truncate">{c.nombre}</span>
                  <span className="text-xs font-bold text-gray-400 bg-gray-100 rounded-full px-2 py-0.5">{labelTipo(c.tipo)}</span>
                  {c.nif && <span className="text-xs text-gray-400">{c.nif}</span>}
                  {c.archivado && <span className="text-xs font-bold text-gray-400 bg-gray-100 rounded-full px-2 py-0.5">Archivado</span>}
                </div>
                <p className="text-xs text-gray-400 truncate mt-0.5">
                  {[c.localidad, c.email, c.telefono].filter(Boolean).join(' · ') || '—'}
                </p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <BotonMini onClick={() => (editando === c.id ? cerrar() : (setDraft(aDraft(c)), setEditando(c.id), setCreando(false)))} disabled={!editable}>
                  {editando === c.id ? 'Cerrar' : 'Editar'}
                </BotonMini>
                <BotonMini onClick={() => correr(() => archivarClienteFactura(c.id, !c.archivado))} disabled={!editable} titulo={c.archivado ? 'Restaurar' : 'Archivar'}>
                  {c.archivado ? 'Restaurar' : 'Archivar'}
                </BotonMini>
                <BotonMini onClick={() => { if (confirm(`¿Eliminar a ${c.nombre}? Solo si no tiene documentos.`)) correr(() => eliminarClienteFactura(c.id)) }} disabled={!editable} titulo="Eliminar">✕</BotonMini>
              </div>
            </div>
            {editando === c.id && (
              <div className="p-3 pt-0">
                <Formulario draft={draft} setDraft={setDraft} onGuardar={guardar} onCancelar={cerrar} pending={pending} editable={editable} />
              </div>
            )}
          </div>
        ))}

        {creando ? (
          <Formulario draft={draft} setDraft={setDraft} onGuardar={guardar} onCancelar={cerrar} pending={pending} editable={editable} />
        ) : (
          <button type="button" onClick={() => { setDraft(vacio()); setCreando(true); setEditando(null) }} disabled={!editable}
            className="w-full border-2 border-dashed border-gray-200 hover:border-pm-red text-sm font-bold text-gray-400 hover:text-pm-red rounded-xl py-3 disabled:opacity-40 disabled:cursor-not-allowed">
            + Añadir cliente
          </button>
        )}
      </div>
    </Bloque>
  )
}
