'use client'

import { useState, useEffect, useCallback } from 'react'
import { submitForm } from '@/lib/forms/actions'
import { PRODUCTOS, type Producto, type Color, type Variante } from './productos'

const WHATSAPP = '34969000000'
const CART_KEY = 'pm_cart_colchonetas'

// ─── Tipos del carrito ────────────────────────────────────────────────────────
type CartItem = {
  key: string
  productoId: string
  nombre: string
  colorId: string
  colorLabel: string
  colorHex: string
  varianteLabel: string
  precio: number
  cantidad: number
}

// ─── Ilustración de colchoneta reactiva al color ──────────────────────────────
function MatVisual({ color, grosor = 'normal' }: { color: Color; grosor?: 'normal' | 'grueso' }) {
  const edgeH = grosor === 'grueso' ? 38 : 22
  return (
    <div className="relative w-full max-w-[260px] mx-auto" style={{ perspective: '600px' }}>
      <div className="relative" style={{ transform: 'rotateX(18deg)', transformStyle: 'preserve-3d' }}>
        {/* Canto (grosor) */}
        <div
          className="absolute left-0 right-0 rounded-b-2xl"
          style={{ background: color.hexEdge, height: edgeH, bottom: -edgeH + 8, transform: 'translateZ(-2px)' }}
        />
        {/* Cara superior */}
        <div
          className="relative rounded-2xl shadow-xl flex items-center justify-center"
          style={{
            background: `linear-gradient(135deg, ${color.hex} 0%, ${color.hexEdge} 100%)`,
            height: 130,
          }}
        >
          {/* Costuras decorativas */}
          <div className="absolute inset-3 rounded-xl border-2 border-white/15" />
          {/* Asas */}
          <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-3 h-8 rounded-full bg-black/30" />
          <div className="absolute -right-1 top-1/2 -translate-y-1/2 w-3 h-8 rounded-full bg-black/30" />
          {/* Brillo */}
          <div className="absolute top-0 left-0 right-0 h-1/2 rounded-t-2xl bg-gradient-to-b from-white/20 to-transparent" />
        </div>
      </div>
    </div>
  )
}

