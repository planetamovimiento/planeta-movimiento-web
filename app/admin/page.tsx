import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getAdminUser } from '@/lib/admin/auth'
import { getDashboard, type Novedad } from '@/lib/admin/data'
import { puedeVerSeccion, type SeccionId } from '@/lib/admin/secciones'
import { AdminHeader, Metric, SetupNotice } from '@/components/admin/ui'

/** Tiempo relativo corto en español. */
function hace(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const min = Math.floor(diff / 60000)
  if (min < 1) return 'ahora'
  if (min < 60) return `hace ${min} min`
  const h = Math.floor(min / 60)
  if (h < 24) return `hace ${h} h`
  const d = Math.floor(h / 24)
  return d === 1 ? 'ayer' : `hace ${d} días`
}

export default async function DashboardPage() {
  const admin = await getAdminUser()
  // El monitor no ve el dashboard general: directo a su portal.
  if (admin?.role === 'monitor') redirect('/admin/monitores')
  const d = await getDashboard()
  const hoy = new Intl.DateTimeFormat('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date())
  const eur = (n: number) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n)

  const ver = (id: SeccionId) => !!admin && puedeVerSeccion(admin.role, admin.secciones, id)
  const verReservas = ver('reservas')
  const verFormularios = ver('formularios')
  const verClub = ver('club')
  const verFinanzas = ver('balance') || ver('pagos')

  // Novedades filtradas por permiso (reservas ↔ reservas, club ↔ club).
  const novedades = d.novedades.filter(n => (n.clase === 'reserva' ? verReservas : verClub))

  const metricasEmpresa = [
    verReservas && <Metric key="rh" label="Reservas hoy" valor={d.reservasHoy} tono="navy" />,
    verReservas && <Metric key="pe" label="Pendientes" valor={d.pendientes} sub="Requieren confirmación" tono="amber" />,
    verFinanzas && <Metric key="in" label="Ingresos (pagado)" valor={eur(d.ingresos)} tono="green" />,
    verFormularios && <Metric key="se" label="Solicitudes empresa" valor={d.formsNuevos} tono="red" />,
  ].filter(Boolean)

  // Alertas accionables (cada chip enlaza a donde se resuelve).
  const alertas = [
    verReservas && d.pendientes > 0 && { href: '/admin/reservas', tono: 'amber', icon: '⏳', txt: `${d.pendientes} reserva(s) pendiente(s) de confirmar` },
    verReservas && d.enEspera > 0 && { href: '/admin/reservas', tono: 'purple', icon: '📋', txt: `${d.enEspera} en lista de espera` },
    verFormularios && d.formsNuevos > 0 && { href: '/admin/formularios', tono: 'red', icon: '✉️', txt: `${d.formsNuevos} solicitud(es) de empresa sin leer` },
    verClub && d.clubNuevos > 0 && { href: '/admin/club', tono: 'blue', icon: '🏅', txt: `${d.clubNuevos} inscripción(es) al club sin gestionar` },
    verClub && d.clubConPagoPendiente > 0 && { href: '/admin/club', tono: 'amber', icon: '💶', txt: `${d.clubConPagoPendiente} alumno(s) con cuota pendiente` },
  ].filter(Boolean) as { href: string; tono: string; icon: string; txt: string }[]

  const tonoChip: Record<string, string> = {
    amber: 'bg-amber-50 text-amber-800 hover:bg-amber-100 border-amber-200',
    purple: 'bg-purple-50 text-purple-800 hover:bg-purple-100 border-purple-200',
    red: 'bg-pm-red-light text-pm-red hover:bg-pm-red/10 border-pm-red/20',
    blue: 'bg-blue-50 text-pm-navy hover:bg-blue-100 border-blue-200',
  }

  const accesos = ([
    { href: '/admin/club', icon: '🏅', label: 'Inscripciones Club', id: 'club' },
    { href: '/admin/familias', icon: '👨‍👩‍👧', label: 'Portal de Familias', id: 'familias' },
    { href: '/admin/calendario-club', icon: '🗓️', label: 'Calendario Club', id: 'calendario-club' },
    { href: '/admin/reservas', icon: '📋', label: 'Reservas', id: 'reservas' },
    { href: '/admin/formularios', icon: '✉️', label: 'Solicitudes', id: 'formularios' },
    { href: '/admin/balance', icon: '💰', label: 'Balance', id: 'balance' },
    { href: '/admin/facturacion', icon: '🧾', label: 'Facturación', id: 'facturacion' },
    { href: '/admin/calendario', icon: '📅', label: 'Calendario', id: 'calendario' },
  ] as const).filter(a => ver(a.id))

  return (
    <>
      <AdminHeader
        titulo={`Hola, ${admin?.nombre?.split(' ')[0] || 'admin'} 👋`}
        subtitulo={hoy.charAt(0).toUpperCase() + hoy.slice(1)}
        accion={verClub ? <Link href="/admin/club" className="bg-pm-red hover:bg-pm-red-dark text-white font-bold px-5 py-2.5 rounded-xl transition-colors text-sm hidden sm:inline-block">Inscripciones Club</Link> : null}
      />

      <div className="p-6 lg:p-8 space-y-8">
        {!d.ok && <SetupNotice />}

        {/* ── Alertas accionables ── */}
        <div>
          <div className="text-xs font-black text-gray-400 uppercase tracking-wider mb-3">Alertas</div>
          {alertas.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {alertas.map((a, i) => (
                <Link key={i} href={a.href} className={`flex items-center gap-2 text-sm font-semibold border rounded-xl px-3 py-2.5 transition-colors ${tonoChip[a.tono]}`}>
                  <span>{a.icon}</span><span className="flex-1">{a.txt}</span><span aria-hidden>→</span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-xl px-3 py-2.5">✓ Todo al día, sin nada pendiente.</div>
          )}
        </div>

        {/* ── Métricas Empresa ── */}
        {metricasEmpresa.length > 0 && (
          <div>
            <div className="text-xs font-black text-gray-400 uppercase tracking-wider mb-3">Empresa</div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">{metricasEmpresa}</div>
          </div>
        )}

        {/* ── Métricas Club Deportivo Origen ── */}
        {verClub && (
          <div>
            <div className="text-xs font-black text-gray-400 uppercase tracking-wider mb-3">Club Deportivo Origen · temporada {d.tempActiva.replace('/', '-')}</div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Metric label="Inscripciones nuevas" valor={d.clubNuevos} sub="Sin gestionar" tono="red" />
              <Metric label="Alumnos activos" valor={d.clubActivos} tono="navy" />
              {verFinanzas && <Metric label="Cuotas cobradas" valor={eur(d.clubIngresosTemporada)} sub="Temporada" tono="green" />}
              <Metric label="Con pago pendiente" valor={d.clubConPagoPendiente} tono="amber" />
            </div>
          </div>
        )}

        {/* ── Novedades (últimos 7 días) + Más reservados ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="font-black text-pm-navy">Novedades <span className="text-gray-400 font-medium text-sm">· últimos 7 días</span></h2>
            </div>
            {novedades.length === 0 ? (
              <p className="text-sm text-gray-400 px-6 py-10 text-center">Sin novedades esta semana. Las reservas e inscripciones nuevas aparecerán aquí.</p>
            ) : (
              <ul className="divide-y divide-gray-50">
                {novedades.map(n => <FilaNovedad key={n.id} n={n} />)}
              </ul>
            )}
          </div>

          {verReservas && (
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
          )}
        </div>

        {/* ── Accesos rápidos ── */}
        {accesos.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
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

function FilaNovedad({ n }: { n: Novedad }) {
  const href = n.clase === 'reserva' ? '/admin/reservas' : '/admin/club'
  const icon = n.clase === 'reserva' ? '📋' : '🏅'
  const esNueva = n.estado === 'pendiente' || n.estado === 'nueva'
  return (
    <li>
      <Link href={href} className="flex items-center gap-3 px-6 py-3 hover:bg-gray-50 transition-colors">
        <span className="text-xl shrink-0">{icon}</span>
        <div className="min-w-0 flex-1">
          <div className="font-semibold text-pm-navy truncate">{n.nombre}</div>
          <div className="text-xs text-gray-500 truncate">{n.clase === 'reserva' ? 'Reserva' : 'Club'} · {n.detalle}</div>
        </div>
        {esNueva && <span className="text-[10px] font-black uppercase tracking-wide bg-pm-red-light text-pm-red rounded-full px-2 py-0.5 shrink-0">Nueva</span>}
        <span className="text-xs text-gray-400 whitespace-nowrap shrink-0">{hace(n.cuando)}</span>
      </Link>
    </li>
  )
}
