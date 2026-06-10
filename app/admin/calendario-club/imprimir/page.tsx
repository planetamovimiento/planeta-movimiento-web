import Link from 'next/link'
import { requireSeccion } from '@/lib/admin/auth'
import { getEventos, getExcepciones, getTipos } from '@/lib/calendario-club/data'
import { expandirOcurrencias } from '@/lib/calendario-club/expand'
import { iso, paleta, colorOcurrencia, type Ocurrencia, type TipoEvento } from '@/lib/calendario-club/tipos'
import BarraImprimir from './BarraImprimir'

export const dynamic = 'force-dynamic'

const PRINT_CSS = `@media print { aside{display:none!important} .no-print{display:none!important} body{background:#fff!important} .cal-hoja{box-shadow:none!important;border:none!important;margin:0!important;max-width:100%!important} .cal-mes{break-inside:avoid} }`
const DIAS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

function mesesEnRango(desde: string, hasta: string): { y: number; m: number }[] {
  const out: { y: number; m: number }[] = []
  const a = new Date(desde + 'T12:00:00'), b = new Date(hasta + 'T12:00:00')
  let y = a.getFullYear(), m = a.getMonth()
  while (y < b.getFullYear() || (y === b.getFullYear() && m <= b.getMonth())) {
    out.push({ y, m }); m++; if (m > 11) { m = 0; y++ }
    if (out.length > 24) break
  }
  return out
}

export default async function ImprimirCalendarioPage({ searchParams }: { searchParams: Promise<{ desde?: string; hasta?: string }> }) {
  await requireSeccion('calendario-club')
  const sp = await searchParams
  const hoy = new Date()
  const desde = sp.desde || iso(hoy.getFullYear(), hoy.getMonth(), 1)
  const hasta = sp.hasta || iso(hoy.getFullYear(), hoy.getMonth(), new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0).getDate())

  const [eventos, excepciones, tipos] = await Promise.all([getEventos(), getExcepciones(), getTipos()])
  const todas = expandirOcurrencias(eventos, excepciones, desde, hasta)
  const publicas = todas.filter(o => o.publico && !o.cancelado)
  const meses = mesesEnRango(desde, hasta)
  const tiposPresentes = tipos.filter(t => publicas.some(o => o.tipo === t.id)).sort((a, b) => a.orden - b.orden)
  const rangoTexto = `${new Date(desde + 'T12:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })} – ${new Date(hasta + 'T12:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}`

  return (
    <div className="bg-gray-100 min-h-screen py-6">
      <style dangerouslySetInnerHTML={{ __html: PRINT_CSS }} />

      <div className="no-print max-w-4xl mx-auto px-4 mb-4 flex items-center justify-between gap-3 flex-wrap">
        <Link href="/admin/calendario-club" className="text-sm text-gray-500 hover:text-pm-red">← Volver al calendario</Link>
        <BarraImprimir ocurrencias={todas} tipos={tipos} />
      </div>

      <div className="cal-hoja max-w-4xl mx-auto bg-white shadow-sm rounded-lg p-8">
        <div className="flex items-center gap-4 border-b-2 border-pm-red pb-4 mb-5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Planeta Movimiento" className="h-14 w-auto" />
          <div className="flex-1">
            <div className="font-black text-pm-navy text-lg leading-tight">Club Deportivo Origen</div>
            <div className="text-xs text-gray-500">Planeta Movimiento · Calendario de actividades</div>
          </div>
          <div className="text-right text-xs text-gray-500">{rangoTexto}</div>
        </div>

        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-600 mb-5">
          {tiposPresentes.map(t => (
            <span key={t.id} className="flex items-center gap-1.5"><span className={`w-3 h-3 rounded-full ${paleta(t.color).dot}`} /> {t.label}</span>
          ))}
        </div>

        {meses.map(({ y, m }) => <MesImpreso key={`${y}-${m}`} y={y} m={m} ocurrencias={publicas} tipos={tipos} />)}
        {publicas.length === 0 && <p className="text-gray-400 italic">No hay actividades públicas en este periodo.</p>}

        <div className="mt-6 pt-4 border-t border-gray-200 text-xs text-gray-400 text-center">Planeta Movimiento · Club Deportivo Origen</div>
      </div>
    </div>
  )
}

function MesImpreso({ y, m, ocurrencias, tipos }: { y: number; m: number; ocurrencias: Ocurrencia[]; tipos: TipoEvento[] }) {
  const primer = (new Date(y, m, 1).getDay() + 6) % 7
  const dias = new Date(y, m + 1, 0).getDate()
  const celdas: (number | null)[] = [...Array(primer).fill(null), ...Array.from({ length: dias }, (_, i) => i + 1)]
  const porDia = new Map<string, Ocurrencia[]>()
  for (const o of ocurrencias) {
    const d = new Date(o.fecha + 'T12:00:00')
    if (d.getMonth() !== m || d.getFullYear() !== y) continue
    const a = porDia.get(o.fecha) || []; a.push(o); porDia.set(o.fecha, a)
  }
  const nombreMes = new Date(y, m, 1).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })

  return (
    <div className="cal-mes mb-6">
      <h3 className="font-black text-pm-navy capitalize mb-2">{nombreMes}</h3>
      <div className="grid grid-cols-7 text-[10px] font-black text-gray-400 uppercase">
        {DIAS.map(d => <div key={d} className="px-1 py-1 text-center">{d}</div>)}
      </div>
      <div className="grid grid-cols-7 border-t border-l border-gray-200">
        {celdas.map((dia, i) => {
          if (dia === null) return <div key={`b${i}`} className="min-h-[64px] border-b border-r border-gray-200 bg-gray-50" />
          const fecha = iso(y, m, dia)
          const evs = porDia.get(fecha) || []
          return (
            <div key={fecha} className="min-h-[64px] border-b border-r border-gray-200 p-1">
              <div className="text-[10px] font-bold text-gray-500">{dia}</div>
              <div className="space-y-0.5">
                {evs.map((o, idx) => {
                  const p = paleta(colorOcurrencia(o, tipos))
                  return <div key={idx} className={`text-[9px] leading-tight px-1 py-0.5 rounded truncate ${p.chip}`}>{o.hora_inicio ? `${o.hora_inicio} ` : ''}{o.titulo}</div>
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
