import Link from 'next/link'
import { getAdminUser } from '@/lib/admin/auth'
import { getDashboard } from '@/lib/admin/data'
import { puedeVerSeccion, type SeccionId } from '@/lib/admin/secciones'
import { AdminHeader, Metric, EstadoBadge, EmptyState, SetupNotice } from '@/components/admin/ui'

export default async function DashboardPage() {
  const admin = await getAdminUser()
  const d = await getDashboard()
  const hoy = new Intl.DateTimeFormat('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date())

  const eur = (n: number) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n)

  // ── Visibilidad por permisos ───────────────────────────────────────────────
  // Cada bloque del panel se muestra solo si el usuario tiene acceso a esa sección.
  // Sin acceso a Balance ni Pagos → ningún dato económico.
  const ver = (id: SeccionId) => !!admin && puedeVerSeccion(admin.role, admin.secciones, id)
  const verReservas = ver('reservas')
  const verFormularios = ver('formularios')
  const verClub = ver('club')
  const verFinanzas = ver('balance') || ver('pagos')

  const metricasEmpresa = [
    verReservas && <Metric key="rh" label="Reservas hoy" valor={d.reservasHoy} tono="navy" />,
    verReservas && <Metric key="pe" label="Pendientes" valor={d.pendientes} sub="Requieren confirmación" tono="amber" />,
    verFinanzas && <Metric key="in" label="Ingresos (pagado)" valor={eur(d.ingresos)} tono="green" />,
    verFormularios && <Metric key="se" label="Solicitudes empresa" valor={d.formsNuevos} tono="red" />,
  ].filter(Boolean)

  const alertas = [
    verReservas && d.pendientes > 0 && <div key="p" className="text-sm text-amber-700 bg-amber-50 rounded-lg px-3 py-2">⏳ {d.pendientes} reserva(s) pendiente(s) de confirmar</div>,
    verReservas && d.enEspera > 0 && <div key="e" className="text-sm text-purple-700 bg-purple-50 rounded-lg px-3 py-2">📋 {d.enEspera} en lista de espera</div>,
    verFormularios && d.formsNuevos > 0 && <div key="f" className="text-sm text-pm-red bg-pm-red-light rounded-lg px-3 py-2">✉️ {d.formsNuevos} solicitud(es) de empresa sin leer</div>,
    verClub && d.clubNuevos > 0 && <div key="c" className="text-sm text-pm-navy bg-blue-50 rounded-lg px-3 py-2">🏅 {d.clubNuevos} solicitud(es) de inscripción al club</div>,
  ].filter(Boolean)

  const accesos = ([
    { href: '/admin/club', icon: '🏅', label: 'Club · Solicitudes', id: 'club' },
    { href: '/admin/reservas', icon: '📋', label: 'Reservas', id: 'reservas' },
    { href: '/admin/formularios', icon: '✉️', label: 'Solicitudes', id: 'formularios' },
    { href: '/admin/calendario', icon: '🗓️', label: 'Calendario', id: 'calendario' },
    { href: '/admin/clientes', icon: '👥', label: 'Clientes', id: 'clientes' },
    { href: '/admin/productos', icon: '🛒', label: 'Productos', id: 'productos' },
  ] as const).filter(a => ver(a.id))

  return (
    <>
      <AdminHeader
        titulo={`Hola, ${admin?.nombre?.split(' ')[0] || 'admin'} 👋`}
        subtitulo={hoy.charAt(0).toUpperCase() + hoy.slice(1)}
        accion={verReservas ? <Link href="/admin/reservas" className="bg-pm-red hover:bg-pm-red-dark text-white font-bold px-5 py-2.5 rounded-xl transition-colors text-sm hidden sm:inline-block">Ver reservas</Link> : null}
      />

      <div className="p-6 lg:p-8 space-y-8">
        {!d.ok && <SetupNotice />}

        {/* Métricas Empresa */}
        {metricasEmpresa.length > 0 && (
          <div>
            <div className="text-xs font-black text-gray-400 uppercase tracking-wider mb-3">Empresa</div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">{metricasEmpresa}</div>
          </div>
        )}

        {/* Métricas Club Deportivo */}
        {verClub && (
          <div>
            <div className="text-xs font-black text-gray-400 uppercase tracking-wider mb-3">Club Deportivo Origen</div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Metric label="Solicitudes nuevas" valor={d.clubNuevos} sub="Inscripciones por gestionar" tono="red" />
              <Metric label="Total solicitudes club" valor={d.clubTotal} tono="navy" />
            </div>
          </div>
        )}

        {/* Alertas (adaptadas a los permisos) */}
        <div>
          <div className="text-xs font-black text-gray-400 uppercase tracking-wider mb-3">Alertas</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
            {alertas.length > 0 ? alertas : <div className="text-sm text-green-700 bg-green-50 rounded-lg px-3 py-2">✓ Todo al día</div>}
          </div>
        </div>

        {/* Reservas recientes + Más reservados (solo con acceso a Reservas) */}
        {verReservas && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
            </div>
          </div>
        )}

        {/* Accesos rápidos (solo a las secciones permitidas) */}
        {accesos.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {accesos.map(a => (
              <Link key={a.href} href={a.href} className="bg-white border border-gray-100 rounded-2xl p-4 text-center hover:shadow-md hover:border-pm-red/20 transition-all">
                <div className="text-2xl mb-1">{a.icon}</div>
                <div className="text-xs font-bold text-pm-navy">{a.label}</div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
