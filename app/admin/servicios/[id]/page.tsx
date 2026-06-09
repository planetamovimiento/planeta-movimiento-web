import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getServicio } from '@/lib/servicios/store'
import { AdminHeader, EstadoBadge } from '@/components/admin/ui'
import EditorServicio from './EditorServicio'
import { getAdminUser, requireSeccion, can } from '@/lib/admin/auth'
import { getMananaMagica, getEventoCentro } from '@/lib/eventos/store'
import EditorMananaMagica from '@/app/admin/manana-magica/EditorMananaMagica'
import EditorEventoCentro from './EditorEventoCentro'
import { EVENTOS_CENTRO_IDS, type EventoCentroId } from '@/lib/eventos/centro'
import { CATALOGO_MAP } from '@/lib/servicios/catalogo'
import { getTalleres } from '@/lib/talleres/store'
import { getCampamentosConfig } from '@/lib/campamentos/store'
import EditorCampamentos from './EditorCampamentos'

export const dynamic = 'force-dynamic'

export default async function EditarServicioPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await requireSeccion('servicios')

  // Mañanas Mágicas usa su editor especial (personaje del mes), integrado en Servicios.
  if (id === 'manana-magica') {
    const admin = await getAdminUser()
    const cfg = await getMananaMagica()
    return (
      <>
        <AdminHeader
          titulo={<span className="flex items-center gap-2"><span>✨</span> Mañanas Mágicas</span>}
          subtitulo="Empresa · Eventos · Personaje del mes editable"
        />
        <div className="p-6 lg:p-8">
          <div className="flex items-center gap-3 mb-6 text-sm">
            <Link href="/admin/servicios" className="text-gray-500 hover:text-pm-red">← Servicios</Link>
            <span className="text-gray-300">/</span>
            <span className="text-pm-navy font-semibold">Mañanas Mágicas</span>
          </div>
          <EditorMananaMagica inicial={cfg} puedeEditar={admin ? can.edit(admin.role) : false} />
        </div>
      </>
    )
  }

  // Eventos en el centro (Días Sin Cole, Domingos, Halloween): editor de fechas/precios.
  if ((EVENTOS_CENTRO_IDS as readonly string[]).includes(id)) {
    const admin = await getAdminUser()
    const cfg = await getEventoCentro(id as EventoCentroId)
    const base = CATALOGO_MAP.get(id)
    return (
      <>
        <AdminHeader
          titulo={<span className="flex items-center gap-2"><span>{base?.icon}</span> {base?.nombre}</span>}
          subtitulo="Empresa · Eventos en el centro · Datos editables"
        />
        <div className="p-6 lg:p-8">
          <div className="flex items-center gap-3 mb-6 text-sm">
            <Link href="/admin/servicios" className="text-gray-500 hover:text-pm-red">← Servicios</Link>
            <span className="text-gray-300">/</span>
            <span className="text-pm-navy font-semibold">{base?.nombre}</span>
          </div>
          <EditorEventoCentro id={id} inicial={cfg} puedeEditar={admin ? can.edit(admin.role) : false} />
        </div>
      </>
    )
  }

  // Talleres Intensivos: lista de talleres (cada uno editable), integrada en Servicios.
  if (id === 'talleres-intensivos') {
    const talleres = await getTalleres()
    return (
      <>
        <AdminHeader
          titulo={<span className="flex items-center gap-2"><span>🎯</span> Talleres Intensivos</span>}
          subtitulo="Club Deportivo Origen · Edita fechas, precios, plazas y abre inscripciones"
        />
        <div className="p-6 lg:p-8 space-y-6">
          <div className="flex items-center gap-3 text-sm">
            <Link href="/admin/servicios" className="text-gray-500 hover:text-pm-red">← Servicios</Link>
            <span className="text-gray-300">/</span>
            <span className="text-pm-navy font-semibold">Talleres Intensivos</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {talleres.map(t => (
              <Link key={t.id} href={`/admin/talleres-intensivos/${t.id}`}
                className="group bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md hover:border-pm-red/30 transition-all">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{t.icon}</span>
                    <div>
                      <div className="font-black text-pm-navy text-sm group-hover:text-pm-red transition-colors">{t.nombre}</div>
                      <div className="text-xs text-gray-400">{t.fecha || 'Sin fecha'} · {t.precio}</div>
                    </div>
                  </div>
                  <EstadoBadge estado={t.estado === 'abierto' ? 'activo' : t.estado === 'proximamente' ? 'proximamente' : t.estado === 'completo' ? 'completo' : 'ultimas'} />
                </div>
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>Plazas: {t.plazasLibres}/{t.plazasTotal}</span>
                  <span className="font-bold text-pm-red">Editar →</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </>
    )
  }

  // Campamentos: editor completo (precios, fechas, semanas) integrado en Servicios.
  if (id === 'campamentos') {
    const admin = await getAdminUser()
    const cfg = await getCampamentosConfig()
    return (
      <>
        <AdminHeader
          titulo={<span className="flex items-center gap-2"><span>🏕️</span> Campamentos</span>}
          subtitulo="Empresa · Navidad, Semana Santa y Verano · Precios, fechas y semanas editables"
        />
        <div className="p-6 lg:p-8">
          <div className="flex items-center gap-3 mb-6 text-sm">
            <Link href="/admin/servicios" className="text-gray-500 hover:text-pm-red">← Servicios</Link>
            <span className="text-gray-300">/</span>
            <span className="text-pm-navy font-semibold">Campamentos</span>
          </div>
          <EditorCampamentos inicial={cfg} puedeEditar={admin ? can.edit(admin.role) : false} />
        </div>
      </>
    )
  }

  const servicio = await getServicio(id)
  if (!servicio) notFound()

  return (
    <>
      <AdminHeader
        titulo={<span className="flex items-center gap-2"><span>{servicio.icon}</span> {servicio.nombre}</span>}
        subtitulo={`${servicio.entidad === 'club' ? 'Club Deportivo Origen' : 'Empresa'} · ${servicio.categoria}`}
      />
      <div className="p-6 lg:p-8">
        <div className="flex items-center gap-3 mb-6 text-sm">
          <Link href="/admin/servicios" className="text-gray-500 hover:text-pm-red">← Servicios</Link>
          <span className="text-gray-300">/</span>
          <span className="text-pm-navy font-semibold">{servicio.nombre}</span>
          <EstadoBadge estado={servicio.estado} />
          {servicio.updatedAt && (
            <span className="ml-auto text-xs text-gray-400">
              Última edición: {new Date(servicio.updatedAt).toLocaleString('es-ES')}{servicio.updatedBy ? ` · ${servicio.updatedBy}` : ''}
            </span>
          )}
        </div>
        <EditorServicio servicio={servicio} />
      </div>
    </>
  )
}
