import { requireSeccion } from '@/lib/admin/auth'
import { AdminHeader } from '@/components/admin/ui'
import { hayTablasFacturacion } from '@/lib/facturacion/data'

export const dynamic = 'force-dynamic'

// Subsecciones del módulo. Los paneles se van rellenando por fases.
const TABS = ['Resumen', 'Facturas', 'Proformas', 'Perfiles de facturación', 'Clientes', 'Configuración']

export default async function FacturacionPage() {
  await requireSeccion('facturacion')
  const migrado = await hayTablasFacturacion()

  return (
    <>
      <AdminHeader
        titulo={<span className="flex items-center gap-2"><span>🧾</span> Facturación</span>}
        subtitulo="Facturas y proformas · perfiles emisores y clientes"
      />
      <div className="p-4 lg:p-8 space-y-5">
        {!migrado && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-sm text-amber-800">
            <div className="font-black mb-1">⚙️ Falta la migración</div>
            <p className="text-amber-700 leading-relaxed">
              Ejecuta una vez <code className="bg-amber-100 px-1.5 py-0.5 rounded">supabase/migration_facturacion.sql</code> en
              el SQL Editor de Supabase para activar el módulo.
            </p>
          </div>
        )}

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-1.5 flex gap-1 overflow-x-auto scrollbar-hide">
          {TABS.map((t, i) => (
            <span key={t}
              className={`px-3.5 py-2 rounded-xl text-sm font-bold whitespace-nowrap ${i === 0 ? 'bg-pm-navy text-white' : 'text-gray-400'}`}>
              {t}
            </span>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
          <div className="text-4xl mb-3">🧾</div>
          <p className="font-black text-pm-navy">Módulo de facturación en construcción</p>
          <p className="text-gray-400 text-sm mt-1 max-w-md mx-auto leading-relaxed">
            Base lista: esquema, cálculo de impuestos y numeración. Las pantallas de
            perfiles, clientes, facturas y proformas se activan en las siguientes fases.
          </p>
        </div>
      </div>
    </>
  )
}
