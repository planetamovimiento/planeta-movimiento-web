import { getRows } from '@/lib/admin/data'
import { AdminHeader, EstadoBadge, EmptyState, SetupNotice } from '@/components/admin/ui'

export default async function CalendarioPage() {
  const { rows, ok } = await getRows('availability', 'fecha')

  return (
    <>
      <AdminHeader titulo="Calendario y disponibilidad" subtitulo="Fechas, horarios y plazas por servicio" />
      <div className="p-6 lg:p-8 space-y-6">
        {!ok && <SetupNotice />}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {rows.length === 0 ? (
            <EmptyState icon="🗓️" titulo="Sin fechas configuradas" desc="Crea fechas disponibles por servicio para controlar plazas y bloquear días." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-left text-xs text-gray-500 uppercase tracking-wider">
                    <th className="px-4 py-3 font-semibold">Servicio</th>
                    <th className="px-4 py-3 font-semibold">Fecha</th>
                    <th className="px-4 py-3 font-semibold">Horario</th>
                    <th className="px-4 py-3 font-semibold">Plazas</th>
                    <th className="px-4 py-3 font-semibold">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {rows.map((a: Record<string, unknown>) => {
                    const total = Number(a.plazas_total) || 0
                    const ocup = Number(a.plazas_ocupadas) || 0
                    return (
                      <tr key={a.id as string} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-semibold text-pm-navy">{(a.servicio as string) || '—'}</td>
                        <td className="px-4 py-3 text-gray-600">{(a.fecha as string) || '—'}</td>
                        <td className="px-4 py-3 text-gray-600">{a.hora_inicio as string}{a.hora_fin ? ` – ${a.hora_fin}` : ''}</td>
                        <td className="px-4 py-3 text-gray-600">{ocup}/{total}</td>
                        <td className="px-4 py-3"><EstadoBadge estado={(a.estado as string) || 'disponible'} /></td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
        <p className="text-xs text-gray-400">
          La edición visual del calendario (crear/bloquear fechas con clic) se conecta en la siguiente fase.
          De momento las fechas configuradas en el código de cada servicio siguen siendo la fuente para la web pública.
        </p>
      </div>
    </>
  )
}
