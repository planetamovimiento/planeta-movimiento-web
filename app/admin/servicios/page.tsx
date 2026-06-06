import { getAdminUser, can } from '@/lib/admin/auth'
import { getRows } from '@/lib/admin/data'
import { AdminHeader, SetupNotice } from '@/components/admin/ui'
import ServiciosClient, { type ServicioCatalogo } from './ServiciosClient'

// Catálogo de servicios de la web. El estado se gestiona desde el panel (tabla services).
const CATALOGO: Omit<ServicioCatalogo, 'estado'>[] = [
  { id: 'club',              nombre: 'Club Deportivo',          categoria: 'club',      icon: '🏅', precio: null },
  { id: 'escuela-bienestar', nombre: 'Escuela de Bienestar',    categoria: 'club',      icon: '🧘', precio: null },
  { id: 'jiu-jitsu',         nombre: 'Jiu-Jitsu Brasileño',     categoria: 'club',      icon: '🥋', precio: 60 },
  { id: 'circo-inclusivo',   nombre: 'Circo Inclusivo',         categoria: 'club',      icon: '♿', precio: null },
  { id: 'talleres-intensivos', nombre: 'Talleres Intensivos',   categoria: 'club',      icon: '🎯', precio: null },
  { id: 'cumpleanos',        nombre: 'Cumpleaños',              categoria: 'ocio',      icon: '🎂', precio: 11 },
  { id: 'campamentos',       nombre: 'Campamentos',             categoria: 'ocio',      icon: '🏕️', precio: 30 },
  { id: 'eventos',           nombre: 'Eventos y celebraciones', categoria: 'eventos',   icon: '🎉', precio: 150 },
  { id: 'talleres',          nombre: 'Talleres de Circo',       categoria: 'eventos',   icon: '🎪', precio: null },
  { id: 'excursiones',       nombre: 'Excursiones Escolares',   categoria: 'educacion', icon: '🎒', precio: null },
  { id: 'extraescolares',    nombre: 'Extraescolares',          categoria: 'educacion', icon: '🏃', precio: null },
  { id: 'monitor-juvenil',   nombre: 'Curso Monitor Juvenil',   categoria: 'educacion', icon: '🎓', precio: null },
  { id: 'colchonetas',       nombre: 'Colchonetas',             categoria: 'ecommerce', icon: '🛒', precio: 349 },
]

export default async function ServiciosPage() {
  const admin = await getAdminUser()
  const { rows, ok } = await getRows('services', 'orden')

  const estadoPorId = new Map((rows as Record<string, unknown>[]).map(r => [r.id as string, r.estado as string]))
  const servicios: ServicioCatalogo[] = CATALOGO.map(c => ({ ...c, estado: estadoPorId.get(c.id) ?? 'activo' }))

  return (
    <>
      <AdminHeader titulo="Servicios" subtitulo="Activa, desactiva o marca el estado de cada servicio de la web" />
      <div className="p-6 lg:p-8 space-y-6">
        {!ok && <SetupNotice />}
        <ServiciosClient servicios={servicios} puedeEditar={admin ? can.edit(admin.role) : false} />
        <p className="text-xs text-gray-400">
          La edición de textos, imágenes y precios completos por servicio se conecta en la siguiente fase.
          Aquí controlas el estado (activo / inactivo / completo / próximamente), que se guarda en la base de datos.
        </p>
      </div>
    </>
  )
}
