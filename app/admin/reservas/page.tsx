import { getAdminUser, can } from '@/lib/admin/auth'
import { getBookings } from '@/lib/admin/data'
import { AdminHeader, SetupNotice } from '@/components/admin/ui'
import ReservasTable from './ReservasTable'

export default async function ReservasPage() {
  const admin = await getAdminUser()
  const { rows, ok } = await getBookings()

  return (
    <>
      <AdminHeader titulo="Reservas" subtitulo={`${rows.length} reservas en total`} />
      <div className="p-6 lg:p-8 space-y-6">
        {!ok && <SetupNotice />}
        <ReservasTable reservas={rows} puedeEditar={admin ? can.edit(admin.role) : false} />
      </div>
    </>
  )
}
