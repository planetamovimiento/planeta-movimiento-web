import { requireSeccion } from '@/lib/admin/auth'
import { getRegistrosCRM } from '@/lib/crm/data'
import { eur, totalDe, pagadoDe, pendienteDe, fechaCorta, labelPago, badgePago } from '@/lib/crm/constants'
import { AdminHeader, EmptyState, SetupNotice, Metric } from '@/components/admin/ui'

/**
 * Control de cobros. Se construye sobre la MISMA fuente que el CRM de Reservas
 * (getRegistrosCRM + helpers pagadoDe/pendienteDe), así los ingresos cuadran
 * siempre con el panel de Reservas e incluyen también los cobros manuales
 * (efectivo, transferencia, Bizum…) registrados en cada ficha, no solo los
 * cobros online de la pasarela.
 */
export default async function PagosPage() {
  await requireSeccion('pagos')

  const { registros, ok } = await getRegistrosCRM()

  const filas = registros
    .map(r => ({ r, total: totalDe(r), cobrado: pagadoDe(r), pendiente: pendienteDe(r) }))
    .filter(x => x.total > 0 || x.cobrado > 0 || x.pendiente > 0)
    .sort((a, b) =>
      (b.r.fecha_realizacion || b.r.fecha_reserva || '').localeCompare(a.r.fecha_realizacion || a.r.fecha_reserva || '')
    )

  const cobrado = filas.reduce((s, x) => s + x.cobrado, 0)
  const pendiente = filas.reduce((s, x) => s + x.pendiente, 0)
  const conPendiente = filas.filter(x => x.pendiente > 0).length

  const metodoDe = (x: (typeof filas)[number]) =>
    x.r.metodo_pago || x.r.pagos[x.r.pagos.length - 1]?.metodo || '—'

  return (
    <>
      <AdminHeader titulo="Pagos" subtitulo={`${filas.length} reservas con importe`} />
      <div className="p-6 lg:p-8 space-y-6">
        {!ok && <SetupNotice />}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <Metric label="Ingresos cobrados" valor={eur(cobrado)} tono="green" />
          <Metric label="Pendiente de cobro" valor={eur(pendiente)} tono="amber" />
          <Metric label="Reservas por cobrar" valor={conPendiente} tono="red" />
        </div>

        <p className="text-xs text-gray-400 -mt-2">
          Incluye cobros online (Redsys) y cobros manuales (efectivo, transferencia, Bizum) registrados en cada ficha.
          Las cifras coinciden con el panel de Reservas.
        </p>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {filas.length === 0 ? (
            <EmptyState icon="💳" titulo="Sin pagos registrados" desc="Los cobros aparecerán aquí cuando se registren reservas con importe." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-left text-xs text-gray-500 uppercase tracking-wider">
                    <th className="px-4 py-3 font-semibold">Cliente</th>
                    <th className="px-4 py-3 font-semibold">Servicio</th>
                    <th className="px-4 py-3 font-semibold">Fecha</th>
                    <th className="px-4 py-3 font-semibold text-right">Total</th>
                    <th className="px-4 py-3 font-semibold text-right">Cobrado</th>
                    <th className="px-4 py-3 font-semibold text-right">Pendiente</th>
                    <th className="px-4 py-3 font-semibold">Método</th>
                    <th className="px-4 py-3 font-semibold">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filas.map(({ r, total, cobrado, pendiente }) => (
                    <tr key={`${r.origen}|${r.id}`} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-semibold text-pm-navy whitespace-nowrap">{r.cliente_nombre || '—'}</td>
                      <td className="px-4 py-3 text-gray-600">{r.servicio || '—'}</td>
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{fechaCorta(r.fecha_realizacion || r.fecha_reserva)}</td>
                      <td className="px-4 py-3 text-right text-pm-navy whitespace-nowrap">{eur(total)}</td>
                      <td className="px-4 py-3 text-right font-bold text-green-600 whitespace-nowrap">{cobrado > 0 ? eur(cobrado) : '—'}</td>
                      <td className={`px-4 py-3 text-right font-bold whitespace-nowrap ${pendiente > 0 ? 'text-pm-red' : 'text-gray-300'}`}>{pendiente > 0 ? eur(pendiente) : '—'}</td>
                      <td className="px-4 py-3 text-gray-600 capitalize whitespace-nowrap">{metodoDe({ r, total, cobrado, pendiente })}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-pm-navy">
                          <span className={`w-2.5 h-2.5 rounded-full ${badgePago(r.estado_pago)}`} />
                          {labelPago(r.estado_pago)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
