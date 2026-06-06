import { getAdminUser, can } from '@/lib/admin/auth'
import { getRows } from '@/lib/admin/data'
import { AdminHeader, SetupNotice } from '@/components/admin/ui'
import FormulariosClient from './FormulariosClient'

export default async function FormulariosPage() {
  const admin = await getAdminUser()
  const { rows, ok } = await getRows('form_submissions')

  return (
    <>
      <AdminHeader titulo="Formularios y solicitudes" subtitulo={`${rows.length} solicitudes recibidas`} />
      <div className="p-6 lg:p-8 space-y-6">
        {!ok && <SetupNotice />}
        <FormulariosClient rows={rows as never} puedeEditar={admin ? can.edit(admin.role) : false} />
      </div>
    </>
  )
}
