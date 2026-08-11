import 'server-only'
import { cookies } from 'next/headers'
import { randomBytes } from 'node:crypto'
import { createAdminClient } from '@/lib/supabase/admin'

// ─────────────────────────────────────────────────────────────────────────────
// Sesión propia del Portal de Familias (correo + nº de socio). Token opaco
// (aleatorio) en cookie HttpOnly/Secure; el estado vive en club_familia_sesiones
// (revocable y con caducidad). NO se usa Supabase Auth para la familia.
// ─────────────────────────────────────────────────────────────────────────────

const COOKIE = 'pm_fam'
const DIAS = 30
const MAX_AGE = DIAS * 24 * 60 * 60

/** Crea una sesión para la familia y fija la cookie segura. */
export async function crearSesionFamilia(familiaId: string, userAgent?: string): Promise<void> {
  const db = createAdminClient()
  const token = randomBytes(32).toString('hex')
  const expira = new Date(Date.now() + MAX_AGE * 1000).toISOString()
  await db.from('club_familia_sesiones').insert({
    token, familia_id: familiaId, expires_at: expira, user_agent: (userAgent || '').slice(0, 300) || null,
  })
  const c = await cookies()
  c.set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: MAX_AGE,
  })
}

/** Devuelve el id de la familia con sesión válida, o null (caducada/ausente). */
export async function familiaIdDeSesion(): Promise<string | null> {
  const c = await cookies()
  const token = c.get(COOKIE)?.value
  if (!token) return null
  const db = createAdminClient()
  const { data } = await db.from('club_familia_sesiones').select('familia_id, expires_at').eq('token', token).maybeSingle()
  if (!data) return null
  if (new Date(String(data.expires_at)) < new Date()) {
    void db.from('club_familia_sesiones').delete().eq('token', token)
    return null
  }
  return String(data.familia_id)
}

/** Cierra la sesión: borra la fila y la cookie. */
export async function destruirSesionFamilia(): Promise<void> {
  const c = await cookies()
  const token = c.get(COOKIE)?.value
  if (token) {
    const db = createAdminClient()
    void db.from('club_familia_sesiones').delete().eq('token', token)
  }
  c.delete(COOKIE)
}
