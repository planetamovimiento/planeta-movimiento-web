'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import type { ClienteFactura, PerfilFacturacion, SerieFacturacion } from '@/lib/facturacion/tipos'
import type { Resultado } from '../50dias50provincias/piezas'
import TabPerfiles from './TabPerfiles'
import TabClientes from './TabClientes'

type Props = {
  perfiles: PerfilFacturacion[]
  series: SerieFacturacion[]
  clientes: ClienteFactura[]
  migrado: boolean
  puedePerfiles: boolean
  puedeClientes: boolean
}

type TabId = 'resumen' | 'facturas' | 'proformas' | 'perfiles' | 'clientes' | 'config'

const TABS: { id: TabId; label: string }[] = [
  { id: 'resumen', label: 'Resumen' },
  { id: 'facturas', label: 'Facturas' },
  { id: 'proformas', label: 'Proformas' },
  { id: 'perfiles', label: 'Perfiles de facturación' },
  { id: 'clientes', label: 'Clientes' },
  { id: 'config', label: 'Configuración' },
]

// Paneles que aún no están en esta fase.
function Proximamente({ que }: { que: string }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
      <div className="text-4xl mb-3">🧾</div>
      <p className="font-black text-pm-navy">{que}</p>
      <p className="text-gray-400 text-sm mt-1 max-w-md mx-auto leading-relaxed">
        Se activa en la siguiente fase. La base (perfiles y clientes) ya está operativa.
      </p>
    </div>
  )
}

export default function FacturacionClient({ perfiles, series, clientes, migrado, puedePerfiles, puedeClientes }: Props) {
  const router = useRouter()
  const [tab, setTab] = useState<TabId>(perfiles.length === 0 ? 'perfiles' : 'resumen')
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState('')
  const [msg, setMsg] = useState('')

  const correr = (fn: () => Promise<Resultado>) => {
    setError(''); setMsg('')
    startTransition(async () => {
      const r = await fn()
      if (!r.ok) setError(r.error || 'Error')
      else { setMsg('✓ Guardado'); router.refresh() }
    })
  }

  const cuenta = (id: TabId) =>
    id === 'perfiles' ? perfiles.length : id === 'clientes' ? clientes.length : null

  return (
    <div className="space-y-5">
      {!migrado && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-sm text-amber-800">
          <div className="font-black mb-1">⚙️ Falta la migración</div>
          <p className="text-amber-700 leading-relaxed">
            Ejecuta una vez <code className="bg-amber-100 px-1.5 py-0.5 rounded">supabase/migration_facturacion.sql</code> en
            el SQL Editor de Supabase. Hasta entonces no se puede guardar nada.
          </p>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-1.5 flex gap-1 overflow-x-auto scrollbar-hide">
        {TABS.map(t => {
          const n = cuenta(t.id)
          return (
            <button key={t.id} onClick={() => { setTab(t.id); setError(''); setMsg('') }}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-colors ${
                tab === t.id ? 'bg-pm-navy text-white' : 'text-gray-500 hover:text-pm-navy hover:bg-pm-bg'
              }`}>
              {t.label}
              {n != null && <span className={`text-xs font-black rounded-full px-1.5 ${tab === t.id ? 'bg-white/20' : 'bg-gray-100 text-gray-400'}`}>{n}</span>}
            </button>
          )
        })}
      </div>

      {error && <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">{error}</div>}
      {msg && <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-sm text-green-700">{msg}</div>}

      {tab === 'perfiles' && (
        <TabPerfiles perfiles={perfiles} series={series} pending={pending} correr={correr} editable={migrado && puedePerfiles} />
      )}
      {tab === 'clientes' && (
        <TabClientes clientes={clientes} pending={pending} correr={correr} editable={migrado && puedeClientes} />
      )}
      {tab === 'resumen' && <Proximamente que="Resumen de facturación" />}
      {tab === 'facturas' && <Proximamente que="Facturas" />}
      {tab === 'proformas' && <Proximamente que="Proformas" />}
      {tab === 'config' && <Proximamente que="Configuración" />}
    </div>
  )
}
