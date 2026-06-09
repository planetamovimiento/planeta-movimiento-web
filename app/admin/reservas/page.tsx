import { requireSeccion, can } from '@/lib/admin/auth'
import { getRegistrosCRM } from '@/lib/crm/data'
import { AdminHeader } from '@/components/admin/ui'
import ReservasCRMClient from './ReservasCRMClient'

export default async function ReservasPage() {
  const admin = await requireSeccion('reservas')
  const { registros, gestionOk } = await getRegistrosCRM()

  return (
    <>
      <AdminHeader
        titulo="Reservas · CRM de empresa"
        subtitulo="Clientes, reservas, cobros y contrataciones de todos los servicios"
      />
      <div className="p-4 lg:p-6">
        <ReservasCRMClient
          registros={registros}
          puedeEditar={admin ? can.edit(admin.role) : false}
          gestionOk={gestionOk}
        />
      </div>
    </>
  )
}
