import { getAdminUser, can } from '@/lib/admin/auth'
import { getClientes } from '@/lib/clientes/data'
import { AdminHeader } from '@/components/admin/ui'
import ClientesClient from './ClientesClient'

export const dynamic = 'force-dynamic'

export default async function ClientesPage() {
  const admin = await getAdminUser()
  const { clientes } = await getClientes()

  return (
    <>
      <AdminHeader titulo="Clientes" subtitulo={`${clientes.length} clientes (Club, reservas y solicitudes)`} />
      <div className="p-4 lg:p-6">
        <ClientesClient clientes={clientes} puedeEditar={admin ? can.edit(admin.role) : false} />
      </div>
    </>
  )
}
