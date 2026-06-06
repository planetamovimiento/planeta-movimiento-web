import { getRows } from '@/lib/admin/data'
import { AdminHeader, EmptyState, SetupNotice } from '@/components/admin/ui'

export default async function ClientesPage() {
  const { rows, ok } = await getRows('customers')

  return (
    <>
      <AdminHeader titulo="Clientes" subtitulo={`${rows.length} contactos en la base de datos`} />
      <div className="p-6 lg:p-8 space-y-6">
        {!ok && <SetupNotice />}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {rows.length === 0 ? (
            <EmptyState icon="👥" titulo="Aún no hay clientes" desc="Los clientes se añaden automáticamente desde reservas, formularios y compras." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-left text-xs text-gray-500 uppercase tracking-wider">
                    <th className="px-4 py-3 font-semibold">Nombre</th>
                    <th className="px-4 py-3 font-semibold">Email</th>
                    <th className="px-4 py-3 font-semibold">Teléfono</th>
                    <th className="px-4 py-3 font-semibold">Último contacto</th>
                    <th className="px-4 py-3 font-semibold">Alta</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {rows.map((c: Record<string, unknown>) => (
                    <tr key={c.id as string} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-semibold text-pm-navy">{(c.nombre as string) || '—'}</td>
                      <td className="px-4 py-3 text-gray-600">{(c.email as string) || '—'}</td>
                      <td className="px-4 py-3 text-gray-600">{(c.telefono as string) || '—'}</td>
                      <td className="px-4 py-3 text-gray-600">{c.ultimo_contacto ? new Date(c.ultimo_contacto as string).toLocaleDateString('es-ES') : '—'}</td>
                      <td className="px-4 py-3 text-gray-400 text-xs">{c.created_at ? new Date(c.created_at as string).toLocaleDateString('es-ES') : '—'}</td>
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
