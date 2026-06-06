'use client'

import { useState, useTransition } from 'react'
import { EstadoBadge } from '@/components/admin/ui'
import { guardarServicio } from './actions'

export type ServicioCatalogo = {
  id: string; nombre: string; categoria: string; icon: string
  estado: string; precio: number | null
}

const ESTADOS = ['activo', 'inactivo', 'completo', 'proximamente']
const CAT_LABEL: Record<string, string> = {
  club: 'Club', ocio: 'Ocio', educacion: 'Educación', eventos: 'Eventos', ecommerce: 'Tienda',
}

export default function ServiciosClient({ servicios, puedeEditar }: { servicios: ServicioCatalogo[]; puedeEditar: boolean }) {
  const cats = Array.from(new Set(servicios.map(s => s.categoria)))
  return (
    <div className="space-y-6">
      {cats.map(cat => (
        <div key={cat}>
          <h2 className="font-black text-pm-navy mb-3">{CAT_LABEL[cat] || cat}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {servicios.filter(s => s.categoria === cat).map(s => (
              <ServicioCard key={s.id} servicio={s} puedeEditar={puedeEditar} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function ServicioCard({ servicio, puedeEditar }: { servicio: ServicioCatalogo; puedeEditar: boolean }) {
  const [estado, setEstado] = useState(servicio.estado)
  const [pending, startTransition] = useTransition()
  const [ok, setOk] = useState(false)

  function cambiar(nuevo: string) {
    setEstado(nuevo); setOk(false)
    startTransition(async () => {
      const r = await guardarServicio({ id: servicio.id, nombre: servicio.nombre, categoria: servicio.categoria, estado: nuevo, precio: servicio.precio })
      if (r.ok) { setOk(true); setTimeout(() => setOk(false), 1500) }
    })
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{servicio.icon}</span>
          <div>
            <div className="font-black text-pm-navy text-sm">{servicio.nombre}</div>
            {servicio.precio != null && <div className="text-xs text-gray-400">desde {servicio.precio} €</div>}
          </div>
        </div>
        <EstadoBadge estado={estado} />
      </div>
      {puedeEditar ? (
        <div className="flex flex-wrap gap-1.5">
          {ESTADOS.map(e => (
            <button key={e} disabled={pending} onClick={() => cambiar(e)}
              className={`text-xs font-bold px-2.5 py-1 rounded-full border transition-colors ${estado === e ? 'bg-pm-red border-pm-red text-white' : 'border-gray-200 text-gray-500 hover:border-pm-red'}`}>
              {e}
            </button>
          ))}
          {ok && <span className="text-xs text-green-600 font-bold self-center ml-1">✓ Guardado</span>}
        </div>
      ) : (
        <p className="text-xs text-gray-400">Solo lectura</p>
      )}
    </div>
  )
}
