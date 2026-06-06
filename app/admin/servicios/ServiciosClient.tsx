'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { EstadoBadge } from '@/components/admin/ui'
import type { ServicioFull } from '@/lib/servicios/store'

const ACCION_LABEL: Record<string, string> = {
  formulario: 'Formulario', reserva: 'Reserva', carrito: 'Carrito',
  presupuesto: 'Presupuesto', externo: 'Enlace externo', proximamente: 'Próximamente', espera: 'Lista de espera',
}

export default function ServiciosClient({ servicios }: { servicios: ServicioFull[] }) {
  const [q, setQ] = useState('')
  const [fEntidad, setFEntidad] = useState('')
  const [fCategoria, setFCategoria] = useState('')
  const [fEstado, setFEstado] = useState('')
  const [fAccion, setFAccion] = useState('')

  const categorias = useMemo(() => Array.from(new Set(servicios.map(s => s.categoria))), [servicios])

  const filtrados = useMemo(() => servicios.filter(s => {
    if (q && !s.nombre.toLowerCase().includes(q.toLowerCase()) && !s.descripcionCorta.toLowerCase().includes(q.toLowerCase())) return false
    if (fEntidad && s.entidad !== fEntidad) return false
    if (fCategoria && s.categoria !== fCategoria) return false
    if (fEstado && s.estado !== fEstado) return false
    if (fAccion && s.botonAccion !== fAccion) return false
    return true
  }), [servicios, q, fEntidad, fCategoria, fEstado, fAccion])

  const club = filtrados.filter(s => s.entidad === 'club')
  const empresa = filtrados.filter(s => s.entidad === 'empresa')

  return (
    <div className="space-y-5">
      {/* Filtros */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <svg className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar servicio..."
            className="w-full border border-gray-200 rounded-xl pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:border-pm-red" />
        </div>
        <select value={fEntidad} onChange={e => setFEntidad(e.target.value)} className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white">
          <option value="">Club y Empresa</option>
          <option value="club">Club Deportivo</option>
          <option value="empresa">Empresa</option>
        </select>
        <select value={fCategoria} onChange={e => setFCategoria(e.target.value)} className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white">
          <option value="">Toda categoría</option>
          {categorias.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={fEstado} onChange={e => setFEstado(e.target.value)} className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white">
          <option value="">Todo estado</option>
          {['activo', 'inactivo', 'proximamente', 'completo', 'pausado', 'oculto', 'borrador'].map(e => <option key={e} value={e}>{e}</option>)}
        </select>
        <select value={fAccion} onChange={e => setFAccion(e.target.value)} className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white">
          <option value="">Toda acción</option>
          {Object.entries(ACCION_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </div>

      <div className="text-sm text-gray-500">{filtrados.length} servicio(s)</div>

      {club.length > 0 && <Grupo titulo="🏅 Club Deportivo Origen" sub="Solo formularios — nunca compra directa" items={club} />}
      {empresa.length > 0 && <Grupo titulo="🏢 Empresa" sub="Reservas, ecommerce y presupuestos" items={empresa} />}
      {filtrados.length === 0 && <div className="text-center py-16 text-gray-400">Sin servicios que coincidan con los filtros.</div>}
    </div>
  )
}

function Grupo({ titulo, sub, items }: { titulo: string; sub: string; items: ServicioFull[] }) {
  return (
    <div>
      <div className="flex items-baseline gap-2 mb-3">
        <h2 className="font-black text-pm-navy">{titulo}</h2>
        <span className="text-xs text-gray-400">{sub}</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map(s => (
          <Link key={s.id} href={`/admin/servicios/${s.id}`}
            className="group bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md hover:border-pm-red/30 transition-all">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{s.icon}</span>
                <div>
                  <div className="font-black text-pm-navy text-sm group-hover:text-pm-red transition-colors">{s.nombre}</div>
                  <div className="text-xs text-gray-400">{s.categoria} · {ACCION_LABEL[s.botonAccion]}</div>
                </div>
              </div>
              {s.destacado && <span className="text-amber-500 text-sm" title="Destacado">⭐</span>}
            </div>
            <p className="text-xs text-gray-500 leading-relaxed mb-3 line-clamp-2">{s.descripcionCorta}</p>
            <div className="flex items-center justify-between">
              <EstadoBadge estado={s.estado} />
              <span className="text-xs font-bold text-pm-red flex items-center gap-1">
                Editar
                <svg className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7"/></svg>
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
