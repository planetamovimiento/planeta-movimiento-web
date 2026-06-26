import { requireSeccion } from '@/lib/admin/auth'
import { AdminHeader, Metric } from '@/components/admin/ui'
import { getEventosSeguridad } from '@/lib/seguridad/data'
import { turnstileActivo } from '@/lib/seguridad/turnstile'

export const dynamic = 'force-dynamic'

const TIPO: Record<string, { label: string; badge: string }> = {
  envio:        { label: 'Envío correcto',   badge: 'bg-green-100 text-green-700' },
  bot:          { label: 'Bot detectado',    badge: 'bg-red-100 text-red-700' },
  spam:         { label: 'Spam bloqueado',   badge: 'bg-amber-100 text-amber-700' },
  'rate-limit': { label: 'Límite superado',  badge: 'bg-orange-100 text-orange-700' },
  login:        { label: 'Acceso',           badge: 'bg-blue-100 text-blue-700' },
  bloqueo:      { label: 'Bloqueo',          badge: 'bg-red-100 text-red-700' },
}

const fecha = (iso: string) => {
  try { return new Date(iso).toLocaleString('es-ES', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' }) }
  catch { return iso }
}

function Proteccion({ activa, texto, sub }: { activa: boolean; texto: string; sub?: string }) {
  return (
    <div className="flex items-start gap-2.5 bg-white rounded-xl border border-gray-100 p-3">
      <span className={`mt-0.5 text-sm ${activa ? 'text-green-600' : 'text-gray-300'}`}>{activa ? '✅' : '⚪'}</span>
      <div>
        <div className="text-sm font-semibold text-pm-navy">{texto}</div>
        {sub && <div className="text-xs text-gray-400">{sub}</div>}
      </div>
    </div>
  )
}

export default async function SeguridadPage() {
  await requireSeccion('seguridad')
  const eventos = await getEventosSeguridad(300)

  const bots = eventos.filter(e => e.tipo === 'bot').length
  const spam = eventos.filter(e => e.tipo === 'spam').length
  const limites = eventos.filter(e => e.tipo === 'rate-limit').length
  const bloqueados = bots + spam + limites
  const turnstile = turnstileActivo()

  // IPs con más bloqueos
  const porIp = new Map<string, number>()
  for (const e of eventos) {
    if (e.ip && (e.tipo === 'bot' || e.tipo === 'spam' || e.tipo === 'rate-limit')) {
      porIp.set(e.ip, (porIp.get(e.ip) ?? 0) + 1)
    }
  }
  const topIps = [...porIp.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5)

  return (
    <>
      <AdminHeader titulo="Seguridad" subtitulo="Protección antibots/antispam de los formularios y registro de eventos" />
      <div className="p-4 lg:p-6 space-y-4">

        {/* Estado de las protecciones */}
        <div className="bg-pm-bg rounded-2xl border border-gray-100 p-5">
          <h3 className="font-black text-pm-navy mb-3">Protecciones activas</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            <Proteccion activa texto="Campo trampa (honeypot)" sub="Detecta bots que rellenan campos ocultos" />
            <Proteccion activa texto="Tiempo mínimo de envío" sub="Bloquea envíos instantáneos" />
            <Proteccion activa texto="Límite por IP (rate-limit)" sub="Máx. 8 envíos / 10 min por IP" />
            <Proteccion activa texto="Filtro antispam" sub="Enlaces, palabras y correos desechables" />
            <Proteccion activa texto="Saneado de datos" sub="Anti-inyección de cabeceras y HTML en correos" />
            <Proteccion activa={turnstile} texto="Captcha Cloudflare Turnstile" sub={turnstile ? 'Activo' : 'Pendiente: añadir las claves en producción'} />
          </div>
        </div>

        {/* Métricas */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Metric label="Bloqueados (total)" valor={bloqueados} tono={bloqueados > 0 ? 'red' : 'navy'} />
          <Metric label="Bots detectados" valor={bots} tono="amber" />
          <Metric label="Spam bloqueado" valor={spam} tono="amber" />
          <Metric label="Límites superados" valor={limites} tono="purple" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Tabla de eventos */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-black text-pm-navy mb-3">Últimos eventos de seguridad</h3>
            {eventos.length ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-xs text-gray-400 uppercase"><tr>
                    <th className="text-left py-2 px-2">Fecha</th>
                    <th className="text-left py-2 px-2">Tipo</th>
                    <th className="text-left py-2 px-2">Formulario</th>
                    <th className="text-left py-2 px-2">IP</th>
                    <th className="text-left py-2 px-2">Motivo</th>
                  </tr></thead>
                  <tbody className="divide-y divide-gray-50">
                    {eventos.filter(e => e.tipo !== 'envio').slice(0, 120).map(e => (
                      <tr key={e.id}>
                        <td className="py-2 px-2 text-gray-500 whitespace-nowrap">{fecha(e.created_at)}</td>
                        <td className="py-2 px-2">
                          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${TIPO[e.tipo]?.badge ?? 'bg-gray-100 text-gray-500'}`}>{TIPO[e.tipo]?.label ?? e.tipo}</span>
                        </td>
                        <td className="py-2 px-2 text-gray-600">{e.form_tipo}</td>
                        <td className="py-2 px-2 text-gray-500 font-mono text-xs">{e.ip}</td>
                        <td className="py-2 px-2 text-gray-600 max-w-xs truncate" title={e.motivo ?? ''}>{e.motivo}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p className="text-xs text-gray-400 mt-2">Se ocultan los envíos correctos; aquí solo ves bloqueos e incidencias.</p>
              </div>
            ) : (
              <div className="text-sm text-gray-500 py-8 text-center">
                Aún no hay eventos registrados.<br />
                <span className="text-gray-400 text-xs">Si acabas de activarlo, falta ejecutar <code>supabase/migration_seguridad.sql</code> en Supabase.</span>
              </div>
            )}
          </div>

          {/* IPs con más bloqueos */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-black text-pm-navy mb-3">IPs más bloqueadas</h3>
            {topIps.length ? (
              <div className="space-y-1.5">
                {topIps.map(([ip, n]) => (
                  <div key={ip} className="flex justify-between text-sm border-b border-gray-50 pb-1.5">
                    <span className="font-mono text-xs text-gray-600">{ip}</span>
                    <span className="font-bold text-pm-red">{n}</span>
                  </div>
                ))}
              </div>
            ) : <p className="text-gray-400 text-sm py-6 text-center">Sin IPs bloqueadas.</p>}
          </div>
        </div>
      </div>
    </>
  )
}
