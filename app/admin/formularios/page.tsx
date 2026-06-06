import { getAdminUser, can } from '@/lib/admin/auth'
import { getRows } from '@/lib/admin/data'
import { AdminHeader, SetupNotice } from '@/components/admin/ui'
import FormulariosClient from './FormulariosClient'

export default async function FormulariosPage() {
  const admin = await getAdminUser()
  const { rows, ok } = await getRows('form_submissions')

  // Solo solicitudes de la EMPRESA (las del Club tienen su propia área)
  const empresa = (rows as Record<string, unknown>[]).filter(r => r.tipo !== 'inscripcion_club')

  return (
    <>
      <AdminHeader titulo="Solicitudes de empresa" subtitulo={`${empresa.length} solicitudes (presupuestos, colegios, colchonetas...)`} />
      <div className="p-6 lg:p-8 space-y-6">
        {!ok && <SetupNotice />}
        <FormulariosClient rows={empresa as never} puedeEditar={admin ? can.edit(admin.role) : false} />
      </div>
    </>
  )
}
