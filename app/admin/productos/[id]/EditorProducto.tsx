'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { guardarProducto } from '../actions'
import type { ProductoFull } from '@/lib/productos/store'

const lbl = 'block text-xs font-bold text-pm-navy mb-1.5'
const inp = 'w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-pm-red'

export default function EditorProducto({ producto }: { producto: ProductoFull }) {
  const [f, setF] = useState({
    nombre: producto.nombre, tagline: producto.tagline, descripcionCorta: producto.descripcionCorta,
    precioDesde: producto.precioDesde, activo: producto.activo, stock: producto.stock,
    variantes: producto.variantes.map(v => ({ ...v })),
    colores: producto.colores.map(c => ({ ...c })),
    caracteristicas: [...producto.caracteristicas],
    materiales: [...producto.materiales],
  })
  const [pending, startTransition] = useTransition()
  const [msg, setMsg] = useState('')
  const set = (k: string, v: unknown) => setF(prev => ({ ...prev, [k]: v }))

  function guardar() {
    const cambioPrecio = f.precioDesde !== producto.precioDesde || JSON.stringify(f.variantes) !== JSON.stringify(producto.variantes)
    if (cambioPrecio && !confirm('Vas a cambiar precios. ¿Confirmas publicar los cambios?')) return
    startTransition(async () => {
      const r = await guardarProducto(producto.id, f)
      setMsg(r.ok ? `✓ Guardado (${r.cambios ?? 0} cambios)` : `Error: ${r.error}`)
      setTimeout(() => setMsg(''), 4000)
    })
  }

  return (
    <div className="max-w-3xl space-y-6">
      <Seccion titulo="Información del producto">
        <label className={lbl}>Nombre</label>
        <input className={inp} value={f.nombre} onChange={e => set('nombre', e.target.value)} />
        <label className={lbl + ' mt-4'}>Tagline</label>
        <input className={inp} value={f.tagline} onChange={e => set('tagline', e.target.value)} />
        <label className={lbl + ' mt-4'}>Descripción corta</label>
        <textarea rows={2} className={inp + ' resize-none'} value={f.descripcionCorta} onChange={e => set('descripcionCorta', e.target.value)} />
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div><label className={lbl}>Precio desde (€)</label><input type="number" className={inp} value={f.precioDesde ?? ''} onChange={e => set('precioDesde', e.target.value === '' ? null : Number(e.target.value))} /></div>
          <div><label className={lbl}>Stock</label><input type="number" className={inp} value={f.stock ?? ''} onChange={e => set('stock', e.target.value === '' ? null : Number(e.target.value))} placeholder="Sin límite" /></div>
          <div>
            <label className={lbl}>Estado</label>
            <select className={inp + ' bg-white'} value={f.activo ? 'activo' : 'inactivo'} onChange={e => set('activo', e.target.value === 'activo')}>
              <option value="activo">Activo (visible)</option>
              <option value="inactivo">Inactivo (oculto)</option>
            </select>
          </div>
        </div>
      </Seccion>

      {/* Variantes / medidas */}
      <Seccion titulo="Variantes y medidas" nota="Cada variante con su precio. Cambios aquí piden confirmación.">
        <div className="space-y-2">
          {f.variantes.map((v, i) => (
            <div key={i} className="flex gap-2 items-center">
              <input className={inp} placeholder="Medida / variante" value={v.label} onChange={e => set('variantes', f.variantes.map((x, j) => j === i ? { ...x, label: e.target.value } : x))} />
              <input type="number" className={inp + ' w-28'} placeholder="€" value={v.precio} onChange={e => set('variantes', f.variantes.map((x, j) => j === i ? { ...x, precio: Number(e.target.value) } : x))} />
              <button onClick={() => set('variantes', f.variantes.filter((_, j) => j !== i))} className="text-gray-400 hover:text-pm-red px-2">✕</button>
            </div>
          ))}
        </div>
        <button onClick={() => set('variantes', [...f.variantes, { id: 'v' + Date.now(), label: '', precio: 0 }])} className="mt-2 text-sm font-bold text-pm-red">+ Añadir variante</button>
      </Seccion>

      {/* Colores */}
      <Seccion titulo="Colores disponibles">
        <div className="space-y-2">
          {f.colores.map((c, i) => (
            <div key={i} className="flex gap-2 items-center">
              <input type="color" className="w-10 h-10 rounded-lg border border-gray-200" value={c.hex} onChange={e => set('colores', f.colores.map((x, j) => j === i ? { ...x, hex: e.target.value } : x))} />
              <input className={inp} placeholder="Nombre del color" value={c.label} onChange={e => set('colores', f.colores.map((x, j) => j === i ? { ...x, label: e.target.value } : x))} />
              <button onClick={() => set('colores', f.colores.filter((_, j) => j !== i))} className="text-gray-400 hover:text-pm-red px-2">✕</button>
            </div>
          ))}
        </div>
        <button onClick={() => set('colores', [...f.colores, { id: 'c' + Date.now(), label: '', hex: '#1A2A5E', hexEdge: '#0F1A3D' }])} className="mt-2 text-sm font-bold text-pm-red">+ Añadir color</button>
      </Seccion>

      {/* Características y materiales */}
      <Seccion titulo="Características técnicas">
        <label className={lbl}>Características (una por línea)</label>
        <textarea rows={5} className={inp + ' resize-none'} value={f.caracteristicas.join('\n')} onChange={e => set('caracteristicas', e.target.value.split('\n'))} />
        <label className={lbl + ' mt-4'}>Materiales (uno por línea)</label>
        <textarea rows={3} className={inp + ' resize-none'} value={f.materiales.join('\n')} onChange={e => set('materiales', e.target.value.split('\n'))} />
      </Seccion>

      {/* Guardar */}
      <div className="sticky bottom-0 bg-white border border-gray-200 rounded-2xl shadow-lg p-4 flex items-center gap-3">
        <p className="text-xs text-gray-400">Los botones "Personalizar" y "Añadir al carrito" están siempre activos en la web.</p>
        <div className="flex-1" />
        {msg && <span className={`text-sm font-semibold ${msg.startsWith('✓') ? 'text-green-600' : 'text-pm-red'}`}>{msg}</span>}
        <Link href="/admin/productos" className="border border-gray-200 text-gray-600 font-bold px-4 py-2.5 rounded-xl text-sm hover:border-pm-red">Volver</Link>
        <button onClick={guardar} disabled={pending} className="bg-pm-red hover:bg-pm-red-dark disabled:opacity-50 text-white font-black px-6 py-2.5 rounded-xl text-sm">
          {pending ? 'Guardando...' : 'Publicar cambios'}
        </button>
      </div>
    </div>
  )
}

function Seccion({ titulo, nota, children }: { titulo: string; nota?: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <h2 className="font-black text-pm-navy mb-1">{titulo}</h2>
      {nota ? <p className="text-xs text-gray-400 mb-4">{nota}</p> : <div className="mb-4" />}
      {children}
    </div>
  )
}
