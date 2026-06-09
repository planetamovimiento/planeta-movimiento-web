// ─────────────────────────────────────────────────────────────────────────────
// Metadatos y permisos de las secciones del panel de administración.
// Archivo PURO (sin imports de servidor): se usa tanto en el servidor
// (auth, guards) como en el cliente (barra lateral, gestor de admins).
// ─────────────────────────────────────────────────────────────────────────────

export type AdminRole = 'principal' | 'gestor' | 'lectura'

export type SeccionId =
  | 'club'
  | 'reservas'
  | 'pagos'
  | 'productos'
  | 'formularios'
  | 'calendario'
  | 'servicios'
  | 'clientes'
  | 'balance'
  | 'administradores'
  | 'actividad'

export type SeccionMeta = {
  id: SeccionId
  label: string
  icon: string
  href: string
  grupo: string | null
  /** Exclusiva del administrador principal: nunca asignable a gestor/lectura. */
  soloPrincipal?: boolean
}

/** Orden y agrupación = el que se muestra en la barra lateral. */
export const SECCIONES: SeccionMeta[] = [
  { id: 'club',            label: 'Inscripciones Club',  icon: '🏅', href: '/admin/club',            grupo: 'Club Deportivo Origen' },
  { id: 'reservas',        label: 'Reservas',            icon: '📋', href: '/admin/reservas',         grupo: 'Empresa' },
  { id: 'pagos',           label: 'Pagos',               icon: '💳', href: '/admin/pagos',            grupo: 'Empresa' },
  { id: 'productos',       label: 'Productos y pedidos', icon: '🛒', href: '/admin/productos',        grupo: 'Empresa' },
  { id: 'formularios',     label: 'Solicitudes',         icon: '✉️', href: '/admin/formularios',      grupo: 'Empresa' },
  { id: 'calendario',      label: 'Calendario',          icon: '🗓️', href: '/admin/calendario',       grupo: 'Empresa' },
  { id: 'servicios',       label: 'Servicios',           icon: '🎪', href: '/admin/servicios',        grupo: 'Empresa' },
  { id: 'clientes',        label: 'Clientes',            icon: '👥', href: '/admin/clientes',         grupo: 'General' },
  { id: 'balance',         label: 'Balance Económico',   icon: '💰', href: '/admin/balance',          grupo: 'General' },
  { id: 'administradores', label: 'Administradores',     icon: '🔐', href: '/admin/administradores',   grupo: 'General', soloPrincipal: true },
  { id: 'actividad',       label: 'Actividad',           icon: '📝', href: '/admin/actividad',        grupo: 'General' },
]

/** Secciones que el administrador principal puede asignar a un gestor / lectura. */
export const SECCIONES_ASIGNABLES: SeccionMeta[] = SECCIONES.filter(s => !s.soloPrincipal)

/**
 * ¿Puede este administrador ver/entrar a una sección?
 *  - principal: siempre acceso total.
 *  - secciones === null: compatibilidad con cuentas antiguas → todas las asignables.
 *  - resto: solo las secciones de su lista.
 * Las secciones `soloPrincipal` nunca son accesibles para gestor/lectura.
 */
export function puedeVerSeccion(role: AdminRole, secciones: string[] | null, id: SeccionId): boolean {
  if (role === 'principal') return true
  const meta = SECCIONES.find(s => s.id === id)
  if (!meta || meta.soloPrincipal) return false
  if (secciones == null) return true
  return secciones.includes(id)
}
