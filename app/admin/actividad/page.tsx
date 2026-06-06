import { getRows } from '@/lib/admin/data'
import { AdminHeader, EmptyState, SetupNotice } from '@/components/admin/ui'

export default async function ActividadPage() {
  const { rows, ok } = await getRows('activity_log')

  return (
    <>
      <AdminHeader titulo="Registro de actividad" subtitulo="Historial de acciones realizadas en el panel" />
      <div className="p-6 lg:p-8 space-y-6">
        {!ok && <SetupNotice />}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {rows.length === 0 ? (
            <EmptyState icon="📝" titulo="Sin actividad registrada" desc="Cada cambio importante (reservas, pagos, administradores...) quedará registrado aquí." />
          ) : (
            <ul className="divide-y divide-gray-50">
              {rows.map((a: Record<string, unknown>) => (
                <li key={a.id as string} className="flex items-start gap-4 px-5 py-4">
                  <div className="w-9 h-9 bg-pm-bg rounded-full flex items-center justify-center text-sm shrink-0">📝</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-pm-navy">
                      <strong>{(a.actor_email as string) || 'sistema'}</strong>{' '}
                      <span className="text-gray-600">{a.accion as string}</span>
                      {a.detalle ? <span className="text-gray-400"> · {a.detalle as string}</span> : null}
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5">
                      {(a.entidad as string)} · {a.created_at ? new Date(a.created_at as string).toLocaleString('es-ES') : ''}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  )
}
