'use client'

import { useMemo, useState } from 'react'
import { useProteccion, ProteccionCampos } from '@/components/seguridad/ProteccionFormulario'
import { enviarPedidoShop, type LineaPedido } from './actions'
import { PRODUCTOS, type Color, type Producto, type Variante } from '@/lib/shop/productos'

// ─────────────────────────────────────────────────────────────────────────────
// Planeta Shop: catálogo, ficha de producto y carrito. El pedido se registra en
// el CRM; el pago y el envío se cierran después con el cliente.
// ─────────────────────────────────────────────────────────────────────────────

type ItemCarrito = {
  key: string
  productoId: string
  nombre: string
  varianteId: string
  varianteLabel: string
  colorId?: string
  colorLabel?: string
  colorHex?: string
  talla?: string
  nombrePersonalizado?: string
  /** Precio final por unidad, con el descuento de socio ya aplicado. */
  precio: number
  precioSinDescuento: number
  numeroSocio?: string
  cantidad: number
  reserva: boolean
  recogida: boolean
}

const eur = (n: number) => `${new Intl.NumberFormat('es-ES').format(n)} €`

export default function TiendaClient() {
  const [carrito, setCarrito] = useState<ItemCarrito[]>([])
  const [abierto, setAbierto] = useState(false)
  const [ficha, setFicha] = useState<Producto | null>(null)

  const unidades = carrito.reduce((s, i) => s + i.cantidad, 0)
  const total = carrito.reduce((s, i) => s + i.precio * i.cantidad, 0)
  const hayReserva = carrito.some(i => i.reserva)

  function anadir(item: Omit<ItemCarrito, 'key' | 'cantidad'>, cantidad: number) {
    const key = [item.productoId, item.varianteId, item.colorId, item.talla, item.nombrePersonalizado].filter(Boolean).join('|')
    setCarrito(prev => {
      const ya = prev.find(i => i.key === key)
      if (ya) return prev.map(i => (i.key === key ? { ...i, cantidad: i.cantidad + cantidad } : i))
      return [...prev, { ...item, key, cantidad }]
    })
    setFicha(null)
    setAbierto(true)
  }

  const cambiar = (key: string, delta: number) =>
    setCarrito(prev => prev.map(i => (i.key === key ? { ...i, cantidad: i.cantidad + delta } : i)).filter(i => i.cantidad > 0))

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {PRODUCTOS.map(p => <Tarjeta key={p.id} producto={p} onVer={() => setFicha(p)} />)}
      </div>

      {unidades > 0 && (
        <button onClick={() => setAbierto(true)}
          className="fixed bottom-6 right-6 z-40 bg-pm-red hover:bg-pm-red-dark text-white rounded-full shadow-2xl shadow-pm-red/40 h-14 pl-5 pr-6 flex items-center gap-3 font-black transition-all hover:scale-105">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
          {unidades} {unidades === 1 ? 'artículo' : 'artículos'}
        </button>
      )}

      {ficha && <FichaProducto producto={ficha} onClose={() => setFicha(null)} onAnadir={anadir} />}

      {abierto && (
        <Carrito items={carrito} total={total} hayReserva={hayReserva}
          onClose={() => setAbierto(false)} onCambiar={cambiar}
          onQuitar={key => setCarrito(prev => prev.filter(i => i.key !== key))}
          onVaciar={() => setCarrito([])} />
      )}
    </>
  )
}

