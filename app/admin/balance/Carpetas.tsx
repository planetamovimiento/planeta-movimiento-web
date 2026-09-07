'use client'

import { useMemo, useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { eur, METODOS_PAGO } from '@/lib/balance/constants'
import {
  ESTADOS_PAGO_DOC, badgeEstadoDoc, labelEstadoDoc, badgeEstadoPagoDoc,
  type Carpeta, type Factura, type Ambito, type TipoDoc,
} from '@/lib/balance/documentos'
import {
  subirFactura, guardarFactura, confirmarFactura, anularFactura,
  estadoFactura, borrarFactura, urlFactura, crearCarpeta, editarCarpeta, borrarCarpeta,
} from './documentos-actions'

// ─────────────────────────────────────────────────────────────────────────────
// Carpetas del Balance: las categorías se recorren como carpetas de documentos.
// Dentro de cada una se suben facturas o justificantes, se revisan y, al
// confirmarlas, entran en el balance como gasto o ingreso.
// ─────────────────────────────────────────────────────────────────────────────

type Props = {
  carpetas: Carpeta[]
  facturas: Factura[]
  ambito: Ambito
  puedeEditar: boolean
  puedeGestionar: boolean
  migrado: boolean
}

type Resultado = { ok: boolean; error?: string }

const fechaCorta = (iso: string) => (iso ? new Date(iso + (iso.length === 10 ? 'T12:00:00' : '')).toLocaleDateString('es-ES') : '—')
const kb = (n: number) => (n > 1024 * 1024 ? `${(n / 1024 / 1024).toFixed(1)} MB` : `${Math.round(n / 1024)} KB`)

export default function Carpetas({ carpetas, facturas, ambito, puedeEditar, puedeGestionar, migrado }: Props) {
  const router = useRouter()
  const [tipo, setTipo] = useState<TipoDoc>('gasto')
  const [abierta, setAbierta] = useState<string | null>(null)   // id de la carpeta abierta
  const [detalle, setDetalle] = useState<string | null>(null)   // id de la factura abierta
  const [nueva, setNueva] = useState(false)
  const [error, setError] = useState('')
  const [pending, start] = useTransition()

  const correr = (fn: () => Promise<Resultado>) => {
    setError('')
    start(async () => {
      const r = await fn()
      if (!r.ok) setError(r.error || 'No se pudo completar')
      else router.refresh()
    })
  }

  const raiz = useMemo(
    () => carpetas.filter(c => c.ambito === ambito && c.tipo === tipo && !c.parentId && c.activa),
    [carpetas, ambito, tipo],
  )
  const hijasDe = (id: string) => carpetas.filter(c => c.parentId === id && c.activa)

  // Facturas de una carpeta: por enlace directo o por nombre de categoría.
  const docsDe = (c: Carpeta) => facturas.filter(f =>
    f.ambito === ambito && f.tipo === tipo &&
    (f.categoriaId === c.id || (!f.categoriaId && f.categoria?.toLowerCase() === c.nombre.toLowerCase())))

  const totalDe = (c: Carpeta) => {
    const propias = [c, ...hijasDe(c.id)].flatMap(docsDe)
    const confirmadas = propias.filter(f => f.estadoDoc === 'confirmada')
    return {
      docs: propias.length,
      confirmadas: confirmadas.length,
      revision: propias.filter(f => f.estadoDoc === 'revision' || f.estadoDoc === 'duplicada').length,
      importe: confirmadas.reduce((n, f) => n + (f.total ?? 0), 0),
    }
  }

  const carpetaAbierta = carpetas.find(c => c.id === abierta) || null
  const facturaAbierta = facturas.find(f => f.id === detalle) || null
  const sinClasificar = facturas.filter(f => f.ambito === ambito && f.tipo === tipo && !f.categoria)
  const porRevisar = facturas.filter(f => f.ambito === ambito && (f.estadoDoc === 'revision' || f.estadoDoc === 'duplicada'))

  if (!migrado) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-sm text-amber-800">
        <div className="font-black mb-1">⚙️ Falta una migración</div>
        Ejecuta <code className="bg-amber-100 px-1.5 py-0.5 rounded">supabase/migration_balance_documentos.sql</code> en Supabase
        y crea el bucket privado <code className="bg-amber-100 px-1.5 py-0.5 rounded">facturas</code> para activar las carpetas de documentos.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Gasto / Ingreso + nueva carpeta */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex bg-pm-bg rounded-xl p-1">
          {([['gasto', '📉 Gastos'], ['ingreso', '📈 Ingresos']] as const).map(([id, txt]) => (
            <button key={id} onClick={() => { setTipo(id); setAbierta(null); setDetalle(null) }}
              className={`text-sm font-bold px-4 py-2 rounded-lg transition-colors ${tipo === id ? 'bg-white text-pm-navy shadow-sm' : 'text-gray-500 hover:text-pm-navy'}`}>
              {txt}
            </button>
          ))}
        </div>
        <div className="flex-1" />
        {porRevisar.length > 0 && (
          <span className="text-xs font-bold bg-amber-100 text-amber-700 rounded-full px-3 py-1.5">
            {porRevisar.length} factura(s) por revisar
          </span>
        )}
        {puedeGestionar && (
          <button onClick={() => setNueva(true)} className="border border-gray-200 hover:border-pm-navy text-pm-navy font-bold text-sm px-4 py-2 rounded-xl">
            + Nueva carpeta
          </button>
        )}
      </div>

      {error && <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">{error}</div>}

      {/* ── Vista de carpetas ── */}
      {!carpetaAbierta ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {raiz.map(c => {
              const t = totalDe(c)
              const subs = hijasDe(c.id)
              return (
                <div key={c.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:border-pm-red/40 transition-colors p-4">
                  <button onClick={() => setAbierta(c.id)} className="w-full text-left">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{c.icono || '📁'}</span>
                      <div className="min-w-0 flex-1">
                        <div className="font-black text-pm-navy truncate">{c.nombre}</div>
                        <div className="text-xs text-gray-400 truncate">
                          {subs.length ? `${subs.length} subcarpeta(s) · ` : ''}{t.docs} documento(s)
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 flex items-end justify-between gap-2">
                      <div>
                        <div className="text-lg font-black text-pm-navy">{eur(t.importe)}</div>
                        <div className="text-[11px] text-gray-400">contabilizado</div>
                      </div>
                      {t.revision > 0 && (
                        <span className="text-[11px] font-bold bg-amber-100 text-amber-700 rounded-full px-2 py-0.5">{t.revision} por revisar</span>
                      )}
                    </div>
                  </button>
                  {puedeGestionar && (
                    <div className="flex gap-3 mt-3 pt-2 border-t border-gray-50">
                      <BotonesCarpeta carpeta={c} pending={pending} correr={correr} />
                    </div>
                  )}
                </div>
              )
            })}
            {raiz.length === 0 && (
              <p className="text-sm text-gray-400 col-span-full py-8 text-center">
                No hay carpetas de {tipo === 'gasto' ? 'gasto' : 'ingreso'} en esta entidad todavía.
              </p>
            )}
          </div>

          {sinClasificar.length > 0 && (
            <div className="bg-white rounded-2xl border border-amber-200 shadow-sm p-4">
              <div className="font-black text-pm-navy mb-2">📥 Sin categoría ({sinClasificar.length})</div>
              <ListaFacturas facturas={sinClasificar} onAbrir={setDetalle} />
            </div>
          )}
        </>
      ) : (
        /* ── Dentro de una carpeta ── */
        <div className="space-y-4">
          <button onClick={() => { setAbierta(null); setDetalle(null) }} className="text-sm text-gray-500 hover:text-pm-red">← Todas las carpetas</button>

          <ResumenCarpeta carpeta={carpetaAbierta} docs={[carpetaAbierta, ...hijasDe(carpetaAbierta.id)].flatMap(docsDe)} />

          {puedeGestionar && (
            <div className="flex flex-wrap gap-3 items-center">
              <BotonesCarpeta carpeta={carpetaAbierta} pending={pending}
                correr={correr} onBorrada={() => setAbierta(carpetaAbierta.parentId)} />
              <button onClick={() => setNueva(true)} className="text-xs font-bold text-pm-navy hover:underline">+ Nueva subcarpeta</button>
            </div>
          )}

          {hijasDe(carpetaAbierta.id).length > 0 && (
            <div className="flex flex-wrap gap-2">
              {hijasDe(carpetaAbierta.id).map(sub => (
                <button key={sub.id} onClick={() => setAbierta(sub.id)}
                  className="bg-white border border-gray-200 hover:border-pm-red/40 rounded-xl px-3 py-2 text-sm font-semibold text-pm-navy">
                  📂 {sub.nombre} <span className="text-gray-400 font-normal">({docsDe(sub).length})</span>
                </button>
              ))}
            </div>
          )}

          {puedeEditar && (
            <ZonaSubida carpeta={carpetaAbierta} ambito={ambito} tipo={tipo}
              onSubido={(id, dup) => { setDetalle(id); if (dup) setError('Ojo: ese archivo ya estaba subido. Revísalo antes de confirmarlo.'); router.refresh() }}
              onError={setError} />
          )}

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <div className="font-black text-pm-navy mb-2">Documentos de {carpetaAbierta.nombre}</div>
            <ListaFacturas facturas={docsDe(carpetaAbierta)} onAbrir={setDetalle} />
          </div>
        </div>
      )}

      {/* Ficha de la factura */}
      {facturaAbierta && (
        <FichaFactura factura={facturaAbierta} carpetas={carpetas} puedeEditar={puedeEditar} puedeGestionar={puedeGestionar}
          pending={pending} correr={correr} onClose={() => setDetalle(null)} />
      )}

      {/* Nueva carpeta */}
      {nueva && (
        <ModalCarpeta ambito={ambito} tipo={tipo} carpetasRaiz={raiz} pending={pending}
          padrePorDefecto={carpetaAbierta && !carpetaAbierta.parentId ? carpetaAbierta.id : ''}
          onGuardar={p => { correr(() => crearCarpeta(p)); setNueva(false) }} onClose={() => setNueva(false)} />
      )}
    </div>
  )
}

/** Renombrar o borrar una carpeta. Solo se borra si está vacía (lo valida el servidor). */
function BotonesCarpeta({ carpeta, pending, correr, onBorrada }: {
  carpeta: Carpeta; pending: boolean
  correr: (fn: () => Promise<Resultado>) => void; onBorrada?: () => void
}) {
  return (
    <>
      <button disabled={pending}
        onClick={() => {
          const nombre = window.prompt('Nombre de la carpeta', carpeta.nombre)
          if (nombre && nombre.trim() && nombre.trim() !== carpeta.nombre) correr(() => editarCarpeta(carpeta.id, { nombre: nombre.trim() }))
        }}
        className="text-xs font-bold text-gray-400 hover:text-pm-navy disabled:opacity-50">✏️ Renombrar</button>
      <button disabled={pending}
        onClick={() => {
          if (!window.confirm(`¿Borrar la carpeta "${carpeta.nombre}"? Solo se puede si está vacía (sin subcarpetas ni facturas).`)) return
          correr(async () => { const r = await borrarCarpeta(carpeta.id); if (r.ok) onBorrada?.(); return r })
        }}
        className="text-xs font-bold text-gray-400 hover:text-red-600 disabled:opacity-50">🗑 Borrar</button>
    </>
  )
}

// ── Resumen de la carpeta (punto 29 y 43) ───────────────────────────────────
function ResumenCarpeta({ carpeta, docs }: { carpeta: Carpeta; docs: Factura[] }) {
  const conf = docs.filter(f => f.estadoDoc === 'confirmada')
  const anio = new Date().getFullYear()
  const mes = new Date().toISOString().slice(0, 7)
  const total = conf.reduce((n, f) => n + (f.total ?? 0), 0)
  const totalAnio = conf.filter(f => f.fechaEmision.startsWith(String(anio))).reduce((n, f) => n + (f.total ?? 0), 0)
  const totalMes = conf.filter(f => f.fechaEmision.startsWith(mes)).reduce((n, f) => n + (f.total ?? 0), 0)
  const proveedores = new Map<string, number>()
  conf.forEach(f => { if (f.proveedor) proveedores.set(f.proveedor, (proveedores.get(f.proveedor) ?? 0) + (f.total ?? 0)) })
  const top = [...proveedores.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3)

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-2xl">{carpeta.icono || '📁'}</span>
        <div>
          <div className="font-black text-pm-navy text-lg">{carpeta.nombre}</div>
          {carpeta.descripcion && <div className="text-xs text-gray-400">{carpeta.descripcion}</div>}
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Dato k={`Total ${anio}`} v={eur(totalAnio)} />
        <Dato k="Este mes" v={eur(totalMes)} />
        <Dato k="Documentos" v={String(docs.length)} />
        <Dato k="Media por factura" v={conf.length ? eur(total / conf.length) : '—'} />
      </div>
      {top.length > 0 && (
        <div className="mt-3 text-xs text-gray-500">
          Principales proveedores: {top.map(([n, v]) => `${n} (${eur(v)})`).join(' · ')}
        </div>
      )}
    </div>
  )
}

