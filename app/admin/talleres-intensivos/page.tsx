import { requireSeccion } from '@/lib/admin/auth'
import { AdminHeader } from '@/components/admin/ui'
import { getTalleresAdmin } from '@/lib/talleres/store'
import TalleresListClient from './TalleresListClient'

export const dynamic = 'force-dynamic'

export default async function TalleresIntensivosPage() {
  await requireSeccion('servicios')
  const talleres = await getTalleresAdmin()
  // ¿Cuántos ya son registros reales en BD? (para ofrecer importar los del código)
  const enBD = talleres.filter(t => t.updatedAt).length

  return (
    <>
      <AdminHeader
        titulo={<span className="flex items-center gap-2"><span>🎯</span> Talleres Intensivos</span>}
        subtitulo="Crea, edita y ordena cualquier intensivo · Club Deportivo Origen"
      />
      <div className="p-4 lg:p-8">
        <TalleresListClient talleres={talleres} totalEnBD={enBD} />
      </div>
    </>
  )
}