// ─── Modal de personalización ─────────────────────────────────────────────────
function ModalPersonalizar({ producto, onClose }: { producto: Producto; onClose: () => void }) {
  const [form, setForm] = useState({ nombre: '', telefono: '', email: '', medidas: '', color: '', comentarios: '' })
  const [enviando, setEnviando] = useState(false)
  const [enviado, setEnviado] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setEnviando(true)
    await submitForm({
      tipo: 'colchonetas',
      nombre: form.nombre,
      email: form.email,
      telefono: form.telefono,
      asunto: `Personalización · ${producto.nombre}`,
      mensaje: form.comentarios,
      datos: { producto: producto.nombre, medidas: form.medidas, color: form.color },
    })
    setEnviando(false); setEnviado(true)
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="bg-pm-navy text-white px-6 py-4 rounded-t-2xl flex items-center justify-between sticky top-0 z-10">
          <div>
            <h3 className="font-black text-base">Solicitar personalización</h3>
            <p className="text-white/60 text-xs">{producto.nombre} · medidas y colores a medida</p>
          </div>
          <button onClick={onClose} className="text-white/60 hover:text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>

        {enviado ? (
          <div className="p-10 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/></svg>
            </div>
            <h4 className="text-xl font-black text-pm-navy mb-2">¡Solicitud enviada!</h4>
            <p className="text-gray-500 text-sm mb-6">Prepararemos un presupuesto personalizado y te contactaremos en menos de 48 horas.</p>
            <button onClick={onClose} className="bg-pm-red hover:bg-pm-red-dark text-white font-bold px-8 py-3 rounded-xl transition-colors">Cerrar</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="bg-pm-bg border border-gray-200 rounded-xl p-3 text-sm">
              <span className="text-gray-500">Producto:</span> <strong className="text-pm-navy">{producto.nombre}</strong>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input required type="text" placeholder="Nombre *" value={form.nombre} onChange={e => setForm(f => ({...f, nombre: e.target.value}))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-pm-red"/>
              <input required type="tel" placeholder="Teléfono *" value={form.telefono} onChange={e => setForm(f => ({...f, telefono: e.target.value}))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-pm-red"/>
            </div>
            <input required type="email" placeholder="Email *" value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-pm-red"/>
            <div className="grid grid-cols-2 gap-3">
              <input type="text" placeholder="Medidas deseadas (ej. 250×150×30)" value={form.medidas} onChange={e => setForm(f => ({...f, medidas: e.target.value}))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-pm-red"/>
              <input type="text" placeholder="Color deseado" value={form.color} onChange={e => setForm(f => ({...f, color: e.target.value}))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-pm-red"/>
            </div>
            <textarea rows={3} placeholder="Comentarios o necesidades especiales" value={form.comentarios} onChange={e => setForm(f => ({...f, comentarios: e.target.value}))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-pm-red resize-none"/>
            <button type="submit" disabled={!form.nombre || !form.telefono || !form.email || enviando} className="w-full bg-pm-red hover:bg-pm-red-dark disabled:opacity-50 text-white font-black py-3.5 rounded-xl transition-colors">
              {enviando ? 'Enviando...' : 'Solicitar presupuesto personalizado'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

// ─── Panel de producto ──────────────────────────────────────────────────────
function PanelProducto({ producto, onAdd, onPersonalizar }: {
  producto: Producto
  onAdd: (p: Producto, color: Color, variante: Variante) => void
  onPersonalizar: (p: Producto) => void
}) {
  const [color, setColor] = useState<Color>(producto.colores[0])
  const [variante, setVariante] = useState<Variante>(producto.variantes[0])
  const [abierto, setAbierto] = useState(false)
  const [añadido, setAñadido] = useState(false)

  function handleAdd() {
    onAdd(producto, color, variante)
    setAñadido(true)
    setTimeout(() => setAñadido(false), 1800)
  }

  return (
    <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow flex flex-col">
      {/* Visual */}
      <div className={`relative bg-gradient-to-br ${producto.grad} px-6 pt-8 pb-10`}>
        <div className="absolute top-4 right-4 bg-white/15 backdrop-blur text-white text-xs font-black px-3 py-1 rounded-full">
          desde {producto.precioDesde} €
        </div>
        <div className="text-3xl mb-4">{producto.icon}</div>
        <MatVisual color={color} grosor={producto.id === 'quitamiedos' ? 'grueso' : 'normal'} />
      </div>

      {/* Info */}
      <div className="p-6 flex flex-col flex-1">
        <h3 className="text-xl font-black text-pm-navy">{producto.nombre}</h3>
        <p className="text-pm-red text-xs font-bold mb-2">{producto.tagline}</p>
        <p className="text-gray-500 text-sm leading-relaxed mb-5">{producto.descripcionCorta}</p>

        {/* Selector de color */}
        <div className="mb-4">
          <div className="text-xs font-bold text-pm-navy mb-2">Color: <span className="text-gray-500 font-normal">{color.label}</span></div>
          <div className="flex gap-2">
            {producto.colores.map(c => (
              <button key={c.id} onClick={() => setColor(c)}
                aria-label={c.label}
                className={`w-8 h-8 rounded-full border-2 transition-all ${color.id === c.id ? 'border-pm-navy scale-110 ring-2 ring-pm-navy/20' : 'border-gray-200 hover:scale-105'}`}
                style={{ background: c.hex }}
              />
            ))}
          </div>
        </div>

        {/* Selector de variante (si hay más de una) */}
        {producto.variantes.length > 1 && (
          <div className="mb-4">
            <div className="text-xs font-bold text-pm-navy mb-2">Medida</div>
            <div className="grid grid-cols-1 gap-2">
              {producto.variantes.map(v => (
                <button key={v.id} onClick={() => setVariante(v)}
                  className={`flex items-center justify-between border-2 rounded-xl px-3 py-2 text-sm transition-all ${variante.id === v.id ? 'border-pm-red bg-pm-red-light' : 'border-gray-200 hover:border-pm-red/40'}`}>
                  <span className={`font-semibold ${variante.id === v.id ? 'text-pm-red' : 'text-pm-navy'}`}>{v.label}</span>
                  <span className="font-black text-pm-navy">{v.precio} €</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Precio */}
        <div className="flex items-end justify-between mb-4 pb-4 border-b border-gray-100">
          <div>
            <div className="text-3xl font-black text-pm-navy">{variante.precio} €</div>
            <div className="text-xs text-gray-400">{variante.nota}</div>
          </div>
          <div className="text-right text-xs text-gray-400">{variante.label}</div>
        </div>

        {/* Desplegable de detalles */}
        <button onClick={() => setAbierto(!abierto)}
          className="flex items-center justify-between w-full text-sm font-bold text-pm-navy hover:text-pm-red transition-colors mb-2">
          Ver detalles completos
          <svg className={`w-4 h-4 transition-transform ${abierto ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/></svg>
        </button>

        {abierto && (
          <div className="space-y-5 py-4 text-sm">
            {/* Descripción larga */}
            <div className="space-y-2">
              {producto.descripcionLarga.map((p, i) => <p key={i} className="text-gray-600 leading-relaxed">{p}</p>)}
            </div>
            {/* Características */}
            <div>
              <div className="text-xs font-black text-pm-navy uppercase tracking-wider mb-2">Características</div>
              <ul className="space-y-1.5">
                {producto.caracteristicas.map(c => (
                  <li key={c} className="flex items-start gap-2 text-gray-600 text-xs leading-relaxed">
                    <span className="text-pm-red font-bold shrink-0 mt-0.5">✓</span>{c}
                  </li>
                ))}
              </ul>
            </div>
            {/* Materiales */}
            <div>
              <div className="text-xs font-black text-pm-navy uppercase tracking-wider mb-2">Materiales</div>
              <ul className="space-y-1">
                {producto.materiales.map(m => <li key={m} className="text-gray-600 text-xs">• {m}</li>)}
              </ul>
            </div>
            {/* Ficha técnica */}
            <div>
              <div className="text-xs font-black text-pm-navy uppercase tracking-wider mb-2">Ficha técnica</div>
              <div className="grid grid-cols-2 gap-1.5">
                {producto.ficha.map(f => (
                  <div key={f.campo} className="bg-pm-bg rounded-lg px-3 py-2">
                    <div className="text-gray-400 text-xs">{f.campo}</div>
                    <div className="text-pm-navy font-semibold text-xs">{f.valor}</div>
                  </div>
                ))}
              </div>
            </div>
            {/* Usos */}
            <div>
              <div className="text-xs font-black text-pm-navy uppercase tracking-wider mb-2">Ideal para</div>
              <div className="flex flex-wrap gap-1.5">
                {producto.usos.map(u => <span key={u} className="bg-pm-bg border border-gray-200 text-gray-600 text-xs px-2 py-1 rounded-full">{u}</span>)}
              </div>
            </div>
          </div>
        )}

        {/* Botones */}
        <div className="mt-auto pt-4 space-y-2">
          <button onClick={handleAdd}
            className={`w-full font-black py-3.5 rounded-xl transition-all ${añadido ? 'bg-green-600 text-white' : 'bg-pm-red hover:bg-pm-red-dark text-white'}`}>
            {añadido ? '✓ Añadido al carrito' : '🛒 Añadir al carrito'}
          </button>
          <button onClick={() => onPersonalizar(producto)}
            className="w-full border-2 border-pm-navy text-pm-navy hover:bg-pm-navy hover:text-white font-bold py-3 rounded-xl transition-colors text-sm">
            Personalizar medidas
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Componente principal ──────────────────────────────────────────────────
export default function ColchonetasCatalog() {
  const [cart, setCart] = useState<CartItem[]>([])
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [modalProducto, setModalProducto] = useState<Producto | null>(null)
  const [hydrated, setHydrated] = useState(false)

  // Cargar carrito de localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(CART_KEY)
      if (stored) setCart(JSON.parse(stored))
    } catch {}
    setHydrated(true)
  }, [])

  // Persistir
  useEffect(() => {
    if (hydrated) {
      try { localStorage.setItem(CART_KEY, JSON.stringify(cart)) } catch {}
    }
  }, [cart, hydrated])

  const addToCart = useCallback((p: Producto, color: Color, variante: Variante) => {
    const key = `${p.id}-${color.id}-${variante.id}`
    setCart(prev => {
      const existe = prev.find(i => i.key === key)
      if (existe) return prev.map(i => i.key === key ? { ...i, cantidad: i.cantidad + 1 } : i)
      return [...prev, {
        key, productoId: p.id, nombre: p.nombre,
        colorId: color.id, colorLabel: color.label, colorHex: color.hex,
        varianteLabel: variante.label, precio: variante.precio, cantidad: 1,
      }]
    })
    setDrawerOpen(true)
  }, [])

  const cambiarCantidad = (key: string, delta: number) =>
    setCart(prev => prev
      .map(i => i.key === key ? { ...i, cantidad: i.cantidad + delta } : i)
      .filter(i => i.cantidad > 0))

  const quitar = (key: string) => setCart(prev => prev.filter(i => i.key !== key))

  const totalItems = cart.reduce((s, i) => s + i.cantidad, 0)
  const totalPrecio = cart.reduce((s, i) => s + i.precio * i.cantidad, 0)

  function finalizarPedido() {
    const lineas = cart.map(i => `• ${i.cantidad}× ${i.nombre} (${i.varianteLabel}, ${i.colorLabel}) — ${i.precio * i.cantidad}€`).join('\n')
    const msg = `¡Hola! Quiero hacer un pedido de colchonetas:\n\n${lineas}\n\nTOTAL: ${totalPrecio}€\n\n¿Me confirmáis disponibilidad y envío?`
    window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`, '_blank')
  }

  return (
    <>
      {/* Grid de productos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {PRODUCTOS.map(p => (
          <PanelProducto key={p.id} producto={p} onAdd={addToCart} onPersonalizar={setModalProducto} />
        ))}
      </div>

      {/* Botón flotante del carrito */}
      {totalItems > 0 && (
        <button onClick={() => setDrawerOpen(true)}
          className="fixed bottom-6 right-6 z-40 bg-pm-red hover:bg-pm-red-dark text-white rounded-full shadow-2xl shadow-pm-red/40 w-16 h-16 flex items-center justify-center transition-all hover:scale-105">
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
          <span className="absolute -top-1 -right-1 bg-pm-navy text-white text-xs font-black w-6 h-6 rounded-full flex items-center justify-center border-2 border-white">{totalItems}</span>
        </button>
      )}

      {/* Drawer del carrito */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setDrawerOpen(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-2xl flex flex-col">
            <div className="bg-pm-navy text-white px-5 py-4 flex items-center justify-between">
              <div className="font-black text-base">🛒 Tu carrito ({totalItems})</div>
              <button onClick={() => setDrawerOpen(false)} className="text-white/60 hover:text-white">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>

            {cart.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-8 text-center">
                <div className="text-5xl mb-3">🛒</div>
                <p className="text-sm">Tu carrito está vacío</p>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto p-5 space-y-3">
                  {cart.map(i => (
                    <div key={i.key} className="flex gap-3 bg-pm-bg rounded-2xl p-3">
                      <div className="w-12 h-12 rounded-xl shrink-0 border border-gray-200" style={{ background: i.colorHex }} />
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-pm-navy text-sm truncate">{i.nombre}</div>
                        <div className="text-xs text-gray-500">{i.varianteLabel} · {i.colorLabel}</div>
                        <div className="flex items-center gap-2 mt-2">
                          <button onClick={() => cambiarCantidad(i.key, -1)} className="w-6 h-6 bg-white border border-gray-200 rounded-lg font-bold text-sm hover:border-pm-red">−</button>
                          <span className="text-sm font-bold w-6 text-center">{i.cantidad}</span>
                          <button onClick={() => cambiarCantidad(i.key, 1)} className="w-6 h-6 bg-white border border-gray-200 rounded-lg font-bold text-sm hover:border-pm-red">+</button>
                          <button onClick={() => quitar(i.key)} className="ml-auto text-xs text-gray-400 hover:text-pm-red underline">Quitar</button>
                        </div>
                      </div>
                      <div className="font-black text-pm-navy text-sm shrink-0">{i.precio * i.cantidad} €</div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-200 p-5 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 text-sm">Total</span>
                    <span className="text-2xl font-black text-pm-navy">{totalPrecio} €</span>
                  </div>
                  <button onClick={finalizarPedido} className="w-full bg-pm-red hover:bg-pm-red-dark text-white font-black py-4 rounded-xl transition-colors flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                    Finalizar pedido por WhatsApp
                  </button>
                  <p className="text-center text-xs text-gray-400">Te confirmaremos disponibilidad, envío y forma de pago.</p>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Modal personalización */}
      {modalProducto && <ModalPersonalizar producto={modalProducto} onClose={() => setModalProducto(null)} />}
    </>
  )
}
