import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import type { Familia, EstadoFamilia } from './tipos'
import { provisionarFamilia } from './sync'

export type EstadoSesionFamilia =
  | { tipo: 'sin-sesion' }
  | { tipo: 'sin-cuenta'; email: string }
  | { tipo: 'inactiva'; email: string; estado: EstadoFamilia }
  | { tipo: 'ok'; familia: Familia }

/** Estado completo de la sesión familiar (para decidir qué pantalla mostrar). */
export async function estadoFamilia(): Promise<EstadoSesionFamilia> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user?.email) return { tipo: 'sin-sesion' }
  const email = user.email.toLowerCase()

  // Crea/sincroniza la cuenta automáticamente si ese correo tiene inscripciones.
  const row = await provisionarFamilia(email)
  if (!row) return { tipo: 'sin-cuenta', email }

  const fam = row as unknown as Familia
  if (fam.estado !== 'activo') return { tipo: 'inactiva', email, estado: fam.estado }

  // Registrar último acceso (best-effort, sin bloquear).
  const db = createAdminClient()
  void db.from('club_familias').update({ ultimo_acceso: new Date().toISOString() }).eq('id', fam.id)
  return { tipo: 'ok', familia: { ...fam, email } }
}

/** Familia autenticada y ACTIVA, o null. */
export async function getFamiliaUser(): Promise<Familia | null> {
  const e = await estadoFamilia()
  return e.tipo === 'ok' ? e.familia : null
}

/** Guard para páginas del portal: exige familia activa o redirige al login. */
export async function requireFamilia(): Promise<Familia> {
  const familia = await getFamiliaUser()
  if (!familia) redirect('/familias/login')
  return familia
}
