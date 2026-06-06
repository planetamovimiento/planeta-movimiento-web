import Link from 'next/link'
import { getAdminUser } from '@/lib/admin/auth'
import { getDashboard } from '@/lib/admin/data'
import { AdminHeader, Metric, EstadoBadge, EmptyState, SetupNotice } from '@/components/admin/ui'

export default async function DashboardPage() {
  const admin = await getAdminUser()
  const d = await getDashboard()
  const hoy = new Intl.DateTimeFormat('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date())

  const eur = (n: number) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n)

  return (
    <>
      <AdminHeader
        titulo={`Hola, ${admin?.nombre?.split(' ')[0] || 'admin'} 👋`}
        subtitulo={hoy.charAt(0).toUpperCase() + hoy.slice(1)}
        accion={<Link href="/admin/reservas" className="bg-pm-red hover:bg-pm-red-dark text-white font-bold px-5 py-2.5 rounded-xl transition-colors text-sm hidden sm:inline-block">Ver reservas</Link>}
      />

      <div className="p-6 lg:p-8 space-y-8">
        {!d.ok && <SetupNotice />}

        {/* Métricas */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Metric label="Reservas hoy" valor={d.reservasHoy} tono="navy" />
          <Metric label="Pendientes" valor={d.pendientes} sub="Requieren confirmación" tono="amber" />
          <Metric label="Ingresos (pagado)" valor={eur(d.ingresos)} tono="green" />
          <Metric label="Solicitudes nuevas" valor={d.formsNuevos} tono="red" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Reservas recientes */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-black text-pm-navy">Reservas recientes</h2>
              <Link href="/admin/reservas" className="text-sm text-pm-red font-semibold hover:underline">Ver todas →</Link>
            </div>
            {d.recientes.length === 0 ? (
              <EmptyState titulo="Aún no hay reservas" desc="Las reservas que se realicen en la web aparecerán aquí." />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 text-left text-xs text-gray-500 uppercase tracking-wider">
                      <th className="px-5 py-3 font-semibold">Cliente</th>
                      <th className="px-5 py-3 font-semibold">Servicio</th>
                      <th className="px-5 py-3 font-semibold">Fecha</th>
                      <th className="px-5 py-3 font-semibold">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {d.recientes.map(b => (
                      <tr key={b.id} className="hover:bg-gray-50">
                        <td className="px-5 py-3 font-semibold text-pm-navy">{b.cliente_nombre || '—'}</td>
                        <td className="px-5 py-3 text-gray-600">{b.servicio || '—'}</td>
                        <td className="px-5 py-3 text-gray-600">{b.fecha || '—'}</td>
                        <td className="px-5 py-3"><EstadoBadge estado={b.estado_reserva} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Servicios más reservados */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-black text-pm-navy mb-4">Más reservados</h2>
            {d.topServicios.length === 0 ? (
              <p className="text-gray-400 text-sm">Sin datos todavía.</p>
            ) : (
              <div className="space-y-3">
                {d.topServicios.map(([nombre, n], i) => {
                  const max = d.topServicios[0][1]
                  return (
                    <div key={nombre}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-pm-navy font-semibold">{i + 1}. {nombre}</span>
                        <span className="text-gray-400">{n}</span>
                      </div>
                      <div className="bg-gray-100 rounded-full h-1.5">
                        <div className="bg-pm-red h-1.5 rounded-full" style={{ width: `${(n / max) * 100}%` }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Alertas */}
            <div className="mt-6 pt-6 border-t border-gray-100 space-y-2">
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-wider mb-2">Alertas</h3>
              {d.pendientes > 0 && <div className="text-sm text-amber-700 bg-amber-50 rounded-lg px-3 py-2">⏳ {d.pendientes} reserva(s) pendiente(s) de confirmar</div>}
              {d.enEspera > 0 && <div className="text-sm text-purple-700 bg-purple-50 rounded-lg px-3 py-2">📋 {d.enEspera} en lista de espera</div>}
              {d.formsNuevos > 0 && <div className="text-sm text-pm-red bg-pm-red-light rounded-lg px-3 py-2">✉️ {d.formsNuevos} solicitud(es) sin leer</div>}
              {d.pendientes === 0 && d.enEspera === 0 && d.formsNuevos === 0 && <div className="text-sm text-green-700 bg-green-50 rounded-lg px-3 py-2">✓ Todo al día</div>}
            </div>
          </div>
        </div>

        {/* Accesos rápidos */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { href: '/admin/reservas', icon: '📋', label: 'Reservas' },
            { href: '/admin/formularios', icon: '✉️', label: 'Solicitudes' },
            { href: '/admin/calendario', icon: '🗓️', label: 'Calendario' },
            { href: '/admin/clientes', icon: '👥', label: 'Clientes' },
            { href: '/admin/servicios', icon: '🎪', label: 'Servicios' },
            { href: '/admin/productos', icon: '🛒', label: 'Productos' },
          ].map(a => (
            <Link key={a.href} href={a.href} className="bg-white border border-gray-100 rounded-2xl p-4 text-center hover:shadow-md hover:border-pm-red/20 transition-all">
              <div className="text-2xl mb-1">{a.icon}</div>
              <div className="text-xs font-bold text-pm-navy">{a.label}</div>
            </Link>
          ))}
        </div>
      </div>
    </>
  )
}
