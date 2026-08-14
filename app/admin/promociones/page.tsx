import { requireSeccion, can } from '@/lib/admin/auth'
import { AdminHeader } from '@/components/admin/ui'
import { getPromos } from '@/lib/home/promos'
import PromosManager from './PromosManager'

export const dynamic = 'force-dynamic'

export default async function PromocionesPage() {
  const admin = await requireSeccion('promociones')
  const promos = await getPromos()
  return (
    <>
      <AdminHeader
        titulo={<span className="flex items-center gap-2"><span>📣</span> Promociones del inicio</span>}
        subtitulo="Tiras destacadas de la portada · añade lo que quieras promocionar y a dónde redirige"
      />
      <div className="p-4 lg:p-8">
        <PromosManager promos={promos} puedeEditar={can.edit(admin.role)} />
      </div>
    </>
  )
}
