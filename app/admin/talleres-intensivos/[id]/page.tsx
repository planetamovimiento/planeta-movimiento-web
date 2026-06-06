import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getTaller } from '@/lib/talleres/store'
import { AdminHeader } from '@/components/admin/ui'
import EditorTaller from './EditorTaller'

export const dynamic = 'force-dynamic'

export default async function EditarTallerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const taller = await getTaller(id)
  if (!taller) notFound()

  return (
    <>
      <AdminHeader titulo={<span className="flex items-center gap-2"><span>{taller.icon}</span> {taller.nombre}</span>} subtitulo="Taller intensivo · Club Deportivo Origen" />
      <div className="p-6 lg:p-8">
        <div className="flex items-center gap-3 mb-6 text-sm">
          <Link href="/admin/talleres-intensivos" className="text-gray-500 hover:text-pm-red">← Talleres intensivos</Link>
          {taller.updatedAt && <span className="ml-auto text-xs text-gray-400">Última edición: {new Date(taller.updatedAt).toLocaleString('es-ES')}{taller.updatedBy ? ` · ${taller.updatedBy}` : ''}</span>}
        </div>
        <EditorTaller taller={taller} />
      </div>
    </>
  )
}
