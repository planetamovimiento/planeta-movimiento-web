import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { requireSeccion } from '@/lib/admin/auth'
import { getParticipante, getEvaluacion } from '@/lib/circo-inclusivo/data'
import { AdminHeader } from '@/components/admin/ui'
import EvaluacionForm from '../EvaluacionForm'
import type { TipoEvaluacion } from '@/lib/circo-inclusivo/tipos'

export const dynamic = 'force-dynamic'

export default async function EvaluarPage(
  { params, searchParams }:
  { params: Promise<{ id: string }>; searchParams: Promise<{ tipo?: string; eval?: string }> },
) {
  const admin = await requireSeccion('circo-inclusivo')
  const { id } = await params
  const sp = await searchParams

  // Solo principal o gestor pueden evaluar; lectura vuelve a la ficha.
  if (admin.role === 'lectura') redirect(`/admin/circo-inclusivo/participantes/${id}`)

  const tipo: TipoEvaluacion = sp.tipo === 'trimestral' ? 'trimestral' : 'mensual'
  const p = await getParticipante(id)
  if (!p) notFound()
  const evaluacion = sp.eval ? await getEvaluacion(sp.eval) : null

  return (
    <>
      <AdminHeader
        titulo={<span className="flex items-center gap-2"><span>🤸</span> Evaluación {tipo}</span>}
        subtitulo={`${p.nombre} ${p.apellidos ?? ''} · Circo Inclusivo`}
      />
      <div className="p-4 lg:p-8">
        <Link href={`/admin/circo-inclusivo/participantes/${id}`} className="text-sm text-gray-500 hover:text-pm-red">← Volver a la ficha</Link>
        <div className="mt-4">
          <EvaluacionForm participanteId={id} participanteNombre={`${p.nombre} ${p.apellidos ?? ''}`.trim()} tipo={tipo} evaluacion={evaluacion} />
        </div>
      </div>
    </>
  )
}
