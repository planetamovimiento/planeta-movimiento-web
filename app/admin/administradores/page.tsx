import { redirect } from 'next/navigation'
import { getAdminUser } from '@/lib/admin/auth'
import { getRows } from '@/lib/admin/data'
import { AdminHeader, SetupNotice } from '@/components/admin/ui'
import AdminsManager from './AdminsManager'

export default async function AdministradoresPage() {
  const admin = await getAdminUser()
  if (!admin || admin.role !== 'principal') redirect('/admin')

  const { rows, ok } = await getRows('admin_users')

  return (
    <>
      <AdminHeader titulo="Administradores" subtitulo="Gestiona quién puede acceder al panel y con qué permisos" />
      <div className="p-6 lg:p-8 space-y-6">
        {!ok && <SetupNotice />}
        <AdminsManager admins={rows as never} miEmail={admin.email} />
      </div>
    </>
  )
}
