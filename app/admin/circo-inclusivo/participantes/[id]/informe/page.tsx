import Link from 'next/link'
import { notFound } from 'next/navigation'
import { requireSeccion } from '@/lib/admin/auth'
import { getParticipante, getGrupos, getEvaluacionesDe, getEvalsSesionDe, getSesiones } from '@/lib/circo-inclusivo/data'
import { esquemaDe, ESCALA, CRITERIOS_SESION, evalCuenta, labelValoracion, type Evaluacion, type EvalSesion, type Sesion } from '@/lib/circo-inclusivo/tipos'
import { resumenMensual, resumenTrimestral, type ResumenMes, type ResumenTrimestre } from '@/lib/circo-inclusivo/medias'
import ImprimirBoton from './ImprimirBoton'

export const dynamic = 'force-dynamic'

const PRINT_CSS = `
@media print {
  aside { display: none !important; }
  .no-print { display: none !important; }
  body { background: #fff !important; }
  .informe-hoja.pm-print-root { position: static !important; inset: auto !important; width: 100% !important; }
  .informe-hoja { box-shadow: none !important; border: none !important; margin: 0 !important; max-width: 100% !important; }
  .informe-eval { break-inside: avoid; }
}
`

function edad(fecha?: string | null): number | null {
  if (!fecha) return null
  const f = new Date(fecha); if (isNaN(f.getTime())) return null
  const h = new Date(); let e = h.getFullYear() - f.getFullYear()
  const m = h.getMonth() - f.getMonth()
  if (m < 0 || (m === 0 && h.getDate() < f.getDate())) e--
  return e
}
const fechaLarga = (s?: string | null) => (s ? new Date(s).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' }) : '—')

export default async function InformePage(
  { params, searchParams }:
  { params: Promise<{ id: string }>; searchParams: Promise<{ tipo?: string; eval?: string; clave?: string }> },
) {
  await requireSeccion('circo-inclusivo')
  const { id } = await params
  const sp = await searchParams
  const p = await getParticipante(id)
  if (!p) notFound()

  const [grupos, evals, evalsSesion, sesiones] = await Promise.all([getGrupos(), getEvaluacionesDe(id), getEvalsSesionDe(id), getSesiones()])
  const grupo = grupos.find(g => g.id === p.grupo_id)

  // Medias automáticas (de las evaluaciones de sesión): mes = YYYY-MM, trimestre = YYYY-Tn.
  const meses = resumenMensual(evalsSesion, sesiones)
  const trimestres = resumenTrimestral(meses)
  const sesionPorId = new Map(sesiones.map(s => [s.id, s]))

  const modo = ['completo', 'trimestral', 'mes', 'trimestre'].includes(sp.tipo ?? '') ? sp.tipo! : 'mensual'
  let aMostrar: Evaluacion[] = []
  let autoMeses: ResumenMes[] = []
  let autoTrimestres: ResumenTrimestre[] = []
  let titulo = 'Informe del participante'
  if (modo === 'completo') {
    aMostrar = evals
    autoMeses = meses
    autoTrimestres = trimestres
    titulo = 'Informe completo del participante'
  } else if (modo === 'mes') {
    autoMeses = meses.filter(m => m.clave === sp.clave).slice(0, 1)
    titulo = 'Informe mensual'
  } else if (modo === 'trimestre') {
    autoTrimestres = trimestres.filter(t => t.clave === sp.clave).slice(0, 1)
    autoMeses = autoTrimestres[0]?.meses ?? []
    titulo = 'Informe trimestral'
  } else {
    const delTipo = evals.filter(e => e.tipo === modo)
    const sel = sp.eval ? delTipo.find(e => e.id === sp.eval) : delTipo[0]
    aMostrar = sel ? [sel] : []
    titulo = modo === 'trimestral' ? 'Informe trimestral' : 'Informe mensual'
  }

  return (
    <div className="bg-gray-100 min-h-screen py-6">
      <style dangerouslySetInnerHTML={{ __html: PRINT_CSS }} />

      {/* Barra de acciones (no se imprime) */}
      <div className="no-print pm-no-print max-w-3xl mx-auto px-4 mb-4 flex items-center justify-between">
        <Link href={`/admin/circo-inclusivo/participantes/${id}`} className="text-sm text-gray-500 hover:text-pm-red">← Volver a la ficha</Link>
        <ImprimirBoton />
      </div>

      {/* Hoja del informe */}
      <div className="informe-hoja pm-print-root max-w-3xl mx-auto bg-white shadow-sm rounded-lg p-8 text-[13px] text-gray-800">
        {/* Cabecera */}
        <div className="flex items-center gap-4 border-b-2 border-pm-red pb-4 mb-5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-origen.png" alt="Club Deportivo Origen" className="h-16 w-auto" />
          <div className="flex-1">
            <div className="font-black text-pm-navy text-lg leading-tight">Club Deportivo Origen</div>
            <div className="text-xs text-gray-500">Circo Inclusivo y Psicomotricidad</div>
          </div>
          <div className="text-right">
            <div className="font-black text-pm-red uppercase text-sm">{titulo}</div>
            <div className="text-xs text-gray-500">{fechaLarga(new Date().toISOString())}</div>
          </div>
        </div>

        {/* Datos del participante */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-1 mb-5">
          <Campo k="Participante" v={`${p.nombre} ${p.apellidos ?? ''}`.trim()} />
          <Campo k="Edad" v={edad(p.fecha_nacimiento) != null ? `${edad(p.fecha_nacimiento)} años` : '—'} />
          <Campo k="Entidad / centro" v={p.entidad ?? '—'} />
          <Campo k="Grupo" v={grupo?.nombre ?? '—'} />
          <Campo k="Actividad" v={p.actividad ?? '—'} />
          <Campo k="Estado" v={p.estado} />
        </div>

        {aMostrar.length === 0 && autoMeses.length === 0 && autoTrimestres.length === 0 ? (
          <p className="text-gray-400 italic">Este participante todavía no tiene evaluaciones de este tipo.</p>
        ) : (
          <>
            <div className="mb-4 border border-gray-200 rounded-lg px-4 py-2 bg-gray-50">
              <div className="text-xs font-black text-pm-navy uppercase tracking-wide mb-1">Escala de valoración</div>
              <div className="flex flex-wrap gap-x-5 gap-y-0.5 text-xs text-gray-600">
                {ESCALA.map(s => <span key={s.valor}><strong className="text-pm-red">{s.valor}</strong> · {s.label}</span>)}
              </div>
            </div>
            {autoTrimestres.map(t => <ResumenImpreso key={t.clave} titulo={`Evaluación trimestral · ${t.label}`} r={t}
              detalle={t.provisional ? `Provisional · ${t.mesesConDatos} de 3 meses con datos` : '3 de 3 meses con datos'} />)}
            {autoMeses.map(m => <ResumenImpreso key={m.clave} titulo={`Evaluación mensual · ${m.label}`} r={m}
              detalle={`${m.validas} sesión(es) válida(s) · ${m.asistencias} asistencia(s) · ${m.ausencias} ausencia(s)`}
              observaciones={observacionesDelMes(evalsSesion, sesionPorId, m.clave)} />)}
            {aMostrar.map(ev => <EvaluacionImpresa key={ev.id} ev={ev} />)}
          </>
        )}

        <div className="mt-8 pt-4 border-t border-gray-200 flex justify-between text-xs text-gray-500">
          <span>Club Deportivo Origen</span>
          <span>Documento generado el {fechaLarga(new Date().toISOString())}</span>
        </div>
      </div>
    </div>
  )
}

function Campo({ k, v }: { k: string; v: string }) {
  return <div><span className="text-gray-400">{k}: </span><span className="font-semibold text-pm-navy capitalize">{v}</span></div>
}

/** Observaciones escritas en las sesiones válidas de un mes, por fecha. */
function observacionesDelMes(evals: EvalSesion[], sesionPorId: Map<string, Sesion>, clave: string) {
  return evals
    .map(e => ({ e, fecha: sesionPorId.get(e.sesion_id)?.fecha ?? '' }))
    .filter(({ e, fecha }) => fecha.startsWith(clave) && evalCuenta(e) && e.observaciones?.trim())
    .sort((a, b) => a.fecha.localeCompare(b.fecha))
    .map(({ e, fecha }) => ({ fecha, texto: e.observaciones!.trim() }))
}

const fmt2 = (n: number | null) => (n == null ? '—' : n.toFixed(2))
/** Etiqueta de la escala más cercana a una media (2,6 → «Con supervisión»). */
const escalaDe = (n: number | null) => (n == null ? '' : ESCALA.find(s => s.valor === Math.round(n))?.corto ?? '')

function ResumenImpreso({ titulo, r, detalle, observaciones = [] }: {
  titulo: string
  r: { mediaGeneral: number | null; porCriterio: Record<string, number | null> }
  detalle: string
  observaciones?: { fecha: string; texto: string }[]
}) {
  return (
    <div className="informe-eval mb-6">
      <div className="bg-pm-bg border border-gray-200 rounded-lg px-4 py-2 mb-3 flex flex-wrap gap-x-6 gap-y-0.5 text-xs">
        <span><strong className="text-pm-navy capitalize">{titulo}</strong></span>
        <span>{detalle}</span>
        <span>Media general: <strong className="text-pm-red">{fmt2(r.mediaGeneral)}</strong></span>
      </div>
      <table className="w-full mb-2">
        <tbody>
          {CRITERIOS_SESION.map(c => (
            <tr key={c.key} className="border-b border-gray-100">
              <td className="py-1 pr-3">{c.label}</td>
              <td className="py-1 w-14 text-center font-black text-pm-red tabular-nums">{fmt2(r.porCriterio[c.key])}</td>
              <td className="py-1 w-40 text-gray-500 text-xs">{escalaDe(r.porCriterio[c.key])}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {observaciones.length > 0 && (
        <div className="mt-2 space-y-1">
          <div className="font-semibold text-pm-navy">Observaciones de las sesiones:</div>
          {observaciones.map((o, i) => (
            <div key={i}><span className="text-gray-500">{fechaLarga(o.fecha)}: </span><span className="whitespace-pre-line">{o.texto}</span></div>
          ))}
        </div>
      )}
    </div>
  )
}

function EvaluacionImpresa({ ev }: { ev: Evaluacion }) {
  const esquema = esquemaDe(ev.tipo)
  const escala = (n?: number) => ESCALA.find(s => s.valor === n)?.corto ?? '—'
  const fechaLarga = (s?: string | null) => (s ? new Date(s).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' }) : '—')

  return (
    <div className="informe-eval mb-6">
      <div className="bg-pm-bg border border-gray-200 rounded-lg px-4 py-2 mb-3 flex flex-wrap gap-x-6 gap-y-0.5 text-xs">
        <span><strong className="text-pm-navy capitalize">Evaluación {ev.tipo}</strong></span>
        <span>Fecha: <strong>{fechaLarga(ev.fecha)}</strong></span>
        {ev.periodo && <span>Periodo: <strong>{ev.periodo}</strong></span>}
        {ev.profesional && <span>Profesional: <strong>{ev.profesional}</strong></span>}
      </div>

      {/* Áreas e ítems */}
      {esquema.areas.map(area => (
        <div key={area.area} className="mb-3">
          <div className="font-bold text-pm-navy text-xs uppercase tracking-wide mb-1">{area.area}</div>
          <table className="w-full">
            <tbody>
              {area.items.map(item => (
                <tr key={item.key} className="border-b border-gray-100">
                  <td className="py-1 pr-3">{item.label}</td>
                  <td className="py-1 w-10 text-center font-black text-pm-red">{ev.items?.[item.key] ?? '—'}</td>
                  <td className="py-1 w-40 text-gray-500 text-xs">{ev.items?.[item.key] ? escala(ev.items[item.key]) : ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}

      {/* Campos cualitativos (solo los rellenos) */}
      {esquema.campos.some(c => (ev.textos?.[c.key] ?? '').trim()) && (
        <div className="mt-2 space-y-1.5">
          {esquema.campos.filter(c => (ev.textos?.[c.key] ?? '').trim()).map(c => (
            <div key={c.key}>
              <span className="font-semibold text-pm-navy">{c.label}: </span>
              <span className="whitespace-pre-line">{ev.textos[c.key]}</span>
            </div>
          ))}
        </div>
      )}

      <div className="mt-3 text-sm">
        <span className="text-gray-500">Valoración global: </span>
        <strong className="text-pm-navy">{labelValoracion(ev.valoracion_global)}</strong>
      </div>
    </div>
  )
}
