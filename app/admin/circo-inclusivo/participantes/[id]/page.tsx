import Link from 'next/link'
import { notFound } from 'next/navigation'
import { requireSeccion } from '@/lib/admin/auth'
import { getParticipante, getGrupos, getEvaluacionesDe, getEvalsSesionDe, getSesiones } from '@/lib/circo-inclusivo/data'
import { AdminHeader } from '@/components/admin/ui'
import { VALORACIONES, ESTADOS, labelEstado, labelAsistencia, CRITERIOS_SESION, type Evaluacion, type EvalSesion, type Sesion } from '@/lib/circo-inclusivo/tipos'
import { resumenMensual, resumenTrimestral, type ResumenMes, type ResumenTrimestre } from '@/lib/circo-inclusivo/medias'

export const dynamic = 'force-dynamic'

function edad(fecha?: string | null): number | null {
  if (!fecha) return null
  const f = new Date(fecha); if (isNaN(f.getTime())) return null
  const h = new Date(); let e = h.getFullYear() - f.getFullYear()
  const m = h.getMonth() - f.getMonth()
  if (m < 0 || (m === 0 && h.getDate() < f.getDate())) e--
  return e
}
const fechaCorta = (s?: string | null) => (s ? new Date(s.slice(0, 10) + 'T00:00:00').toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }) : '—')
const fmt = (n: number | null) => (n == null ? '—' : n.toFixed(2))

