'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import type {
  ColaboradorLocal, ConfigReto, Donante, Etapa, FaqItem, Patrocinador, QrDonacion, ResumenReto,
} from '@/lib/reto50/tipos'
import type { Correr, Resultado } from './piezas'
import TabGeneral from './TabGeneral'
import TabRuta from './TabRuta'
import TabImpacto from './TabImpacto'
import TabQr from './TabQr'
import TabGasolina from './TabGasolina'
import TabPatrocinadores from './TabPatrocinadores'
import TabColaboradoresLocales from './TabColaboradoresLocales'
import TabFaq from './TabFaq'

type Props = {
  etapas: Etapa[]
  patrocinadores: Patrocinador[]
  locales: ColaboradorLocal[]
  faq: FaqItem[]
  qrs: QrDonacion[]
  donantes: Donante[]
  config: ConfigReto
  resumen: ResumenReto
  migrado: boolean
  puedeEditar: boolean
}

type TabId = 'general' | 'ruta' | 'qr' | 'gasolina' | 'impacto' | 'patrocinadores' | 'locales' | 'faq'

export default function Reto50Client({
  etapas, patrocinadores, locales, faq, qrs, donantes, config, resumen, migrado, puedeEditar,
}: Props) {
  const router = useRouter()
  const [tab, setTab] = useState<TabId>('general')
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState('')
  const [msg, setMsg] = useState('')

  // Mientras la migración no se ejecute, la ruta que se ve es la de respaldo
  // y no hay nada que escribir en la base de datos.
  const editable = puedeEditar && migrado

  const correr: Correr = (fn: () => Promise<Resultado>) => {
    setError('')
    setMsg('')
    startTransition(async () => {
      const r = await fn()
      if (!r.ok) setError(r.error || 'Error')
      else {
        setMsg('✓ Guardado')
        router.refresh()
      }
    })
  }

  const tabs: { id: TabId; label: string; extra?: string }[] = [
    { id: 'general', label: 'General' },
    { id: 'ruta', label: 'Ruta', extra: String(etapas.length) },
    { id: 'qr', label: 'Códigos QR', extra: String(qrs.length) },
    { id: 'gasolina', label: 'Gasolina', extra: String(donantes.length) },
    { id: 'impacto', label: 'Recaudación', extra: String(etapas.length) },
    { id: 'patrocinadores', label: 'Patrocinadores', extra: String(patrocinadores.length) },
    { id: 'locales', label: 'Colaboradores locales', extra: String(locales.length) },
    { id: 'faq', label: 'FAQ', extra: String(faq.length) },
  ]

  return (
    <div className="space-y-5">
      {!migrado && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-sm text-amber-800">
          <div className="font-black mb-1">⚙️ Faltan las migraciones</div>
          <p className="text-amber-700 leading-relaxed">
            Ejecuta en el SQL Editor de Supabase, por este orden,{' '}
            <code className="bg-amber-100 px-1.5 py-0.5 rounded">supabase/migration_reto50.sql</code> y{' '}
            <code className="bg-amber-100 px-1.5 py-0.5 rounded">supabase/migration_reto50_donaciones.sql</code> para
            activar esta sección. Mientras tanto se muestra la <strong>ruta oficial de respaldo</strong> (solo lectura) y{' '}
            <strong>no se puede guardar</strong> ningún cambio.
          </p>
        </div>
      )}

      {!puedeEditar && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-sm text-blue-800">
          Tu cuenta tiene permiso de <strong>solo lectura</strong>: puedes consultar todo, pero no modificarlo.
        </div>
      )}

      {/* Pestañas */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-1.5 flex gap-1 overflow-x-auto scrollbar-hide">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => { setTab(t.id); setError(''); setMsg('') }}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-colors ${
              tab === t.id ? 'bg-pm-navy text-white' : 'text-gray-500 hover:text-pm-navy hover:bg-pm-bg'
            }`}
          >
            {t.label}
            {t.extra && (
              <span className={`text-xs font-black rounded-full px-1.5 ${tab === t.id ? 'bg-white/20' : 'bg-gray-100 text-gray-400'}`}>
                {t.extra}
              </span>
            )}
          </button>
        ))}
      </div>

      {error && <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">{error}</div>}
      {msg && <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-sm text-green-700">{msg}</div>}

      {tab === 'general' && <TabGeneral config={config} pending={pending} correr={correr} editable={editable} />}
      {tab === 'ruta' && <TabRuta etapas={etapas} pending={pending} correr={correr} editable={editable} />}
      {tab === 'qr' && <TabQr qrs={qrs} pending={pending} correr={correr} editable={editable} />}
      {tab === 'gasolina' && <TabGasolina config={config} donantes={donantes} pending={pending} correr={correr} editable={editable} />}
      {tab === 'impacto' && <TabImpacto etapas={etapas} resumen={resumen} pending={pending} correr={correr} editable={editable} />}
      {tab === 'patrocinadores' && <TabPatrocinadores patrocinadores={patrocinadores} pending={pending} correr={correr} editable={editable} />}
      {tab === 'locales' && <TabColaboradoresLocales colaboradores={locales} etapas={etapas} pending={pending} correr={correr} editable={editable} />}
      {tab === 'faq' && <TabFaq faq={faq} pending={pending} correr={correr} editable={editable} />}
    </div>
  )
}
