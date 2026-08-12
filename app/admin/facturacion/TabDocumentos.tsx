'use client'

// ─────────────────────────────────────────────────────────────────────────────
// Listado de facturas o proformas + acceso al formulario de creación/edición.
// El mismo componente sirve para los dos tipos (prop `tipo`).
// ─────────────────────────────────────────────────────────────────────────────

import { useMemo, useState } from 'react'
import { eur } from '@/lib/facturacion/dinero'
import { estadoMeta, estadosDe, fechaCorta, ESTADOS_EMITIDOS } from '@/lib/facturacion/constants'
import type { ClienteFactura, Documento, PerfilFacturacion, SerieFacturacion, TipoDocumento } from '@/lib/facturacion/tipos'
import { cambiarEstadoDocumento, convertirEnFactura, duplicarDocumento, eliminarDocumento } from './actions'
import DocumentoForm from './DocumentoForm'
import type { Correr } from '../50dias50provincias/piezas'

type CampoOrden = 'numero' | 'cliente' | 'fecha' | 'total' | 'estado'

export default function TabDocumentos({ tipo, documentos, perfiles, series, clientes, correr, pending, editable, puedeEmitir, puedeAnular }: {
  tipo: TipoDocumento
  documentos: Documento[]
  perfiles: PerfilFacturacion[]
  series: SerieFacturacion[]
  clientes: ClienteFactura[]
  correr: Correr
  pending: boolean
  editable: boolean
  puedeEmitir: boolean
  puedeAnular: boolean
}) {
  const [modo, setModo] = useState<{ tipo: 'lista' } | { tipo: 'form'; doc: Documento | null }>({ tipo: 'lista' })
  const [busca, setBusca] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('')
  const [filtroEmisor, setFiltroEmisor] = useState('')
  const [orden, setOrden] = useState<{ campo: CampoOrden; dir: 'asc' | 'desc' }>({ campo: 'fecha', dir: 'desc' })

  const nombreCliente = (d: Documento) =>
    (d.clienteSnapshot?.nombre as string) || clientes.find(c => c.id === d.clientId)?.nombre || '—'

  const nombreEmisor = (d: Documento) =>
    (d.emisorSnapshot?.nombre_comercial as string) || perfiles.find(p => p.id === d.profileId)?.nombreComercial || '—'

  // Número: por correlativo real cuando existe; si es manual ("18/2026"), por su
  // primer entero. Borradores (sin número) → -1, van al fondo en ascendente.
  const claveNumero = (d: Documento) =>
    d.numeroInt != null ? d.numeroInt : Number((d.numero.match(/\d+/) ?? ['-1'])[0])

  const clicOrden = (campo: CampoOrden) =>
    setOrden(o => o.campo === campo
      ? { campo, dir: o.dir === 'asc' ? 'desc' : 'asc' }
      : { campo, dir: campo === 'fecha' || campo === 'total' ? 'desc' : 'asc' })

  const lista = useMemo(() => {
    const q = busca.trim().toLowerCase()
    const filtrada = documentos
      .filter(d => d.tipo === tipo)
      .filter(d => !filtroEmisor || d.profileId === filtroEmisor)
      .filter(d => !filtroEstado || d.estado === filtroEstado)
      .filter(d => !q || `${d.numero} ${nombreCliente(d)}`.toLowerCase().includes(q))
    const dir = orden.dir === 'asc' ? 1 : -1
    return filtrada.sort((a, b) => {
      switch (orden.campo) {
        case 'numero': return ((claveNumero(a) - claveNumero(b)) || a.fecha.localeCompare(b.fecha)) * dir
        case 'cliente': return nombreCliente(a).localeCompare(nombreCliente(b), 'es') * dir
        case 'total': return (a.totalCents - b.totalCents) * dir
        case 'estado': return estadoMeta(tipo, a.estado).label.localeCompare(estadoMeta(tipo, b.estado).label, 'es') * dir
        default: return a.fecha.localeCompare(b.fecha) * dir // fecha
      }
    })
  }, [documentos, tipo, busca, filtroEstado, filtroEmisor, orden]) // eslint-disable-line react-hooks/exhaustive-deps

  const etiqueta = tipo === 'proforma' ? 'proforma' : 'factura'

  if (modo.tipo === 'form') {
    return (
      <DocumentoForm
        tipo={tipo} perfiles={perfiles} series={series} clientes={clientes} doc={modo.doc}
        correr={correr} pending={pending} puedeEmitir={puedeEmitir}
        onCerrar={() => setModo({ tipo: 'lista' })}
      />
    )
  }

  const sinPerfil = perfiles.filter(p => p.activo && !p.archivado).length === 0

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <input className="border border-gray-200 rounded-lg px-2.5 py-2 text-sm flex-1 min-w-[180px]" placeholder="Buscar por número o cliente…" value={busca} onChange={e => setBusca(e.target.value)} />
        <select className="border border-gray-200 rounded-lg px-2.5 py-2 text-sm" value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)}>
          <option value="">Todos los estados</option>
          {(tipo === 'proforma'
            ? ['borrador', 'enviada', 'aceptada', 'rechazada', 'caducada', 'convertida']
            : ['borrador', 'emitida', 'enviada', 'parcial', 'pagada', 'vencida', 'anulada']
          ).map(s => <option key={s} value={s}>{estadoMeta(tipo, s).label}</option>)}
        </select>
        {perfiles.length > 1 && (
          <select className="border border-gray-200 rounded-lg px-2.5 py-2 text-sm" value={filtroEmisor} onChange={e => setFiltroEmisor(e.target.value)}>
            <option value="">Todos los emisores</option>
            {perfiles.map(p => <option key={p.id} value={p.id}>{p.nombreComercial}</option>)}
          </select>
        )}
        <button type="button" disabled={!editable || sinPerfil} onClick={() => setModo({ tipo: 'form', doc: null })}
          className="bg-pm-red hover:bg-pm-red-dark text-white font-bold px-4 py-2 rounded-xl text-sm disabled:opacity-40">
          + Nueva {etiqueta}
        </button>
      </div>
      {sinPerfil && <p className="text-xs text-amber-600">Crea antes un perfil emisor con su serie en la pestaña «Perfiles de facturación».</p>}

      {lista.length === 0 ? (
        <p className="text-sm text-gray-400 py-8 text-center">No hay {etiqueta}s todavía.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[640px]">
            <thead>
              <tr className="text-left text-xs font-bold text-gray-400 uppercase tracking-wide border-b border-gray-100">
                {([['numero', 'Número', ''], ['cliente', 'Cliente', ''], ['fecha', 'Fecha', ''], ['total', 'Total', 'text-right'], ['estado', 'Estado', '']] as [CampoOrden, string, string][]).map(([campo, label, alin]) => (
                  <th key={campo} className={`py-2 pr-2 ${alin}`}>
                    <button type="button" onClick={() => clicOrden(campo)}
                      className={`uppercase tracking-wide hover:text-pm-navy ${orden.campo === campo ? 'text-pm-navy' : ''}`}>
                      {label}{orden.campo === campo ? (orden.dir === 'asc' ? ' ▲' : ' ▼') : ''}
                    </button>
                  </th>
                ))}
                <th className="py-2"></th>
              </tr>
            </thead>
            <tbody>
              {lista.map(d => {
                const meta = estadoMeta(tipo, d.estado)
                const esBorrador = d.estado === 'borrador'
                const emitido = ESTADOS_EMITIDOS.includes(d.estado)
                return (
                  <tr key={d.id} className="border-b border-gray-50 last:border-0 align-middle">
                    <td className="py-2 pr-2 whitespace-nowrap">
                      <div className="font-bold text-pm-navy">{d.numero || <span className="text-gray-400 italic">Borrador</span>}</div>
                      {perfiles.length > 1 && <div className="text-[11px] text-gray-400 font-normal">{nombreEmisor(d)}</div>}
                    </td>
                    <td className="py-2 pr-2 text-gray-600">{nombreCliente(d)}</td>
                    <td className="py-2 pr-2 text-gray-500 whitespace-nowrap">{fechaCorta(d.fecha)}</td>
                    <td className="py-2 pr-2 text-right font-bold text-pm-navy whitespace-nowrap">{eur(d.totalCents)}</td>
                    <td className="py-2 pr-2">
                      {emitido && editable ? (
                        // Cambio rápido de estado (pagada, anulada, vencida…). Un borrador
                        // no aparece aquí: se edita desde el formulario.
                        <select
                          value={d.estado}
                          onChange={ev => correr(() => cambiarEstadoDocumento(d.id, ev.target.value))}
                          className={`text-xs font-bold rounded-full border-0 pl-2 pr-6 py-1 cursor-pointer focus:ring-2 focus:ring-pm-red/40 ${meta.badge}`}
                          aria-label={`Cambiar estado de ${d.numero || 'documento'}`}
                        >
                          {estadosDe(tipo).filter(e => e.id !== 'borrador').map(e => (
                            <option key={e.id} value={e.id}>{e.label}</option>
                          ))}
                        </select>
                      ) : (
                        <span className={`inline-block text-xs font-bold px-2 py-0.5 rounded-full ${meta.badge}`}>{meta.label}</span>
                      )}
                    </td>
                    <td className="py-2">
                      <div className="flex items-center gap-1.5 justify-end flex-wrap">
                        <button type="button" onClick={() => setModo({ tipo: 'form', doc: d })} className="text-xs font-bold text-pm-navy border border-gray-200 rounded-lg px-2.5 py-1.5 hover:border-pm-red">
                          {(esBorrador && editable) || (emitido && puedeEmitir) ? 'Editar' : 'Ver'}
                        </button>
                        <a href={`/admin/facturacion/${d.id}/pdf`} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-pm-navy border border-gray-200 rounded-lg px-2.5 py-1.5 hover:border-pm-red">PDF</a>
                        <button type="button" disabled={!editable} onClick={() => correr(() => duplicarDocumento(d.id))} className="text-xs font-bold text-pm-navy border border-gray-200 rounded-lg px-2.5 py-1.5 hover:border-pm-red disabled:opacity-30">Duplicar</button>
                        {tipo === 'proforma' && emitido && !d.convertidaDocumentoId && (
                          <button type="button" disabled={!editable} onClick={() => correr(() => convertirEnFactura(d.id))} className="text-xs font-bold text-pm-red border border-pm-red/30 rounded-lg px-2.5 py-1.5 hover:bg-pm-red/5 disabled:opacity-30">Convertir en factura</button>
                        )}
                        {esBorrador ? (
                          <button type="button" disabled={!editable} onClick={() => { if (confirm('¿Borrar este borrador?')) correr(() => eliminarDocumento(d.id)) }} className="text-xs font-bold text-gray-400 border border-gray-200 rounded-lg px-2.5 py-1.5 hover:border-red-400 hover:text-red-500 disabled:opacity-30" title="Eliminar borrador">✕</button>
                        ) : puedeAnular && (
                          <button type="button" onClick={() => { if (confirm(`Eliminar ${etiqueta} ${d.numero || ''} de forma DEFINITIVA.\n\nRompe la numeración y deja un hueco; fiscalmente suele ser mejor anularla. No se puede deshacer.\n\n¿Continuar?`)) correr(() => eliminarDocumento(d.id)) }} className="text-xs font-bold text-gray-400 border border-gray-200 rounded-lg px-2.5 py-1.5 hover:border-red-400 hover:text-red-500" title={`Eliminar ${etiqueta} definitivamente`}>Eliminar</button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