export default async function FichaParticipantePage({ params }: { params: Promise<{ id: string }> }) {
  const admin = await requireSeccion('circo-inclusivo')
  const { id } = await params
  const p = await getParticipante(id)
  if (!p) notFound()

  const [grupos, historicas, evalsSesion, sesiones] = await Promise.all([
    getGrupos(), getEvaluacionesDe(id), getEvalsSesionDe(id), getSesiones(),
  ])
  const grupo = grupos.find(g => g.id === p.grupo_id)
  const estadoColor = ESTADOS.find(x => x.valor === p.estado)?.color ?? ''
  const base = `/admin/circo-inclusivo/participantes/${id}`

  const meses = resumenMensual(evalsSesion, sesiones)
  const trimestres = resumenTrimestral(meses)
  const sesionPorId = new Map(sesiones.map(s => [s.id, s]))

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
            <Link href="/admin/circo-inclusivo/sesiones" className="bg-pm-red hover:bg-pm-red-dark text-white font-bold px-4 py-2 rounded-xl text-sm">Evaluar en una sesión →</Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-3">
            <h2 className="font-black text-pm-navy">Datos personales</h2>
            <Dato label="Nombre completo" valor={`${p.nombre} ${p.apellidos ?? ''}`.trim()} />
            <Dato label="Edad" valor={edad(p.fecha_nacimiento) != null ? `${edad(p.fecha_nacimiento)} años` : '—'} />
            <Dato label="Fecha de nacimiento" valor={fechaCorta(p.fecha_nacimiento)} />
            <Dato label="Entidad o centro" valor={p.entidad ?? '—'} />
            <Dato label="Grupo" valor={grupo?.nombre ?? '—'} />
            <Dato label="Actividad" valor={p.actividad ?? '—'} />
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Nota titulo="Necesidades de apoyo" texto={p.necesidades_apoyo} />
              <Nota titulo="Info para el monitor" texto={p.info_monitor} />
              <Nota titulo="Observaciones generales" texto={p.observaciones} />
            </div>

            {/* Resumen mensual automático */}
            <Bloque titulo="Evaluación mensual (automática)" sub="Media de las sesiones válidas de cada mes. Provisional hasta el cierre.">
              {meses.length === 0
                ? <Vacio texto="Aún no hay medias: se calculan solas al evaluar sesiones." />
                : <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{meses.map(m => <TarjetaMes key={m.clave} m={m} />)}</div>}
            </Bloque>

            {/* Resumen trimestral automático */}
            <Bloque titulo="Evaluación trimestral (automática)" sub="Media de las evaluaciones mensuales del trimestre.">
              {trimestres.length === 0
                ? <Vacio texto="Se calcula automáticamente a partir de los meses." />
                : <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{trimestres.map(t => <TarjetaTrimestre key={t.clave} t={t} />)}</div>}
            </Bloque>

            {/* Evaluaciones de sesión */}
            <Bloque titulo="Evaluaciones de sesión" sub={`${evalsSesion.length} registro(s)`}>
              {evalsSesion.length === 0
                ? <Vacio texto="Sin evaluaciones de sesión todavía." />
                : <div className="divide-y divide-gray-50 -mx-2">
                    {evalsSesion
                      .slice()
                      .sort((a, b) => (sesionPorId.get(b.sesion_id)?.fecha ?? '').localeCompare(sesionPorId.get(a.sesion_id)?.fecha ?? ''))
                      .map(e => <FilaSesion key={e.id} e={e} sesion={sesionPorId.get(e.sesion_id)} />)}
                  </div>}
            </Bloque>

            {/* Histórico manual (se conserva) */}
            {historicas.length > 0 && (
              <Bloque titulo="Evaluaciones anteriores (manuales)" sub="Introducidas a mano antes del cálculo automático. Se conservan como histórico.">
                <div className="divide-y divide-gray-50">
                  {historicas.map(e => <FilaHistorica key={e.id} e={e} base={base} />)}
                </div>
              </Bloque>
            )}
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
function Bloque({ titulo, sub, children }: { titulo: string; sub?: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-5 py-3 border-b border-gray-100">
        <div className="font-black text-pm-navy text-sm">{titulo}</div>
        {sub && <div className="text-xs text-gray-400 mt-0.5">{sub}</div>}
      </div>
      <div className="p-4">{children}</div>
    </div>
  )
}
function Vacio({ texto }: { texto: string }) { return <p className="text-center text-gray-400 text-sm py-4">{texto}</p> }

function Criterios({ pc }: { pc: Record<string, number | null> }) {
  return (
    <div className="flex flex-wrap gap-1.5 mt-2">
      {CRITERIOS_SESION.map(c => (
        <span key={c.key} className="text-[11px] bg-pm-bg border border-gray-100 rounded-md px-1.5 py-0.5 text-gray-600">
          {c.label.split(' ')[0]}: <strong className="text-pm-navy">{fmt(pc[c.key])}</strong>
        </span>
      ))}
    </div>
  )
}

function TarjetaMes({ m }: { m: ResumenMes }) {
  return (
    <div className="border border-gray-100 rounded-xl p-3">
      <div className="flex items-center justify-between">
        <span className="font-bold text-pm-navy capitalize text-sm">{m.label}</span>
        <span className="text-2xl font-black text-pm-navy tabular-nums">{fmt(m.mediaGeneral)}</span>
      </div>
      <div className="text-xs text-gray-400 mt-0.5">
        {m.validas} sesión(es) válida(s) · {m.asistencias} asist. · {m.ausencias} ausen.
        {m.provisional && <span className="ml-1 text-amber-600 font-semibold">· provisional</span>}
      </div>
      <Criterios pc={m.porCriterio} />
    </div>
  )
}

function TarjetaTrimestre({ t }: { t: ResumenTrimestre }) {
  return (
    <div className="border border-gray-100 rounded-xl p-3">
      <div className="flex items-center justify-between">
        <span className="font-bold text-pm-navy text-sm">{t.label}</span>
        <span className="text-2xl font-black text-pm-navy tabular-nums">{fmt(t.mediaGeneral)}</span>
      </div>
      <div className="text-xs text-gray-400 mt-0.5">
        {t.provisional
          ? <span className="text-amber-600 font-semibold">Provisional · {t.mesesConDatos} de 3 meses</span>
          : <span>3 de 3 meses</span>}
      </div>
      <Criterios pc={t.porCriterio} />
    </div>
  )
}

function FilaSesion({ e, sesion }: { e: EvalSesion; sesion?: Sesion }) {
  const ausente = e.asistencia !== 'asiste'
  return (
    <div className="flex flex-wrap items-center gap-3 px-2 py-2 text-sm">
      <span className="font-semibold text-pm-navy w-28">{fechaCorta(sesion?.fecha)}</span>
      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${ausente ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>{labelAsistencia(e.asistencia)}</span>
      {e.estado === 'borrador' && <span className="text-xs text-gray-400">borrador</span>}
      <span className="ml-auto text-lg font-black text-pm-navy tabular-nums">{ausente ? '—' : fmt(e.media)}</span>
    </div>
  )
}

function FilaHistorica({ e, base }: { e: Evaluacion; base: string }) {
  const val = VALORACIONES.find(v => v.valor === e.valoracion_global)
  return (
    <div className="flex flex-wrap items-center gap-3 px-1 py-2 text-sm">
      <span className="font-semibold text-pm-navy w-28">{fechaCorta(e.fecha)}</span>
      <span className="text-xs text-gray-400 uppercase">{e.tipo}</span>
      {e.periodo && <span className="text-xs text-gray-400">{e.periodo}</span>}
      {val && <span className={`text-xs font-semibold border px-2 py-0.5 rounded-full ${val.color}`}>{val.label}</span>}
      <div className="ml-auto flex gap-3">
        <Link href={`${base}/informe?tipo=${e.tipo}&eval=${e.id}`} target="_blank" className="text-xs font-semibold text-pm-navy hover:text-pm-red">Informe</Link>
        <Link href={`${base}/evaluar?tipo=${e.tipo}&eval=${e.id}`} className="text-xs font-semibold text-gray-500 hover:text-pm-red">Editar</Link>
      </div>
    </div>
  )
}
