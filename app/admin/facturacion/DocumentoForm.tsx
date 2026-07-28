'use client'

// ─────────────────────────────────────────────────────────────────────────────
// Formulario único de factura / proforma. Modo rápido por defecto (concepto +
// base + IVA); «opciones avanzadas» abre cantidad, precio, descuentos, IRPF,
// vencimiento y notas. Los totales se calculan en vivo con lib/facturacion/dinero
// (el servidor los vuelve a calcular al guardar: nunca se confía en el cliente).
// ─────────────────────────────────────────────────────────────────────────────

import { useMemo, useState } from 'react'
import { calcularDocumento, eur, inputACents, inputANumero, centsAInput, type LineaEntrada } from '@/lib/facturacion/dinero'
import { FORMAS_PAGO, TIPOS_CLIENTE, numeroPreview, fechaCorta, TEXTO_PROFORMA, AVISO_PROFORMA } from '@/lib/facturacion/constants'
import type { ClienteFactura, Documento, PerfilFacturacion, SerieFacturacion, TipoDocumento } from '@/lib/facturacion/tipos'
import { guardarBorrador, emitirDocumento, guardarClienteFactura, type DocumentoInput } from './actions'
import { Campo, inputCls, type Correr } from '../50dias50provincias/piezas'

const IVA_OPCIONES = [
  { key: '21', label: 'IVA 21 %', pct: 21, tipo: 'normal' as const },
  { key: '10', label: 'IVA 10 %', pct: 10, tipo: 'normal' as const },
  { key: '4', label: 'IVA 4 %', pct: 4, tipo: 'normal' as const },
  { key: '0', label: 'IVA 0 %', pct: 0, tipo: 'normal' as const },
  { key: 'exento', label: 'Exento', pct: 0, tipo: 'exento' as const },
  { key: 'no_sujeto', label: 'No sujeto', pct: 0, tipo: 'no_sujeto' as const },
]
const ivaDeKey = (k: string) => IVA_OPCIONES.find(o => o.key === k) ?? IVA_OPCIONES[0]
const keyDeIva = (pct: number, tipo: string) => IVA_OPCIONES.find(o => o.pct === pct && o.tipo === tipo)?.key ?? '21'

type Linea = {
  concepto: string; descripcion: string
  cantidad: string; unidad: string; precio: string   // precio = base en modo rápido (cantidad 1)
  descPct: string; descFijo: string; ivaKey: string; irpf: string
}
const lineaVacia = (ivaKey = '21'): Linea => ({ concepto: '', descripcion: '', cantidad: '1', unidad: '', precio: '', descPct: '', descFijo: '', ivaKey, irpf: '' })

