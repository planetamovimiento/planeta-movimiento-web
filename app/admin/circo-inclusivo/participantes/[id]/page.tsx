import Link from 'next/link'
import { notFound } from 'next/navigation'
import { requireSeccion } from '@/lib/admin/auth'
import { getParticipante, getGrupos, getEvaluacionesDe } from '@/lib/circo-inclusivo/data'
import { AdminHeader } from '@/components/admin/ui'
import { VALORACIONES, ESTADOS, labelEstado, type Evaluacion } from '@/lib/circo-inclusivo/tipos'

export const dynamic = 'force-dynamic'

function edad(fecha?: string | null): number | null {
  if (!fecha) return null
  const f = new Date(fecha); if (isNaN(f.getTime())) return null
  const h = new Date(); let e = h.getFullYear() - f.getFullYear()
  const m = h.getMonth() - f.getMonth()
  if (m < 0 || (m === 0 && h.getDate() < f.getDate())) e--
  return e
}
const fechaCorta = (s?: string | null) => (s ? new Date(s).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }) : '—')

export default async function FichaParticipantePage({ params }: { params: Promise<{ id: string }> }) {
  const admin = await requireSeccion('circo-inclusivo')
  const { id } = await params
  const p = await getParticipante(id)
  if (!p) notFound()

  const [grupos, evals] = await Promise.all([getGrupos(), getEvaluacionesDe(id)])
  const grupo = grupos.find(g => g.id === p.grupo_id)
  const puedeEvaluar = admin.role === 'principal' || admin.role === 'gestor'
  const estadoColor = ESTADOS.find(x => x.valor === p.estado)?.color ?? ''

  const mensuales = evals.filter(e => e.tipo === 'mensual')
  const trimestrales = evals.filter(e => e.tipo === 'trimestral')
  const base = `/admin/circo-inclusivo/participantes/${id}`

  return (
    <>
      <AdminHeader
        titulo={<span className="flex items-center gap-2"><span>🤸</span> {p.nombre} {p.apellidos ?? ''}</span>}
        subtitulo="Ficha del participante · Circo Inclusivo"
      />
      <div className="p-4 lg:p-8 space-y-6">
        <div className="flex flex-wrap items-center gap-3">
          <Link href="/admin/circo-inclusivo" className="text-sm text-gray-500 hover:text-pm-red">← Participantes</Link>
          <span className={`text-xs font-semibold border px-2 py-0.5 rounded-full ${estadoColor}`}>{labelEstado(p.estado)}</span>
          <div className="ml-auto flex flex-wrap gap-2">
            <Link href={`${base}/informe?tipo=completo`} target="_blank" className="bg-pm-navy hover:bg-pm-navy-md text-white font-bold px-4 py-2 rounded-xl text-sm">📄 Informe completo</Link>
            {puedeEvaluar && <Link href={`${base}/evaluar?tipo=mensual`} className="bg-pm-red hover:bg-pm-red-dark text-white font-bold px-4 py-2 rounded-xl text-sm">+ Eval. mensual</Link>}
            {puedeEvaluar && <Link href={`${base}/evaluar?tipo=trimestral`} className="bg-pm-red hover:bg-pm-red-dark text-white font-bold px-4 py-2 rounded-xl text-sm">+ Eval. trimestral</Link>}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Datos personales */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-3">
            <h2 className="font-black text-pm-navy">Datos personales</h2>
            <Dato label="Nombre completo" valor={`${p.nombre} ${p.apellidos ?? ''}`.trim()} />
            <Dato label="Edad" valor={edad(p.fecha_nacimiento) != null ? `${edad(p.fecha_nacimiento)} años` : '—'} />
            <Dato label="Fecha de nacimiento" valor={fechaCorta(p.fecha_nacimiento)} />
            <Dato label="Entidad o centro" valor={p.entidad ?? '—'} />
            <Dato label="Grupo" valor={grupo?.nombre ?? '—'} />
            <Dato label="Actividad" valor={p.actividad ?? '—'} />
          </div>

          {/* Notas */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Nota titulo="Necesidades de apoyo" texto={p.necesidades_apoyo} />
              <Nota titulo="Info para el monitor" texto={p.info_monitor} />
              <Nota titulo="Observaciones generales" texto={p.observaciones} />
            </div>

            <BloqueEvals titulo="Evaluaciones mensuales" tipo="mensual" evals={mensuales} base={base} />
            <BloqueEvals titulo="Evaluaciones trimestrales" tipo="trimestral" evals={trimestrales} base={base} />
          </div>
        </div>
      </div>
    </>
  )
}

function Dato({ label, valor }: { label: string; valor: string }) {
  return (
    <div className="flex justify-between gap-4 text-sm border-b border-gray-50 pb-2">
      <span className="text-gray-400">{label}</span>
      <span className="text-pm-navy font-semibold text-right">{valor}</span>
    </div>
  )
}

function Nota({ titulo, texto }: { titulo: string; texto: string | null }) {
  return (
    <div>
      <div className="text-xs font-black text-gray-400 uppercase tracking-wider mb-1">{titulo}</div>
      <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{texto || '—'}</p>
    </div>
  )
}

function BloqueEvals({ titulo, tipo, evals, base }: { titulo: string; tipo: 'mensual' | 'trimestral'; evals: Evaluacion[]; base: string }) {
  const fechaCorta = (s?: string | null) => (s ? new Date(s).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }) : '—')
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-5 py-3 border-b border-gray-100 font-black text-pm-navy text-sm">{titulo} <span className="text-gray-400 font-medium">({evals.length})</span></div>
      {evals.length === 0 ? (
        <div className="p-6 text-center text-gray-400 text-sm">Sin evaluaciones registradas.</div>
      ) : (
        <div className="divide-y divide-gray-50">
          {evals.map(e => {
            const val = VALORACIONES.find(v => v.valor === e.valoracion_global)
            return (
              <div key={e.id} className="flex flex-wrap items-center gap-3 px-5 py-3 text-sm">
                <span className="font-semibold text-pm-navy w-28">{fechaCorta(e.fecha)}</span>
                {e.periodo && <span className="text-xs text-gray-400">{e.periodo}</span>}
                {val && <span className={`text-xs font-semibold border px-2 py-0.5 rounded-full ${val.color}`}>{val.label}</span>}
                <span className="text-xs text-gray-400">{e.profesional ?? ''}</span>
                <div className="ml-auto flex gap-3">
                  <Link href={`${base}/informe?tipo=${tipo}&eval=${e.id}`} target="_blank" className="text-xs font-semibold text-pm-navy hover:text-pm-red">Informe</Link>
                  <Link href={`${base}/evaluar?tipo=${tipo}&eval=${e.id}`} className="text-xs font-semibold text-gray-500 hover:text-pm-red">Editar</Link>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
