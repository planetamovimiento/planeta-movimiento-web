import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getProducto } from '@/lib/productos/store'
import { AdminHeader, EstadoBadge } from '@/components/admin/ui'
import EditorProducto from './EditorProducto'
import { requireSeccion } from '@/lib/admin/auth'

export const dynamic = 'force-dynamic'

export default async function EditarProductoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await requireSeccion('productos')
  const producto = await getProducto(id)
  if (!producto) notFound()

  return (
    <>
      <AdminHeader titulo={<span className="flex items-center gap-2"><span>{producto.icon}</span> {producto.nombre}</span>} subtitulo="Producto · Colchonetas" />
      <div className="p-6 lg:p-8">
        <div className="flex items-center gap-3 mb-6 text-sm">
          <Link href="/admin/productos" className="text-gray-500 hover:text-pm-red">← Productos</Link>
          <span className="text-gray-300">/</span>
          <span className="text-pm-navy font-semibold">{producto.nombre}</span>
          <EstadoBadge estado={producto.activo ? 'activo' : 'inactivo'} />
          {producto.updatedAt && <span className="ml-auto text-xs text-gray-400">Última edición: {new Date(producto.updatedAt).toLocaleString('es-ES')}{producto.updatedBy ? ` · ${producto.updatedBy}` : ''}</span>}
        </div>
        <EditorProducto producto={producto} />
      </div>
    </>
  )
}
