import { getAdminUser } from '@/lib/admin/auth'
import { getBalanceData } from '@/lib/balance/data'
import { AdminHeader } from '@/components/admin/ui'
import BalanceClient from './BalanceClient'

export const dynamic = 'force-dynamic'

export default async function BalancePage() {
  const admin = await getAdminUser()
  const data = await getBalanceData()

  return (
    <>
      <AdminHeader titulo="💰 Balance Económico" subtitulo="Ingresos automáticos, gastos, beneficio y control económico de la empresa" />
      <div className="p-4 lg:p-6">
        <BalanceClient
          ingresos={data.ingresos}
          gastos={data.gastos}
          categorias={data.categorias}
          setupOk={data.setupOk}
          role={admin?.role ?? 'lectura'}
        />
      </div>
    </>
  )
}
