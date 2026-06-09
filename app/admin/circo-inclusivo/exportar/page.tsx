import { requireSeccion } from '@/lib/admin/auth'
import { getParticipantes, getGrupos, getEvaluaciones } from '@/lib/circo-inclusivo/data'
import { AdminHeader } from '@/components/admin/ui'
import CircoNav from '../CircoNav'
import ExportarClient from './ExportarClient'

export const dynamic = 'force-dynamic'

export default async function ExportarPage() {
  await requireSeccion('circo-inclusivo')
  const [participantes, grupos, evaluaciones] = await Promise.all([
    getParticipantes(), getGrupos(), getEvaluaciones(),
  ])

  return (
    <>
      <AdminHeader
        titulo={<span className="flex items-center gap-2"><span>🤸</span> Circo Inclusivo · Exportar</span>}
        subtitulo="Descarga participantes y evaluaciones en Excel o CSV"
      />
      <CircoNav />
      <ExportarClient participantes={participantes} grupos={grupos} evaluaciones={evaluaciones} />
    </>
  )
}
