import Link from 'next/link'
import { notFound } from 'next/navigation'
import { requireSeccion } from '@/lib/admin/auth'
import { getParticipante, getGrupos, getEvaluacionesDe } from '@/lib/circo-inclusivo/data'
import { esquemaDe, ESCALA, labelValoracion, type Evaluacion } from '@/lib/circo-inclusivo/tipos'
import ImprimirBoton from './ImprimirBoton'

export const dynamic = 'force-dynamic'

const PRINT_CSS = `
@media print {
  aside { display: none !important; }
  .no-print { display: none !important; }
  body { background: #fff !important; }
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
  { params: Promise<{ id: string }>; searchParams: Promise<{ tipo?: string; eval?: string }> },
) {
  await requireSeccion('circo-inclusivo')
  const { id } = await params
  const sp = await searchParams
  const p = await getParticipante(id)
  if (!p) notFound()

  const [grupos, evals] = await Promise.all([getGrupos(), getEvaluacionesDe(id)])
  const grupo = grupos.find(g => g.id === p.grupo_id)

  const modo = sp.tipo === 'completo' ? 'completo' : sp.tipo === 'trimestral' ? 'trimestral' : 'mensual'
  let aMostrar: Evaluacion[] = []
  let titulo = 'Informe del participante'
  if (modo === 'completo') {
    aMostrar = evals
    titulo = 'Informe completo del participante'
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
      <div className="no-print max-w-3xl mx-auto px-4 mb-4 flex items-center justify-between">
        <Link href={`/admin/circo-inclusivo/participantes/${id}`} className="text-sm text-gray-500 hover:text-pm-red">← Volver a la ficha</Link>
        <ImprimirBoton />
      </div>

      {/* Hoja del informe */}
      <div className="informe-hoja max-w-3xl mx-auto bg-white shadow-sm rounded-lg p-8 text-[13px] text-gray-800">
        {/* Cabecera */}
        <div className="flex items-center gap-4 border-b-2 border-pm-red pb-4 mb-5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Planeta Movimiento" className="h-14 w-auto" />
          <div className="flex-1">
            <div className="font-black text-pm-navy text-lg leading-tight">Planeta Movimiento</div>
            <div className="text-xs text-gray-500">Club Deportivo Origen · Circo Inclusivo y Psicomotricidad</div>
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

        {aMostrar.length === 0 ? (
          <p className="text-gray-400 italic">Este participante todavía no tiene evaluaciones de este tipo.</p>
        ) : (
          aMostrar.map(ev => <EvaluacionImpresa key={ev.id} ev={ev} />)
        )}

        <div className="mt-8 pt-4 border-t border-gray-200 flex justify-between text-xs text-gray-500">
          <span>Planeta Movimiento · Club Deportivo Origen</span>
          <span>Documento generado el {fechaLarga(new Date().toISOString())}</span>
        </div>
      </div>
    </div>
  )
}

function Campo({ k, v }: { k: string; v: string }) {
  return <div><span className="text-gray-400">{k}: </span><span className="font-semibold text-pm-navy capitalize">{v}</span></div>
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
