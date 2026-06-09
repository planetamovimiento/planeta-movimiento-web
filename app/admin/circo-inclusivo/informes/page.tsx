import Link from 'next/link'
import { requireSeccion } from '@/lib/admin/auth'
import { getParticipantes, getGrupos } from '@/lib/circo-inclusivo/data'
import { AdminHeader } from '@/components/admin/ui'
import CircoNav from '../CircoNav'

export const dynamic = 'force-dynamic'

export default async function InformesPage() {
  await requireSeccion('circo-inclusivo')
  const [participantes, grupos] = await Promise.all([getParticipantes(), getGrupos()])
  const gMap = new Map(grupos.map(g => [g.id, g.nombre]))

  return (
    <>
      <AdminHeader
        titulo={<span className="flex items-center gap-2"><span>🤸</span> Circo Inclusivo · Informes</span>}
        subtitulo="Genera informes en PDF (Imprimir → Guardar como PDF) por participante"
      />
      <CircoNav />
      <div className="p-4 lg:p-8">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {participantes.length === 0 ? (
            <div className="p-10 text-center text-gray-400 text-sm">Aún no hay participantes.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-left text-xs text-gray-500 uppercase tracking-wider">
                    <th className="px-5 py-3 font-semibold">Participante</th>
                    <th className="px-5 py-3 font-semibold">Grupo</th>
                    <th className="px-5 py-3 font-semibold text-right">Informes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {participantes.map(p => {
                    const base = `/admin/circo-inclusivo/participantes/${p.id}/informe`
                    return (
                      <tr key={p.id} className="hover:bg-gray-50">
                        <td className="px-5 py-3 font-semibold text-pm-navy">{p.nombre} {p.apellidos ?? ''}</td>
                        <td className="px-5 py-3 text-gray-600">{p.grupo_id ? gMap.get(p.grupo_id) ?? '—' : '—'}</td>
                        <td className="px-5 py-3">
                          <div className="flex items-center justify-end gap-2 flex-wrap">
                            <Link href={`${base}?tipo=mensual`} target="_blank" className="text-xs font-semibold border border-gray-200 hover:border-pm-red text-pm-navy px-3 py-1.5 rounded-lg">Mensual</Link>
                            <Link href={`${base}?tipo=trimestral`} target="_blank" className="text-xs font-semibold border border-gray-200 hover:border-pm-red text-pm-navy px-3 py-1.5 rounded-lg">Trimestral</Link>
                            <Link href={`${base}?tipo=completo`} target="_blank" className="text-xs font-semibold bg-pm-navy text-white px-3 py-1.5 rounded-lg">Completo</Link>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