// ── Zona de subida (arrastrar o elegir, varios archivos) ────────────────────
function ZonaSubida({ carpeta, ambito, tipo, onSubido, onError }: {
  carpeta: Carpeta; ambito: Ambito; tipo: TipoDoc
  onSubido: (facturaId: string, duplicada: boolean) => void; onError: (e: string) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [sobre, setSobre] = useState(false)
  const [progreso, setProgreso] = useState('')

  async function subir(files: FileList | File[]) {
    const lista = Array.from(files)
    if (!lista.length) return
    onError('')
    let ultima = ''
    let dup = false
    for (let i = 0; i < lista.length; i++) {
      setProgreso(`Subiendo ${i + 1} de ${lista.length}…`)
      const fd = new FormData()
      fd.append('file', lista[i])
      fd.append('ambito', ambito)
      fd.append('tipo', tipo)
      fd.append('categoria', carpeta.parentId ? '' : carpeta.nombre)
      fd.append('subcategoria', carpeta.parentId ? carpeta.nombre : '')
      fd.append('categoriaId', carpeta.id)
      const r = await subirFactura(fd)
      if (!r.ok) { onError(`${lista[i].name}: ${r.error}`); break }
      ultima = r.data!.factura.id
      dup = dup || !!r.data!.duplicada
    }
    setProgreso('')
    if (ultima) onSubido(lista.length === 1 ? ultima : '', dup)
  }

  return (
    <div
      onDragOver={e => { e.preventDefault(); setSobre(true) }}
      onDragLeave={() => setSobre(false)}
      onDrop={e => { e.preventDefault(); setSobre(false); void subir(e.dataTransfer.files) }}
      className={`rounded-2xl border-2 border-dashed p-6 text-center transition-colors ${sobre ? 'border-pm-red bg-pm-red-light' : 'border-gray-300 bg-white'}`}
    >
      <div className="text-sm font-bold text-pm-navy">Arrastra aquí las facturas o justificantes</div>
      <div className="text-xs text-gray-400 mt-1">PDF, JPG, PNG o WebP · hasta 20 MB · puedes soltar varios a la vez</div>
      <button type="button" onClick={() => inputRef.current?.click()} disabled={!!progreso}
        className="mt-3 bg-pm-red hover:bg-pm-red-dark disabled:opacity-50 text-white font-bold text-sm px-4 py-2 rounded-xl">
        {progreso || '+ Subir factura'}
      </button>
      <input ref={inputRef} type="file" multiple accept="application/pdf,image/jpeg,image/png,image/webp" className="hidden"
        onChange={e => { if (e.target.files) void subir(e.target.files); e.target.value = '' }} />
      <p className="text-[11px] text-gray-400 mt-3">
        El documento se guarda tal cual y queda <strong>pendiente de revisión</strong>: no entra en el balance hasta que lo confirmes.
      </p>
    </div>
  )
}

// ── Lista de documentos ─────────────────────────────────────────────────────
function ListaFacturas({ facturas, onAbrir }: { facturas: Factura[]; onAbrir: (id: string) => void }) {
  if (facturas.length === 0) return <p className="text-sm text-gray-400 py-6 text-center">Todavía no hay documentos aquí.</p>
  return (
    <div className="divide-y divide-gray-50">
      {facturas.map(f => (
        <button key={f.id} onClick={() => onAbrir(f.id)} className="w-full flex flex-wrap items-center gap-3 py-2.5 text-left hover:bg-gray-50 rounded-lg px-2">
          <span className="text-lg">{f.archivoMime === 'application/pdf' ? '📕' : '🖼️'}</span>
          <div className="min-w-0 flex-1">
            <div className="font-semibold text-pm-navy text-sm truncate">{f.proveedor || f.concepto || f.archivoNombre}</div>
            <div className="text-xs text-gray-400 truncate">
              {[f.numero, fechaCorta(f.fechaEmision), f.subcategoria || f.categoria, kb(f.archivoTamano)].filter(Boolean).join(' · ')}
            </div>
          </div>
          <span className="font-black text-pm-navy text-sm whitespace-nowrap">{f.total != null ? eur(f.total) : '—'}</span>
          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${badgeEstadoDoc(f.estadoDoc)}`}>{labelEstadoDoc(f.estadoDoc)}</span>
          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${badgeEstadoPagoDoc(f.estadoPago)}`}>
            {ESTADOS_PAGO_DOC.find(e => e.id === f.estadoPago)?.label ?? f.estadoPago}
          </span>
        </button>
      ))}
    </div>
  )
}

