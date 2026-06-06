import Link from 'next/link'
import { getTalleres } from '@/lib/talleres/store'
import { createAdminClient } from '@/lib/supabase/admin'
import { AdminHeader, EstadoBadge } from '@/components/admin/ui'

export const dynamic = 'force-dynamic'

export default async function AdminTalleresPage() {
  const talleres = await getTalleres()

  let migrado = true
  try {
    const db = createAdminClient()
    const { error } = await db.from('talleres_intensivos').select('id').limit(1)
    if (error) migrado = false
  } catch { migrado = false }

  return (
    <>
      <AdminHeader titulo="Talleres Intensivos" subtitulo="Edita fechas, precios, plazas y abre inscripciones" />
      <div className="p-6 lg:p-8 space-y-6">
        {!migrado && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 text-sm text-amber-800">
            <div className="font-black mb-1">⚙️ Falta aplicar la migración</div>
            <p className="text-amber-700">Ejecuta <code className="bg-amber-100 px-1.5 py-0.5 rounded">supabase/migration_talleres.sql</code> en Supabase para guardar los cambios.</p>
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {talleres.map(t => (
            <Link key={t.id} href={`/admin/talleres-intensivos/${t.id}`}
              className="group bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md hover:border-pm-red/30 transition-all">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{t.icon}</span>
                  <div>
                    <div className="font-black text-pm-navy text-sm group-hover:text-pm-red transition-colors">{t.nombre}</div>
                    <div className="text-xs text-gray-400">{t.fecha || 'Sin fecha'} · {t.precio}</div>
                  </div>
                </div>
                <EstadoBadge estado={t.estado === 'abierto' ? 'activo' : t.estado === 'proximamente' ? 'proximamente' : t.estado === 'completo' ? 'completo' : 'ultimas'} />
              </div>
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>Plazas: {t.plazasLibres}/{t.plazasTotal}</span>
                <span className="font-bold text-pm-red">Editar →</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </>
  )
}
