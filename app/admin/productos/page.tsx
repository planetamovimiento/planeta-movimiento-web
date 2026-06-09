import Link from 'next/link'
import { getRows } from '@/lib/admin/data'
import { getProductos } from '@/lib/productos/store'
import { AdminHeader, EstadoBadge, EmptyState, SetupNotice } from '@/components/admin/ui'
import { requireSeccion } from '@/lib/admin/auth'

export const dynamic = 'force-dynamic'

export default async function ProductosPage() {
  await requireSeccion('productos')
  const productos = await getProductos()
  const { rows: pedidos, ok } = await getRows('product_orders')
  const eur = (n: number) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(n || 0)

  return (
    <>
      <AdminHeader titulo="Productos y pedidos" subtitulo="Colchonetas — edita precios, colores, variantes y stock" />
      <div className="p-6 lg:p-8 space-y-8">

        {/* Productos */}
        <div>
          <h2 className="font-black text-pm-navy mb-3">Catálogo</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {productos.map(p => (
              <Link key={p.id} href={`/admin/productos/${p.id}`}
                className="group bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md hover:border-pm-red/30 transition-all">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{p.icon}</span>
                    <h3 className="font-black text-pm-navy group-hover:text-pm-red transition-colors">{p.nombre}</h3>
                  </div>
                  <EstadoBadge estado={p.activo ? 'activo' : 'inactivo'} />
                </div>
                <div className="text-2xl font-black text-pm-navy">desde {eur(Number(p.precioDesde))}</div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-gray-400">Stock: {p.stock != null ? p.stock : 'sin límite'} · {p.variantes.length} variante(s)</span>
                  <span className="text-xs font-bold text-pm-red">Editar →</span>
                </div>
              </Link>
            ))}
          </div>
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
