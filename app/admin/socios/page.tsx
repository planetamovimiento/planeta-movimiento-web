import { requireSeccion, can } from '@/lib/admin/auth'
import { AdminHeader } from '@/components/admin/ui'
import { getSocios } from '@/lib/club/socios'
import SociosClient from './SociosClient'

export const dynamic = 'force-dynamic'

export default async function SociosPage() {
  const admin = await requireSeccion('socios')
  const socios = await getSocios()

  return (
    <>
      <AdminHeader
        titulo={<span className="flex items-center gap-2"><span>⭐</span> Socios</span>}
        subtitulo="Altas del formulario de socio: nº de socio, participantes y entrega de equipación"
      />
      <div className="p-4 lg:p-6">
        <SociosClient socios={socios} puedeEditar={can.edit(admin.role)} />
      </div>
    </>
  )
}
