import { requireSeccion } from '@/lib/admin/auth'
import { AdminHeader, Metric } from '@/components/admin/ui'
import { getEmailLog } from '@/lib/emails/data'

export const dynamic = 'force-dynamic'

const TIPO_LABEL: Record<string, string> = {
  'aviso-interno': 'Solicitud / formulario',
  'aviso-reserva': 'Reserva / pago',
  'confirmacion-cliente': 'Confirmación al cliente',
}

const fecha = (iso: string) => {
  try { return new Date(iso).toLocaleString('es-ES', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' }) }
  catch { return iso }
}

export default async function CorreosPage() {
  await requireSeccion('correos')
  const logs = await getEmailLog(300)
  const enviados = logs.filter(l => l.estado === 'enviado').length
  const fallidos = logs.filter(l => l.estado === 'fallido').length

  return (
    <>
      <AdminHeader titulo="Correos enviados" subtitulo="Registro de envíos de la web (formularios, reservas y confirmaciones)" />
      <div className="p-4 lg:p-6 space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <Metric label="Total registrados" valor={logs.length} tono="navy" />
          <Metric label="Entregados a Resend" valor={enviados} tono="green" />
          <Metric label="Fallidos" valor={fallidos} tono={fallidos > 0 ? 'red' : 'navy'} />
        </div>

        {fallidos > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3 text-sm text-red-700">
            ⚠️ Hay <strong>{fallidos}</strong> correo(s) que no se pudieron enviar. Revisa el motivo en la columna «Error».
          </div>
        )}

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          {logs.length ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-xs text-gray-400 uppercase">
                  <tr>
                    <th className="text-left py-2 px-2">Fecha</th>
                    <th className="text-left py-2 px-2">Tipo</th>
                    <th className="text-left py-2 px-2">Destinatario</th>
                    <th className="text-left py-2 px-2">Asunto</th>
                    <th className="text-left py-2 px-2">Estado</th>
                    <th className="text-left py-2 px-2">Error</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {logs.map(l => (
                    <tr key={l.id}>
                      <td className="py-2 px-2 text-gray-500 whitespace-nowrap">{fecha(l.created_at)}</td>
                      <td className="py-2 px-2 text-gray-600">{TIPO_LABEL[l.tipo] ?? l.tipo}</td>
                      <td className="py-2 px-2 text-pm-navy">{l.destinatario}</td>
                      <td className="py-2 px-2 text-gray-600 max-w-xs truncate" title={l.asunto}>{l.asunto}</td>
                      <td className="py-2 px-2">
                        {l.estado === 'enviado'
                          ? <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700">Enviado</span>
                          : <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700">Fallido</span>}
                      </td>
                      <td className="py-2 px-2 text-red-600 text-xs max-w-xs truncate" title={l.error ?? ''}>{l.error ?? ''}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-sm text-gray-500 py-8 text-center">
              Aún no hay correos registrados.<br />
              <span className="text-gray-400 text-xs">Si acabas de activarlo, falta ejecutar <code>supabase/migration_email_log.sql</code> en Supabase.</span>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
