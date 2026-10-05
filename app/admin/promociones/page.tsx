import { requireSeccion, can } from '@/lib/admin/auth'
import { AdminHeader } from '@/components/admin/ui'
import { getPromos } from '@/lib/home/promos'
import { getResenas } from '@/lib/home/resenas'
import PromosManager from './PromosManager'
import ResenasManager from './ResenasManager'

export const dynamic = 'force-dynamic'

export default async function PromocionesPage() {
  const admin = await requireSeccion('promociones')
  const [promos, resenas] = await Promise.all([getPromos(), getResenas()])
  return (
    <>
      <AdminHeader
        titulo={<span className="flex items-center gap-2"><span>📣</span> Promociones del inicio</span>}
        subtitulo="Tiras destacadas y reseñas de Google de la portada"
      />
      <div className="p-4 lg:p-8 space-y-6">
        <PromosManager promos={promos} puedeEditar={can.edit(admin.role)} />
        <ResenasManager datos={resenas} puedeEditar={can.edit(admin.role)} />
      </div>
    </>
  )
}
