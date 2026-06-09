import { requireSeccion } from '@/lib/admin/auth'
import { getEvaluaciones, getParticipantes, getGrupos } from '@/lib/circo-inclusivo/data'
import { AdminHeader } from '@/components/admin/ui'
import CircoNav from '../CircoNav'
import EvaluacionesClient from './EvaluacionesClient'

export const dynamic = 'force-dynamic'

export default async function EvaluacionesPage() {
  await requireSeccion('circo-inclusivo')
  const [evaluaciones, participantes, grupos] = await Promise.all([
    getEvaluaciones(), getParticipantes(), getGrupos(),
  ])

  return (
    <>
      <AdminHeader
        titulo={<span className="flex items-center gap-2"><span>🤸</span> Circo Inclusivo · Evaluaciones</span>}
        subtitulo="Histórico de evaluaciones mensuales y trimestrales"
      />
      <CircoNav />
      <EvaluacionesClient evaluaciones={evaluaciones} participantes={participantes} grupos={grupos} />
    </>
  )
}
