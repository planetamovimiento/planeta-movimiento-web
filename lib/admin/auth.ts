import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { puedeVerSeccion, type AdminRole, type SeccionId } from './secciones'

export type { AdminRole, SeccionId } from './secciones'

export type AdminUser = {
  id: string
  email: string
  nombre: string | null
  role: AdminRole
  /** Secciones a las que tiene acceso. null = todas las asignables (cuentas antiguas). */
  secciones: string[] | null
}

/**
 * Devuelve el administrador autenticado y autorizado, o null.
 * Comprueba sesión de Supabase Auth + pertenencia a admin_users (activo).
 */
export async function getAdminUser(): Promise<AdminUser | null> {
  // Acceso directo SOLO en desarrollo local (sin login) si ADMIN_DEV_BYPASS=true.
  // Protegido: nunca en producción.
  if (process.env.NODE_ENV !== 'production' && process.env.ADMIN_DEV_BYPASS === 'true') {
    return { id: 'dev-local', email: 'zumitolol@gmail.com', nombre: 'Administrador (local)', role: 'principal', secciones: null }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user?.email) return null

  const admin = createAdminClient()
  // select('*') en vez de columnas explícitas: así el panel sigue funcionando
  // aunque la columna `secciones` aún no exista (migración no aplicada todavía).
  const { data } = await admin
    .from('admin_users')
    .select('*')
    .eq('email', user.email.toLowerCase())
    .eq('activo', true)
    .maybeSingle()

  if (!data) return null
  return {
    id: user.id,
    email: data.email,
    nombre: data.nombre,
    role: data.role as AdminRole,
    secciones: (data.secciones as string[] | null) ?? null,
  }
}

/**
 * Guard para páginas de sección: exige sesión de administrador CON acceso a esa
 * sección. Si no está autorizado, redirige a /admin. Devuelve el admin (no null),
 * por lo que puede usarse directamente: `const admin = await requireSeccion('reservas')`.
 */
export async function requireSeccion(id: SeccionId): Promise<AdminUser> {
  const admin = await getAdminUser()
  if (!admin) redirect('/admin')
  if (!puedeVerSeccion(admin.role, admin.secciones, id)) redirect('/admin')
  return admin
}

/** Permisos por rol */
export const can = {
  manageUsers:    (r: AdminRole) => r === 'principal',
  managePayments: (r: AdminRole) => r === 'principal',
  edit:           (r: AdminRole) => r === 'principal' || r === 'gestor',
  view:           (_r: AdminRole) => true,
  // Balance económico: principal hace todo; gestor crea/edita; lectura solo ve.
  manageFinance:  (r: AdminRole) => r === 'principal',                 // borrar, importar, categorías
  editFinance:    (r: AdminRole) => r === 'principal' || r === 'gestor', // crear/editar
}

/** Registra una acción en el log de actividad */
export async function logActivity(params: {
  actorEmail: string
  accion: string
  entidad: string
  entidadId?: string
  detalle?: string
}) {
  const admin = createAdminClient()
  await admin.from('activity_log').insert({
    actor_email: params.actorEmail,
    accion: params.accion,
    entidad: params.entidad,
    entidad_id: params.entidadId ?? null,
    detalle: params.detalle ?? null,
  })
}
