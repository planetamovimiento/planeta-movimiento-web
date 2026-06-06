import { redirect } from 'next/navigation'
import { getAdminUser, can } from '@/lib/admin/auth'
import { getRows } from '@/lib/admin/data'
import { AdminHeader, EstadoBadge, EmptyState, SetupNotice, Metric } from '@/components/admin/ui'

export default async function PagosPage() {
  const admin = await getAdminUser()
  if (!admin || !can.managePayments(admin.role)) redirect('/admin')

  const { rows, ok } = await getRows('payments', 'fecha')
  const eur = (n: number) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(n || 0)

  const pagados = rows.filter((r: Record<string, unknown>) => r.estado === 'pagado')
  const total = pagados.reduce((s: number, r: Record<string, unknown>) => s + (Number(r.importe) || 0), 0)
  const pendiente = rows.filter((r: Record<string, unknown>) => r.estado === 'pendiente').reduce((s: number, r: Record<string, unknown>) => s + (Number(r.importe) || 0), 0)

  return (
    <>
      <AdminHeader titulo="Pagos" subtitulo={`${rows.length} transacciones`} />
      <div className="p-6 lg:p-8 space-y-6">
        {!ok && <SetupNotice />}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <Metric label="Ingresos cobrados" valor={eur(total)} tono="green" />
          <Metric label="Pendiente de cobro" valor={eur(pendiente)} tono="amber" />
          <Metric label="Transacciones" valor={rows.length} tono="navy" />
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {rows.length === 0 ? (
            <EmptyState icon="💳" titulo="Sin pagos registrados" desc="Los pagos aparecerán aquí cuando se registren reservas con cobro." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-left text-xs text-gray-500 uppercase tracking-wider">
                    <th className="px-4 py-3 font-semibold">Cliente</th>
                    <th className="px-4 py-3 font-semibold">Servicio</th>
                    <th className="px-4 py-3 font-semibold">Importe</th>
                    <th className="px-4 py-3 font-semibold">Método</th>
                    <th className="px-4 py-3 font-semibold">Estado</th>
                    <th className="px-4 py-3 font-semibold">Referencia</th>
                    <th className="px-4 py-3 font-semibold">Fecha</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {rows.map((p: Record<string, unknown>) => (
                    <tr key={p.id as string} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-semibold text-pm-navy">{(p.cliente_nombre as string) || '—'}</td>
                      <td className="px-4 py-3 text-gray-600">{(p.servicio as string) || '—'}</td>
                      <td className="px-4 py-3 font-bold text-pm-navy">{eur(Number(p.importe))}</td>
                      <td className="px-4 py-3 text-gray-600 capitalize">{(p.metodo as string) || '—'}</td>
                      <td className="px-4 py-3"><EstadoBadge estado={(p.estado as string) || 'pendiente'} /></td>
                      <td className="px-4 py-3 text-gray-400 text-xs">{(p.referencia as string) || '—'}</td>
                      <td className="px-4 py-3 text-gray-600">{p.fecha ? new Date(p.fecha as string).toLocaleDateString('es-ES') : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
