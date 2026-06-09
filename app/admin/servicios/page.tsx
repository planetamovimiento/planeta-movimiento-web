import { getServicios } from '@/lib/servicios/store'
import { createAdminClient } from '@/lib/supabase/admin'
import { AdminHeader, SetupNotice } from '@/components/admin/ui'
import ServiciosClient from './ServiciosClient'
import { requireSeccion } from '@/lib/admin/auth'

export const dynamic = 'force-dynamic'

export default async function ServiciosPage() {
  await requireSeccion('servicios')
  const servicios = await getServicios()

  // ¿Está la migración aplicada? (columna contenido en services)
  let migrado = true
  try {
    const db = createAdminClient()
    const { error } = await db.from('services').select('contenido').limit(1)
    if (error) migrado = false
  } catch { migrado = false }

  return (
    <>
      <AdminHeader titulo="Servicios" subtitulo="Edita cualquier servicio de la web — Club y Empresa" />
      <div className="p-6 lg:p-8 space-y-6">
        {!migrado && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 text-sm text-amber-800">
            <div className="font-black mb-1">⚙️ Falta aplicar la migración del editor</div>
            <p className="text-amber-700 leading-relaxed">
              Ejecuta una vez <code className="bg-amber-100 px-1.5 py-0.5 rounded">supabase/migration_editor.sql</code> en
              el SQL Editor de Supabase para poder guardar la edición completa de servicios. Mientras tanto puedes
              ver las fichas pero el guardado fallará.
            </p>
          </div>
        )}
        <ServiciosClient servicios={servicios} />
      </div>
    </>
  )
}