function hoyISO() {
  // Cliente: fecha local del navegador en yyyy-mm-dd para <input type=date>.
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const clienteInlineVacio = { tipo: 'empresa', nombre: '', nif: '', direccion: '', cp: '', localidad: '', provincia: '', pais: 'España', email: '', telefono: '', contacto: '' }

export default function DocumentoForm({ tipo, perfiles, series, clientes, doc, correr, pending, onCerrar, puedeEmitir }: {
  tipo: TipoDocumento
  perfiles: PerfilFacturacion[]
  series: SerieFacturacion[]
  clientes: ClienteFactura[]
  doc?: Documento | null
  correr: Correr
  pending: boolean
  onCerrar: () => void
  puedeEmitir: boolean
}) {
  const activos = perfiles.filter(p => p.activo && !p.archivado)
  const predeterminado = activos.find(p => p.predeterminado) ?? activos[0]

  const [docId, setDocId] = useState<string | null>(doc?.id ?? null)
  const [profileId, setProfileId] = useState(doc?.profileId ?? predeterminado?.id ?? '')
  const perfil = perfiles.find(p => p.id === profileId)
  const seriesTipo = series.filter(s => s.profileId === profileId && s.tipo === tipo && s.activa)
  const [serieId, setSerieId] = useState(doc?.serieId ?? seriesTipo[0]?.id ?? '')
  const [fecha, setFecha] = useState(doc?.fecha || hoyISO())
  const [vencimiento, setVencimiento] = useState(doc?.vencimiento ?? '')
  const [referencia, setReferencia] = useState(doc?.referencia ?? '')
  const [observaciones, setObservaciones] = useState(doc?.observaciones ?? '')
  const [notasInternas, setNotasInternas] = useState(doc?.notasInternas ?? '')
  const [formaPago, setFormaPago] = useState(doc?.formaPago ?? perfil?.formaPago ?? '')
  const [avanzado, setAvanzado] = useState(false)

  // Cliente: existente o nuevo.
  const [modoCliente, setModoCliente] = useState<'guardado' | 'nuevo'>(doc?.clientId ? 'guardado' : (doc?.clienteSnapshot ? 'nuevo' : 'guardado'))
  const [clientId, setClientId] = useState(doc?.clientId ?? '')
  const [buscaCliente, setBuscaCliente] = useState('')
  const [inline, setInline] = useState<Record<string, string>>(
    doc?.clienteSnapshot ? { ...clienteInlineVacio, ...(doc.clienteSnapshot as Record<string, string>) } : { ...clienteInlineVacio },
  )
  const [guardarCli, setGuardarCli] = useState(false)

  const [lineas, setLineas] = useState<Linea[]>(
    doc?.lineas?.length
      ? doc.lineas.map(l => ({
          concepto: l.concepto, descripcion: l.descripcion, cantidad: String(l.cantidad || 1), unidad: l.unidad,
          precio: centsAInput(l.precioCents), descPct: l.descuentoPct ? String(l.descuentoPct) : '', descFijo: l.descuentoCents ? centsAInput(l.descuentoCents) : '',
          ivaKey: keyDeIva(l.ivaPct, l.ivaTipo), irpf: l.irpfPct ? String(l.irpfPct) : '',
        }))
      : [lineaVacia(perfil?.irpfPct ? '21' : '21')],
  )

  const editable = doc ? doc.estado === 'borrador' : true

  // ── Cálculo en vivo ──────────────────────────────────────────────────────
  const entradas: LineaEntrada[] = lineas.map(l => {
    const iva = ivaDeKey(l.ivaKey)
    return {
      cantidad: inputANumero(l.cantidad) ?? 1,
      precioCents: inputACents(l.precio) ?? 0,
      descuentoPct: inputANumero(l.descPct) ?? 0,
      descuentoCents: inputACents(l.descFijo) ?? 0,
      ivaPct: iva.pct, ivaTipo: iva.tipo,
      irpfPct: inputANumero(l.irpf) ?? 0,
    }
  })
  const calc = useMemo(() => calcularDocumento(entradas), [JSON.stringify(entradas)])

  const serie = seriesTipo.find(s => s.id === serieId)
  const numeroPrevio = serie ? numeroPreview(serie.prefijo, Number(fecha.slice(0, 4)) || new Date().getFullYear(), serie.ejercicio && serie.ejercicio !== Number(fecha.slice(0, 4)) && serie.reiniciaAnual ? 1 : serie.proximo) : null

  // ── Validación en vivo ───────────────────────────────────────────────────
  const errores: string[] = []
  if (!profileId) errores.push('Selecciona un emisor.')
  if (modoCliente === 'guardado' && !clientId) errores.push('Selecciona un cliente.')
  if (modoCliente === 'nuevo' && !inline.nombre.trim()) errores.push('Escribe el nombre del cliente.')
  if (!fecha) errores.push('La fecha de emisión es obligatoria.')
  if (lineas.every(l => !l.concepto.trim())) errores.push('Añade al menos un concepto.')
  if (calc.totalCents <= 0) errores.push('El total debe ser mayor que 0.')
  if (vencimiento && vencimiento < fecha) errores.push('El vencimiento no puede ser anterior a la emisión.')
  const emitibleSerie = !!serieId

  const setLinea = (i: number, patch: Partial<Linea>) => setLineas(ls => ls.map((l, j) => j === i ? { ...l, ...patch } : l))
  const quitarLinea = (i: number) => setLineas(ls => ls.length > 1 ? ls.filter((_, j) => j !== i) : ls)
  const duplicarLinea = (i: number) => setLineas(ls => [...ls.slice(0, i + 1), { ...ls[i] }, ...ls.slice(i + 1)])
  const moverLinea = (i: number, d: -1 | 1) => setLineas(ls => {
    const j = i + d; if (j < 0 || j >= ls.length) return ls
    const c = [...ls]; [c[i], c[j]] = [c[j], c[i]]; return c
  })

  function construirInput(): DocumentoInput {
    return {
      id: docId ?? undefined, tipo, profileId, serieId: serieId || null,
      clientId: modoCliente === 'guardado' ? clientId : null,
      clienteInline: modoCliente === 'nuevo' ? inline : null,
      fecha, vencimiento: vencimiento || null, referencia, formaPago,
      observaciones, notasInternas, condicionesPago: perfil?.condicionesPago,
      lineas: lineas.filter(l => l.concepto.trim()).map(l => {
        const iva = ivaDeKey(l.ivaKey)
        return {
          concepto: l.concepto, descripcion: l.descripcion,
          cantidad: inputANumero(l.cantidad) ?? 1, unidad: l.unidad,
          precioCents: inputACents(l.precio) ?? 0,
          descuentoPct: inputANumero(l.descPct) ?? 0, descuentoCents: inputACents(l.descFijo) ?? 0,
          ivaPct: iva.pct, ivaTipo: iva.tipo, irpfPct: inputANumero(l.irpf) ?? 0,
        }
      }),
    }
  }

  /** Si el cliente es nuevo y se marcó guardarlo, se crea primero y se usa su id. */
  async function resolverCliente(): Promise<{ input: DocumentoInput } | { error: string }> {
    const base = construirInput()
    if (modoCliente === 'nuevo' && guardarCli) {
      const r = await guardarClienteFactura({
        tipo: inline.tipo, nombre: inline.nombre, nif: inline.nif, direccion: inline.direccion,
        cp: inline.cp, localidad: inline.localidad, provincia: inline.provincia, pais: inline.pais,
        email: inline.email, telefono: inline.telefono, contacto: inline.contacto,
      })
      if (!r.ok || !r.id) return { error: r.error || 'No se pudo guardar el cliente' }
      return { input: { ...base, clientId: r.id, clienteInline: null } }
    }
    return { input: base }
  }

  function guardar(despuesEmitir = false) {
    correr(async () => {
      const rc = await resolverCliente()
      if ('error' in rc) return { ok: false, error: rc.error }
      const r = await guardarBorrador(rc.input)
      if (!r.ok || !r.id) return r
      setDocId(r.id)
      if (!despuesEmitir) return { ok: true }
      const e = await emitirDocumento(r.id)
      if (e.ok) onCerrar()
      return e
    })
  }

  const titulo = tipo === 'proforma' ? 'Proforma' : 'Factura'

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="font-black text-pm-navy text-lg">{doc ? `Editar ${titulo.toLowerCase()}` : `Nueva ${titulo.toLowerCase()}`}</h2>
        <button type="button" onClick={onCerrar} className="text-sm font-bold text-gray-400 hover:text-pm-navy">Cerrar ✕</button>
      </div>

      {tipo === 'proforma' && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800">
          <strong>{TEXTO_PROFORMA}.</strong> {AVISO_PROFORMA} Tiene numeración propia y no cuenta como ingreso hasta convertirla en factura.
        </div>
      )}

      {!editable && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-800">
          Documento <strong>{doc?.numero || 'emitido'}</strong>: ya no se puede editar. Duplícalo o regístralo/anúlalo desde el listado.
        </div>
      )}

      {/* ── Datos del documento + emisor ── */}
      <section className="grid lg:grid-cols-2 gap-5">
        <div className="space-y-3">
          <h3 className="text-xs font-black text-pm-red uppercase tracking-widest">Datos del documento</h3>
          <div className="grid grid-cols-2 gap-3">
            <Campo label="Fecha de emisión">
              <input type="date" className={inputCls} value={fecha} disabled={!editable} onChange={e => setFecha(e.target.value)} />
            </Campo>
            <Campo label="Número">
              <div className="text-sm font-bold text-pm-navy border border-gray-200 rounded-lg px-2.5 py-2 bg-gray-50">
                {doc?.numero || (numeroPrevio ? <span className="text-gray-400">Al emitir: {numeroPrevio}</span> : <span className="text-gray-300">Elige serie</span>)}
              </div>
            </Campo>
          </div>
          <Campo label="Serie" hint="Facturas y proformas tienen series y numeración separadas.">
            <select className={inputCls} value={serieId} disabled={!editable} onChange={e => setSerieId(e.target.value)}>
              <option value="">— elige serie —</option>
              {seriesTipo.map(s => <option key={s.id} value={s.id}>{s.prefijo}</option>)}
            </select>
            {seriesTipo.length === 0 && <span className="block text-xs text-amber-600 mt-1">Este emisor no tiene series de {titulo.toLowerCase()}. Créala en Perfiles.</span>}
          </Campo>
        </div>

        <div className="space-y-3">
          <h3 className="text-xs font-black text-pm-red uppercase tracking-widest">Emisor</h3>
          <select className={inputCls} value={profileId} disabled={!editable} onChange={e => { setProfileId(e.target.value); const p = perfiles.find(x => x.id === e.target.value); const s = series.find(x => x.profileId === e.target.value && x.tipo === tipo && x.activa); setSerieId(s?.id ?? ''); if (p) setFormaPago(p.formaPago) }}>
            {activos.length === 0 && <option value="">— crea un perfil emisor —</option>}
            {activos.map(p => <option key={p.id} value={p.id}>{p.nombreComercial}{p.predeterminado ? ' · predeterminado' : ''}</option>)}
          </select>
          {perfil && (
            <div className="text-xs text-gray-500 bg-pm-bg rounded-lg p-3 leading-relaxed">
              <div className="font-bold text-pm-navy">{perfil.razonSocial || perfil.nombreComercial}</div>
              {[perfil.nif && `NIF ${perfil.nif}`, perfil.direccion, [perfil.cp, perfil.localidad].filter(Boolean).join(' '), perfil.provincia].filter(Boolean).map((x, i) => <div key={i}>{x}</div>)}
              {perfil.iban && <div className="mt-1">IBAN {perfil.iban}</div>}
            </div>
          )}
        </div>
      </section>

      {/* ── Cliente ── */}
      <section className="space-y-3">
        <h3 className="text-xs font-black text-pm-red uppercase tracking-widest">Cliente</h3>
        <div className="flex gap-2">
          {(['guardado', 'nuevo'] as const).map(m => (
            <button key={m} type="button" disabled={!editable} onClick={() => setModoCliente(m)}
              className={`text-sm font-bold px-3 py-1.5 rounded-lg border ${modoCliente === m ? 'bg-pm-navy text-white border-pm-navy' : 'border-gray-200 text-gray-500'}`}>
              {m === 'guardado' ? 'Cliente guardado' : 'Nuevo cliente'}
            </button>
          ))}
        </div>

        {modoCliente === 'guardado' ? (
          <div className="space-y-2">
            <input className={inputCls} placeholder="Buscar por nombre, NIF, correo…" value={buscaCliente} disabled={!editable} onChange={e => setBuscaCliente(e.target.value)} />
            <select className={inputCls} value={clientId} disabled={!editable} onChange={e => setClientId(e.target.value)}>
              <option value="">— elige cliente —</option>
              {clientes.filter(c => !c.archivado).filter(c => { const q = buscaCliente.trim().toLowerCase(); return !q || `${c.nombre} ${c.nif} ${c.email} ${c.telefono}`.toLowerCase().includes(q) })
                .map(c => <option key={c.id} value={c.id}>{c.nombre}{c.nif ? ` · ${c.nif}` : ''}</option>)}
            </select>
          </div>
        ) : (
          <div className="space-y-3 bg-pm-bg rounded-xl p-3">
            <div className="grid sm:grid-cols-3 gap-3">
              <Campo label="Tipo">
                <select className={inputCls} value={inline.tipo} disabled={!editable} onChange={e => setInline({ ...inline, tipo: e.target.value })}>
                  {TIPOS_CLIENTE.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                </select>
              </Campo>
              <Campo label="Nombre o razón social"><input className={inputCls} value={inline.nombre} disabled={!editable} onChange={e => setInline({ ...inline, nombre: e.target.value })} /></Campo>
              <Campo label="NIF / CIF / NIE"><input className={inputCls} value={inline.nif} disabled={!editable} onChange={e => setInline({ ...inline, nif: e.target.value })} /></Campo>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <Campo label="Dirección"><input className={inputCls} value={inline.direccion} disabled={!editable} onChange={e => setInline({ ...inline, direccion: e.target.value })} /></Campo>
              <div className="grid grid-cols-3 gap-3">
                <Campo label="C.P."><input className={inputCls} value={inline.cp} disabled={!editable} onChange={e => setInline({ ...inline, cp: e.target.value })} /></Campo>
                <Campo label="Localidad"><input className={inputCls} value={inline.localidad} disabled={!editable} onChange={e => setInline({ ...inline, localidad: e.target.value })} /></Campo>
                <Campo label="Provincia"><input className={inputCls} value={inline.provincia} disabled={!editable} onChange={e => setInline({ ...inline, provincia: e.target.value })} /></Campo>
              </div>
            </div>
            <div className="grid sm:grid-cols-3 gap-3">
              <Campo label="Correo"><input className={inputCls} value={inline.email} disabled={!editable} onChange={e => setInline({ ...inline, email: e.target.value })} /></Campo>
              <Campo label="Teléfono"><input className={inputCls} value={inline.telefono} disabled={!editable} onChange={e => setInline({ ...inline, telefono: e.target.value })} /></Campo>
              <Campo label="Contacto"><input className={inputCls} value={inline.contacto} disabled={!editable} onChange={e => setInline({ ...inline, contacto: e.target.value })} /></Campo>
            </div>
            <label className="flex items-center gap-2 text-sm text-pm-navy">
              <input type="checkbox" checked={guardarCli} disabled={!editable} onChange={e => setGuardarCli(e.target.checked)} />
              Guardar este cliente para futuras facturas
            </label>
          </div>
        )}
      </section>

      {/* ── Conceptos ── */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black text-pm-red uppercase tracking-widest">Conceptos</h3>
          <label className="flex items-center gap-2 text-xs font-bold text-gray-500">
            <input type="checkbox" checked={avanzado} onChange={e => setAvanzado(e.target.checked)} /> Opciones avanzadas
          </label>
        </div>

        <div className="space-y-3">
          {lineas.map((l, i) => (
            <div key={i} className="border border-gray-100 rounded-xl p-3 space-y-2">
              <div className="flex gap-2">
                <input className={`${inputCls} flex-1`} placeholder="Concepto (obligatorio)" value={l.concepto} disabled={!editable} onChange={e => setLinea(i, { concepto: e.target.value })} />
                <div className="flex items-center gap-1">
                  <button type="button" title="Subir" disabled={!editable || i === 0} onClick={() => moverLinea(i, -1)} className="text-xs px-2 py-1.5 border border-gray-200 rounded-lg disabled:opacity-30">↑</button>
                  <button type="button" title="Bajar" disabled={!editable || i === lineas.length - 1} onClick={() => moverLinea(i, 1)} className="text-xs px-2 py-1.5 border border-gray-200 rounded-lg disabled:opacity-30">↓</button>
                  <button type="button" title="Duplicar" disabled={!editable} onClick={() => duplicarLinea(i)} className="text-xs px-2 py-1.5 border border-gray-200 rounded-lg disabled:opacity-30">⧉</button>
                  <button type="button" title="Eliminar" disabled={!editable || lineas.length === 1} onClick={() => quitarLinea(i)} className="text-xs px-2 py-1.5 border border-gray-200 rounded-lg disabled:opacity-30">✕</button>
                </div>
              </div>
              <textarea className={`${inputCls} min-h-[42px]`} placeholder="Descripción (opcional)" value={l.descripcion} disabled={!editable} onChange={e => setLinea(i, { descripcion: e.target.value })} />

              <div className="grid gap-2" style={{ gridTemplateColumns: avanzado ? '1fr 1fr 1fr 1fr 1fr' : '1fr 1fr auto' }}>
                {avanzado && (
                  <>
                    <label className="block"><span className="block text-[11px] font-bold text-gray-400">Cantidad</span>
                      <input className={inputCls} value={l.cantidad} disabled={!editable} onChange={e => setLinea(i, { cantidad: e.target.value })} /></label>
                    <label className="block"><span className="block text-[11px] font-bold text-gray-400">Precio ud. (€)</span>
                      <input className={inputCls} value={l.precio} disabled={!editable} placeholder="0,00" onChange={e => setLinea(i, { precio: e.target.value })} /></label>
                    <label className="block"><span className="block text-[11px] font-bold text-gray-400">Dto. %</span>
                      <input className={inputCls} value={l.descPct} disabled={!editable} onChange={e => setLinea(i, { descPct: e.target.value })} /></label>
                    <label className="block"><span className="block text-[11px] font-bold text-gray-400">IRPF %</span>
                      <input className={inputCls} value={l.irpf} disabled={!editable} onChange={e => setLinea(i, { irpf: e.target.value })} /></label>
                  </>
                )}
                {!avanzado && (
                  <label className="block"><span className="block text-[11px] font-bold text-gray-400">Base imponible (€)</span>
                    <input className={inputCls} value={l.precio} disabled={!editable} placeholder="0,00" onChange={e => setLinea(i, { precio: e.target.value, cantidad: '1' })} /></label>
                )}
                <label className="block"><span className="block text-[11px] font-bold text-gray-400">IVA</span>
                  <select className={inputCls} value={l.ivaKey} disabled={!editable} onChange={e => setLinea(i, { ivaKey: e.target.value })}>
                    {IVA_OPCIONES.map(o => <option key={o.key} value={o.key}>{o.label}</option>)}
                  </select></label>
                <div className="flex flex-col justify-end">
                  <span className="block text-[11px] font-bold text-gray-400">Total línea</span>
                  <span className="text-sm font-black text-pm-navy py-2">{eur(calc.lineas[i]?.totalCents ?? 0)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <button type="button" disabled={!editable} onClick={() => setLineas(ls => [...ls, lineaVacia()])}
          className="w-full border-2 border-dashed border-gray-200 hover:border-pm-red text-sm font-bold text-gray-400 hover:text-pm-red rounded-xl py-2.5 disabled:opacity-40">
          + Añadir concepto
        </button>
      </section>

      {/* ── Totales ── */}
      <section className="bg-pm-bg rounded-xl p-4">
        <div className="max-w-xs ml-auto space-y-1 text-sm">
          <div className="flex justify-between"><span className="text-gray-500">Base imponible</span><span className="font-bold text-pm-navy">{eur(calc.baseCents)}</span></div>
          {calc.gruposIva.map(g => <div key={`iva${g.pct}`} className="flex justify-between"><span className="text-gray-500">IVA {g.pct} %</span><span className="text-pm-navy">{eur(g.cuotaCents)}</span></div>)}
          {calc.gruposIrpf.map(g => <div key={`irpf${g.pct}`} className="flex justify-between"><span className="text-gray-500">Retención IRPF {g.pct} %</span><span className="text-pm-navy">−{eur(g.cuotaCents)}</span></div>)}
          <div className="flex justify-between border-t border-gray-200 pt-1.5 mt-1.5"><span className="font-black text-pm-navy">TOTAL</span><span className="font-black text-pm-navy text-lg">{eur(calc.totalCents)}</span></div>
        </div>
      </section>

      {/* ── Avanzado: documento ── */}
      {avanzado && (
        <section className="grid sm:grid-cols-2 gap-3">
          <Campo label="Vencimiento (opcional)"><input type="date" className={inputCls} value={vencimiento} disabled={!editable} onChange={e => setVencimiento(e.target.value)} /></Campo>
          <Campo label="Referencia interna (opcional)"><input className={inputCls} value={referencia} disabled={!editable} onChange={e => setReferencia(e.target.value)} /></Campo>
          <Campo label="Forma de pago">
            <select className={inputCls} value={formaPago} disabled={!editable} onChange={e => setFormaPago(e.target.value)}>
              <option value="">—</option>{FORMAS_PAGO.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </Campo>
          <Campo label="Observaciones (salen en el PDF)"><textarea className={`${inputCls} min-h-[42px]`} value={observaciones} disabled={!editable} onChange={e => setObservaciones(e.target.value)} /></Campo>
          <Campo label="Notas internas (no salen en el PDF)"><textarea className={`${inputCls} min-h-[42px]`} value={notasInternas} disabled={!editable} onChange={e => setNotasInternas(e.target.value)} /></Campo>
        </section>
      )}

      {/* ── Avisos + acciones ── */}
      {editable && errores.length > 0 && (
        <ul className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl p-3 list-disc pl-6 space-y-0.5">
          {errores.map((e, i) => <li key={i}>{e}</li>)}
        </ul>
      )}

      {editable && (
        <div className="flex flex-wrap gap-2 pt-1 border-t border-gray-100">
          <button type="button" onClick={() => guardar(false)} disabled={pending}
            className="bg-white border border-gray-200 hover:border-pm-navy text-pm-navy font-bold px-4 py-2 rounded-xl text-sm disabled:opacity-40">
            {pending ? 'Guardando…' : 'Guardar borrador'}
          </button>
          {puedeEmitir && (
            <button type="button" onClick={() => guardar(true)} disabled={pending || errores.length > 0 || !emitibleSerie}
              className="bg-pm-red hover:bg-pm-red-dark text-white font-bold px-5 py-2 rounded-xl text-sm disabled:opacity-40">
              {tipo === 'proforma' ? 'Emitir proforma' : 'Emitir factura'}
            </button>
          )}
          <button type="button" onClick={onCerrar} className="text-sm font-bold text-gray-400 hover:text-pm-navy px-3 py-2 ml-auto">Cancelar</button>
        </div>
      )}
      <p className="text-[11px] text-gray-400">Fecha: {fechaCorta(fecha)}. El número definitivo se asigna al emitir; el borrador no consume numeración.</p>
    </div>
  )
}