// ─── Tarjeta del catálogo ────────────────────────────────────────────────────
function Tarjeta({ producto: p, onVer }: { producto: Producto; onVer: () => void }) {
  return (
    <button onClick={onVer}
      className="group text-left flex flex-col bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:border-pm-red/30 transition-all duration-200 hover:-translate-y-0.5">
      <div className="relative bg-pm-bg aspect-[4/3] flex items-center justify-center overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={p.imagen} alt={p.nombre} className="w-full h-full object-contain p-4 transition-transform duration-300 group-hover:scale-[1.03]" />
        <span className="absolute top-4 left-4 bg-white/90 backdrop-blur text-pm-navy text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full border border-gray-200">
          {p.categoria}
        </span>
      </div>

      <div className="flex-1 flex flex-col p-5">
        <h3 className="font-black text-pm-navy text-lg leading-tight">{p.nombre}</h3>
        <p className="text-sm text-gray-500 mt-1">{p.tagline}</p>
        <p className="text-sm text-gray-600 leading-relaxed mt-3 flex-1">{p.descripcionCorta}</p>

        <div className="flex items-end justify-between mt-5 pt-4 border-t border-gray-100">
          <div>
            {p.precioDesde > 0 ? (
              <>
                <div className="text-[11px] text-gray-400 uppercase tracking-wider font-bold">
                  {p.variantes.length > 1 ? 'Desde' : 'Precio'}
                </div>
                <div className="text-2xl font-black text-pm-navy">{eur(p.precioDesde)}</div>
                <div className="text-[11px] text-gray-400">IVA incluido</div>
              </>
            ) : (
              <>
                <div className="text-[11px] text-gray-400 uppercase tracking-wider font-bold">Por reserva</div>
                <div className="text-lg font-black text-pm-navy">Precio al confirmar</div>
              </>
            )}
          </div>
          <span className="bg-pm-navy group-hover:bg-pm-red text-white text-sm font-bold px-4 py-2.5 rounded-xl transition-colors">
            {p.tipo === 'reserva' ? 'Reservar' : 'Ver producto'}
          </span>
        </div>
      </div>
    </button>
  )
}

