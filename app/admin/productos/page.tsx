import { getRows } from '@/lib/admin/data'
import { AdminHeader, EstadoBadge, EmptyState, SetupNotice } from '@/components/admin/ui'

export default async function ProductosPage() {
  const [{ rows: productos, ok }, { rows: pedidos }] = await Promise.all([
    getRows('products', 'updated_at'),
    getRows('product_orders'),
  ])
  const eur = (n: number) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(n || 0)

  return (
    <>
      <AdminHeader titulo="Productos y pedidos" subtitulo="Colchonetas, stock y solicitudes de personalización" />
      <div className="p-6 lg:p-8 space-y-8">
        {!ok && <SetupNotice />}

        {/* Productos */}
        <div>
          <h2 className="font-black text-pm-navy mb-3">Catálogo</h2>
          {productos.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
              <EmptyState icon="🛒" titulo="Sin productos en la base de datos"
                desc="Las colchonetas se muestran en la web desde el código. Sincronízalas aquí para editar precios y stock desde el panel." />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {productos.map((p: Record<string, unknown>) => (
                <div key={p.id as string} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-black text-pm-navy">{p.nombre as string}</h3>
                    <EstadoBadge estado={p.activo ? 'activo' : 'inactivo'} />
                  </div>
                  <div className="text-2xl font-black text-pm-navy">{eur(Number(p.precio))}</div>
                  <div className="text-xs text-gray-400 mt-1">Stock: {p.stock != null ? (p.stock as number) : '—'}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pedidos */}
        <div>
          <h2 className="font-black text-pm-navy mb-3">Pedidos y personalizaciones</h2>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {pedidos.length === 0 ? (
              <EmptyState icon="📦" titulo="Sin pedidos todavía" desc="Los pedidos del carrito y las solicitudes de personalización aparecerán aquí." />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 text-left text-xs text-gray-500 uppercase tracking-wider">
                      <th className="px-4 py-3 font-semibold">Cliente</th>
                      <th className="px-4 py-3 font-semibold">Tipo</th>
                      <th className="px-4 py-3 font-semibold">Total</th>
                      <th className="px-4 py-3 font-semibold">Estado</th>
                      <th className="px-4 py-3 font-semibold">Fecha</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {pedidos.map((o: Record<string, unknown>) => (
                      <tr key={o.id as string} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-semibold text-pm-navy">{(o.cliente_nombre as string) || '—'}</td>
                        <td className="px-4 py-3 text-gray-600 capitalize">{(o.tipo as string) || 'pedido'}</td>
                        <td className="px-4 py-3 font-bold text-pm-navy">{o.total != null ? eur(Number(o.total)) : '—'}</td>
                        <td className="px-4 py-3"><EstadoBadge estado={(o.estado as string) || 'nuevo'} /></td>
                        <td className="px-4 py-3 text-gray-600">{o.created_at ? new Date(o.created_at as string).toLocaleDateString('es-ES') : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
