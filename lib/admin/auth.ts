import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export type AdminRole = 'principal' | 'gestor' | 'lectura'

export type AdminUser = {
  id: string
  email: string
  nombre: string | null
  role: AdminRole
}

/**
 * Devuelve el administrador autenticado y autorizado, o null.
 * Comprueba sesión de Supabase Auth + pertenencia a admin_users (activo).
 */
export async function getAdminUser(): Promise<AdminUser | null> {
  // Acceso directo SOLO en desarrollo local (sin login) si ADMIN_DEV_BYPASS=true.
  // Protegido: nunca en producción.
  if (process.env.NODE_ENV !== 'production' && process.env.ADMIN_DEV_BYPASS === 'true') {
    return { id: 'dev-local', email: 'zumitolol@gmail.com', nombre: 'Administrador (local)', role: 'principal' }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user?.email) return null

  const admin = createAdminClient()
  const { data } = await admin
    .from('admin_users')
    .select('id, email, nombre, role, activo')
    .eq('email', user.email.toLowerCase())
    .eq('activo', true)
    .maybeSingle()

  if (!data) return null
  return { id: user.id, email: data.email, nombre: data.nombre, role: data.role as AdminRole }
}

/** Permisos por rol */
export const can = {
  manageUsers:    (r: AdminRole) => r === 'principal',
  managePayments: (r: AdminRole) => r === 'principal',
  edit:           (r: AdminRole) => r === 'principal' || r === 'gestor',
  view:           (_r: AdminRole) => true,
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