// ── Ficha de una factura ────────────────────────────────────────────────────
function FichaFactura({ factura: f, carpetas, puedeEditar, puedeGestionar, pending, correr, onClose }: {
  factura: Factura; carpetas: Carpeta[]; puedeEditar: boolean; puedeGestionar: boolean
  pending: boolean; correr: (fn: () => Promise<Resultado>) => void; onClose: () => void
}) {
  const [d, setD] = useState({
    proveedor: f.proveedor, cif: f.cif, numero: f.numero, concepto: f.concepto,
    fechaEmision: f.fechaEmision, fechaPago: f.fechaPago,
    base: f.base?.toString() ?? '', ivaPct: f.ivaPct?.toString() ?? '', total: f.total?.toString() ?? '',
    metodoPago: f.metodoPago, estadoPago: f.estadoPago, notas: f.notas, esTicket: f.esTicket,
    categoriaId: f.categoriaId ?? '',
  })
  const num = (v: string) => (v.trim() === '' ? null : Number(v.replace(',', '.')))
  const input = 'w-full border border-gray-200 rounded-lg px-2.5 py-2 text-sm focus:outline-none focus:border-pm-red disabled:opacity-60'
  const label = 'block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1'
  const mias = carpetas.filter(c => c.ambito === f.ambito && c.tipo === f.tipo && c.activa)

  function abrir(descargar: boolean) {
    correr(async () => {
      const r = await urlFactura(f.id, descargar)
      if (r.ok && r.data) window.open(r.data, '_blank', 'noopener,noreferrer')
      return r
    })
  }

  function guardar(despuesConfirmar = false) {
    const carpeta = mias.find(c => c.id === d.categoriaId)
    const padre = carpeta?.parentId ? mias.find(c => c.id === carpeta.parentId) : null
    correr(async () => {
      const r = await guardarFactura(f.id, {
        proveedor: d.proveedor, cif: d.cif, numero: d.numero, concepto: d.concepto,
        fechaEmision: d.fechaEmision, fechaPago: d.fechaPago,
        base: num(d.base), ivaPct: num(d.ivaPct), total: num(d.total),
        metodoPago: d.metodoPago, estadoPago: d.estadoPago, notas: d.notas, esTicket: d.esTicket,
        categoriaId: d.categoriaId || null,
        categoria: carpeta ? (padre ? padre.nombre : carpeta.nombre) : undefined,
        subcategoria: carpeta?.parentId ? carpeta.nombre : '',
      })
      if (!r.ok || !despuesConfirmar) return r
      return confirmarFactura(f.id)
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-xl bg-white h-full overflow-y-auto shadow-2xl">
        <div className="bg-pm-navy text-white px-5 py-4 flex items-center justify-between sticky top-0 z-10">
          <div className="min-w-0">
            <div className="font-black text-lg truncate">{f.proveedor || f.archivoNombre}</div>
            <div className="text-white/60 text-xs">{labelEstadoDoc(f.estadoDoc)} · {f.ambito === 'club' ? 'Club Origen' : 'Empresa'} · {f.tipo}</div>
          </div>
          <button onClick={onClose} className="text-white/60 hover:text-white text-xl">✕</button>
        </div>

        <div className="p-5 space-y-4">
          {/* Documento original */}
          <div className="bg-pm-bg border border-gray-100 rounded-xl p-3 flex flex-wrap items-center gap-2">
            <span className="text-2xl">{f.archivoMime === 'application/pdf' ? '📕' : '🖼️'}</span>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold text-pm-navy truncate">{f.archivoNombre}</div>
              <div className="text-xs text-gray-400">{kb(f.archivoTamano)} · subido por {f.createdBy || '—'}</div>
            </div>
            <button onClick={() => abrir(false)} disabled={pending} className="text-xs font-bold text-pm-navy border border-gray-200 rounded-lg px-3 py-1.5 hover:border-pm-navy disabled:opacity-50">Ver</button>
            <button onClick={() => abrir(true)} disabled={pending} className="text-xs font-bold text-pm-navy border border-gray-200 rounded-lg px-3 py-1.5 hover:border-pm-navy disabled:opacity-50">Descargar</button>
          </div>

          {f.estadoDoc === 'duplicada' && (
            <div className="bg-fuchsia-50 border border-fuchsia-200 rounded-xl p-3 text-sm text-fuchsia-800">
              Este archivo ya se había subido antes. Compruébalo antes de contabilizarlo.
            </div>
          )}

          {/* Datos fiscales */}
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2"><label className={label}>Proveedor / cliente</label>
              <input className={input} value={d.proveedor} disabled={!puedeEditar} onChange={e => setD({ ...d, proveedor: e.target.value })} /></div>
            <div><label className={label}>CIF / NIF</label>
              <input className={input} value={d.cif} disabled={!puedeEditar} onChange={e => setD({ ...d, cif: e.target.value })} /></div>
            <div><label className={label}>Nº de factura</label>
              <input className={input} value={d.numero} disabled={!puedeEditar} onChange={e => setD({ ...d, numero: e.target.value })} /></div>
            <div className="col-span-2"><label className={label}>Concepto</label>
              <input className={input} value={d.concepto} disabled={!puedeEditar} onChange={e => setD({ ...d, concepto: e.target.value })} /></div>
            <div><label className={label}>Fecha de factura</label>
              <input type="date" className={input} value={d.fechaEmision} disabled={!puedeEditar} onChange={e => setD({ ...d, fechaEmision: e.target.value })} /></div>
            <div><label className={label}>Fecha de pago</label>
              <input type="date" className={input} value={d.fechaPago} disabled={!puedeEditar} onChange={e => setD({ ...d, fechaPago: e.target.value })} /></div>
            <div><label className={label}>Base imponible (€)</label>
              <input className={input} value={d.base} disabled={!puedeEditar} onChange={e => setD({ ...d, base: e.target.value })} /></div>
            <div><label className={label}>IVA (%)</label>
              <input className={input} value={d.ivaPct} disabled={!puedeEditar} onChange={e => setD({ ...d, ivaPct: e.target.value })} /></div>
            <div><label className={label}>Total (€) *</label>
              <input className={input} value={d.total} disabled={!puedeEditar} onChange={e => setD({ ...d, total: e.target.value })} /></div>
            <div><label className={label}>Forma de pago</label>
              <select className={input} value={d.metodoPago} disabled={!puedeEditar} onChange={e => setD({ ...d, metodoPago: e.target.value })}>
                <option value="">— Sin definir —</option>
                {METODOS_PAGO.map(m => <option key={m} value={m}>{m}</option>)}
              </select></div>
            <div><label className={label}>Estado del pago</label>
              <select className={input} value={d.estadoPago} disabled={!puedeEditar} onChange={e => setD({ ...d, estadoPago: e.target.value })}>
                {ESTADOS_PAGO_DOC.map(e => <option key={e.id} value={e.id}>{e.label}</option>)}
              </select></div>
            <div><label className={label}>Carpeta</label>
              <select className={input} value={d.categoriaId} disabled={!puedeEditar} onChange={e => setD({ ...d, categoriaId: e.target.value })}>
                <option value="">— Sin carpeta —</option>
                {mias.filter(c => !c.parentId).map(c => (
                  <optgroup key={c.id} label={c.nombre}>
                    <option value={c.id}>{c.nombre}</option>
                    {mias.filter(s => s.parentId === c.id).map(s => <option key={s.id} value={s.id}>— {s.nombre}</option>)}
                  </optgroup>
                ))}
              </select></div>
            <div className="col-span-2"><label className={label}>Notas</label>
              <textarea rows={2} className={`${input} resize-none`} value={d.notas} disabled={!puedeEditar} onChange={e => setD({ ...d, notas: e.target.value })} /></div>
            <label className="col-span-2 flex items-center gap-2 text-sm text-gray-600">
              <input type="checkbox" checked={d.esTicket} disabled={!puedeEditar} onChange={e => setD({ ...d, esTicket: e.target.checked })} className="w-4 h-4 accent-pm-red" />
              Es un ticket, no una factura
            </label>
          </div>

          {puedeEditar && (
            <div className="flex flex-wrap items-center gap-2 border-t border-gray-100 pt-4">
              <button onClick={() => guardar(false)} disabled={pending} className="border border-gray-200 hover:border-pm-navy text-pm-navy font-bold text-sm px-4 py-2.5 rounded-xl disabled:opacity-50">Guardar cambios</button>
              {f.estadoDoc !== 'confirmada' ? (
                <button onClick={() => guardar(true)} disabled={pending} className="bg-green-600 hover:bg-green-700 text-white font-black text-sm px-5 py-2.5 rounded-xl disabled:opacity-50">
                  Confirmar y contabilizar
                </button>
              ) : (
                <button onClick={() => { if (confirm('¿Anular? Se borrará su movimiento del balance y volverá a revisión.')) correr(() => anularFactura(f.id)) }}
                  disabled={pending} className="border border-amber-300 text-amber-700 hover:bg-amber-50 font-bold text-sm px-4 py-2.5 rounded-xl disabled:opacity-50">
                  Anular contabilización
                </button>
              )}
              <div className="flex-1" />
              {f.estadoDoc !== 'confirmada' && (
                <button onClick={() => correr(() => estadoFactura(f.id, 'archivada'))} disabled={pending} className="text-xs font-semibold text-gray-400 hover:text-pm-navy px-2">Archivar</button>
              )}
              {puedeGestionar && f.estadoDoc !== 'confirmada' && (
                <button onClick={() => { if (confirm('¿Borrar el documento? Se elimina también el archivo.')) { correr(() => borrarFactura(f.id)); onClose() } }}
                  disabled={pending} className="text-xs font-semibold text-gray-400 hover:text-red-600 px-2">Borrar</button>
              )}
            </div>
          )}

          {f.estadoDoc === 'confirmada' && (
            <p className="text-xs text-green-700 bg-green-50 border border-green-200 rounded-xl px-3 py-2">
              ✓ Contabilizada en el balance ({f.tipo === 'gasto' ? 'gasto' : 'ingreso'} de {eur(f.total ?? 0)}). Para cambiarla, anúlala primero.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Nueva carpeta ───────────────────────────────────────────────────────────
function ModalCarpeta({ ambito, tipo, carpetasRaiz, pending, padrePorDefecto = '', onGuardar, onClose }: {
  ambito: Ambito; tipo: TipoDoc; carpetasRaiz: Carpeta[]; pending: boolean; padrePorDefecto?: string
  onGuardar: (p: { nombre: string; descripcion: string; color: string; icono: string; ambito: string; tipo: string; parentId: string | null; orden: number }) => void
  onClose: () => void
}) {
  const [f, setF] = useState({ nombre: '', descripcion: '', color: 'gray', icono: '', parentId: padrePorDefecto, orden: 99 })
  const input = 'w-full border border-gray-200 rounded-lg px-2.5 py-2 text-sm focus:outline-none focus:border-pm-red'
  const label = 'block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl">
        <div className="bg-pm-navy text-white px-5 py-4 rounded-t-2xl flex items-center justify-between">
          <div className="font-black">Nueva carpeta · {ambito === 'club' ? 'Club Origen' : 'Empresa'} · {tipo}</div>
          <button onClick={onClose} className="text-white/60 hover:text-white text-xl">✕</button>
        </div>
        <div className="p-5 space-y-3">
          <div><label className={label}>Nombre *</label><input className={input} value={f.nombre} onChange={e => setF({ ...f, nombre: e.target.value })} /></div>
          <div><label className={label}>Descripción</label><input className={input} value={f.descripcion} onChange={e => setF({ ...f, descripcion: e.target.value })} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className={label}>Icono</label><input className={input} placeholder="📁" value={f.icono} onChange={e => setF({ ...f, icono: e.target.value })} /></div>
            <div><label className={label}>Orden</label><input type="number" className={input} value={f.orden} onChange={e => setF({ ...f, orden: Number(e.target.value) || 99 })} /></div>
          </div>
          <div>
            <label className={label}>Dentro de</label>
            <select className={input} value={f.parentId} onChange={e => setF({ ...f, parentId: e.target.value })}>
              <option value="">— Carpeta principal —</option>
              {carpetasRaiz.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
            </select>
          </div>
          <button disabled={pending || !f.nombre.trim()}
            onClick={() => onGuardar({ ...f, ambito, tipo, parentId: f.parentId || null })}
            className="w-full bg-pm-red hover:bg-pm-red-dark text-white font-black py-2.5 rounded-xl disabled:opacity-50">Crear carpeta</button>
        </div>
      </div>
    </div>
  )
}

function Dato({ k, v }: { k: string; v: string }) {
  return (
    <div className="bg-pm-bg rounded-xl border border-gray-100 p-3">
      <div className="text-xs text-gray-400">{k}</div>
      <div className="font-black text-pm-navy">{v}</div>
    </div>
  )
}
