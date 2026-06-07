import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getServicio } from '@/lib/servicios/store'
import { AdminHeader, EstadoBadge } from '@/components/admin/ui'
import EditorServicio from './EditorServicio'
import { getAdminUser, can } from '@/lib/admin/auth'
import { getMananaMagica } from '@/lib/eventos/store'
import EditorMananaMagica from '@/app/admin/manana-magica/EditorMananaMagica'

export const dynamic = 'force-dynamic'

export default async function EditarServicioPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  // Mañanas Mágicas usa su editor especial (personaje del mes), integrado en Servicios.
  if (id === 'manana-magica') {
    const admin = await getAdminUser()
    const cfg = await getMananaMagica()
    return (
      <>
        <AdminHeader
          titulo={<span className="flex items-center gap-2"><span>✨</span> Mañanas Mágicas</span>}
          subtitulo="Empresa · Eventos · Personaje del mes editable"
        />
        <div className="p-6 lg:p-8">
          <div className="flex items-center gap-3 mb-6 text-sm">
            <Link href="/admin/servicios" className="text-gray-500 hover:text-pm-red">← Servicios</Link>
            <span className="text-gray-300">/</span>
            <span className="text-pm-navy font-semibold">Mañanas Mágicas</span>
          </div>
          <EditorMananaMagica inicial={cfg} puedeEditar={admin ? can.edit(admin.role) : false} />
        </div>
      </>
    )
  }

  const servicio = await getServicio(id)
  if (!servicio) notFound()

  return (
    <>
      <AdminHeader
        titulo={<span className="flex items-center gap-2"><span>{servicio.icon}</span> {servicio.nombre}</span>}
        subtitulo={`${servicio.entidad === 'club' ? 'Club Deportivo Origen' : 'Empresa'} · ${servicio.categoria}`}
      />
      <div className="p-6 lg:p-8">
        <div className="flex items-center gap-3 mb-6 text-sm">
          <Link href="/admin/servicios" className="text-gray-500 hover:text-pm-red">← Servicios</Link>
          <span className="text-gray-300">/</span>
          <span className="text-pm-navy font-semibold">{servicio.nombre}</span>
          <EstadoBadge estado={servicio.estado} />
          {servicio.updatedAt && (
            <span className="ml-auto text-xs text-gray-400">
              Última edición: {new Date(servicio.updatedAt).toLocaleString('es-ES')}{servicio.updatedBy ? ` · ${servicio.updatedBy}` : ''}
            </span>
          )}
        </div>
        <EditorServicio servicio={servicio} />
      </div>
    </>
  )
}
