import { redirect } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'
import type { Familia, EstadoFamilia } from './tipos'
import { familiaIdDeSesion } from './sesion'

// Autorización del Portal de Familias sobre la sesión propia (correo + nº socio).
// La sesión la establece app/familias/actions.ts → loginFamilia.

export type EstadoSesionFamilia =
  | { tipo: 'sin-sesion' }
  | { tipo: 'sin-cuenta'; email: string }
  | { tipo: 'inactiva'; email: string; estado: EstadoFamilia }
  | { tipo: 'ok'; familia: Familia }

async function cargarFamilia(id: string): Promise<Familia | null> {
  const db = createAdminClient()
  const { data } = await db.from('club_familias').select('*').eq('id', id).maybeSingle()
  return (data as unknown as Familia) ?? null
}

/** Estado completo de la sesión familiar (para decidir qué pantalla mostrar). */
export async function estadoFamilia(): Promise<EstadoSesionFamilia> {
  const id = await familiaIdDeSesion()
  if (!id) return { tipo: 'sin-sesion' }
  const fam = await cargarFamilia(id)
  if (!fam) return { tipo: 'sin-sesion' }
  if (fam.estado !== 'activo') return { tipo: 'inactiva', email: fam.email, estado: fam.estado }

  // Registrar último acceso (best-effort, sin bloquear).
  const db = createAdminClient()
  void db.from('club_familias').update({ ultimo_acceso: new Date().toISOString() }).eq('id', fam.id)
  return { tipo: 'ok', familia: fam }
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