// ─── Ficha del producto (elige medida, color, talla y cantidad) ──────────────
function FichaProducto({ producto: p, onClose, onAnadir }: {
  producto: Producto
  onClose: () => void
  onAnadir: (item: Omit<ItemCarrito, 'key' | 'cantidad'>, cantidad: number) => void
}) {
  const [variante, setVariante] = useState<Variante>(p.variantes[0])
  const [color, setColor] = useState<Color | undefined>(p.colores[0])
  const [talla, setTalla] = useState(p.tallas?.[0] ?? '')
  const [nombrePers, setNombrePers] = useState('')
  const [cantidad, setCantidad] = useState(1)
  const [esSocio, setEsSocio] = useState(false)
  const [numeroSocio, setNumeroSocio] = useState('')

  const dto = esSocio ? (p.descuentoSocio ?? 0) : 0
  const precioUnidad = Math.round(variante.precio * (1 - dto / 100) * 100) / 100
  const falta = (!!p.pideNombre && !nombrePers.trim()) || (esSocio && !numeroSocio.trim())

  return (
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full sm:max-w-4xl sm:rounded-3xl overflow-hidden shadow-2xl my-0 sm:my-8">
        <div className="sticky top-0 z-10 bg-pm-navy text-white px-5 py-4 flex items-center justify-between">
          <div className="min-w-0">
            <div className="font-black truncate">{p.nombre}</div>
            <div className="text-white/60 text-xs truncate">{p.tagline}</div>
          </div>
          <button onClick={onClose} aria-label="Cerrar" className="text-white/60 hover:text-white shrink-0">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2">
          {/* Imagen y puntos fuertes */}
          <div className="bg-pm-bg p-5 space-y-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.imagen} alt={p.nombre} className="w-full rounded-2xl bg-white" />
            <div className="grid grid-cols-2 gap-2">
              {p.destacados.map(d => (
                <div key={d.titulo} className="bg-white border border-gray-200 rounded-xl p-3">
                  <div className="text-[11px] font-black text-pm-navy uppercase tracking-wider">{d.titulo}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{d.texto}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Compra */}
          <div className="p-5 space-y-5">
            <div className="space-y-2">
              {p.descripcionLarga.map((t, i) => <p key={i} className="text-sm text-gray-600 leading-relaxed">{t}</p>)}
            </div>

            {p.variantes.length > 1 && (
              <div>
                <div className="text-xs font-black text-pm-navy uppercase tracking-wider mb-2">Medida</div>
                <div className="grid grid-cols-1 gap-2">
                  {p.variantes.map(v => (
                    <button key={v.id} onClick={() => setVariante(v)}
                      className={`flex items-center justify-between px-4 py-3 rounded-xl border-2 text-sm transition-all ${
                        variante.id === v.id ? 'border-pm-red bg-pm-red-light text-pm-navy' : 'border-gray-200 hover:border-pm-red/50 text-gray-600'
                      }`}>
                      <span className="font-bold">{v.label}</span>
                      <span className="font-black text-pm-navy">{eur(v.precio)}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {p.colores.length > 0 && (
              <div>
                <div className="text-xs font-black text-pm-navy uppercase tracking-wider mb-2">Color de la funda</div>
                <div className="flex flex-wrap gap-2">
                  {p.colores.map(c => (
                    <button key={c.id} onClick={() => setColor(c)} title={c.label} aria-label={c.label}
                      className={`w-10 h-10 rounded-xl border-2 transition-all ${color?.id === c.id ? 'border-pm-red scale-105' : 'border-gray-200'}`}
                      style={{ background: c.hex }} />
                  ))}
                </div>
                <div className="text-xs text-gray-500 mt-1.5">{color?.label}</div>
              </div>
            )}

            {p.tallas && (
              <div>
                <div className="text-xs font-black text-pm-navy uppercase tracking-wider mb-2">Talla</div>
                <div className="flex flex-wrap gap-2">
                  {p.tallas.map(t => (
                    <button key={t} onClick={() => setTalla(t)}
                      className={`min-w-11 px-3 py-2 rounded-xl border-2 text-sm font-bold transition-all ${
                        talla === t ? 'border-pm-red bg-pm-red-light text-pm-red' : 'border-gray-200 text-gray-600 hover:border-pm-red/50'
                      }`}>{t}</button>
                  ))}
                </div>
              </div>
            )}

            {p.pideNombre && (
              <div>
                <label className="block text-xs font-black text-pm-navy uppercase tracking-wider mb-2">Nombre para la espalda</label>
                <input value={nombrePers} maxLength={16} onChange={e => setNombrePers(e.target.value.toUpperCase())}
                  placeholder="CARLOS"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm tracking-widest font-bold focus:outline-none focus:border-pm-red" />
                <p className="text-[11px] text-gray-400 mt-1.5">Hasta 16 caracteres. Se imprime tal cual aparece aquí.</p>
              </div>
            )}

            {!!p.descuentoSocio && (
              <div>
                <div className="text-xs font-black text-pm-navy uppercase tracking-wider mb-2">¿Eres socio del club?</div>
                <button type="button" onClick={() => { setEsSocio(v => !v); setNumeroSocio('') }}
                  className={`w-full text-left px-4 py-3 rounded-xl border-2 text-sm font-bold transition-all ${
                    esSocio ? 'border-pm-red bg-pm-red-light text-pm-red' : 'border-gray-200 text-pm-navy hover:border-pm-red/50'
                  }`}>
                  Descuento de socio −{p.descuentoSocio} %
                  <span className="block font-normal opacity-70">Club Deportivo Origen</span>
                </button>
                {esSocio && (
                  <input required value={numeroSocio} onChange={e => setNumeroSocio(e.target.value)} placeholder="Tu nº de socio"
                    className="w-full mt-2 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-pm-red" />
                )}
                <p className="text-[11px] text-gray-400 mt-2">Comprobamos el nº de socio antes de entregar el pedido.</p>
              </div>
            )}

            {p.recogida && (
              <div className="bg-pm-bg border border-gray-200 rounded-xl p-3 text-xs text-gray-600 leading-relaxed">
                <span className="font-bold text-pm-navy">Recogida en nuestra instalación.</span> Polígono Los Palancares, 8 · 16004 Cuenca.
                Te avisamos en cuanto esté lista; no se envía a domicilio.
              </div>
            )}

            <div className="flex items-center gap-3">
              <div className="text-xs font-black text-pm-navy uppercase tracking-wider">Cantidad</div>
              <div className="flex items-center gap-2">
                <button onClick={() => setCantidad(c => Math.max(1, c - 1))} className="w-9 h-9 border border-gray-200 rounded-xl font-bold hover:border-pm-red">−</button>
                <span className="w-8 text-center font-black text-pm-navy">{cantidad}</span>
                <button onClick={() => setCantidad(c => Math.min(20, c + 1))} className="w-9 h-9 border border-gray-200 rounded-xl font-bold hover:border-pm-red">+</button>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-4 flex items-center justify-between gap-3">
              <div>
                {variante.precio > 0 ? (
                  <>
                    <div className="flex items-baseline gap-2">
                      {dto > 0 && <span className="text-sm text-gray-400 line-through">{eur(variante.precio * cantidad)}</span>}
                      <span className="text-2xl font-black text-pm-navy">{eur(precioUnidad * cantidad)}</span>
                    </div>
                    <div className="text-[11px] text-gray-400">{dto > 0 ? `Socio −${dto} % · ${variante.nota}` : variante.nota}</div>
                  </>
                ) : (
                  <div className="text-sm text-gray-500 max-w-[180px]">Te confirmamos precio y entrega al cerrar la reserva.</div>
                )}
              </div>
              <button disabled={falta}
                onClick={() => onAnadir({
                  productoId: p.id, nombre: p.nombre,
                  varianteId: variante.id, varianteLabel: variante.label,
                  colorId: color?.id, colorLabel: color?.label, colorHex: color?.hex,
                  talla: talla || undefined, nombrePersonalizado: nombrePers.trim() || undefined,
                  precio: precioUnidad, precioSinDescuento: variante.precio,
                  numeroSocio: esSocio ? numeroSocio.trim() : undefined,
                  reserva: p.tipo === 'reserva', recogida: !!p.recogida,
                }, cantidad)}
                className="bg-pm-red hover:bg-pm-red-dark disabled:opacity-40 text-white font-black px-6 py-3.5 rounded-xl transition-colors">
                {p.tipo === 'reserva' ? 'Añadir reserva' : 'Añadir al carrito'}
              </button>
            </div>

            <div>
              <div className="text-xs font-black text-pm-navy uppercase tracking-wider mb-2">Ficha técnica</div>
              <table className="w-full text-sm">
                <tbody>
                  {p.ficha.map(f => (
                    <tr key={f.campo} className="border-b border-gray-100 last:border-0">
                      <td className="py-1.5 text-gray-500">{f.campo}</td>
                      <td className="py-1.5 text-pm-navy font-semibold text-right">{f.valor}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div>
              <div className="text-xs font-black text-pm-navy uppercase tracking-wider mb-2">Recomendada para</div>
              <div className="flex flex-wrap gap-1.5">
                {p.usos.map(u => <span key={u} className="text-xs font-semibold bg-pm-bg border border-gray-200 text-gray-600 px-2.5 py-1 rounded-full">{u}</span>)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Carrito y pedido ────────────────────────────────────────────────────────
function Carrito({ items, total, hayReserva, onClose, onCambiar, onQuitar, onVaciar }: {
  items: ItemCarrito[]
  total: number
  hayReserva: boolean
  onClose: () => void
  onCambiar: (key: string, delta: number) => void
  onQuitar: (key: string) => void
  onVaciar: () => void
}) {
  const [paso, setPaso] = useState<'carrito' | 'datos' | 'hecho'>('carrito')
  const [form, setForm] = useState({ nombre: '', email: '', telefono: '', mensaje: '' })
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState('')
  const { valores, hpRef, onToken } = useProteccion()
  const soloRecogida = items.length > 0 && items.every(i => i.recogida)

  const lineas: LineaPedido[] = useMemo(() => items.map(i => ({
    productoId: i.productoId, varianteId: i.varianteId, colorId: i.colorId,
    talla: i.talla, nombrePersonalizado: i.nombrePersonalizado,
    numeroSocio: i.numeroSocio, cantidad: i.cantidad,
  })), [items])

  async function enviar(e: React.FormEvent) {
    e.preventDefault()
    setEnviando(true); setError('')
    const r = await enviarPedidoShop({ cliente: form, lineas, seguridad: valores() })
    setEnviando(false)
    if (!r.ok) { setError(r.error); return }
    onVaciar()
    setPaso('hecho')
  }

  const input = 'w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-pm-red'

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-2xl flex flex-col">
        <div className="bg-pm-navy text-white px-5 py-4 flex items-center justify-between">
          <div className="font-black">{paso === 'hecho' ? 'Pedido enviado' : paso === 'datos' ? 'Tus datos' : 'Tu carrito'}</div>
          <button onClick={onClose} aria-label="Cerrar" className="text-white/60 hover:text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {paso === 'hecho' ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
            </div>
            <p className="font-black text-pm-navy text-lg mb-2">Hemos recibido tu pedido</p>
            <p className="text-sm text-gray-500 mb-6">Te escribimos enseguida para confirmar disponibilidad, plazo de entrega y forma de pago.</p>
            <button onClick={onClose} className="bg-pm-navy text-white font-bold px-6 py-2.5 rounded-xl">Seguir viendo productos</button>
          </div>
        ) : items.length === 0 ? (
          <div className="flex-1 flex items-center justify-center p-8 text-center text-gray-400 text-sm">
            Tu carrito está vacío.
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-5 space-y-3">
              {items.map(i => (
                <div key={i.key} className="flex gap-3 bg-pm-bg rounded-2xl p-3">
                  {i.colorHex
                    ? <div className="w-12 h-12 rounded-xl shrink-0 border border-gray-200" style={{ background: i.colorHex }} />
                    : <div className="w-12 h-12 rounded-xl shrink-0 border border-gray-200 bg-white" />}
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-pm-navy text-sm">{i.nombre}</div>
                    <div className="text-xs text-gray-500">
                      {[i.varianteLabel, i.colorLabel, i.talla && `Talla ${i.talla}`, i.nombrePersonalizado, i.numeroSocio && `Socio ${i.numeroSocio}`].filter(Boolean).join(' · ')}
                    </div>
                    {paso === 'carrito' && (
                      <div className="flex items-center gap-2 mt-2">
                        <button onClick={() => onCambiar(i.key, -1)} className="w-6 h-6 bg-white border border-gray-200 rounded-lg font-bold text-sm hover:border-pm-red">−</button>
                        <span className="text-sm font-bold w-6 text-center">{i.cantidad}</span>
                        <button onClick={() => onCambiar(i.key, 1)} className="w-6 h-6 bg-white border border-gray-200 rounded-lg font-bold text-sm hover:border-pm-red">+</button>
                        <button onClick={() => onQuitar(i.key)} className="ml-auto text-xs text-gray-400 hover:text-pm-red underline">Quitar</button>
                      </div>
                    )}
                  </div>
                  <div className="font-black text-pm-navy text-sm shrink-0">
                    {i.precio ? eur(i.precio * i.cantidad) : 'Reserva'}
                  </div>
                </div>
              ))}

              {paso === 'datos' && (
                <form id="form-pedido" onSubmit={enviar} className="space-y-2 pt-2">
                  <input required placeholder="Nombre y apellidos" value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} className={input} />
                  <input required type="email" placeholder="Correo electrónico" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className={input} />
                  <input required type="tel" placeholder="Teléfono" value={form.telefono} onChange={e => setForm(f => ({ ...f, telefono: e.target.value }))} className={input} />
                  <textarea rows={3}
                    placeholder={soloRecogida ? 'Dudas o cualquier detalle de tu pedido' : 'Dirección de envío, dudas o cualquier detalle'}
                    value={form.mensaje} onChange={e => setForm(f => ({ ...f, mensaje: e.target.value }))} className={`${input} resize-none`} />
                  {soloRecogida && (
                    <p className="text-[11px] text-gray-500 bg-pm-bg border border-gray-200 rounded-xl p-3 leading-relaxed">
                      Este pedido se recoge en nuestra instalación: Polígono Los Palancares, 8 · 16004 Cuenca. No hace falta dirección de envío.
                    </p>
                  )}
                  <ProteccionCampos hpRef={hpRef} onToken={onToken} />
                  {error && <p className="text-xs text-pm-red">{error}</p>}
                </form>
              )}
            </div>

            <div className="border-t border-gray-200 p-5 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-500 text-sm">{hayReserva && total === 0 ? 'Reserva' : 'Total'}</span>
                <span className="text-2xl font-black text-pm-navy">{total ? eur(total) : 'Por confirmar'}</span>
              </div>
              {paso === 'carrito' ? (
                <button onClick={() => setPaso('datos')} className="w-full bg-pm-red hover:bg-pm-red-dark text-white font-black py-3.5 rounded-xl transition-colors">
                  Continuar
                </button>
              ) : (
                <button form="form-pedido" type="submit" disabled={enviando}
                  className="w-full bg-pm-red hover:bg-pm-red-dark disabled:opacity-50 text-white font-black py-3.5 rounded-xl transition-colors">
                  {enviando ? 'Enviando…' : 'Enviar pedido'}
                </button>
              )}
              <p className="text-center text-xs text-gray-400">
                Sin pago online: confirmamos disponibilidad, envío y forma de pago antes de cobrar nada.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
